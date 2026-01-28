import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const id = params.id;

        // 1. Unlink sales (keep history, remove client link)
        await prisma.sale.updateMany({
            where: { clientId: id },
            data: { clientId: null }
        });

        // 2. Delete Client
        await prisma.client.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Delete Client Error:", error);
        return NextResponse.json({ error: "Erro ao excluir cliente." }, { status: 500 });
    }
}
