'use server'

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createExpense(formData: FormData) {
    const description = formData.get("description") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const type = formData.get("type") as string; // FIXA, VARIAVEL
    const category = formData.get("category") as string;

    // Branch Context
    const { cookies } = require("next/headers");
    const cookieStore = cookies();
    const branchId = cookieStore.get("touti_branchId")?.value;

    if (!branchId) {
        throw new Error("Selecione uma filial para lançar despesas.");
    }

    // Bill details
    const isBill = formData.get("isBill") === "on";
    const dueDate = formData.get("dueDate") as string;
    const barcode = formData.get("barcode") as string;

    const expense = await prisma.expense.create({
        data: {
            description,
            amount,
            type,
            category,
            branchId,
            // If it's a bill, we create it nested
            bills: isBill ? {
                create: {
                    amount, // Default to expense amount
                    dueDate: new Date(dueDate),
                    barcode,
                    description: `Boleto: ${description}`
                }
            } : undefined
        }
    });

    revalidatePath("/dashboard/financial");
    revalidatePath("/dashboard/financial/expenses");
    return { success: true };
}

export async function deleteExpense(id: string) {
    // Delete bills first via cascade or manual if not configured
    // Prisma usually handles cascade if configured, but let's be safe
    // My schema didn't specify cascade delete, so I should delete bills first
    await prisma.bill.deleteMany({ where: { expenseId: id } });
    await prisma.expense.delete({ where: { id } });

    revalidatePath("/dashboard/financial");
    revalidatePath("/dashboard/financial/expenses");
}

export async function markBillPaid(id: string) {
    await prisma.bill.update({
        where: { id },
        data: {
            status: 'PAGO',
            paidDate: new Date()
        }
    });
    revalidatePath("/dashboard/financial");
}
