const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    await prisma.$executeRawUnsafe('ALTER TABLE registration_team_members DROP CONSTRAINT IF EXISTS registration_team_members_team_id_username_key;');
    console.log('Dropped constraint');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => {
        prisma.$disconnect();
    });
