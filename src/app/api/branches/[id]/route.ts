import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from "next/headers";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Optional: Check if branch has related data (Stocks, Sales) before deleting?
        // For now, we will assume cascade delete or let the database error if constraint fails.
        // Actually, preventing delete if data exists is safer for a "Production" app.

        // Check for dependencies
        const branch = await prisma.branch.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        productStocks: true,
                        sales: true,
                        expenses: true,
                        users: true
                    }
                }
            }
        });

        if (!branch) {
            return NextResponse.json({ error: 'Filial não encontrada' }, { status: 404 });
        }

        const hasData = branch._count.productStocks > 0 ||
            branch._count.sales > 0 ||
            branch._count.expenses > 0 ||
            branch._count.users > 0;

        if (hasData) {
            return NextResponse.json(
                { error: 'Não é possível excluir esta filial pois ela possui registros vinculados (Estoque, Vendas, Despesas ou Usuários).' },
                { status: 400 }
            );
        }

        await prisma.branch.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete Branch Error:", error);
        return NextResponse.json({ error: 'Falha ao excluir filial' }, { status: 500 });
    }
}
