const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyStockSafety() {
    console.log('--- STARTING STOCK SAFETY CHECK ---');
    try {
        // 1. Get a Branch and Product
        const branch = await prisma.branch.findFirst();
        if (!branch) throw new Error('No branch found');
        console.log(`Using Branch: ${branch.name} (${branch.id})`);

        const product = await prisma.product.findFirst();
        if (!product) throw new Error('No product found');
        console.log(`Using Product: ${product.name} (${product.id})`);

        // 2. Check Initial Stock
        let initialStock = await prisma.productStock.findUnique({
            where: { productId_branchId: { productId: product.id, branchId: branch.id } }
        });

        // Initialize stock if missing
        if (!initialStock) {
            console.log("Stock record missing, creating...");
            initialStock = await prisma.productStock.create({
                data: { productId: product.id, branchId: branch.id, quantity: 100 }
            });
        }

        console.log(`Initial Stock: ${initialStock.quantity}`);

        // 3. Create a Sale
        console.log('--- SIMULATING SALE ---');
        const sale = await prisma.$transaction(async (tx) => {
            // Create Sale Header
            // Find a user for the sale
            const user = await tx.user.findFirst();
            if (!user) throw new Error("No user found");

            const newSale = await tx.sale.create({
                data: {
                    userId: user.id,
                    branchId: branch.id,
                    status: "COMPLETED",
                    total: 10.00,
                    items: {
                        create: {
                            productId: product.id,
                            quantity: 1,
                            unitPrice: 10.00,
                            total: 10.00
                        }
                    }
                }
            });

            // Decrement Stock
            await tx.productStock.update({
                where: { productId_branchId: { productId: product.id, branchId: branch.id } },
                data: { quantity: { decrement: 1 } }
            });

            return newSale;
        });

        console.log(`Sale Created: ${sale.id}`);

        // 4. Verify Stock Decremented
        const stockAfterSale = await prisma.productStock.findUnique({
            where: { productId_branchId: { productId: product.id, branchId: branch.id } }
        });
        console.log(`Stock After Sale: ${stockAfterSale.quantity}`);

        if (stockAfterSale.quantity !== initialStock.quantity - 1) {
            throw new Error("Stock did not decrease correctly!");
        }
        console.log("SUCCESS: Stock decremented correctly.");


        // 5. Cancel Sale (Simulate Actions Logic)
        console.log('--- SIMULATING CANCELLATION ---');
        await prisma.$transaction(async (tx) => {
            // Update status
            await tx.sale.update({
                where: { id: sale.id },
                data: { status: 'CANCELLED' }
            });

            // Find items
            const saleWithItems = await tx.sale.findUnique({
                where: { id: sale.id },
                include: { items: true }
            });

            for (const item of saleWithItems.items) {
                // Restore stock
                await tx.productStock.update({
                    where: { productId_branchId: { productId: item.productId, branchId: branch.id } },
                    data: { quantity: { increment: item.quantity } }
                });

                // Log movement
                await tx.stockMovement.create({
                    data: {
                        productId: item.productId,
                        branchId: branch.id,
                        type: "DEVOLUCAO_VENDA",
                        quantity: item.quantity,
                        reason: `TEST_CANCEL_${sale.id}`
                    }
                });
            }
        });

        // 6. Verify Stock Restored
        const stockAfterCancel = await prisma.productStock.findUnique({
            where: { productId_branchId: { productId: product.id, branchId: branch.id } }
        });
        console.log(`Stock After Cancel: ${stockAfterCancel.quantity}`);

        if (stockAfterCancel.quantity !== initialStock.quantity) {
            throw new Error("Stock was not restored correctly!");
        }
        console.log("SUCCESS: Stock restored correctly.");


    } catch (error) {
        console.error('Test Failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyStockSafety();
