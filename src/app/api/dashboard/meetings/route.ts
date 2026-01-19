import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
// Force TS update

export async function GET() {
    try {
        const meetings = await prisma.meeting.findMany({
            orderBy: { date: 'desc' }
        });
        return NextResponse.json(meetings);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao buscar reuniões' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body.title || !body.date || !body.content) {
            return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });
        }

        const meeting = await prisma.meeting.create({
            data: {
                title: body.title,
                date: new Date(body.date),
                content: body.content,
                participants: body.participants || ""
            }
        });

        return NextResponse.json(meeting);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Erro ao salvar reunião' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    try {
        await prisma.meeting.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao deletar' }, { status: 500 });
    }
}
