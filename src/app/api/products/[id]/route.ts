import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const body = await request.json();
        const { id } = params;
        const { name, price, costPrice, stock, ncm, cest, unit, imageUrl } = body;

        // Note: Direct stock update via PUT is risky. Usually stock should be updated via movements.
        // But for "Edit Product" screen, users often expect to just fix the number.
        // We will allow it but maybe log it? For now, standard update.



        // 2. Transaction to Update Product 
        const product = await prisma.$transaction(async (tx) => {
            const updated = await tx.product.update({
                where: { id },
                data: {
                    name,
                    price: Number(price),
                    costPrice: Number(costPrice),
                    // Stock is now managed via movements/adjustments only
                    ncm,
                    cest,
                    unit,
                    imageUrl
                }
            });

            return updated;
        });

        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        await prisma.product.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
