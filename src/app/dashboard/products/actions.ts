'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteProduct(productId: string) {
    try {
        // 1. Check if product has sales history
        const salesCount = await prisma.saleItem.count({
            where: { productId }
        });

        if (salesCount > 0) {
            return {
                success: false,
                message: "Não é possível excluir este produto pois ele possui histórico de vendas. Tente inativá-lo (futuro) ou excluir as vendas associadas primeiro."
            };
        }

        // 2. Check stock movements
        const movementCount = await prisma.stockMovement.count({
            where: { productId }
        });

        if (movementCount > 0) {
            // If minimal movements (just creation), maybe we can delete? 
            // ideally we cascade delete stock records if no sales exist.
            // For safety, let's try to delete. If Prisma throws due to foreign keys not handling cascade, we catch it.
        }

        // 3. Delete related child records manually if needed (or rely on Cascade if set in Schema - assuming not for safety)
        // Delete Stock
        await prisma.productStock.deleteMany({ where: { productId } });
        // Delete Movements
        await prisma.stockMovement.deleteMany({ where: { productId } });
        // Delete Promotions
        await prisma.promotion.deleteMany({ where: { productId } });

        // 4. Delete Product
        await prisma.product.delete({
            where: { id: productId }
        });

        revalidatePath("/dashboard/products");
        return { success: true, message: "Produto excluído com sucesso." };

    } catch (error: any) {
        console.error("Delete Product Error:", error);
        return {
            success: false,
            message: "Erro ao excluir produto. Verifique se existem registros vinculados."
        };
    }
}
