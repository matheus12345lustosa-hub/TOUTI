import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    try {
        const where = q ? {
            OR: [
                { name: { contains: q, mode: 'insensitive' as any } }, // Cast for Prisma types if needed
                { cpf: { contains: q } },
                { phone: { contains: q } },
                { email: { contains: q } }
            ]
        } : {};

        const clients = await prisma.client.findMany({
            where,
            take: 10,
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(clients);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to search clients" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const client = await prisma.client.create({
            data: {
                name: body.name,
                cpf: body.cpf,
                phone: body.phone,
                email: body.email
            }
        });
        return NextResponse.json(client);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
    }
}
