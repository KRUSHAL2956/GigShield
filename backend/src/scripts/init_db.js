const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function initDb() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ Error: DATABASE_URL not found in .env');
    process.exit(1);
  }

  console.log('🚀 Initializing Cloud Database...');
  
  const sslConfig = () => {
    if (process.env.NODE_ENV === 'production' || process.env.PG_SSL === 'true') {
      return {
        rejectUnauthorized: true,
        ca: process.env.PG_SSL_CA ? process.env.PG_SSL_CA.replace(/\\n/g, '\n') : undefined
      };
    }
    return { rejectUnauthorized: false };
  };

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: sslConfig()
  });

  try {
    const schemaPath = path.join(__dirname, '../../../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📦 Running schema.sql...');
    await pool.query(schema);
    
    console.log('✅ Database schema initialized successfully!');
  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
    throw err;
  } finally {
    if (pool) await pool.end();
  }
}

initDb().catch((err) => {
  console.error('❌ Unhandled initialization error:', err.message);
  process.exit(1);
});
