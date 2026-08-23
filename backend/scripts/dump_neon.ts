import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const NEON_DATABASE_URL = process.env.DATABASE_URL || '';
if (!NEON_DATABASE_URL) {
  console.error('Error: DATABASE_URL environment variable is required.');
  process.exit(1);
}

const tables = [
  'users',
  'events',
  'ticket_types',
  'registrations',
  'payments',
  'admin_logs',
  'event_team',
  'event_activities',
  'activity_scans',
  'admin_permissions',
  'schedules'
];

async function main() {
  const client = new Client({
    connectionString: NEON_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Neon database...');
    await client.connect();
    console.log('Connected successfully!');

    let sqlOutput = '-- =========================================================================\n';
    sqlOutput += '-- RONG PLAN EVENT PLATFORM - DATABASE INITIALIZATION & DATA MIGRATION\n';
    sqlOutput += `-- Generated on ${new Date().toISOString()}\n`;
    sqlOutput += '-- =========================================================================\n\n';

    // Enable UUID extension
    sqlOutput += 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";\n\n';

    // 1. Drop existing tables in reverse order to avoid dependency conflicts
    sqlOutput += '-- -------------------------------------------------------------------------\n';
    sqlOutput += '-- DROP EXISTING TABLES (CLEAN SLATE)\n';
    sqlOutput += '-- -------------------------------------------------------------------------\n';
    for (const table of [...tables].reverse()) {
      sqlOutput += `DROP TABLE IF EXISTS ${table} CASCADE;\n`;
    }
    sqlOutput += '\n';

    // 2. Recreate schema (DDL)
    sqlOutput += '-- -------------------------------------------------------------------------\n';
    sqlOutput += '-- CREATE TABLES & INDEXES\n';
    sqlOutput += '-- -------------------------------------------------------------------------\n';

    // We can define the schema DDL directly here based on verified Neon columns
    sqlOutput += `
-- Users
CREATE TABLE users (
  username VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar VARCHAR(512),
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  role VARCHAR(20) NOT NULL DEFAULT 'USER',
  mobile VARCHAR(20),
  org VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
);

-- Events
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  date VARCHAR(100) NOT NULL,
  time VARCHAR(100) NOT NULL,
  location VARCHAR(512) NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 100,
  host_username VARCHAR(100) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
  thumbnail VARCHAR(512),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  form_phone BOOLEAN DEFAULT true,
  form_job_title BOOLEAN DEFAULT true,
  form_organization BOOLEAN DEFAULT true,
  form_tshirt_size BOOLEAN DEFAULT false,
  form_reference BOOLEAN DEFAULT false,
  form_transaction_id BOOLEAN DEFAULT false
);

-- Ticket Types
CREATE TABLE ticket_types (
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
);
CREATE INDEX idx_ticket_types_event_id ON ticket_types (event_id);

-- Registrations
CREATE TABLE registrations (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  ticket_type_id INTEGER REFERENCES ticket_types(id),
  user_id VARCHAR(100) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
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
);
CREATE UNIQUE INDEX idx_reg_qr_token ON registrations (qr_token);
CREATE INDEX idx_reg_event_status ON registrations (event_id, status);
CREATE INDEX idx_reg_user ON registrations (user_id);
CREATE INDEX idx_reg_ticket_type ON registrations (ticket_type_id, event_id) WHERE status != 'CANCELLED';

-- Payments
CREATE TABLE payments (
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
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_payments_tran_id ON payments (tran_id);
CREATE INDEX idx_payments_registration ON payments (registration_id, event_id);

-- Admin Logs
CREATE TABLE admin_logs (
  id SERIAL PRIMARY KEY,
  admin_username VARCHAR(100) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id VARCHAR(100),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Event Team
CREATE TABLE event_team (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  username VARCHAR(100) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'SCANNER',
  invited_by VARCHAR(100) REFERENCES users(username) ON DELETE SET NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_id, username)
);

-- Event Activities
CREATE TABLE event_activities (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  scan_limit INTEGER DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Activity Scans
CREATE TABLE activity_scans (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  registration_id BIGINT NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  event_id INTEGER NOT NULL REFERENCES events(id),
  activity_id INTEGER NOT NULL REFERENCES event_activities(id) ON DELETE CASCADE,
  scanned_by VARCHAR(100) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(registration_id, activity_id)
);
CREATE INDEX idx_scans_event ON activity_scans (event_id, scanned_at DESC);

-- Admin Permissions
CREATE TABLE admin_permissions (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
  permission VARCHAR(50) NOT NULL,
  granted_by VARCHAR(100) REFERENCES users(username) ON DELETE SET NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(username, permission)
);
CREATE INDEX idx_admin_permissions_user ON admin_permissions (username);

-- Schedules
CREATE TABLE schedules (
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
);
\n`;

    // 3. Export data table by table
    for (const table of tables) {
      console.log(`Dumping table: ${table}...`);
      sqlOutput += `-- -------------------------------------------------------------------------\n`;
      sqlOutput += `-- DATA FOR TABLE: ${table}\n`;
      sqlOutput += `-- -------------------------------------------------------------------------\n`;

      const result = await client.query(`SELECT * FROM ${table}`);
      if (result.rows.length === 0) {
        sqlOutput += `-- (No rows)\n\n`;
        continue;
      }

      const columns = result.fields.map(f => f.name);
      
      for (const row of result.rows) {
        const values: string[] = [];
        for (const col of columns) {
          const val = row[col];
          if (val === null || val === undefined) {
            values.push('NULL');
          } else if (typeof val === 'boolean') {
            values.push(val ? 'true' : 'false');
          } else if (typeof val === 'number') {
            values.push(val.toString());
          } else if (val instanceof Date) {
            values.push(`'${val.toISOString()}'::timestamptz`);
          } else if (typeof val === 'object') {
            // JSONB type
            const escapedJson = JSON.stringify(val).replace(/'/g, "''");
            values.push(`'${escapedJson}'::jsonb`);
          } else {
            // String type
            const escapedStr = val.toString().replace(/'/g, "''");
            values.push(`'${escapedStr}'`);
          }
        }

        // For tables with IDENTITY column, we need OVERRIDING SYSTEM VALUE
        const hasIdentity = (table === 'registrations' || table === 'activity_scans');
        const overridingClause = hasIdentity ? ' OVERRIDING SYSTEM VALUE' : '';

        sqlOutput += `INSERT INTO ${table} (${columns.join(', ')})${overridingClause} VALUES (${values.join(', ')});\n`;
      }
      sqlOutput += '\n';

      // Reset sequence for SERIAL or IDENTITY columns (all tables except users)
      if (table !== 'users') {
        sqlOutput += `-- Reset sequence for ${table}\n`;
        sqlOutput += `SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE(MAX(id), 1)) FROM ${table};\n\n`;
      }
    }

    const destPath = 'd:/rong-plan/event-platform/database/init/01-init.sql';
    console.log(`Writing to ${destPath}...`);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, sqlOutput, 'utf8');
    console.log('Migration SQL file successfully generated!');

  } catch (error) {
    console.error('Error occurred:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
