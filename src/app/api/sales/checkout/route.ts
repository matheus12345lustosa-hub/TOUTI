import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { items, total, cashRegisterId, payments, userId, clientId, branchId } = body;

        // 1. Transaction to ensure atomicity
        const sale = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            console.log("Starting Sales Transaction...");
            // Find a valid user (fallback to first found if specific ID not provided)
            const user = await tx.user.findFirst();
            if (!user) throw new Error("Nenhum usuário encontrado no sistema para vincular a venda.");

            // Resolve Branch
            // Priority: provided branchId > COOKIE > user's branch > default
            let finalBranchId = branchId;

            // Try cookie if body didn't provide it
            if (!finalBranchId) {
                const { cookies } = require("next/headers");
                const cookieStore = cookies();
                finalBranchId = cookieStore.get("touti_branchId")?.value;
            }

            if (!finalBranchId && user.branchId) finalBranchId = user.branchId;
            if (!finalBranchId) {
                const defaultBranch = await tx.branch.findFirst();
                if (defaultBranch) finalBranchId = defaultBranch.id;
            }

            if (!finalBranchId) throw new Error("Não foi possível determinar a filial para esta venda.");

            // Verify Cash Register
            let finalCashRegisterId = cashRegisterId;
            if (cashRegisterId) {
                const registerExists = await tx.cashRegister.findUnique({ where: { id: cashRegisterId } });
                if (!registerExists) {
                    console.warn(`Cash Register ID ${cashRegisterId} not found. Linking to null.`);
                    finalCashRegisterId = null;
                }
            }

            // Fetch Active Promotions
            const activePromotions = await tx.promotion.findMany({
                where: {
                    active: true,
                    OR: [
                        { validFrom: null },
                        { validFrom: { lte: new Date() } }
                    ],
                    AND: [
                        { OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }] }
                    ]
                }
            });

            // Process Items: Ensure all products exist
            const saleItemsData = [];
            let calculatedTotal = 0;

            for (const item of items) {
                let product = await tx.product.findUnique({ where: { id: item.id } });

                if (!product) {
                    // Auto-create strategy (now complicated by stock, but we'll try)
                    console.log(`Product ${item.id} not found. Auto-creating as generic/demo product.`);
                    product = await tx.product.create({
                        data: {
                            id: item.id,
                            name: item.name || "Produto Diverso",
                            barcode: `GENERIC-${item.id}`,
                            price: item.price,
                            costPrice: 0,
                            productStocks: {
                                create: {
                                    branchId: finalBranchId,
                                    quantity: 0,
                                    minStock: 0
                                }
                            }
                        }
                    });
                }

                // Fetch Stock for this branch
                // We use findUnique on the composite key if possible, or findFirst
                const stockEntry = await tx.productStock.findUnique({
                    where: {
                        productId_branchId: {
                            productId: product.id,
                            branchId: finalBranchId
                        }
                    }
                });

                // If stock entry doesn't exist for this branch, create it (safe default)
                if (!stockEntry) {
                    await tx.productStock.create({
                        data: {
                            productId: product.id,
                            branchId: finalBranchId,
                            quantity: 0
                        }
                    });
                }

                // --- PROMOTION CALCULATION SERVER-SIDE ---
                const promo = activePromotions.find(p => p.productId === product!.id);
                let finalPrice = Number(product.price);
                let itemTotal = item.quantity * finalPrice;

                if (promo) {
                    const quantity = item.quantity;
                    const minQty = promo.minQuantity;

                    if (promo.type === 'WHOLESALE' || promo.type === 'BUNDLE') {
                        if (quantity >= minQty && promo.promotionalPrice) {
                            finalPrice = Number(promo.promotionalPrice);
                            itemTotal = quantity * finalPrice;
                        }
                    } else if (promo.type === 'BUY_X_PAY_Y') {
                        if (quantity >= minQty && promo.payQuantity) {
                            const sets = Math.floor(quantity / minQty);
                            const remainder = quantity % minQty;
                            const payingQty = (sets * promo.payQuantity) + remainder;
                            itemTotal = payingQty * finalPrice; // Using original price for paid units
                        }
                    }
                }
                // -----------------------------------------

                calculatedTotal += itemTotal;

                saleItemsData.push({
                    productId: product.id,
                    quantity: item.quantity,
                    unitPrice: finalPrice,
                    total: itemTotal
                });

                // Reduce Stock (Branch Specific) & Increment Sales Count
                await tx.productStock.update({
                    where: {
                        productId_branchId: {
                            productId: product.id,
                            branchId: finalBranchId
                        }
                    },
                    data: {
                        quantity: { decrement: item.quantity }
                    }
                });

                // Update Global Sales Count
                await tx.product.update({
                    where: { id: product.id },
                    data: { salesCount: { increment: item.quantity } }
                });

                // Stock Movement
                await tx.stockMovement.create({
                    data: {
                        productId: product.id,
                        branchId: finalBranchId,
                        type: "SALE",
                        quantity: -item.quantity,
                        reason: "Venda Direta"
                    }
                });
            }

            // Create Sale with validated data
            const newSale = await tx.sale.create({
                data: {
                    total: calculatedTotal, // Trust backend calculation
                    status: "COMPLETED",
                    cashRegisterId: finalCashRegisterId,
                    userId: user.id,
                    clientId: clientId || null,
                    branchId: finalBranchId,
                    items: {
                        create: saleItemsData
                    },
                    payments: {
                        create: payments.map((p: any) => ({
                            method: p.method,
                            amount: p.amount
                        }))
                    }
                }
            });

            return newSale;
            return newSale;
        }, {
            timeout: 20000, // Increase timeout to 20s
            maxWait: 5000
        });

        return NextResponse.json(sale, { status: 201 });
    } catch (error) {
        console.error("Checkout Error Full Details:", error);
        // @ts-ignore
        const errorMessage = error?.message || "Erro desconhecido";
        return NextResponse.json({ error: `Falha no servidor: ${errorMessage}` }, { status: 500 });
    }
}
