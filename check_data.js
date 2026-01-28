const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Checking database data...");
        const products = await prisma.product.count();
        const clients = await prisma.client ? await prisma.client.count() : 0;
        // Check if Client model exists in client, otherwise skip

        console.log(`VERIFICATION_RESULT: Found ${products} products in the database.`);

        // List first 5 products to prove they exist
        if (products > 0) {
            const list = await prisma.product.findMany({ take: 5, select: { name: true } });
            console.log("Sample products:", list.map(p => p.name).join(", "));
        }
    } catch (e) {
        console.error("VERIFICATION_ERROR:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
