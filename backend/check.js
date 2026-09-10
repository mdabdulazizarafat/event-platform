const { Client } = require('pg');
require('dotenv').config();

const client = new Client({ connectionString: process.env.DATABASE_URL });

client.connect()
  .then(() => client.query(`SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_name ilike 'event%' AND column_name IN ('start_date', 'end_date', 'registration_deadline')`))
  .then(res => console.log(res.rows))
  .finally(() => client.end());
