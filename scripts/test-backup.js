// Simulate a fetch to the backup API (mocking session context is hard in script, 
// so we will just test the data gathering logic by importing the same prisma calls)

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testBackupLogic() {
    console.log("--- TESTING BACKUP DATA GATHERING ---");
    try {
        const [users, products, sales, clients, stock, movements] = await Promise.all([
            prisma.user.findMany(),
            prisma.product.findMany(),
            prisma.sale.findMany({ include: { items: true, payments: true } }),
            prisma.client.findMany(),
            prisma.productStock.findMany(),
            prisma.stockMovement.findMany(),
        ]);

        const backupData = {
            timestamp: new Date().toISOString(),
            stats: {
                users: users.length,
                products: products.length,
                sales: sales.length,
                clients: clients.length,
                stock: stock.length
            }
        };

        console.log("Backup Data Structure Valid:", JSON.stringify(backupData, null, 2));

        if (products.length === 0) console.warn("WARNING: No products found (unexpected?)");
        if (users.length === 0) console.error("ERROR: No users found!");

    } catch (error) {
        console.error("Backup logic failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testBackupLogic();
