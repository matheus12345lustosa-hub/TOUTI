import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Prevent self-deletion if strictly required, but usually handled by frontend
        // Check if user has related data (Sales, etc)
        // If user is a cashier, they might have sales. If so, maybe soft delete or block?
        // User asked to "erase" (apagar). Use delete with care.

        const user = await prisma.user.findUnique({
            where: { id },
            include: { _count: { select: { sales: true } } }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user._count.sales > 0) {
            return NextResponse.json({ error: 'Este funcionário possui vendas registradas. Não é possível excluí-lo.' }, { status: 400 });
        }

        await prisma.user.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete User Error:", error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}

import bcrypt from 'bcryptjs';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, email, password, role } = body;

        const updateData: any = {
            name,
            email,
            role
        };

        if (password && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error("Update User Error:", error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}
