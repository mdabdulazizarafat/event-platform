import { pool } from './pool';
import { createChildLogger } from '../lib/logger';
import bcrypt from 'bcryptjs';

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
      await client.query('ALTER TABLE hosts RENAME TO users');
    }

    // Temporary force alter constraints to add ON UPDATE CASCADE
    logger.info('Ensuring foreign keys have ON UPDATE CASCADE...');
    const alterQueries = [
      `ALTER TABLE events DROP CONSTRAINT IF EXISTS events_host_username_fkey;`,
      `ALTER TABLE events ADD CONSTRAINT events_host_username_fkey FOREIGN KEY (host_username) REFERENCES users(username) ON UPDATE CASCADE ON DELETE CASCADE;`,
      `ALTER TABLE registrations DROP CONSTRAINT IF EXISTS registrations_user_id_fkey;`,
      `ALTER TABLE registrations ADD CONSTRAINT registrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(username) ON UPDATE CASCADE ON DELETE CASCADE;`,
      `ALTER TABLE admin_logs DROP CONSTRAINT IF EXISTS admin_logs_admin_username_fkey;`,
      `ALTER TABLE admin_logs ADD CONSTRAINT admin_logs_admin_username_fkey FOREIGN KEY (admin_username) REFERENCES users(username) ON UPDATE CASCADE ON DELETE CASCADE;`,
      `ALTER TABLE event_team DROP CONSTRAINT IF EXISTS event_team_username_fkey;`,
      `ALTER TABLE event_team ADD CONSTRAINT event_team_username_fkey FOREIGN KEY (username) REFERENCES users(username) ON UPDATE CASCADE ON DELETE CASCADE;`,
      `ALTER TABLE event_team DROP CONSTRAINT IF EXISTS event_team_invited_by_fkey;`,
      `ALTER TABLE event_team ADD CONSTRAINT event_team_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES users(username) ON UPDATE CASCADE ON DELETE SET NULL;`,
      `ALTER TABLE activity_scans DROP CONSTRAINT IF EXISTS activity_scans_scanned_by_fkey;`,
      `ALTER TABLE activity_scans ADD CONSTRAINT activity_scans_scanned_by_fkey FOREIGN KEY (scanned_by) REFERENCES users(username) ON UPDATE CASCADE ON DELETE CASCADE;`,
      `ALTER TABLE admin_permissions DROP CONSTRAINT IF EXISTS admin_permissions_username_fkey;`,
      `ALTER TABLE admin_permissions ADD CONSTRAINT admin_permissions_username_fkey FOREIGN KEY (username) REFERENCES users(username) ON UPDATE CASCADE ON DELETE CASCADE;`,
      `ALTER TABLE admin_permissions DROP CONSTRAINT IF EXISTS admin_permissions_granted_by_fkey;`,
      `ALTER TABLE admin_permissions ADD CONSTRAINT admin_permissions_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES users(username) ON UPDATE CASCADE ON DELETE SET NULL;`,
      `ALTER TABLE certificates DROP CONSTRAINT IF EXISTS certificates_issued_to_fkey;`,
      `ALTER TABLE certificates ADD CONSTRAINT certificates_issued_to_fkey FOREIGN KEY (issued_to) REFERENCES users(username) ON UPDATE CASCADE ON DELETE CASCADE;`,
      `ALTER TABLE certificates DROP CONSTRAINT IF EXISTS certificates_issued_by_fkey;`,
      `ALTER TABLE certificates ADD CONSTRAINT certificates_issued_by_fkey FOREIGN KEY (issued_by) REFERENCES users(username) ON UPDATE CASCADE ON DELETE SET NULL;`,
      `ALTER TABLE registration_team_members DROP CONSTRAINT IF EXISTS registration_team_members_username_fkey;`,
      `ALTER TABLE registration_team_members ADD CONSTRAINT registration_team_members_username_fkey FOREIGN KEY (username) REFERENCES users(username) ON UPDATE CASCADE ON DELETE CASCADE;`
    ];
    for (const q of alterQueries) {
      await client.query(q).catch(() => {});
    }

    // 3. Ensure users table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        username VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        avatar VARCHAR(512),
        bio TEXT,
        role VARCHAR(20) NOT NULL DEFAULT 'USER',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add necessary columns if they don't exist
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT \'USER\'').catch(() => {});
    await client.query('ALTER TABLE users RENAME COLUMN global_role TO role').catch(() => {});
    await client.query('ALTER TABLE users ALTER COLUMN role SET DEFAULT \'USER\'').catch(() => {});
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile VARCHAR(20)').catch(() => {});
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS org VARCHAR(255)').catch(() => {});
    await client.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'").catch(() => {});
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS organizer_status VARCHAR(20) DEFAULT NULL').catch(() => {});
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS rejection_count INT DEFAULT 0').catch(() => {});
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100)').catch(() => {});
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100)').catch(() => {});
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth VARCHAR(50)').catch(() => {});
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20)').catch(() => {});
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS occupation_type VARCHAR(20)').catch(() => {});
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS institution_name VARCHAR(255)').catch(() => {});
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS class_level VARCHAR(100)').catch(() => {});
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS position VARCHAR(100)').catch(() => {});
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS district VARCHAR(100)').catch(() => {});

    // Data migration: update existing participants to user role
    await client.query("UPDATE users SET role = 'USER' WHERE role = 'PARTICIPANT'").catch(() => {});

    // 4. Ensure events table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        thumbnail VARCHAR(512),
        date VARCHAR(100) NOT NULL,
        time VARCHAR(100) NOT NULL,
        start_date TIMESTAMP WITH TIME ZONE,
        end_date TIMESTAMP WITH TIME ZONE,
        registration_deadline TIMESTAMP WITH TIME ZONE,
        location VARCHAR(512) NOT NULL,
        capacity INTEGER NOT NULL DEFAULT 100,
        contact_email VARCHAR(255),
        contact_phone VARCHAR(50),
        host_username VARCHAR(100) NOT NULL REFERENCES users(username) ON UPDATE CASCADE ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
        form_phone BOOLEAN DEFAULT true,
        form_job_title BOOLEAN DEFAULT true,
        form_organization BOOLEAN DEFAULT true,
        form_tshirt_size BOOLEAN DEFAULT false,
        form_reference BOOLEAN DEFAULT false,
        form_transaction_id BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS description TEXT').catch(() => {});
    await client.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT \'DRAFT\'').catch(() => {});
    await client.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS thumbnail VARCHAR(512)').catch(() => {});
    await client.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255)').catch(() => {});
    await client.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50)').catch(() => {});
    await client.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE').catch(() => {});
    await client.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE').catch(() => {});
    await client.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_deadline TIMESTAMP WITH TIME ZONE').catch(() => {});
    await client.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS form_phone BOOLEAN DEFAULT true').catch(() => {});
    await client.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS form_job_title BOOLEAN DEFAULT true').catch(() => {});
    await client.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS form_organization BOOLEAN DEFAULT true').catch(() => {});
    await client.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS form_tshirt_size BOOLEAN DEFAULT false').catch(() => {});
    await client.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS form_reference BOOLEAN DEFAULT false').catch(() => {});
    await client.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS form_transaction_id BOOLEAN DEFAULT false').catch(() => {});
    await client.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false').catch(() => {});
    await client.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS event_for VARCHAR(50) DEFAULT \'BOTH\'').catch(() => {});
    await client.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS student_category VARCHAR(100)').catch(() => {});
    await client.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT \'Tech\'').catch(() => {});

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

    // Drop old partitioned tables and related tables to apply new schema cleanly
    await client.query('DROP TABLE IF EXISTS activity_logs CASCADE').catch(() => {});
    await client.query('DROP TABLE IF EXISTS payments CASCADE').catch(() => {});
    await client.query('DROP TABLE IF EXISTS registrations CASCADE').catch(() => {});

    // 6. Ensure unified registrations normal table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        ticket_type_id INTEGER REFERENCES ticket_types(id),
        user_id VARCHAR(100) NOT NULL REFERENCES users(username) ON UPDATE CASCADE ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED',
        payment_status VARCHAR(50) NOT NULL DEFAULT 'NOT_REQUIRED',
        qr_token VARCHAR(64) NOT NULL DEFAULT uuid_generate_v4()::text,
        full_name VARCHAR(255),
        phone VARCHAR(50),
        job_title VARCHAR(255),
        organization VARCHAR(255),
        tshirt_size VARCHAR(10),
        reference VARCHAR(255),
        transaction_id VARCHAR(255),
        registered_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await client.query('ALTER TABLE registrations ADD COLUMN IF NOT EXISTS full_name VARCHAR(255)').catch(() => {});
    await client.query('ALTER TABLE registrations ADD COLUMN IF NOT EXISTS phone VARCHAR(50)').catch(() => {});
    await client.query('ALTER TABLE registrations ADD COLUMN IF NOT EXISTS job_title VARCHAR(255)').catch(() => {});
    await client.query('ALTER TABLE registrations ADD COLUMN IF NOT EXISTS organization VARCHAR(255)').catch(() => {});
    await client.query('ALTER TABLE registrations ADD COLUMN IF NOT EXISTS tshirt_size VARCHAR(10)').catch(() => {});
    await client.query('ALTER TABLE registrations ADD COLUMN IF NOT EXISTS reference VARCHAR(255)').catch(() => {});
    await client.query('ALTER TABLE registrations ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255)').catch(() => {});

    // 7. Ensure indexes exist
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_reg_qr_token 
      ON registrations (qr_token)
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_reg_event_status ON registrations (event_id, status)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_reg_user ON registrations (user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_reg_ticket_type ON registrations (ticket_type_id, event_id) WHERE status != 'CANCELLED'`);

    // 7.5 Registration Ticket Types Join Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS registration_ticket_types (
        registration_id BIGINT REFERENCES registrations(id) ON DELETE CASCADE,
        ticket_type_id INTEGER REFERENCES ticket_types(id) ON DELETE CASCADE,
        PRIMARY KEY (registration_id, ticket_type_id)
      )
    `);

    // 8. Ensure payments table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        registration_id BIGINT NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
        event_id INTEGER NOT NULL REFERENCES events(id),
        ticket_type_id INTEGER NOT NULL REFERENCES ticket_types(id),
        tran_id VARCHAR(255) NOT NULL UNIQUE,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(10) NOT NULL DEFAULT 'BDT',
        status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
        payment_method VARCHAR(100),
        gateway_response JSONB,
        val_id VARCHAR(255),
        paid_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await client.query('CREATE INDEX IF NOT EXISTS idx_payments_tran_id ON payments (tran_id)').catch(() => {});
    await client.query('CREATE INDEX IF NOT EXISTS idx_payments_registration ON payments (registration_id, event_id)').catch(() => {});

    // 9. Create admin_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_logs (
        id SERIAL PRIMARY KEY,
        admin_username VARCHAR(100) NOT NULL REFERENCES users(username) ON UPDATE CASCADE ON DELETE CASCADE,
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
        username VARCHAR(100) NOT NULL REFERENCES users(username) ON UPDATE CASCADE ON DELETE CASCADE,
        role VARCHAR(20) NOT NULL DEFAULT 'SCANNER',
        invited_by VARCHAR(100) REFERENCES users(username) ON UPDATE CASCADE ON DELETE SET NULL,
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(event_id, username)
      )
    `);

    // Data migration: update existing manager roles in event_team to scanner
    await client.query("UPDATE event_team SET role = 'SCANNER' WHERE role = 'MANAGER'").catch(() => {});

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

    // 12. Create activity_scans table
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_scans (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        registration_id BIGINT NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
        event_id INTEGER NOT NULL REFERENCES events(id),
        activity_id INTEGER NOT NULL REFERENCES event_activities(id) ON DELETE CASCADE,
        scanned_by VARCHAR(100) NOT NULL REFERENCES users(username) ON UPDATE CASCADE ON DELETE CASCADE,
        scanned_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(registration_id, activity_id)
      )
    `);

    await client.query('CREATE INDEX IF NOT EXISTS idx_scans_event ON activity_scans (event_id, scanned_at DESC)').catch(() => {});

    // 13. Create admin_permissions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_permissions (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL REFERENCES users(username) ON UPDATE CASCADE ON DELETE CASCADE,
        permission VARCHAR(50) NOT NULL,
        granted_by VARCHAR(100) REFERENCES users(username) ON UPDATE CASCADE ON DELETE SET NULL,
        granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(username, permission)
      )
    `);
    await client.query('CREATE INDEX IF NOT EXISTS idx_admin_permissions_user ON admin_permissions (username)').catch(() => {});

    // 14. Target Audience, Event Type and Team Registration Schema Updates
    logger.info('Applying Target Audience, Event Type and Team Registration migrations...');
    await client.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS is_private BOOLEAN NOT NULL DEFAULT false').catch(() => {});
    await client.query("ALTER TABLE events ADD COLUMN IF NOT EXISTS event_for VARCHAR(20) NOT NULL DEFAULT 'BOTH'").catch(() => {});
    await client.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS student_category VARCHAR(100) DEFAULT NULL').catch(() => {});

    await client.query('ALTER TABLE ticket_types ADD COLUMN IF NOT EXISTS is_team BOOLEAN NOT NULL DEFAULT false').catch(() => {});
    await client.query('ALTER TABLE ticket_types ADD COLUMN IF NOT EXISTS max_team_size INTEGER NOT NULL DEFAULT 1').catch(() => {});

    await client.query(`
      CREATE TABLE IF NOT EXISTS registration_teams (
        id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        ticket_type_id INTEGER NOT NULL REFERENCES ticket_types(id) ON DELETE CASCADE,
        leader_registration_id BIGINT NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
        team_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `).catch(() => {});

    await client.query(`
      CREATE TABLE IF NOT EXISTS registration_team_members (
        id SERIAL PRIMARY KEY,
        team_id INTEGER NOT NULL REFERENCES registration_teams(id) ON DELETE CASCADE,
        username VARCHAR(100) NOT NULL REFERENCES users(username) ON UPDATE CASCADE ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(team_id, username)
      )
    `).catch(() => {});

    // 15. Create schedules table
    await client.query(`
      CREATE TABLE IF NOT EXISTS schedules (
        id SERIAL PRIMARY KEY,
        event_slug VARCHAR(255) NOT NULL REFERENCES events(slug) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        date VARCHAR(100) NOT NULL,
        start_time VARCHAR(50) NOT NULL,
        end_time VARCHAR(50) NOT NULL,
        room VARCHAR(255),
        speaker VARCHAR(255),
        status VARCHAR(50) DEFAULT 'CONFIRMED',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `).catch(() => {});

    // 16. Create Certificates schema
    logger.info('Applying Certificates migrations...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS certificate_templates (
        id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        template_url VARCHAR(512) NOT NULL,
        sending_time TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(event_id)
      )
    `).catch(() => {});

    await client.query(`
      CREATE TABLE IF NOT EXISTS certificates (
        id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        registration_id BIGINT NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
        issued_to VARCHAR(100) NOT NULL REFERENCES users(username) ON UPDATE CASCADE ON DELETE CASCADE,
        issued_by VARCHAR(100) NOT NULL REFERENCES users(username) ON UPDATE CASCADE ON DELETE SET NULL,
        certificate_type VARCHAR(50) NOT NULL DEFAULT 'PARTICIPATION',
        title VARCHAR(255) NOT NULL,
        description TEXT,
        certificate_url VARCHAR(512),
        issued_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(registration_id, certificate_type)
      )
    `).catch(() => {});

    // 16.5 Create Partners and Team Members tables
    logger.info('Applying Partners and Team Members migrations...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS partners (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        logo VARCHAR(512),
        description TEXT,
        website VARCHAR(512),
        founder_name VARCHAR(255),
        founder_title VARCHAR(255),
        category VARCHAR(255) DEFAULT 'Other Organizations',
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `).catch(() => {});

    await client.query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255),
        image VARCHAR(512),
        bio TEXT,
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `).catch(() => {});

    // Ensure role column allows NULLs in existing tables
    await client.query(`
      ALTER TABLE team_members
      ALTER COLUMN role DROP NOT NULL
    `).catch(() => {});

    // Ensure partners table has category column
    await client.query(`
      ALTER TABLE partners ADD COLUMN IF NOT EXISTS category VARCHAR(255) DEFAULT 'Other Organizations'
    `).catch(() => {});

    // 16.6 Create Verification Codes Table for Authentication OTPs
    logger.info('Applying Verification Codes migration...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS verification_codes (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(6) NOT NULL,
        purpose VARCHAR(50) NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `).catch(() => {});
    await client.query('CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes (email)').catch(() => {});

    // 17. Optional environment-driven initial super admin provisioning
    if (process.env.INITIAL_ADMIN_USERNAME && process.env.INITIAL_ADMIN_EMAIL && process.env.INITIAL_ADMIN_PASSWORD) {
      logger.info('Provisioning initial super admin from environment configuration...');
      const adminPasswordHash = bcrypt.hashSync(process.env.INITIAL_ADMIN_PASSWORD, 10);
      await client.query(`
        INSERT INTO users (username, name, email, password_hash, role, status)
        VALUES ($1, $2, $3, $4, 'SUPER_ADMIN', 'ACTIVE')
        ON CONFLICT (username) DO NOTHING
      `, [
        process.env.INITIAL_ADMIN_USERNAME.toLowerCase().trim(),
        process.env.INITIAL_ADMIN_NAME || 'Platform Admin',
        process.env.INITIAL_ADMIN_EMAIL.toLowerCase().trim(),
        adminPasswordHash
      ]);
    } else {
      logger.info('No INITIAL_ADMIN_* environment variables specified. Skipping seed user creation.');
    }

    logger.info('Database migrations completed successfully.');
  } catch (error) {
    logger.error({ err: error }, 'Migration/Seed failed');
    throw error;
  } finally {
    client.release();
  }
}
