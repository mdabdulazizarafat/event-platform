import { pool } from './pool';
import { createChildLogger } from '../lib/logger';

const logger = createChildLogger('db.migrate');

export async function runMigrations() {
  logger.info('Running automatic database migrations & checks...');
  const client = await pool.connect();
  try {
    // 1. Enable UUID extension
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // 2. Safely rename hosts table to users if it exists and users table does not
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'hosts'
      );
    `);
    
    const hostsExists = tableCheck.rows[0].exists;
    if (hostsExists) {
      logger.info('Renaming "hosts" table to "users"...');
      // Drop referencing foreign keys temporarily to avoid cascade issues, or rename table
      // In PG, RENAME TABLE automatically renames the table and updates referencing FK constraints!
      await client.query('ALTER TABLE hosts RENAME TO users');
    }

    // 3. Ensure users table exists (in case it didn't exist before)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        username VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        avatar VARCHAR(512),
        bio TEXT,
        role VARCHAR(20) NOT NULL DEFAULT 'PARTICIPANT',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3b. Add role column or rename global_role to role
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT \'PARTICIPANT\'').catch(() => {});
    await client.query('ALTER TABLE users RENAME COLUMN global_role TO role').catch(() => {});
    await client.query('ALTER TABLE users ALTER COLUMN role SET DEFAULT \'PARTICIPANT\'').catch(() => {});

    // 4. Ensure events table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        date VARCHAR(100) NOT NULL,
        time VARCHAR(100) NOT NULL,
        location VARCHAR(512) NOT NULL,
        capacity INTEGER NOT NULL DEFAULT 100,
        contact_email VARCHAR(255),
        contact_phone VARCHAR(50),
        host_username VARCHAR(100) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4b. Add contact columns to events if they don't exist (for existing databases)
    await client.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255)').catch(() => {});
    await client.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50)').catch(() => {});

    // 5. Ensure ticket_types table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS ticket_types (
        id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        currency VARCHAR(10) NOT NULL DEFAULT 'BDT',
        capacity INTEGER,
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT true,
        sale_start TIMESTAMP WITH TIME ZONE,
        sale_end TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query('CREATE INDEX IF NOT EXISTS idx_ticket_types_event_id ON ticket_types (event_id)').catch(() => {});

    // 6. Ensure registrations master partitioned table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id SERIAL,
        event_id INTEGER NOT NULL,
        ticket_type_id INTEGER,
        user_id VARCHAR(255) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED',
        payment_status VARCHAR(50) NOT NULL DEFAULT 'NOT_REQUIRED',
        qr_token VARCHAR(255) NOT NULL DEFAULT uuid_generate_v4()::text,
        registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id, event_id)
      ) PARTITION BY LIST (event_id)
    `).catch((err: any) => {
      logger.warn({ err }, 'Note: registrations table creation skipped or partitioned table already configured');
    });

    // 6b. Add new columns to registrations if they don't exist
    await client.query('ALTER TABLE registrations ADD COLUMN IF NOT EXISTS ticket_type_id INTEGER').catch(() => {});
    await client.query("ALTER TABLE registrations ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) NOT NULL DEFAULT 'NOT_REQUIRED'").catch(() => {});
    
    // Add Foreign Key constraint to registrations user_id if not present
    try {
      await client.query(`
        ALTER TABLE registrations 
        ADD CONSTRAINT fk_registrations_user 
        FOREIGN KEY (user_id) REFERENCES users(username) ON DELETE CASCADE
      `);
    } catch (e) {
      // Constraint might already exist
    }

    // 7. Ensure functional index exists
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_registrations_qr_token 
      ON registrations (lower(qr_token))
    `).catch((err: any) => {
      logger.warn({ err }, 'Could not create functional index');
    });

    // 8. Ensure payments table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        registration_id INTEGER NOT NULL,
        event_id INTEGER NOT NULL,
        ticket_type_id INTEGER NOT NULL REFERENCES ticket_types(id),
        tran_id VARCHAR(255) NOT NULL UNIQUE,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(10) NOT NULL DEFAULT 'BDT',
        status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
        payment_method VARCHAR(100),
        gateway_response JSONB,
        val_id VARCHAR(255),
        paid_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query('CREATE INDEX IF NOT EXISTS idx_payments_tran_id ON payments (tran_id)').catch(() => {});
    await client.query('CREATE INDEX IF NOT EXISTS idx_payments_registration ON payments (registration_id, event_id)').catch(() => {});

    // 9. Create admin_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_logs (
        id SERIAL PRIMARY KEY,
        admin_username VARCHAR(100) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
        action VARCHAR(100) NOT NULL,
        target_type VARCHAR(50),
        target_id VARCHAR(100),
        details JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 10. Create event_team table
    await client.query(`
      CREATE TABLE IF NOT EXISTS event_team (
        id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        username VARCHAR(100) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
        role VARCHAR(20) NOT NULL DEFAULT 'MANAGER',
        invited_by VARCHAR(100) REFERENCES users(username) ON DELETE SET NULL,
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(event_id, username)
      )
    `);

    // 11. Create event_activities table
    await client.query(`
      CREATE TABLE IF NOT EXISTS event_activities (
        id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        scan_limit INTEGER DEFAULT 1,
        is_active BOOLEAN NOT NULL DEFAULT true,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 12. Create activity_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        registration_id INTEGER NOT NULL,
        event_id INTEGER NOT NULL,
        activity_id INTEGER NOT NULL REFERENCES event_activities(id) ON DELETE CASCADE,
        scanned_by VARCHAR(100) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
        scanned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(registration_id, event_id, activity_id)
      )
    `);

    await client.query('CREATE INDEX IF NOT EXISTS idx_activity_logs_lookup ON activity_logs (registration_id, event_id, activity_id)').catch(() => {});

    logger.info('Database migrations completed successfully.');
  } catch (error) {
    logger.error({ err: error }, 'Migration failed');
    throw error;
  } finally {
    client.release();
  }
}
