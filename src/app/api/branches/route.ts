import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const branches = await prisma.branch.findMany({
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(branches);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch branches' }, { status: 500 });
    }
}
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, address, phone } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const branch = await prisma.branch.create({
            data: {
                name,
                address,
                phone
            }
        });

        return NextResponse.json(branch, { status: 201 });
    } catch (error) {
        console.error("Create Branch Error:", error);
        return NextResponse.json({ error: 'Failed to create branch' }, { status: 500 });
    }
}
