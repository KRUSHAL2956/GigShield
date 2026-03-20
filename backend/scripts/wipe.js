require('dotenv').config();
const { pool } = require('../src/models/db');

async function performWipe() {
  const allowedEnvs = ['development', 'test', 'ci', 'local'];
  if (!allowedEnvs.includes(process.env.NODE_ENV)) {
    console.error(`ERROR: Cannot run wipe script in ${process.env.NODE_ENV} environment. Only allowed in: ${allowedEnvs.join(', ')}`);
    process.exit(1);
  }

  if (!process.argv.includes('--force')) {
    console.error('ERROR: You must pass --force to run this destructive script.');
    process.exit(1);
  }

  try {
    // Note: This currently only deletes a specific test rider. 
    // Change to 'DELETE FROM riders' to wipe the entire table.
    const res = await pool.query('DELETE FROM riders WHERE id = 1');
    console.log(`Successfully deleted ${res.rowCount} row(s).`);
  } catch(e) {
    console.error('Wipe failed:', e.message);
    process.exit(1);
  } finally {
    pool.end();
  }
}

performWipe();
