import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // 1. Check Database Connection & User Count
        const userCount = await prisma.user.count();
        const users = await prisma.user.findMany({
            select: { email: true, role: true, branchId: true } // Don't expose password hash publicly
        });

        // 2. Check Admin specifically
        const adminEmail = "admin@touti.com";
        const admin = await prisma.user.findUnique({
            where: { email: adminEmail }
        });

        const status = {
            environment: process.env.NODE_ENV,
            database_url_set: !!process.env.DATABASE_URL,
            database_url_prefix: process.env.DATABASE_URL?.split(':')[0], // e.g. "postgres"
            user_count: userCount,
            users_found: users,
            admin_check: {
                found: !!admin,
                email: admin?.email,
                role: admin?.role,
                has_password_hash: !!admin?.password,
                // Verify 'admin' password against the stored hash
                password_valid: admin ? await bcrypt.compare("admin", admin.password) : false
            }
        };

        return NextResponse.json(status);

    } catch (error: any) {
        return NextResponse.json({
            error: "Database check failed",
            message: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
