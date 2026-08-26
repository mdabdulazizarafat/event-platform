import { pool } from './pool';

async function alterForeignKeys() {
  const client = await pool.connect();
  try {
    const queries = [
      // 1. events.host_username
      `ALTER TABLE events DROP CONSTRAINT IF EXISTS events_host_username_fkey;`,
      `ALTER TABLE events ADD CONSTRAINT events_host_username_fkey FOREIGN KEY (host_username) REFERENCES users(username) ON UPDATE CASCADE ON DELETE CASCADE;`,

      // 2. registrations.user_id
      `ALTER TABLE registrations DROP CONSTRAINT IF EXISTS registrations_user_id_fkey;`,
      `ALTER TABLE registrations ADD CONSTRAINT registrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(username) ON UPDATE CASCADE ON DELETE CASCADE;`,

      // 3. admin_logs.admin_username
      `ALTER TABLE admin_logs DROP CONSTRAINT IF EXISTS admin_logs_admin_username_fkey;`,
      `ALTER TABLE admin_logs ADD CONSTRAINT admin_logs_admin_username_fkey FOREIGN KEY (admin_username) REFERENCES users(username) ON UPDATE CASCADE ON DELETE CASCADE;`,

      // 4. event_team.username
      `ALTER TABLE event_team DROP CONSTRAINT IF EXISTS event_team_username_fkey;`,
      `ALTER TABLE event_team ADD CONSTRAINT event_team_username_fkey FOREIGN KEY (username) REFERENCES users(username) ON UPDATE CASCADE ON DELETE CASCADE;`,

      // 5. event_team.invited_by
      `ALTER TABLE event_team DROP CONSTRAINT IF EXISTS event_team_invited_by_fkey;`,
      `ALTER TABLE event_team ADD CONSTRAINT event_team_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES users(username) ON UPDATE CASCADE ON DELETE SET NULL;`,

      // 6. activity_scans.scanned_by
      `ALTER TABLE activity_scans DROP CONSTRAINT IF EXISTS activity_scans_scanned_by_fkey;`,
      `ALTER TABLE activity_scans ADD CONSTRAINT activity_scans_scanned_by_fkey FOREIGN KEY (scanned_by) REFERENCES users(username) ON UPDATE CASCADE ON DELETE CASCADE;`,

      // 7. admin_permissions.username
      `ALTER TABLE admin_permissions DROP CONSTRAINT IF EXISTS admin_permissions_username_fkey;`,
      `ALTER TABLE admin_permissions ADD CONSTRAINT admin_permissions_username_fkey FOREIGN KEY (username) REFERENCES users(username) ON UPDATE CASCADE ON DELETE CASCADE;`,

      // 8. admin_permissions.granted_by
      `ALTER TABLE admin_permissions DROP CONSTRAINT IF EXISTS admin_permissions_granted_by_fkey;`,
      `ALTER TABLE admin_permissions ADD CONSTRAINT admin_permissions_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES users(username) ON UPDATE CASCADE ON DELETE SET NULL;`,

      // 9. certificates.issued_to
      `ALTER TABLE certificates DROP CONSTRAINT IF EXISTS certificates_issued_to_fkey;`,
      `ALTER TABLE certificates ADD CONSTRAINT certificates_issued_to_fkey FOREIGN KEY (issued_to) REFERENCES users(username) ON UPDATE CASCADE ON DELETE CASCADE;`,

      // 10. certificates.issued_by
      `ALTER TABLE certificates DROP CONSTRAINT IF EXISTS certificates_issued_by_fkey;`,
      `ALTER TABLE certificates ADD CONSTRAINT certificates_issued_by_fkey FOREIGN KEY (issued_by) REFERENCES users(username) ON UPDATE CASCADE ON DELETE SET NULL;`,

      // 11. registration_team_members.username
      `ALTER TABLE registration_team_members DROP CONSTRAINT IF EXISTS registration_team_members_username_fkey;`,
      `ALTER TABLE registration_team_members ADD CONSTRAINT registration_team_members_username_fkey FOREIGN KEY (username) REFERENCES users(username) ON UPDATE CASCADE ON DELETE CASCADE;`
    ];

    for (const q of queries) {
      await client.query(q);
    }
    console.log("Foreign keys successfully updated to include ON UPDATE CASCADE.");
  } catch (error) {
    console.error("Error altering foreign keys:", error);
  } finally {
    client.release();
    pool.end();
  }
}

alterForeignKeys();
