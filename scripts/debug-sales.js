const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugSales() {
    console.log("--- DEBUGGING SALES FETCH ---");
    try {
        const branchId = undefined; // Simulating no cookie
        const query = "";

        const whereClause = {
            AND: [
                branchId ? { branchId } : {},
                {
                    OR: [
                        { client: { name: { contains: query, mode: "insensitive" } } },
                        { id: { contains: query } }
                    ]
                }
            ]
        };

        console.log("Querying with:", JSON.stringify(whereClause, null, 2));

        const sales = await prisma.sale.findMany({
            where: whereClause,
            include: {
                client: true,
                user: true,
                items: { include: { product: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        console.log(`Found ${sales.length} sales.`);

        sales.forEach(s => {
            console.log(`- Sale #${s.id} | Client: ${s.client?.name} | Total: ${s.total}`);
            // Simulate conversion used in actions.ts
            const numTotal = Number(s.total);
            if (isNaN(numTotal)) console.error("⚠️ Invalid Total:", s.total);
        });

    } catch (e) {
        console.error("❌ CRASHED:", e);
    } finally {
        await prisma.$disconnect();
    }
}

debugSales();
