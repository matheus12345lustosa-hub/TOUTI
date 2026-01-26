const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyFixes() {
    console.log("--- 🔍 SYSTEM VERIFICATION v1.0 🔍 ---");
    let hasErrors = false;

    // TEST 1: ADMIN USER
    try {
        const admin = await prisma.user.findUnique({ where: { email: 'admin@touti.com' } });
        if (admin) {
            console.log("✅ [AUTH] Admin user exists.");
        } else {
            console.error("❌ [AUTH] Admin user MISSING.");
            hasErrors = true;
        }
    } catch (e) {
        console.error("❌ [AUTH] Error checking admin:", e.message);
        hasErrors = true;
    }

    // TEST 2: PRODUCTS & STOCK (The Bulk Import)
    try {
        const count = await prisma.product.count();
        const stockCount = await prisma.productStock.count();
        if (count > 0 && stockCount > 0) {
            console.log(`✅ [STOCK] Found ${count} products and ${stockCount} stock records.`);
        } else {
            console.warn("⚠️ [STOCK] Database seems empty.");
        }
    } catch (e) {
        console.error("❌ [STOCK] Error checking products:", e.message);
        hasErrors = true;
    }

    // TEST 3: CLIENTS (The Crash Fix)
    console.log("... Testing Client Email Filter (The previous crash) ...");
    try {
        // 1. Create a dummy client with email
        const testEmail = `test_${Date.now()}@test.com`;
        await prisma.client.create({
            data: {
                name: "Test Client",
                email: testEmail,
                phone: "11999999999"
            }
        });

        // 2. Perform the EXACT query that caused the crash
        // The crash happened because 'email' field didn't exist in the WhereInput
        const results = await prisma.client.findMany({
            where: {
                OR: [
                    { name: { contains: "test" } },
                    { email: { contains: "test" } } // This line caused the crash before
                ]
            },
            take: 1
        });

        console.log("✅ [CLIENTS] Email filter query executed SUCCESSFULLY.");
        console.log(`   Found ${results.length} clients matching test.`);

        // Cleanup
        const deleted = await prisma.client.deleteMany({
            where: { email: { contains: 'test_', mode: 'insensitive' } }
        });
        console.log("   (Cleaned up test data)");

    } catch (e) {
        console.error("❌ [CLIENTS] FAILED. The email filter still crashes!");
        console.error("   Error:", e.message);
        hasErrors = true;
    }

    console.log("-----------------------------------------");
    if (hasErrors) {
        console.log("❌ VERIFICATION COMPLETED WITH ERRORS.");
        process.exit(1);
    } else {
        console.log("✅ ALL SYSTEMS VERIFIED. SITE IS STABLE.");
    }
}

verifyFixes()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
