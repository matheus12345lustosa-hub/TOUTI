const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log("--- CREATING ADMIN USER ---");

    const email = "admin@touti.com";
    const password = "admin";
    const role = "GERENTE";

    // 1. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Find Branch (Optional but good)
    let branch = await prisma.branch.findFirst({
        where: { name: { contains: "Matriz", mode: 'insensitive' } }
    });

    if (!branch) {
        console.log("Branch 'Matriz' not found, searching any...");
        branch = await prisma.branch.findFirst();
    }

    if (!branch) {
        console.log("No branch found at all. Creating one...");
        branch = await prisma.branch.create({
            data: { name: "Matriz", address: "Sede" }
        });
    }

    // 3. Upsert User
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            role: role,
            branchId: branch?.id
        },
        create: {
            email,
            name: "Administrador",
            password: hashedPassword,
            role: role,
            branchId: branch?.id
        }
    });

    console.log(`
    ✅ Admin User Created/Updated!
    --------------------------------
    Email:    ${email}
    Password: ${password}
    Role:     ${user.role}
    Branch:   ${branch?.name}
    --------------------------------
    `);
}

main()
    .catch(e => {
        console.error("FULL ERROR:", JSON.stringify(e, null, 2));
        console.error("MESSAGE:", e.message);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
