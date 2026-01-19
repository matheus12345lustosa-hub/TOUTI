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
            }
        });
        return NextResponse.json(promotions);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch promotions" }, { status: 500 });
    }
}
