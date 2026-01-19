'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function adjustStock(
    productId: string,
    quantity: number,
    type: 'ADD' | 'REMOVE' | 'SET',
    reason: string
) {
    const cookieStore = await cookies();
    const branchId = cookieStore.get("touti_branchId")?.value;

    if (!branchId) {
        throw new Error("Selecione uma filial para ajustar o estoque.");
    }

    // Determine quantity delta and movement type
    let delta = 0;
    let movementType = "";

    // We need current stock for SET operation
    const currentStockEntry = await prisma.productStock.findUnique({
        where: { productId_branchId: { productId, branchId } }
    });
    const currentQty = currentStockEntry?.quantity || 0;

    if (type === 'ADD') {
        delta = quantity;
        movementType = "ENTRADA_AJUSTE";
    } else if (type === 'REMOVE') {
        delta = -quantity;
        movementType = "SAIDA_AJUSTE";
    } else if (type === 'SET') {
        delta = quantity - currentQty;
        movementType = "AJUSTE_BALANCO";
    }

    if (delta === 0) return { success: true };

    await prisma.$transaction(async (tx) => {
        // Upsert Stock
        await tx.productStock.upsert({
            where: { productId_branchId: { productId, branchId } },
            update: { quantity: { increment: delta } },
            create: {
                productId,
                branchId,
                quantity: type === 'SET' ? quantity : delta, // If creating, SET is absolute, others are relative to 0
                minStock: 5
            }
        });

        // Log Movement
        await tx.stockMovement.create({
            data: {
                productId,
                branchId,
                type: movementType,
                quantity: delta,
                reason: reason || "Ajuste Manual"
            }
        });
    });

    revalidatePath("/dashboard/products");
    return { success: true };
}
