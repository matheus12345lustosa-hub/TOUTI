const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // 1. Create Data
    const products = [
        { name: "Cerveja Pilsen Lata 350ml", price: 4.50, costPrice: 2.50, barcode: "7891234567890", stock: 120 },
        { name: "Refrigerante Cola 2L", price: 8.90, costPrice: 5.00, barcode: "7891112223334", stock: 45 },
        { name: "Água Mineral 500ml", price: 2.50, costPrice: 0.80, barcode: "7894445556667", stock: 200 },
        { name: "Vodka Premium 1L", price: 89.90, costPrice: 50.00, barcode: "7897778889990", stock: 15 },
        { name: "Gelo Pacote 5kg", price: 12.00, costPrice: 4.00, barcode: "7890001112223", stock: 30 },
    ];

    for (const p of products) {
        const exists = await prisma.product.findUnique({ where: { barcode: p.barcode } });
        if (!exists) {
            await prisma.product.create({ data: p });
            console.log(`Created product: ${p.name}`);
        } else {
            console.log(`Product already exists: ${p.name}`);
        }
    }

    // 2. Create Default User (Operator)
    const userExists = await prisma.user.findUnique({ where: { email: "operador@adega.com" } });
    if (!userExists) {
        await prisma.user.create({
            data: {
                name: "Operador Padrão",
                email: "operador@adega.com",
                password: "hashed_password", // TODO: Implement crypto
                role: "OPERATOR"
            }
        });
        console.log("Created default operator user.");
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
