import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log("--- EMERGENCY ADMIN SETUP START ---");

        const email = "admin@touti.com";
        const password = "admin";

        // 1. Check if user exists
        const existing = await prisma.user.findUnique({
            where: { email }
        });

        if (existing) {
            // Update password just in case it's wrong
            const hashedPassword = await bcrypt.hash(password, 10);
            await prisma.user.update({
                where: { email },
                data: { password: hashedPassword, role: 'GERENTE' }
            });
            return NextResponse.json({
                status: "Admin user already exists. Password RESET to 'admin'.",
                user: { email: existing.email, role: existing.role }
            });
        }

        // 2. Create if missing
        console.log("Admin missing. Check/Create Branch...");

        // Ensure a branch exists
        let branch = await prisma.branch.findFirst();
        if (!branch) {
            branch = await prisma.branch.create({
                data: { name: "Matriz (Auto)", address: "Sede" }
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                name: "Admin Emergencia",
                email,
                password: hashedPassword,
                role: "GERENTE",
                branchId: branch.id
            }
        });

        return NextResponse.json({
            status: "SUCCESS: Admin user created!",
            credentials: { email: email, password: password }
        });

    } catch (error: any) {
        return NextResponse.json({
            error: "Setup failed",
            message: error.message,
            db_url_prefix: process.env.DATABASE_URL?.split(':')[0]
        }, { status: 500 });
    }
}
