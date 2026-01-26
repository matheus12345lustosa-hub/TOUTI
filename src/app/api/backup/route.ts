import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'GERENTE') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const [users, products, sales, clients, stock, movements] = await Promise.all([
            prisma.user.findMany(),
            prisma.product.findMany(),
            prisma.sale.findMany({ include: { items: true, payments: true } }),
            prisma.client.findMany(),
            prisma.productStock.findMany(),
            prisma.stockMovement.findMany(),
        ]);

        const backupData = {
            timestamp: new Date().toISOString(),
            users,
            products,
            stock,
            clients,
            sales,
            movements
        };

        const json = JSON.stringify(backupData, null, 2);

        return new NextResponse(json, {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="touti-backup-${new Date().toISOString().split('T')[0]}.json"`
            }
        });

    } catch (error) {
        console.error("Backup failed:", error);
        return NextResponse.json({ error: 'Backup failed' }, { status: 500 });
    }
}
