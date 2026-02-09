import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const promotions = await prisma.promotion.findMany({
            where: {
                active: true,
                OR: [
                    { validUntil: { gte: new Date() } },
                    { validUntil: null }
                ]
            },
            include: {
                product: {
                    select: {
                        name: true,
                        price: true
                    }
                },
                products: {
                    select: {
                        id: true
                    }
                }
            }
        });
        return NextResponse.json(promotions);
    } catch (error) {
        console.error("Promotions API Error:", error);
        return NextResponse.json({ error: "Failed to fetch promotions" }, { status: 500 });
    }
}
