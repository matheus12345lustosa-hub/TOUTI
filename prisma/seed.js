const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { hash } = require('bcryptjs');

async function main() {
    console.log("Cleaning up database...");
    // 1. Clean up existing data (Order matters because of foreign keys)
    await prisma.stockMovement.deleteMany({});
    await prisma.saleItem.deleteMany({});
    await prisma.sale.deleteMany({});
    await prisma.productStock.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.expense.deleteMany({});
    await prisma.user.deleteMany({});
    // await prisma.branch.deleteMany({}); // Optional: keep branch or recreate? Let's recreate to be clean.

    // Note: Deleting branches might be tricky if there are constraints, but since we deleted children lines above, it should be fine.
    // However, to keep it simple and safe, I will just upsert the main branch.

    console.log("Seeding production data...");

    // 2. Create Main Branch
    const branch = await prisma.branch.upsert({
        where: { id: 'branch-matriz' },
        update: { name: 'Matriz - Touti' },
        create: {
            id: 'branch-matriz',
            name: 'Matriz - Touti',
            address: 'Loja Principal',
        },
    });

    // 3. Create Admin User (Januario)
    const passwordHash = await hash('123456', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'januario@touti.com' },
        update: {
            role: 'GERENTE',
            branchId: branch.id,
            password: passwordHash,
            name: 'Januário'
        },
        create: {
            email: 'januario@touti.com',
            name: 'Januário',
            password: passwordHash,
            role: 'GERENTE',
            branchId: branch.id,
        },
    });

    console.log("Production seed completed!");
    console.log("Admin: januario@touti.com / 123456");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
