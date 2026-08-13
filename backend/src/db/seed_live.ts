import { pool } from './pool';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('Starting explicit seed on live database...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Core extensions
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // 2. Inject 5 seed/test accounts
    console.log('Seeding 5 test/live accounts...');
    const defaultPasswordHash = bcrypt.hashSync('RongPlan2026!@#', 10);
    const seeds = [
      {
        username: 'abdulaziz',
        name: 'Abdul Aziz',
        email: 'abdulaziz@ayojok.rongplan.com',
        password_hash: defaultPasswordHash,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE'
      },
      {
        username: 'zobaerahmed',
        name: 'Zobaer Ahmed',
        email: 'zobaerahmed@ayojok.rongplan.com',
        password_hash: defaultPasswordHash,
        role: 'ADMIN',
        status: 'ACTIVE'
      },
      {
        username: 'organizer',
        name: 'Event Organizer',
        email: 'organizer@ayojok.rongplan.com',
        password_hash: defaultPasswordHash,
        role: 'ORGANIZER',
        status: 'ACTIVE',
        org: 'Ayojok Events'
      },
      {
        username: 'eventmanager',
        name: 'Event Manager',
        email: 'eventmanager@ayojok.rongplan.com',
        password_hash: defaultPasswordHash,
        role: 'PARTICIPANT',
        status: 'ACTIVE'
      },
      {
        username: 'participant',
        name: 'Test Participant',
        email: 'participant@ayojok.rongplan.com',
        password_hash: defaultPasswordHash,
        role: 'PARTICIPANT',
        status: 'ACTIVE'
      }
    ];

    for (const seed of seeds) {
      await client.query(`
        INSERT INTO users (username, name, email, password_hash, role, status, org)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (username) DO UPDATE 
        SET email = EXCLUDED.email, role = EXCLUDED.role, status = EXCLUDED.status, org = EXCLUDED.org
      `, [
        seed.username,
        seed.name,
        seed.email,
        seed.password_hash,
        seed.role,
        seed.status,
        seed.org || null
      ]);
    }

    // 3. Inject 10 Events for the organizer
    console.log('Seeding 10 events for organizer...');
    const events = [
      {
        slug: 'national-tech-summit-2026',
        title: 'National Tech Summit 2026',
        date: '2026-09-15',
        time: '09:00',
        location: 'Bangabandhu International Conference Center, Dhaka',
        capacity: 1000,
        contact_email: 'techsummit@ayojok.rongplan.com',
        contact_phone: '+8801711000001'
      },
      {
        slug: 'marketing-revolution-masterclass',
        title: 'Marketing Revolution Masterclass',
        date: '2026-09-22',
        time: '14:00',
        location: 'Pan Pacific Sonargaon, Dhaka',
        capacity: 300,
        contact_email: 'marketing@ayojok.rongplan.com',
        contact_phone: '+8801711000002'
      },
      {
        slug: 'youth-leadership-conclave-2026',
        title: 'Youth Leadership Conclave 2026',
        date: '2026-10-05',
        time: '10:00',
        location: 'Radisson Blu Water Garden, Dhaka',
        capacity: 500,
        contact_email: 'youthconclave@ayojok.rongplan.com',
        contact_phone: '+8801711000003'
      },
      {
        slug: 'bangladesh-start-up-expo',
        title: 'Bangladesh Startup Expo',
        date: '2026-10-18',
        time: '09:00',
        location: 'BICC Hall of Fame, Dhaka',
        capacity: 2000,
        contact_email: 'startupexpo@ayojok.rongplan.com',
        contact_phone: '+8801711000004'
      },
      {
        slug: 'ai-and-future-work-forum',
        title: 'AI & Future of Work Forum',
        date: '2026-11-02',
        time: '11:00',
        location: 'Le Meridien, Dhaka',
        capacity: 250,
        contact_email: 'aiforum@ayojok.rongplan.com',
        contact_phone: '+8801711000005'
      },
      {
        slug: 'digital-commerce-summit-2026',
        title: 'Digital Commerce Summit 2026',
        date: '2026-11-15',
        time: '10:00',
        location: 'InterContinental, Dhaka',
        capacity: 800,
        contact_email: 'ecomsummit@ayojok.rongplan.com',
        contact_phone: '+8801711000006'
      },
      {
        slug: 'corporate-finance-symposium',
        title: 'Corporate Finance Symposium',
        date: '2026-11-28',
        time: '09:30',
        location: 'The Westin, Dhaka',
        capacity: 150,
        contact_email: 'finance@ayojok.rongplan.com',
        contact_phone: '+8801711000007'
      },
      {
        slug: 'green-energy-sustainability-summit',
        title: 'Green Energy & Sustainability Summit',
        date: '2026-12-10',
        time: '09:00',
        location: 'MIST Auditorium, Mirpur',
        capacity: 400,
        contact_email: 'sustainability@ayojok.rongplan.com',
        contact_phone: '+8801711000008'
      },
      {
        slug: 'women-in-tech-conference-2026',
        title: 'Women In Tech Conference 2026',
        date: '2026-12-18',
        time: '13:00',
        location: 'GP House, Dhaka',
        capacity: 350,
        contact_email: 'womenintech@ayojok.rongplan.com',
        contact_phone: '+8801711000009'
      },
      {
        slug: 'blockchain-web3-hackathon',
        title: 'Blockchain & Web3 National Hackathon',
        date: '2027-01-08',
        time: '08:00',
        location: 'IUT Campus, Gazipur',
        capacity: 600,
        contact_email: 'hackathon@ayojok.rongplan.com',
        contact_phone: '+8801711000010'
      }
    ];

    for (const e of events) {
      // Insert event details
      const insertQuery = `
        INSERT INTO events (slug, title, date, time, location, capacity, contact_email, contact_phone, host_username)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'organizer')
        ON CONFLICT (slug) DO UPDATE
        SET title = EXCLUDED.title, date = EXCLUDED.date, time = EXCLUDED.time,
            location = EXCLUDED.location, capacity = EXCLUDED.capacity,
            contact_email = EXCLUDED.contact_email, contact_phone = EXCLUDED.contact_phone
        RETURNING id;
      `;
      const res = await client.query(insertQuery, [
        e.slug,
        e.title,
        e.date,
        e.time,
        e.location,
        e.capacity,
        e.contact_email,
        e.contact_phone
      ]);
      const eventId = res.rows[0].id;

      // Normal table Architecture: No partition creation needed

      // Add to event_team as ORGANIZER
      await client.query(`
        INSERT INTO event_team (event_id, username, role)
        VALUES ($1, 'organizer', 'ORGANIZER')
        ON CONFLICT (event_id, username) DO NOTHING;
      `, [eventId]);

      // Create default activities
      const defaultActivities = ['Check-in', 'Food', 'Gift', 'Certificate'];
      for (let i = 0; i < defaultActivities.length; i++) {
        await client.query(`
          INSERT INTO event_activities (event_id, name, scan_limit, sort_order)
          VALUES ($1, $2, 1, $3);
        `, [eventId, defaultActivities[i], i]);
      }
    }

    await client.query('COMMIT');
    console.log('Seeding completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seeding failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
