import { pool } from '../db/pool';
import { AuthService } from '../services/auth.service';
import { EventService } from '../services/event.service';
import logger from '../lib/logger';

export async function setupTestDatabase() {
  const client = await pool.connect();
  try {
    logger.info('Cleaning up test artifacts from database...');
    await client.query("DELETE FROM registrations WHERE email LIKE '%@test.rong-plan.com'");
    await client.query("DELETE FROM events WHERE slug LIKE 'test-event-%'");
    await client.query("DELETE FROM users WHERE email LIKE '%@test.rong-plan.com'");
  } catch (err: any) {
    logger.warn({ err }, 'Error during setupTestDatabase cleanup');
  } finally {
    client.release();
  }
}

export async function createTestUser(username = 'testuser_qa', role: 'SUPER_ADMIN' | 'ADMIN' | 'ORGANIZER' | 'PARTICIPANT' = 'ORGANIZER') {
  const email = `${username}@test.rong-plan.com`;
  await AuthService.register(username, `${username} QA`, email, 'SecretPassword123!');
  // Elevate role if needed
  if (role !== 'PARTICIPANT') {
    await pool.query('UPDATE users SET role = $1 WHERE username = $2', [role, username]);
  }
  const loginRes = await AuthService.login(username, 'SecretPassword123!');
  return {
    username,
    email,
    token: loginRes.token,
    user: loginRes.user,
  };
}

export async function createTestEvent(hostUsername: string, slug = `test-event-${Date.now()}`) {
  const eventId = await EventService.createEvent({
    slug,
    title: 'QA Test Event',
    date: '30 Aug, 2026',
    time: '10:00 AM - 05:00 PM',
    location: 'QA Testing Lab, Dhaka',
    capacity: 50,
    hostUsername,
  });
  return { eventId, slug };
}
