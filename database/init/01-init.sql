-- =========================================================================
-- RONG PLAN EVENT PLATFORM - DATABASE INITIALIZATION & DATA MIGRATION
-- Generated on 2026-08-23T17:28:36.368Z
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------------------------
-- DROP EXISTING TABLES (CLEAN SLATE)
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS admin_permissions CASCADE;
DROP TABLE IF EXISTS activity_scans CASCADE;
DROP TABLE IF EXISTS event_activities CASCADE;
DROP TABLE IF EXISTS event_team CASCADE;
DROP TABLE IF EXISTS admin_logs CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS registrations CASCADE;
DROP TABLE IF EXISTS ticket_types CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- -------------------------------------------------------------------------
-- CREATE TABLES & INDEXES
-- -------------------------------------------------------------------------

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

-- -------------------------------------------------------------------------
-- DATA FOR TABLE: users
-- -------------------------------------------------------------------------
INSERT INTO users (username, name, email, password_hash, avatar, bio, created_at, updated_at, role, mobile, org, status, first_name, last_name, date_of_birth, gender, occupation_type, institution_name, class_level, position, district) VALUES ('zobaerahmed', 'Zobaer Ahmed', 'zobaerahmed@Somavesh.rongplan.com', '$2a$10$ROju9ERTWOLGM6KaTUQiOeZA/6n4/2AeIGNSxEJWwQr09jr4m7lui', 'https://pub-210b74cd36d646bbbb826f533facbe35.r2.dev/avatars/zobaerahmed.webp?v=1786554951584', 'VP', '2026-08-06T17:55:13.971Z'::timestamptz, '2026-08-12T17:38:25.014Z'::timestamptz, 'ADMIN', '+880 1783503006', NULL, 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO users (username, name, email, password_hash, avatar, bio, created_at, updated_at, role, mobile, org, status, first_name, last_name, date_of_birth, gender, occupation_type, institution_name, class_level, position, district) VALUES ('organizer', 'ICD Information Technology Club', 'organizer@Somavesh.rongplan.com', '$2a$10$ROju9ERTWOLGM6KaTUQiOeZA/6n4/2AeIGNSxEJWwQr09jr4m7lui', 'https://pub-210b74cd36d646bbbb826f533facbe35.r2.dev/avatars/organizer.webp?v=1786554453782', 'ICDITC', '2026-08-06T17:55:13.971Z'::timestamptz, '2026-08-12T17:09:09.467Z'::timestamptz, 'ORGANIZER', NULL, 'Somavesh Events', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO users (username, name, email, password_hash, avatar, bio, created_at, updated_at, role, mobile, org, status, first_name, last_name, date_of_birth, gender, occupation_type, institution_name, class_level, position, district) VALUES ('eventmanager', 'Event Manager', 'eventmanager@Somavesh.rongplan.com', '$2a$10$g0mO.XAXHLdDIXmAAP9Wh.SDU2la7PAS7kRTZ3wlwxiWcunCA5FDe', NULL, NULL, '2026-08-12T18:40:37.068Z'::timestamptz, '2026-08-12T18:40:37.068Z'::timestamptz, 'USER', NULL, NULL, 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO users (username, name, email, password_hash, avatar, bio, created_at, updated_at, role, mobile, org, status, first_name, last_name, date_of_birth, gender, occupation_type, institution_name, class_level, position, district) VALUES ('participant', 'Participant', 'participant@Somavesh.rongplan.com', '$2a$10$ROju9ERTWOLGM6KaTUQiOeZA/6n4/2AeIGNSxEJWwQr09jr4m7lui', 'https://pub-210b74cd36d646bbbb826f533facbe35.r2.dev/avatars/participant.webp?v=1786560782541', 'Want to participant the tech events', '2026-08-06T17:55:13.971Z'::timestamptz, '2026-08-13T02:50:42.444Z'::timestamptz, 'USER', '0173295038', NULL, 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO users (username, name, email, password_hash, avatar, bio, created_at, updated_at, role, mobile, org, status, first_name, last_name, date_of_birth, gender, occupation_type, institution_name, class_level, position, district) VALUES ('abdulaziz', 'Md Abdul Aziz', 'abdulaziz@Somavesh.rongplan.com', '$2a$10$ROju9ERTWOLGM6KaTUQiOeZA/6n4/2AeIGNSxEJWwQr09jr4m7lui', 'https://pub-210b74cd36d646bbbb826f533facbe35.r2.dev/avatars/abdulaziz.webp?v=1787171383958', 'Software Enginner at Rong Plan
', '2026-08-06T17:55:13.971Z'::timestamptz, '2026-08-19T21:06:09.172Z'::timestamptz, 'SUPER_ADMIN', '01857517588', NULL, 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- -------------------------------------------------------------------------
-- DATA FOR TABLE: events
-- -------------------------------------------------------------------------
INSERT INTO events (id, slug, title, date, time, location, capacity, host_username, created_at, updated_at, contact_email, contact_phone, description, status, thumbnail, start_date, end_date, registration_deadline, form_phone, form_job_title, form_organization, form_tshirt_size, form_reference, form_transaction_id, is_private, event_for, student_category) VALUES (21, 'bnhgv', 'bnhgv', '2026-08-04', '09:53 AM - 02:51 AM', 'fgvchg', 500, 'abdulaziz', '2026-08-13T03:54:00.698Z'::timestamptz, '2026-08-13T04:39:12.538Z'::timestamptz, 'abdulaziz@Somavesh.rongplan.com', '01857517588', 'fgh', 'DRAFT', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&h=450&fit=crop', NULL, NULL, NULL, true, true, true, false, false, false, false, 'BOTH', NULL);
INSERT INTO events (id, slug, title, date, time, location, capacity, host_username, created_at, updated_at, contact_email, contact_phone, description, status, thumbnail, start_date, end_date, registration_deadline, form_phone, form_job_title, form_organization, form_tshirt_size, form_reference, form_transaction_id, is_private, event_for, student_category) VALUES (19, 'test2', 'test2', 'Aug 20, 2026', '11:52 AM - 02:52 AM', 'xczdc', 500, 'organizer', '2026-08-12T04:52:39.022Z'::timestamptz, '2026-08-12T04:52:39.022Z'::timestamptz, 'organizer@Somavesh.rongplan.com', '01732959038', 'aSDf', 'PUBLISHED', 'https://pub-210b74cd36d646bbbb826f533facbe35.r2.dev/banners/temp-1786510330405-1786510330463.webp', NULL, NULL, NULL, true, true, true, false, false, false, false, 'BOTH', NULL);
INSERT INTO events (id, slug, title, date, time, location, capacity, host_username, created_at, updated_at, contact_email, contact_phone, description, status, thumbnail, start_date, end_date, registration_deadline, form_phone, form_job_title, form_organization, form_tshirt_size, form_reference, form_transaction_id, is_private, event_for, student_category) VALUES (20, 'test3', 'test3', 'Aug 29, 2026', '01:52 AM - 04:57 AM', 'sdfc', 500, 'organizer', '2026-08-12T04:53:12.757Z'::timestamptz, '2026-08-13T07:29:57.117Z'::timestamptz, 'organizer@Somavesh.rongplan.com', '01732959038', 'adfsc', 'PUBLISHED', 'https://pub-210b74cd36d646bbbb826f533facbe35.r2.dev/banners/temp-1786510387025-1786510387059.webp', NULL, NULL, NULL, true, true, true, true, true, true, false, 'BOTH', NULL);
INSERT INTO events (id, slug, title, date, time, location, capacity, host_username, created_at, updated_at, contact_email, contact_phone, description, status, thumbnail, start_date, end_date, registration_deadline, form_phone, form_job_title, form_organization, form_tshirt_size, form_reference, form_transaction_id, is_private, event_for, student_category) VALUES (22, 'rfgt', 'rfgt', 'Aug 10, 2026', '05:20 AM - 07:17 AM', 'rfdg', 500, 'abdulaziz', '2026-08-19T21:21:09.258Z'::timestamptz, '2026-08-23T16:41:13.219Z'::timestamptz, 'abdulaziz@Somavesh.rongplan.com', '01857517588', 'edrf', 'PUBLISHED', 'https://pub-210b74cd36d646bbbb826f533facbe35.r2.dev/banners/temp-1787503270772.webp?v=1787503271220', NULL, NULL, NULL, true, true, true, false, false, false, false, 'BOTH', NULL);

-- Reset sequence for events
SELECT setval(pg_get_serial_sequence('events', 'id'), COALESCE(MAX(id), 1)) FROM events;

-- -------------------------------------------------------------------------
-- DATA FOR TABLE: ticket_types
-- -------------------------------------------------------------------------
INSERT INTO ticket_types (id, event_id, name, description, price, currency, capacity, sort_order, is_active, sale_start, sale_end, created_at, updated_at, is_team, max_team_size) VALUES (2, 19, 'Standard Pass', 'General Access to the event.', '0.00', 'BDT', 500, 0, true, NULL, NULL, '2026-08-12T04:52:39.480Z'::timestamptz, '2026-08-12T04:52:39.480Z'::timestamptz, false, 1);
INSERT INTO ticket_types (id, event_id, name, description, price, currency, capacity, sort_order, is_active, sale_start, sale_end, created_at, updated_at, is_team, max_team_size) VALUES (3, 20, 'Standard Pass', 'General Access to the event.', '0.00', 'BDT', 400, 0, true, NULL, NULL, '2026-08-12T04:53:13.192Z'::timestamptz, '2026-08-13T04:41:33.636Z'::timestamptz, false, 1);
INSERT INTO ticket_types (id, event_id, name, description, price, currency, capacity, sort_order, is_active, sale_start, sale_end, created_at, updated_at, is_team, max_team_size) VALUES (4, 20, 'VIP', 'dsfc', '0.00', 'BDT', 100, 0, true, NULL, NULL, '2026-08-12T04:55:42.057Z'::timestamptz, '2026-08-13T04:41:33.805Z'::timestamptz, false, 1);

-- Reset sequence for ticket_types
SELECT setval(pg_get_serial_sequence('ticket_types', 'id'), COALESCE(MAX(id), 1)) FROM ticket_types;

-- -------------------------------------------------------------------------
-- DATA FOR TABLE: registrations
-- -------------------------------------------------------------------------
-- (No rows)

-- -------------------------------------------------------------------------
-- DATA FOR TABLE: payments
-- -------------------------------------------------------------------------
-- (No rows)

-- -------------------------------------------------------------------------
-- DATA FOR TABLE: admin_logs
-- -------------------------------------------------------------------------
INSERT INTO admin_logs (id, admin_username, action, target_type, target_id, details, created_at) VALUES (1, 'abdulaziz', 'DELETE_EVENT', 'EVENT', '14', '{"slug":"hghfd","title":"hghfd"}'::jsonb, '2026-08-09T20:57:57.230Z'::timestamptz);
INSERT INTO admin_logs (id, admin_username, action, target_type, target_id, details, created_at) VALUES (2, 'abdulaziz', 'DELETE_EVENT', 'EVENT', '7', '{"slug":"digital-commerce-summit-2026","title":"Digital Commerce Summit 2026"}'::jsonb, '2026-08-09T20:58:00.011Z'::timestamptz);
INSERT INTO admin_logs (id, admin_username, action, target_type, target_id, details, created_at) VALUES (3, 'abdulaziz', 'DELETE_EVENT', 'EVENT', '2', '{"slug":"national-tech-summit-2026","title":"National Tech Summit 2026"}'::jsonb, '2026-08-09T20:58:00.307Z'::timestamptz);
INSERT INTO admin_logs (id, admin_username, action, target_type, target_id, details, created_at) VALUES (4, 'abdulaziz', 'DELETE_EVENT', 'EVENT', '9', '{"slug":"green-energy-sustainability-summit","title":"Green Energy & Sustainability Summit"}'::jsonb, '2026-08-09T20:58:00.681Z'::timestamptz);
INSERT INTO admin_logs (id, admin_username, action, target_type, target_id, details, created_at) VALUES (5, 'abdulaziz', 'DELETE_EVENT', 'EVENT', '10', '{"slug":"women-in-tech-conference-2026","title":"Women In Tech Conference 2026"}'::jsonb, '2026-08-09T20:58:01.090Z'::timestamptz);
INSERT INTO admin_logs (id, admin_username, action, target_type, target_id, details, created_at) VALUES (6, 'abdulaziz', 'DELETE_EVENT', 'EVENT', '11', '{"slug":"blockchain-web3-hackathon","title":"Blockchain & Web3 National Hackathon"}'::jsonb, '2026-08-09T20:58:01.383Z'::timestamptz);
INSERT INTO admin_logs (id, admin_username, action, target_type, target_id, details, created_at) VALUES (7, 'abdulaziz', 'DELETE_EVENT', 'EVENT', '8', '{"slug":"corporate-finance-symposium","title":"Corporate Finance Symposium"}'::jsonb, '2026-08-09T20:58:01.681Z'::timestamptz);
INSERT INTO admin_logs (id, admin_username, action, target_type, target_id, details, created_at) VALUES (8, 'abdulaziz', 'DELETE_EVENT', 'EVENT', '3', '{"slug":"marketing-revolution-masterclass","title":"Marketing Revolution Masterclass"}'::jsonb, '2026-08-09T20:58:02.137Z'::timestamptz);
INSERT INTO admin_logs (id, admin_username, action, target_type, target_id, details, created_at) VALUES (9, 'abdulaziz', 'DELETE_EVENT', 'EVENT', '4', '{"slug":"youth-leadership-conclave-2026","title":"Youth Leadership Conclave 2026"}'::jsonb, '2026-08-09T20:58:02.481Z'::timestamptz);
INSERT INTO admin_logs (id, admin_username, action, target_type, target_id, details, created_at) VALUES (10, 'abdulaziz', 'DELETE_EVENT', 'EVENT', '6', '{"slug":"ai-and-future-work-forum","title":"AI & Future of Work Forum"}'::jsonb, '2026-08-09T20:58:05.346Z'::timestamptz);
INSERT INTO admin_logs (id, admin_username, action, target_type, target_id, details, created_at) VALUES (11, 'abdulaziz', 'DELETE_EVENT', 'EVENT', '5', '{"slug":"bangladesh-start-up-expo","title":"Bangladesh Startup Expo"}'::jsonb, '2026-08-09T20:58:08.120Z'::timestamptz);
INSERT INTO admin_logs (id, admin_username, action, target_type, target_id, details, created_at) VALUES (12, 'abdulaziz', 'DELETE_EVENT', 'EVENT', '12', '{"slug":"test","title":"test"}'::jsonb, '2026-08-09T20:58:09.465Z'::timestamptz);
INSERT INTO admin_logs (id, admin_username, action, target_type, target_id, details, created_at) VALUES (13, 'abdulaziz', 'ADMIN_ADD_EVENT_TEAM', 'EVENT', '19', '{"role":"MANAGER","username":"participant"}'::jsonb, '2026-08-12T05:54:05.091Z'::timestamptz);
INSERT INTO admin_logs (id, admin_username, action, target_type, target_id, details, created_at) VALUES (14, 'abdulaziz', 'ADMIN_REMOVE_EVENT_TEAM', 'EVENT', '19', '{"username":"participant"}'::jsonb, '2026-08-12T05:54:12.715Z'::timestamptz);
INSERT INTO admin_logs (id, admin_username, action, target_type, target_id, details, created_at) VALUES (15, 'abdulaziz', 'ADMIN_ADD_EVENT_TEAM', 'EVENT', '19', '{"role":"ORGANIZER","username":"participant"}'::jsonb, '2026-08-12T05:54:15.996Z'::timestamptz);
INSERT INTO admin_logs (id, admin_username, action, target_type, target_id, details, created_at) VALUES (16, 'abdulaziz', 'UPDATE_USER_ROLE', 'USER', 'participant', '{"newRole":"ORGANIZER"}'::jsonb, '2026-08-12T05:54:30.242Z'::timestamptz);
INSERT INTO admin_logs (id, admin_username, action, target_type, target_id, details, created_at) VALUES (17, 'abdulaziz', 'ADMIN_UPDATE_EVENT', 'EVENT', '15', '{"date":"2026-08-09","time":"12:99 AM","title":"test1","status":"DRAFT","capacity":500,"location":"sdfvds","description":"sdf","contact_email":"abdulaziz@Somavesh.rongplan.com","contact_phone":"354436436435","host_username":"abdulaziz"}'::jsonb, '2026-08-12T06:40:45.471Z'::timestamptz);
INSERT INTO admin_logs (id, admin_username, action, target_type, target_id, details, created_at) VALUES (18, 'abdulaziz', 'DELETE_EVENT', 'EVENT', '15', '{"slug":"test1","title":"test1"}'::jsonb, '2026-08-12T06:41:35.786Z'::timestamptz);
INSERT INTO admin_logs (id, admin_username, action, target_type, target_id, details, created_at) VALUES (19, 'abdulaziz', 'DELETE_EVENT', 'EVENT', '13', '{"slug":"grandgala2026","title":"Grand Gala 2026"}'::jsonb, '2026-08-12T06:41:47.483Z'::timestamptz);
INSERT INTO admin_logs (id, admin_username, action, target_type, target_id, details, created_at) VALUES (20, 'zobaerahmed', 'ADMIN_REMOVE_EVENT_TEAM', 'EVENT', '20', '{"username":"participant"}'::jsonb, '2026-08-12T17:17:24.318Z'::timestamptz);
INSERT INTO admin_logs (id, admin_username, action, target_type, target_id, details, created_at) VALUES (21, 'zobaerahmed', 'ADMIN_ADD_EVENT_TEAM', 'EVENT', '20', '{"role":"SCANNER","username":"participant"}'::jsonb, '2026-08-12T17:17:34.611Z'::timestamptz);
INSERT INTO admin_logs (id, admin_username, action, target_type, target_id, details, created_at) VALUES (22, 'abdulaziz', 'DELETE_USER', 'USER', 'eventmanager', NULL, '2026-08-12T17:37:15.120Z'::timestamptz);
INSERT INTO admin_logs (id, admin_username, action, target_type, target_id, details, created_at) VALUES (23, 'abdulaziz', 'UPDATE_USER', 'USER', 'participant', '{"org":"sdf","name":"Participant","role":"ORGANIZER","email":"participant@Somavesh.rongplan.com","mobile":"0173295038","status":"ACTIVE"}'::jsonb, '2026-08-12T17:37:20.857Z'::timestamptz);
INSERT INTO admin_logs (id, admin_username, action, target_type, target_id, details, created_at) VALUES (24, 'abdulaziz', 'UPDATE_USER', 'USER', 'participant', '{"org":"sdf","name":"Participant","role":"USER","email":"participant@Somavesh.rongplan.com","mobile":"0173295038","status":"ACTIVE"}'::jsonb, '2026-08-12T17:37:30.601Z'::timestamptz);
INSERT INTO admin_logs (id, admin_username, action, target_type, target_id, details, created_at) VALUES (25, 'abdulaziz', 'UPDATE_USER', 'USER', 'abdulaziz', '{"org":"Rong Plan","name":"Md Abdul Aziz","role":"SUPER_ADMIN","email":"abdulaziz@Somavesh.rongplan.com","mobile":"01857517588","status":"ACTIVE"}'::jsonb, '2026-08-12T17:38:04.637Z'::timestamptz);
INSERT INTO admin_logs (id, admin_username, action, target_type, target_id, details, created_at) VALUES (26, 'abdulaziz', 'UPDATE_USER', 'USER', 'zobaerahmed', '{"org":"Rong Plan","name":"Zobaer Ahmed","role":"ADMIN","email":"zobaerahmed@Somavesh.rongplan.com","mobile":"+880 1783503006","status":"ACTIVE"}'::jsonb, '2026-08-12T17:38:25.068Z'::timestamptz);
INSERT INTO admin_logs (id, admin_username, action, target_type, target_id, details, created_at) VALUES (27, 'abdulaziz', 'UPDATE_USER', 'USER', 'testuser123', '{"org":"Test Org","name":"Test User","role":"ORGANIZER","email":"testuser123@example.com","mobile":"+8801712345678","status":"ACTIVE"}'::jsonb, '2026-08-13T02:44:51.398Z'::timestamptz);
INSERT INTO admin_logs (id, admin_username, action, target_type, target_id, details, created_at) VALUES (28, 'abdulaziz', 'ADMIN_REMOVE_EVENT_TEAM', 'EVENT', '19', '{"username":"participant"}'::jsonb, '2026-08-13T02:46:41.352Z'::timestamptz);
INSERT INTO admin_logs (id, admin_username, action, target_type, target_id, details, created_at) VALUES (29, 'abdulaziz', 'UPDATE_USER', 'USER', 'participant', '{"org":"","name":"Participant","role":"ORGANIZER","email":"participant@Somavesh.rongplan.com","mobile":"0173295038","status":"ACTIVE"}'::jsonb, '2026-08-13T02:48:48.072Z'::timestamptz);
INSERT INTO admin_logs (id, admin_username, action, target_type, target_id, details, created_at) VALUES (30, 'abdulaziz', 'UPDATE_USER', 'USER', 'participant', '{"org":"","name":"Participant","role":"USER","email":"participant@Somavesh.rongplan.com","mobile":"0173295038","status":"ACTIVE"}'::jsonb, '2026-08-13T02:50:42.494Z'::timestamptz);
INSERT INTO admin_logs (id, admin_username, action, target_type, target_id, details, created_at) VALUES (31, 'abdulaziz', 'ADMIN_ADD_EVENT_TEAM', 'EVENT', '21', '{"role":"ORGANIZER","username":"organizer"}'::jsonb, '2026-08-13T03:54:23.751Z'::timestamptz);
INSERT INTO admin_logs (id, admin_username, action, target_type, target_id, details, created_at) VALUES (32, 'abdulaziz', 'ADMIN_REMOVE_EVENT_TEAM', 'EVENT', '21', '{"username":"abdulaziz"}'::jsonb, '2026-08-13T03:54:26.930Z'::timestamptz);
INSERT INTO admin_logs (id, admin_username, action, target_type, target_id, details, created_at) VALUES (33, 'abdulaziz', 'ADMIN_ADD_EVENT_TEAM', 'EVENT', '21', '{"role":"ORGANIZER","username":"abdulaziz"}'::jsonb, '2026-08-13T03:54:49.132Z'::timestamptz);
INSERT INTO admin_logs (id, admin_username, action, target_type, target_id, details, created_at) VALUES (34, 'abdulaziz', 'ADMIN_UPDATE_EVENT', 'EVENT', '21', '{"date":"2026-08-04","slug":"bnhgv","time":"09:53 AM - 02:51 AM","title":"bnhgv","status":"DRAFT","capacity":500,"location":"fgvchg","description":"fgh","contactEmail":"abdulaziz@Somavesh.rongplan.com","contactPhone":"01857517588","hostUsername":"abdulaziz"}'::jsonb, '2026-08-13T04:39:13.050Z'::timestamptz);
INSERT INTO admin_logs (id, admin_username, action, target_type, target_id, details, created_at) VALUES (35, 'abdulaziz', 'DELETE_USER', 'USER', 'testuser123', NULL, '2026-08-19T20:28:27.968Z'::timestamptz);

-- Reset sequence for admin_logs
SELECT setval(pg_get_serial_sequence('admin_logs', 'id'), COALESCE(MAX(id), 1)) FROM admin_logs;

-- -------------------------------------------------------------------------
-- DATA FOR TABLE: event_team
-- -------------------------------------------------------------------------
INSERT INTO event_team (id, event_id, username, role, invited_by, joined_at) VALUES (15, 19, 'organizer', 'ORGANIZER', NULL, '2026-08-12T04:52:39.022Z'::timestamptz);
INSERT INTO event_team (id, event_id, username, role, invited_by, joined_at) VALUES (16, 20, 'organizer', 'ORGANIZER', NULL, '2026-08-12T04:53:12.757Z'::timestamptz);
INSERT INTO event_team (id, event_id, username, role, invited_by, joined_at) VALUES (25, 19, 'participant', 'SCANNER', 'organizer', '2026-08-13T02:47:26.915Z'::timestamptz);
INSERT INTO event_team (id, event_id, username, role, invited_by, joined_at) VALUES (27, 21, 'organizer', 'ORGANIZER', 'abdulaziz', '2026-08-13T03:54:23.698Z'::timestamptz);
INSERT INTO event_team (id, event_id, username, role, invited_by, joined_at) VALUES (28, 21, 'abdulaziz', 'ORGANIZER', 'abdulaziz', '2026-08-13T03:54:49.080Z'::timestamptz);
INSERT INTO event_team (id, event_id, username, role, invited_by, joined_at) VALUES (29, 22, 'abdulaziz', 'ORGANIZER', NULL, '2026-08-19T21:21:09.258Z'::timestamptz);

-- Reset sequence for event_team
SELECT setval(pg_get_serial_sequence('event_team', 'id'), COALESCE(MAX(id), 1)) FROM event_team;

-- -------------------------------------------------------------------------
-- DATA FOR TABLE: event_activities
-- -------------------------------------------------------------------------
INSERT INTO event_activities (id, event_id, name, scan_limit, is_active, sort_order, created_at) VALUES (15, 19, 'Check-in', 1, true, 0, '2026-08-12T04:52:39.022Z'::timestamptz);
INSERT INTO event_activities (id, event_id, name, scan_limit, is_active, sort_order, created_at) VALUES (16, 20, 'Check-in', 1, true, 0, '2026-08-12T04:53:12.757Z'::timestamptz);
INSERT INTO event_activities (id, event_id, name, scan_limit, is_active, sort_order, created_at) VALUES (17, 21, 'Check-in', 1, true, 0, '2026-08-13T03:54:00.698Z'::timestamptz);
INSERT INTO event_activities (id, event_id, name, scan_limit, is_active, sort_order, created_at) VALUES (18, 20, 'Food', 1, true, 0, '2026-08-13T07:25:06.787Z'::timestamptz);
INSERT INTO event_activities (id, event_id, name, scan_limit, is_active, sort_order, created_at) VALUES (19, 22, 'Check-in', 1, true, 0, '2026-08-19T21:21:09.258Z'::timestamptz);
INSERT INTO event_activities (id, event_id, name, scan_limit, is_active, sort_order, created_at) VALUES (20, 22, 'Food', 1, true, 1, '2026-08-19T21:21:09.258Z'::timestamptz);
INSERT INTO event_activities (id, event_id, name, scan_limit, is_active, sort_order, created_at) VALUES (21, 22, 'Gift', 1, true, 2, '2026-08-19T21:21:09.258Z'::timestamptz);
INSERT INTO event_activities (id, event_id, name, scan_limit, is_active, sort_order, created_at) VALUES (22, 22, 'Certificate', 1, true, 3, '2026-08-19T21:21:09.258Z'::timestamptz);

-- Reset sequence for event_activities
SELECT setval(pg_get_serial_sequence('event_activities', 'id'), COALESCE(MAX(id), 1)) FROM event_activities;

-- -------------------------------------------------------------------------
-- DATA FOR TABLE: activity_scans
-- -------------------------------------------------------------------------
-- (No rows)

-- -------------------------------------------------------------------------
-- DATA FOR TABLE: admin_permissions
-- -------------------------------------------------------------------------
-- (No rows)

-- -------------------------------------------------------------------------
-- DATA FOR TABLE: schedules
-- -------------------------------------------------------------------------
-- (No rows)

