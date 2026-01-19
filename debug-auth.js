const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function debugAuth() {
    const email = 'admin@touti.com';
    const password = '123456';

    console.log(`Checking user: ${email}...`);

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        console.error('❌ User NOT found in database.');
        return;
    }

    console.log('✅ User found:', { id: user.id, email: user.email, role: user.role, passwordHash: user.password ? user.password.substring(0, 10) + '...' : 'NULL' });

    const isValid = await bcrypt.compare(password, user.password);

    if (isValid) {
        console.log('✅ Password matches! Login SHOULD work.');
    } else {
        console.error('❌ Password does NOT match.');

        console.log('Attempting to reset password...');
        const newHash = await bcrypt.hash(password, 10);
        await prisma.user.update({
            where: { email },
            data: { password: newHash }
        });
        console.log('✅ Password reset to "123456". Try logging in again.');
    }
}

debugAuth()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
