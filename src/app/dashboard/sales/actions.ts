'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSales({
    page = 1,
    limit = 20,
    branchId,
    query
}: {
    page?: number;
    limit?: number;
    branchId?: string;
    query?: string;
}) {
    const skip = (page - 1) * limit;

    const whereClause: any = {
        AND: [
            branchId ? { branchId } : {},
            query ? {
                OR: [
                    { client: { name: { contains: query, mode: "insensitive" } } },
                    { id: { contains: query } }
                ]
            } : {}
        ]
    };

    const [sales, total] = await Promise.all([
        prisma.sale.findMany({
            where: whereClause,
            include: {
                client: true,
                user: true,
                payments: true, // Adicionado para trazer múltiplos pagamentos
                items: { include: { product: true } }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        }),
        prisma.sale.count({ where: whereClause })
    ]);

    return {
        sales: sales.map(sale => {
            const originalTotal = sale.items.reduce((acc, item) => {
                return acc + (Number(item.product.price) * item.quantity);
            }, 0);

            // Derive actual total paid from payments to bypass legacy backend miscalculations
            const actualTotal = sale.payments && sale.payments.length > 0
                ? sale.payments.reduce((sum, p) => sum + Number(p.amount), 0)
                : Number(sale.total);

            const discount = originalTotal > actualTotal ? originalTotal - actualTotal : 0;

            return {
                ...sale,
                total: actualTotal,
                fullValue: originalTotal,
                discount: discount
            };
        }),
        totalPages: Math.ceil(total / limit),
        totalCount: total
    };
}

export async function cancelSale(saleId: string) {
    try {
        const sale = await prisma.sale.findUnique({
            where: { id: saleId },
            include: { items: true }
        });

        if (!sale) throw new Error("Venda não encontrada.");
        if (sale.status === 'CANCELLED') throw new Error("Venda já cancelada.");

        await prisma.$transaction(async (tx) => {
            // 1. Update Sale Status
            await tx.sale.update({
                where: { id: saleId },
                data: { status: 'CANCELLED' }
            });

            // 2. Return items to stock
            for (const item of sale.items) {
                if (sale.branchId) { // Only adjust if branch is known
                    // Determine current stock
                    const stock = await tx.productStock.findUnique({
                        where: { productId_branchId: { productId: item.productId, branchId: sale.branchId } }
                    });

                    if (stock) {
                        await tx.productStock.update({
                            where: { id: stock.id },
                            data: { quantity: { increment: item.quantity } }
                        });

                        // 3. Log Movement
                        await tx.stockMovement.create({
                            data: {
                                productId: item.productId,
                                branchId: sale.branchId,
                                type: "DEVOLUCAO_VENDA",
                                quantity: item.quantity,
                                reason: `Cancelamento Venda #${saleId.slice(0, 8)}`
                            }
                        });
                    }
                }
            }
        });

        revalidatePath("/dashboard/sales");
        return { success: true, message: "Venda cancelada e estoque estornado." };

    } catch (error: any) {
        console.error("Cancel Sale Error:", error);
        return { success: false, message: error.message || "Erro ao cancelar venda." };
    }
}

export async function updateSale(saleId: string, data: { paymentMethod?: string }) {
    try {
        await prisma.sale.update({
            where: { id: saleId },
            data: {
                paymentMethod: data.paymentMethod
            }
        });

        revalidatePath("/dashboard/sales");
        return { success: true, message: "Venda atualizada." };
    } catch (error) {
        return { success: false, message: "Erro ao atualizar venda." };
    }
}

export async function deleteSale(saleId: string) {
    try {
        const sale = await prisma.sale.findUnique({
            where: { id: saleId }
        });

        if (!sale) return { success: false, message: "Venda não encontrada." };
        if (sale.status !== 'CANCELLED') return { success: false, message: "Apenas vendas canceladas podem ser excluídas." };

        // Transaction to delete items then sale
        await prisma.$transaction(async (tx) => {
            await tx.saleItem.deleteMany({ where: { saleId } });
            await tx.salePayment.deleteMany({ where: { saleId } }); // If exists
            await tx.sale.delete({ where: { id: saleId } });
        });

        revalidatePath("/dashboard/sales");
        return { success: true, message: "Venda excluída permanentemente." };
    } catch (error) {
        console.error("Delete Sale Error:", error);
        return { success: false, message: "Erro ao excluir venda." };
    }
}
