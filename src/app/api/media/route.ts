import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const media = await prisma.media.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        return NextResponse.json(media);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching media' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { url, name, category } = body;

        if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 });

        const media = await prisma.media.create({
            data: {
                url,
                name: name || "Imagem sem nome",
                category: category || "Geral"
            }
        });

        return NextResponse.json(media, { status: 201 });
    } catch (error) {
        console.error("Create Media Error:", error);
        return NextResponse.json({ error: 'Failed to save media' }, { status: 500 });
    }
}
