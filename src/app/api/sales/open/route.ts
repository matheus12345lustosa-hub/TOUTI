import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { initialAmount, operatorId } = body;

        // Validar se o operador já tem caixa aberto? Por simplicidade, vamos permitir e fechar o anterior ou apenas criar novo.
        // Idealmente: Check if user has OPEN cash register.

        let validOperatorId = operatorId;

        // Fallback: Find first user or create default if no operatorId provided or for robustness
        // Fallback: Find first user or create default if no operatorId provided or for robustness
        const existingUser = (operatorId && operatorId !== 'user-placeholder-id')
            ? await prisma.user.findUnique({ where: { id: operatorId } })
            : await prisma.user.findFirst();

        if (existingUser) {
            validOperatorId = existingUser.id;
        } else {
            // No user found, create a default one
            console.log("Creating default operator for cash register...");
            const newUser = await prisma.user.create({
                data: {
                    name: "Operador Padrão",
                    email: "operador@sistema.com",
                    password: "hashed_password_placeholder", // Em produção, usar hash real
                    role: "OPERATOR",
                }
            });
            validOperatorId = newUser.id;
        }

        const cashRegister = await prisma.cashRegister.create({
            data: {
                initialAmount,
                operatorId: validOperatorId,
                status: "OPEN",
                transactions: {
                    create: {
                        type: "OPENING",
                        amount: initialAmount,
                        description: "Abertura de Caixa"
                    }
                }
            }
        });

        return NextResponse.json(cashRegister, { status: 201 });
    } catch (error) {
        console.error("Error opening cash register:", error);
        return NextResponse.json({ error: 'Failed to open cash register' }, { status: 500 });
    }
}
