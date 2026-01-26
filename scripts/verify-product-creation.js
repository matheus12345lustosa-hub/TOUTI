const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyProductCreation() {
    console.log('--- STARTING PRODUCT CREATION TEST ---');
    try {
        // 1. Data for new product
        const newProduct = {
            name: "TEST_PRODUCT_" + Date.now(),
            price: 99.90,
            costPrice: 50.00,
            barcode: "TEST_EAN_" + Date.now().toString().slice(-8),
            stock: 10, // Initial stock
            minStock: 2,
            description: "Automated test product"
        };
        console.log(`Creating product: ${newProduct.name}`);

        // 2. Create Product (Simulate Service Logic)
        // We need to create Product AND ProductStock
        const createdProduct = await prisma.$transaction(async (tx) => {
            // Create Product
            const p = await tx.product.create({
                data: {
                    name: newProduct.name,
                    price: newProduct.price,
                    costPrice: newProduct.costPrice,
                    barcode: newProduct.barcode,
                    description: newProduct.description
                }
            });

            // Find default branch or create one
            let branch = await tx.branch.findFirst();
            if (!branch) {
                console.log("No branch found, creating default branch...");
                branch = await tx.branch.create({
                    data: { name: "Matriz Teste", address: "Rua Teste, 123" }
                });
            }

            // Create Stock
            await tx.productStock.create({
                data: {
                    productId: p.id,
                    branchId: branch.id,
                    quantity: newProduct.stock,
                    minStock: newProduct.minStock
                }
            });

            return p;
        });

        console.log(`Product Created ID: ${createdProduct.id}`);

        // 3. Verify it exists
        const fetchedProduct = await prisma.product.findUnique({
            where: { id: createdProduct.id },
            include: { productStocks: true }
        });

        if (!fetchedProduct) throw new Error("Product not found in DB!");
        if (fetchedProduct.name !== newProduct.name) throw new Error("Name mismatch!");

        console.log(`Stock Saved: ${fetchedProduct.productStocks[0].quantity}`);
        if (fetchedProduct.productStocks[0].quantity !== newProduct.stock) {
            throw new Error("Stock quantity mismatch!");
        }

        console.log("SUCCESS: Product and Stock created correctly.");

    } catch (error) {
        console.error('Test Failed:', error.message);
        if (error.code) console.error('Error Code:', error.code);
        if (error.meta) console.error('Error Meta:', JSON.stringify(error.meta));
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

verifyProductCreation();
