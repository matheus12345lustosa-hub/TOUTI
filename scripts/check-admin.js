const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkAdmin() {
    console.log("--- CHECKING ADMIN USER ---");
    const email = "admin@touti.com";
    const password = "admin";

    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        console.error("❌ User not found in current database!");
        return;
    }

    console.log(`✅ User found: ${user.name} (${user.id})`);
    console.log(`Role: ${user.role}`);
    console.log(`Stored Hash: ${user.password}`);

    const isValid = await bcrypt.compare(password, user.password);
    console.log(`Password 'admin' valid? ${isValid ? "✅ YES" : "❌ NO"}`);
}

checkAdmin()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
