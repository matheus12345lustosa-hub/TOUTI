const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSales() {
    try {
        console.log('--- SALES ---');
        const sales = await prisma.sale.findMany({
            include: { items: true, payments: true },
            orderBy: { createdAt: 'desc' },
            take: 5
        });
        console.log(JSON.stringify(sales, null, 2));

    } catch (error) {
        console.error('Error checking sales:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkSales();
