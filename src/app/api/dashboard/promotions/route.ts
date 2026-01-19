import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Helper to calculate status
const isActive = (promo: any) => {
    const now = new Date();
    if (!promo.active) return false;
    if (promo.validFrom && new Date(promo.validFrom) > now) return false;
    if (promo.validUntil && new Date(promo.validUntil) < now) return false;
    return true;
};

// GET: List all promotions
export async function GET(request: Request) {
    try {
        const promotions = await prisma.promotion.findMany({
            include: {
                product: {
                    select: { name: true, price: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Add computed active status for client convenience
        const enrichedPromotions = promotions.map(p => ({
            ...p,
            isCurrent: isActive(p)
        }));

        return NextResponse.json(enrichedPromotions);
    } catch (error) {
        console.error("Error fetching promotions:", error);
        return NextResponse.json({ error: 'Failed to fetch promotions' }, { status: 500 });
    }
}

// POST: Create a new promotion
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Basic Validation
        if (!body.name || !body.type || !body.productId || !body.minQuantity) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const promotion = await prisma.promotion.create({
            data: {
                name: body.name,
                type: body.type, // 'WHOLESALE' (Leve 12 pague X cada), 'BUNDLE' (Leve 3 pague 2)
                productId: body.productId,
                minQuantity: Number(body.minQuantity),
                promotionalPrice: body.promotionalPrice ? Number(body.promotionalPrice) : null,
                payQuantity: body.payQuantity ? Number(body.payQuantity) : null,
                validFrom: body.validFrom ? new Date(body.validFrom) : null,
                validUntil: body.validUntil ? new Date(body.validUntil) : null,
                active: true
            }
        });

        return NextResponse.json(promotion);
    } catch (error) {
        console.error("Error creating promotion:", error);
        return NextResponse.json({ error: 'Failed to create promotion' }, { status: 500 });
    }
}

// DELETE: Remove a promotion
export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    try {
        await prisma.promotion.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
