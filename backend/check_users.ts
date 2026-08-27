import { pool } from './src/db/pool';

async function run() {
  const res = await pool.query("SELECT username, first_name, date_of_birth, institution_name, position FROM users WHERE username = 'participant'");
  console.log(res.rows);
  pool.end();
}
run();
