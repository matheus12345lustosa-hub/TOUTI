import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 });
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
        });

        // Fail early if no user
        if (!user) {
            return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
        }

        // Secure password check
        // We handle legacy plain text passwords via migration script, but here strictly expect hashes OR migrated plain text if needed during transition
        // Ideally, we only support hashes.
        const isMatch = await bcrypt.compare(password, user.password);

        // --- TEMPORARY FALLBACK FOR PLAIN TEXT (REMOVE AFTER MIGRATION) ---
        // If bcrypt fails, try plain text match temporarily so users aren't locked out before migration runs
        const isLegacyMatch = !isMatch && user.password === password;

        if (!isMatch && !isLegacyMatch) {
            return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
        }

        // Return user info (excluding password)
        const { password: _, ...userWithoutPassword } = user;

        // Create a simple session token
        const token = JSON.stringify({ userId: user.id, email: user.email, role: user.role });

        const response = NextResponse.json({
            user: userWithoutPassword,
            message: "Login realizado com sucesso"
        });

        response.cookies.set({
            name: 'auth_token',
            value: token,
            httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            secure: process.env.NODE_ENV === 'production',
        });

        return response;

    } catch (error) {
        console.error("Login Error:", error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
