const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
    try {
        console.log('--- BRANCHES ---');
        const branches = await prisma.branch.findMany();
        console.log(JSON.stringify(branches, null, 2));

        console.log('--- PRODUCTS ---');
        const products = await prisma.product.findMany({
            include: { productStocks: true }
        });
        console.log(JSON.stringify(products, null, 2));

    } catch (error) {
        console.error('Error checking data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkData();
