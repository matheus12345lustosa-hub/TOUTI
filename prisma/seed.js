const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@touti.com';
    const password = '123456';

    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Create Default Branch (Matriz)
    const matriz = await prisma.branch.upsert({
        where: { id: 'matriz-001' }, // Hardcoded ID for simplicity
        update: {},
        create: {
            id: 'matriz-001',
            name: 'Matriz - Touti',
            address: 'Sede Principal',
            phone: '00 0000-0000'
        }
    });

    console.log({ branch: matriz });

    // 2. Create/Update Admin User linked to Matriz
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            role: 'GERENTE',
            branchId: matriz.id
        },
        create: {
            email,
            name: 'Administrador',
            password: hashedPassword,
            role: 'GERENTE',
            branchId: matriz.id
        },
    });

    console.log({ user });

    // 3. Initialize ProductStock for all existing products (Migration Helper)
    // This ensures that if we have products, they get at least one stock entry in Matriz
    const products = await prisma.product.findMany();
    for (const p of products) {
        await prisma.productStock.upsert({
            where: {
                productId_branchId: {
                    productId: p.id,
                    branchId: matriz.id
                }
            },
            update: {}, // Don't overwrite if exists
            create: {
                productId: p.id,
                branchId: matriz.id,
                quantity: 100, // Default start stock
                minStock: 5
            }
        });
    }
    console.log(`Updated stock for ${products.length} products.`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
