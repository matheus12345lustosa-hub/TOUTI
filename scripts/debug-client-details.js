const { PrismaClient } = require('@prisma/client');
const { format } = require('date-fns');

const prisma = new PrismaClient();

async function debugClientDetails() {
    console.log("--- DEBUGGING CLIENT DETAILS ---");
    try {
        // 1. Get first client ID to test
        const firstClient = await prisma.client.findFirst();
        if (!firstClient) {
            console.log("No clients found to test.");
            return;
        }

        console.log(`Testing Client ID: ${firstClient.id} (${firstClient.name})`);

        // 2. Run the EXACT query from page.tsx
        const client = await prisma.client.findUnique({
            where: { id: firstClient.id },
            include: {
                sales: {
                    where: { status: 'COMPLETED' },
                    include: { items: { include: { product: true } } },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!client) {
            console.log("Client not found in second query?");
            return;
        }

        console.log("✅ Client Fetched.");

        // 3. Simulate Render Logic (Calculations)
        console.log("... Simulating Calculations ...");
        const totalSpent = client.sales.reduce((acc, sale) => acc + Number(sale.total), 0);
        console.log("Total Spent:", totalSpent);

        // 4. Simulate Date Formatting (Common Crash Source)
        console.log("... Simulating Date Format ...");
        if (client.birthday) {
            console.log("Birthday raw:", client.birthday);
            console.log("Formatted:", format(new Date(client.birthday), "dd/MM"));
        } else {
            console.log("No birthday (OK)");
        }

        if (client.sales.length > 0) {
            const lastSale = client.sales[0];
            console.log("Last Sale Date raw:", lastSale.createdAt);
            console.log("Formatted:", format(new Date(lastSale.createdAt), "dd/MM/yyyy"));
        }

        console.log("✅ ALL SIMULATIONS PASSED.");

    } catch (e) {
        console.error("❌ CRASHED:", e);
    } finally {
        await prisma.$disconnect();
    }
}

debugClientDetails();
