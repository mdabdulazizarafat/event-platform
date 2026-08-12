import { pool } from './src/db/pool';

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('Running migrations...');
    await client.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS description TEXT;`);
    await client.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS thumbnail VARCHAR(512);`);
    await client.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'DRAFT';`);
    console.log('Migrations completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

runMigration();
