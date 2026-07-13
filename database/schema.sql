-- =========================================================================
-- RONG PLAN: PostgreSQL Database Schema
-- Optimized for 30k+ dynamic participant transactions monthly.
-- Includes List Partitioning on registrations and global functional indexing.
-- =========================================================================

-- Enable uuid-ossp for secure token generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Core Reference Table: Users (Organizers, Participants, Admins)
CREATE TABLE IF NOT EXISTS users (
  username VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar VARCHAR(512),
  bio TEXT,
  role VARCHAR(20) NOT NULL DEFAULT 'PARTICIPANT', -- 'SUPER_ADMIN', 'ADMIN', 'ORGANIZER', 'PARTICIPANT'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Core Reference Table: Events
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
);

-- Ticket Types / Segments for each event
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
);

-- Index for efficient ticket type lookups by event
CREATE INDEX IF NOT EXISTS idx_ticket_types_event_id ON ticket_types (event_id);

-- Master Partitioned Table: Registrations
-- Partitioned by list (event_id).
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
) PARTITION BY LIST (event_id);

-- Global Functional Index to ensure sub-50ms door scans during peak traffic.
CREATE INDEX IF NOT EXISTS idx_registrations_qr_token 
ON registrations (lower(qr_token));

-- Payment records for paid ticket purchases
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
);

-- Indexes for payment lookups
CREATE INDEX IF NOT EXISTS idx_payments_tran_id ON payments (tran_id);
CREATE INDEX IF NOT EXISTS idx_payments_registration ON payments (registration_id, event_id);

-- Platform audit log
CREATE TABLE IF NOT EXISTS admin_logs (
  id SERIAL PRIMARY KEY,
  admin_username VARCHAR(100) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id VARCHAR(100),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Event Team Roles (Organizer + Manager)
CREATE TABLE IF NOT EXISTS event_team (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  username VARCHAR(100) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'MANAGER', -- 'ORGANIZER' or 'MANAGER'
  invited_by VARCHAR(100) REFERENCES users(username) ON DELETE SET NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_id, username)
);

-- Event Activities (Multi-Operation scanning: Check-in, Lunch, Gift, etc.)
CREATE TABLE IF NOT EXISTS event_activities (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  scan_limit INTEGER DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Log each scan event atomically
CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  registration_id INTEGER NOT NULL,
  event_id INTEGER NOT NULL,
  activity_id INTEGER NOT NULL REFERENCES event_activities(id) ON DELETE CASCADE,
  scanned_by VARCHAR(100) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
  scanned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(registration_id, event_id, activity_id)
);

-- Indexes for activity logs
CREATE INDEX IF NOT EXISTS idx_activity_logs_lookup ON activity_logs (registration_id, event_id, activity_id);
