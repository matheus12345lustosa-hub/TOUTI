import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
    console.log('--- Starting Password Migration ---');

    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users.`);

    let migratedCount = 0;

    for (const user of users) {
        // Basic check: if password isn't starting with $2 (bcrypt prefix) or similar, assuming it needs hash
        // NOTE: This assumes current passwords are NOT hashed.
        // If you already have some hashes, this check needs to be better. 
        // But bcrypt strings typically start with $2a$, $2b$, or $2y$.

        if (!user.password.startsWith('$2')) {
            console.log(`Migrating user: ${user.email}`);
            const hashedPassword = await bcrypt.hash(user.password, 10);

            await prisma.user.update({
                where: { id: user.id },
                data: { password: hashedPassword }
            });
            migratedCount++;
        } else {
            console.log(`User ${user.email} already has hashed password. Skipping.`);
        }
    }

    console.log(`--- Migration Finished. Migrated ${migratedCount} users. ---`);
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
