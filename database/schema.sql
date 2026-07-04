-- =========================================================================
-- RONG PLAN: PostgreSQL Database Schema
-- Optimized for 30k+ dynamic participant transactions monthly.
-- Includes List Partitioning on registrations and global functional indexing.
-- =========================================================================

-- Enable uuid-ossp for secure token generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Core Reference Table: Hosts (Organizers)
CREATE TABLE IF NOT EXISTS hosts (
  username VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar VARCHAR(512),
  bio TEXT,
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
  host_username VARCHAR(100) NOT NULL REFERENCES hosts(username) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Master Partitioned Table: Registrations
-- Partitioned by list (event_id).
-- Note: PostgreSQL requires that all unique/primary key constraints on the partitioned
-- table include all partition key columns (event_id).
CREATE TABLE IF NOT EXISTS registrations (
  id SERIAL,
  event_id INTEGER NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED',
  qr_token VARCHAR(255) NOT NULL DEFAULT uuid_generate_v4()::text,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id, event_id)
) PARTITION BY LIST (event_id);

-- Global Functional Index to ensure sub-50ms door scans during peak traffic.
-- Under PostgreSQL, functional indexes can target partition tables, or be created
-- on the partitioned parent table to propagate down automatically.
CREATE INDEX IF NOT EXISTS idx_registrations_qr_token 
ON registrations (lower(qr_token));

-- Example of dynamic partitioning queries run by backend:
-- CREATE TABLE IF NOT EXISTS p_reg_1 PARTITION OF registrations FOR VALUES IN (1);
