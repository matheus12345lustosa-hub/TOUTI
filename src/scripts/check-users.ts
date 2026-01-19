import prisma from '../lib/prisma';

async function main() {
    const users = await prisma.user.findMany();
    console.log('Total Users:', users.length);
    console.log('Users:', JSON.stringify(users, null, 2));
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
