const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    console.log("--- CHECKING PRODUCTS ---");
    const products = await prisma.product.findMany({
        select: { id: true, name: true, barcode: true }
    });
    console.log(JSON.stringify(products, null, 2));
}

check().finally(() => prisma.$disconnect());
