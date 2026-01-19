import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from "next/headers";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const body = await request.json();
        const { id } = await params;
        const { name, price, costPrice, stock, ncm, cest, unit, imageUrl } = body;

        // Note: Direct stock update via PUT is risky. Usually stock should be updated via movements.
        // But for "Edit Product" screen, users often expect to just fix the number.
        // We will allow it but maybe log it? For now, standard update.



        const cookieStore = await cookies();
        const branchId = cookieStore.get("touti_branchId")?.value;

        // 2. Transaction to Update Product and Stock
        const product = await prisma.$transaction(async (tx) => {
            const updated = await tx.product.update({
                where: { id },
                data: {
                    name,
                    price: Number(price),
                    costPrice: Number(costPrice),
                    ncm,
                    cest,
                    unit,
                    imageUrl
                },
                include: { productStocks: true }
            });

            // Handle Stock Update if provided
            if (stock !== undefined && stock !== null && stock !== "") {
                const newStock = Number(stock);

                // Determine target branch (cookie or first existing stock branch or default)
                let targetBranchId = branchId;
                if (!targetBranchId && updated.productStocks.length > 0) {
                    targetBranchId = updated.productStocks[0].branchId;
                }

                // If still no branch, find default
                if (!targetBranchId) {
                    const defaultBranch = await tx.branch.findFirst();
                    if (defaultBranch) targetBranchId = defaultBranch.id;
                }

                if (targetBranchId) {
                    // Get current stock for this branch
                    const currentStockEntry = updated.productStocks.find(ps => ps.branchId === targetBranchId);
                    const currentQuantity = currentStockEntry?.quantity || 0;

                    if (currentQuantity !== newStock) {
                        const diff = newStock - currentQuantity;

                        // Update Stock
                        await tx.productStock.upsert({
                            where: {
                                productId_branchId: {
                                    productId: id,
                                    branchId: targetBranchId
                                }
                            },
                            update: { quantity: newStock },
                            create: {
                                productId: id,
                                branchId: targetBranchId,
                                quantity: newStock
                            }
                        });

                        // Log Movement
                        await tx.stockMovement.create({
                            data: {
                                productId: id,
                                branchId: targetBranchId,
                                type: "ADJUSTMENT",
                                quantity: diff,
                                reason: "Edição de Produto via Admin"
                            }
                        });

                        // Update result stock for response consistency (manual patch)
                        (updated as any).stock = newStock;
                    }
                }
            }

            return updated;
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error("Update error:", error);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.product.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
