const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL
});
async function migrate() {
  await client.connect();
  try {
    await client.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT \'Tech\';');
    console.log('Added category column successfully');
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
migrate();
