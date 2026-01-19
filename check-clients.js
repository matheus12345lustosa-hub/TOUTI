const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkClients() {
    try {
        console.log('--- CLIENTS ---');
        const clients = await prisma.client.findMany();
        console.log(JSON.stringify(clients, null, 2));
    } catch (error) {
        console.error('Error checking clients:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkClients();
