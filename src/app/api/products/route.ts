import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const barcode = searchParams.get('barcode');
    const query = searchParams.get('q');

    // Get Branch from Cookie (for GET)
    const cookieStore = await cookies();
    const branchId = cookieStore.get("touti_branchId")?.value;

    // Helper to map stock
    const mapStock = (p: any) => {
        // If branchId is active, we should only see stock for that branch
        // The query below handles the filtering, but we sum here just in case (or for global view)
        return {
            ...p,
            stock: p.productStocks?.reduce((acc: number, ps: any) => acc + ps.quantity, 0) || 0,
            // Add branch-specific stock detail if needed
            currentBranchStock: branchId ? (p.productStocks?.find((ps: any) => ps.branchId === branchId)?.quantity || 0) : null
        };
    };

    try {
        const stockInclude = {
            productStocks: {
                where: branchId ? { branchId } : undefined
            }
        };

        if (barcode) {
            const product = await prisma.product.findUnique({
                where: { barcode },
                include: stockInclude
            });
            if (!product) return NextResponse.json(null, { status: 404 });
            return NextResponse.json(mapStock(product));
        }

        if (query) {
            const products = await prisma.product.findMany({
                where: {
                    OR: [
                        { name: { contains: query } },
                        { barcode: { contains: query } }
                    ]
                },
                take: 20,
                orderBy: { salesCount: 'desc' },
                include: stockInclude
            });
            return NextResponse.json(products.map(mapStock));
        }

        // Default list - Smart Sorting (Most Sold First)
        const products = await prisma.product.findMany({
            take: 50,
            orderBy: { salesCount: 'desc' },
            include: stockInclude
        });
        return NextResponse.json(products.map(mapStock));

    } catch (error) {
        console.error("GET Products Error:", error);
        return NextResponse.json({ error: 'Error fetching products' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, barcode, price, costPrice, stock, minStock, ncm, cest, unit, imageUrl, internalCode, categoryId, newCategoryName } = body;

        let finalCategoryId = categoryId;

        if (newCategoryName) {
            const newCat = await prisma.category.create({
                data: { name: newCategoryName }
            });
            finalCategoryId = newCat.id;
        }

        // Get Branch from Cookie
        const cookieStore = await cookies();
        const branchId = cookieStore.get("touti_branchId")?.value;

        // Fallback to default branch if no cookie (e.g. initial setup)
        // Fallback to default branch if no cookie or invalid branch
        let finalBranchId = branchId;

        if (finalBranchId) {
            const branchExists = await prisma.branch.findUnique({ where: { id: finalBranchId } });
            if (!branchExists) {
                finalBranchId = undefined; // Force fallback
            }
        }

        if (!finalBranchId) {
            const defaultBranch = await prisma.branch.findFirst();
            if (!defaultBranch) {
                // Create default branch if none exists (Auto-fix)
                const newBranch = await prisma.branch.create({
                    data: { name: "Matriz - Sede" }
                });
                finalBranchId = newBranch.id;
            } else {
                finalBranchId = defaultBranch.id;
            }
        }

        // Sanitize numbers
        const safeFloat = (val: any) => {
            if (!val) return 0;
            if (typeof val === 'number') return val;
            return Number(String(val).replace(',', '.'));
        };

        const product = await prisma.product.create({
            data: {
                name,
                barcode: barcode || null,
                internalCode: internalCode || `INT-${Date.now()}`,
                price: safeFloat(price),
                costPrice: safeFloat(costPrice),
                // stock & minStock removed from Product model
                ncm,
                cest,
                unit: unit || "UN",
                imageUrl: imageUrl || null,
                categoryId: finalCategoryId || null,
                productStocks: {
                    create: {
                        branchId: finalBranchId,
                        quantity: Number(stock || 0),
                        minStock: Number(minStock || 5)
                    }
                }
            },
            include: { productStocks: true }
        });

        // Optional: Create initial stock movement
        if (stock > 0) {
            await prisma.stockMovement.create({
                data: {
                    productId: product.id,
                    branchId: finalBranchId,
                    type: "INITIAL_ADJUSTMENT",
                    quantity: Number(stock),
                    reason: "Cadastro Inicial"
                }
            });
        }

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error("Create Product Error:", error);
        // Check for unique constraint violation (barcode)
        return NextResponse.json({ error: 'Failed to create product. Barcode might exist.' }, { status: 500 });
    }
}
