const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    console.log('Creating platform_settings table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS platform_settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) UNIQUE NOT NULL,
        value JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Seeding initial settings...');
    await pool.query(`
      INSERT INTO platform_settings (key, value) VALUES
      ('general', '{"platformName": "Rong Plan", "supportEmail": "support@rongplan.com", "platformFee": "5"}'),
      ('features', '{"email": true, "signIn": true, "signUp": true, "organizerApplication": true, "participantRegistration": true}')
      ON CONFLICT (key) DO NOTHING;
    `);

    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

run();
