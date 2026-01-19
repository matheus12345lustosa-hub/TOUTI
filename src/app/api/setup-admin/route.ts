
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const email = 'admin@abbc.com';
        const password = '123'; // Simple password as requested (simples)
        const name = 'Administrador';
        const role = 'ADMIN';

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
             // Update password just in case
            await prisma.user.update({
                where: { email },
                data: { password, role }
            });
            return NextResponse.json({ message: 'User admin@abbc.com updated', password });
        }

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password,
                role
            },
        });

        return NextResponse.json({ message: 'User admin@abbc.com created', password, user });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
