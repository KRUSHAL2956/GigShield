const { Pool } = require('pg');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ FATAL: DATABASE_URL environment variable is missing.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  max: process.env.VERCEL ? 5 : 20, // Lower limit for serverless to prevent connection exhaustion
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => {
  console.log('📦 Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL pool error:', err);
});

module.exports = { pool };
