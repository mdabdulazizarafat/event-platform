const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    await prisma.$executeRawUnsafe('ALTER TABLE verification_codes ADD COLUMN IF NOT EXISTS attempts INTEGER DEFAULT 0 NOT NULL;');
    console.log('Added attempts column');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => {
        prisma.$disconnect();
    });
