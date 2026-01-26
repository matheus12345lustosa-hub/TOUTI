import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        // Optional: Check for sales before deleting to prevent errors or enforce logic
        // But Prisma might throw foreign key constraint if cascade is not set.
        // Let's try to delete.
        await prisma.client.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Delete Client Error:", error);
        if (error.code === 'P2003') { // Prisma Foreign Key Constraint
            return NextResponse.json({ error: "Não é possível excluir este cliente pois existem vendas vinculadas a ele." }, { status: 400 });
        }
        return NextResponse.json({ error: "Erro ao excluir cliente." }, { status: 500 });
    }
}
