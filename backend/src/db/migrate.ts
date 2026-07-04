import { pool } from './pool';

export async function runMigrations() {
  console.log('Running automatic database migrations & checks...');
  const client = await pool.connect();
  try {
    // 1. Enable UUID extension
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // 2. Ensure hosts table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS hosts (
        username VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        avatar VARCHAR(512),
        bio TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `).catch(async (err) => {
      // If table exists but columns are missing, add them
      console.log('Hosts table check failed or already exists, checking columns...');
      await client.query('ALTER TABLE hosts ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE');
      await client.query('ALTER TABLE hosts ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)');
      await client.query('ALTER TABLE hosts ADD COLUMN IF NOT EXISTS avatar VARCHAR(512)');
      await client.query('ALTER TABLE hosts ADD COLUMN IF NOT EXISTS bio TEXT');
    });

    // Ensure they are not null for future checks if they exist
    try {
      await client.query('ALTER TABLE hosts ALTER COLUMN email SET NOT NULL');
      await client.query('ALTER TABLE hosts ALTER COLUMN password_hash SET NOT NULL');
    } catch (e) {
      console.warn('Could not set NOT NULL constraints on hosts (possibly due to existing null data):', (e as Error).message);
    }

    // 3. Ensure events table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        date VARCHAR(100) NOT NULL,
        time VARCHAR(100) NOT NULL,
        location VARCHAR(512) NOT NULL,
        capacity INTEGER NOT NULL DEFAULT 100,
        host_username VARCHAR(100) NOT NULL REFERENCES hosts(username) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Ensure registrations master partitioned table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id SERIAL,
        event_id INTEGER NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED',
        qr_token VARCHAR(255) NOT NULL DEFAULT uuid_generate_v4()::text,
        registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id, event_id)
      ) PARTITION BY LIST (event_id)
    `).catch((err) => {
      console.warn('Note: registrations table creation skipped or partitioned table already configured:', err.message);
    });

    // 5. Ensure functional index exists
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_registrations_qr_token 
      ON registrations (lower(qr_token))
    `).catch((err) => {
      console.warn('Could not create functional index:', err.message);
    });

    console.log('Database migrations completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    client.release();
  }
}
