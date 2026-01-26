const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const rawData = `
01-1
04-55
13-2
14-5
23-43
25-1
31-2
36-1
38-1
48-97
59-2
62-3
72-2
73-3
84-36
LUX Eliza-58
LUX Charlotte-2
FIT maldivas-1
FIT Cancun-1
FIT Noronha-2
HIDRATANTE 250g 11-1
HIDRATANTE 250g 23-5
HIDRATANTE 250g 29-1
100g 04-12
100g 23-13
MY SOUL- 13
Hidratante-35
Visca-6
Blaugrana-6
Més que-5
Desire-3
Quarter-2
Touch down-2
Narina-11
Prestige-3
Paris est magique-1
Paris parc-1
Charm-1
Cityzens-1
`;

async function main() {
    console.log("--- BULK STOCK UPDATE ---");

    // 1. Get or Create Branch "Matriz"
    let branch = await prisma.branch.findFirst({
        where: {
            OR: [
                { name: { contains: "Matriz", mode: 'insensitive' } },
                { name: { equals: "Matriz Teste" } } // Fallback from previous test
            ]
        }
    });

    if (!branch) {
        console.log("Branch 'Matriz' not found. Creating...");
        branch = await prisma.branch.create({
            data: { name: "Matriz", address: "Sede" }
        });
    }
    console.log(`Using Branch: ${branch.name} (${branch.id})`);

    // 2. Parse Data
    const lines = rawData.split('\n').filter(l => l.trim().length > 0);

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        try {
            const parts = line.split('-');
            if (parts.length < 2) continue;

            const qtyStr = parts[parts.length - 1];
            const name = parts.slice(0, parts.length - 1).join('-').trim();
            const quantity = parseInt(qtyStr.trim());

            if (isNaN(quantity)) {
                console.log(`SKIPPING invalid line: ${line}`);
                continue;
            }

            // 3. Find or Create Product
            // Search by name exact match (insensitive)
            let product = await prisma.product.findFirst({
                where: { name: { equals: name, mode: "insensitive" } }
            });

            if (!product) {
                // Check if it exists by internal code just in case? No, user said name.
                console.log(`Creating new product: [${name}]`);
                product = await prisma.product.create({
                    data: {
                        name: name,
                        price: 0,
                        description: "Importado via carga inicial",
                        // Generate a pseudo-unique barcode to avoid constraint errors if multiple nulls are issues
                        // or just to have something.
                        barcode: `AUTO_${Date.now()}_${i}`,
                    }
                });
            }

            // 4. Update Stock
            const stock = await prisma.productStock.upsert({
                where: {
                    productId_branchId: {
                        productId: product.id,
                        branchId: branch.id
                    }
                },
                create: {
                    productId: product.id,
                    branchId: branch.id,
                    quantity: quantity,
                    minStock: 5
                },
                update: {
                    quantity: quantity
                }
            });

            console.log(`OK: [${name}] -> ${stock.quantity}`);

        } catch (err) {
            console.error(`ERROR processing line "${line}": ${err.message}`);
        }
    }
    console.log("--- FINISHED ---");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
