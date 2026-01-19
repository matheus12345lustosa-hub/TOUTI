const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBranches() {
    try {
        const branches = await prisma.branch.findMany();
        console.log('Branches found:', branches);
        if (branches.length === 0) {
            console.log('No branches found. Attempting to create Main Branch...');
            const newBranch = await prisma.branch.create({
                data: {
                    name: 'Matriz - Sede',
                    address: 'Rua Principal, 100',
                    phone: '(11) 9999-9999'
                }
            });
            console.log('Created branch:', newBranch);
        }
    } catch (error) {
        console.error('Error checking branches:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkBranches();
