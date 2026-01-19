import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const saleId = params.id;

        // 1. Transaction to ensure atomicity
        const result = await prisma.$transaction(async (tx) => {
            // Check if sale exists and status
            const sale = await tx.sale.findUnique({
                where: { id: saleId },
                include: { items: true }
            });

            if (!sale) throw new Error("Venda não encontrada.");
            if (sale.status === 'CANCELLED') throw new Error("Venda já cancelada.");

            // 2. Restore Stock
            for (const item of sale.items) {
                // Increment product stock
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { increment: item.quantity } }
                });

                // Record Stock Movement (Cancellation/Restoration)
                await tx.stockMovement.create({
                    data: {
                        productId: item.productId,
                        type: "CANCELLATION", // Return/Cancellation
                        quantity: item.quantity, // Positive quantity adding back to stock
                        reason: `Cancelamento da Venda #${saleId.slice(-6)}`
                    }
                });
            }

            // 3. Update Sale Status
            const updatedSale = await tx.sale.update({
                where: { id: saleId },
                data: { status: 'CANCELLED' }
            });

            return updatedSale;
        });

        return NextResponse.json(result);

    } catch (error: any) {
        console.error("Cancellation Error:", error);
        return NextResponse.json(
            { error: error.message || "Falha ao cancelar venda" },
            { status: 500 }
        );
    }
}
