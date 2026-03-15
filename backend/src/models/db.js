const { Pool } = require('pg');

const databaseUrl = process.env.DATABASE_URL || 
                    process.env.POSTGRES_URL || 
                    process.env.NEON_DATABASE_URL ||
                    process.env.POSTGRES_PRISMA_URL;

if (!databaseUrl) {
  console.error('❌ FATAL: Neither DATABASE_URL nor POSTGRES_URL environment variables exist.');
  process.exit(1);
}

const sslConfig = () => {
  if (process.env.NODE_ENV === 'production' || process.env.PG_SSL === 'true') {
    return {
      rejectUnauthorized: true,
      ca: process.env.PG_SSL_CA ? process.env.PG_SSL_CA.replace(/\\n/g, '\n') : undefined
    };
  }
  
  try {
    const url = new URL(databaseUrl);
    const hostname = url.hostname;
    const isAllowedCloudProvider = hostname === 'neon.tech' || 
                                   hostname.endsWith('.neon.tech') || 
                                   hostname.endsWith('.vercel-storage.com');

    if (isAllowedCloudProvider && process.env.NODE_ENV !== 'production') {
      return { 
        rejectUnauthorized: process.env.ALLOW_INSECURE_TLS === 'true' ? false : true,
        ca: process.env.SSL_CA || process.env.DB_SSL_CERT ? (process.env.SSL_CA || process.env.DB_SSL_CERT).replace(/\\n/g, '\n') : undefined
      };
    }
  } catch (err) {
    console.warn('⚠️ Failed to parse DATABASE_URL for SSL hostname check', err);
    return { rejectUnauthorized: process.env.ALLOW_INSECURE_TLS === 'true' ? false : true, ca: process.env.SSL_CA || process.env.DB_SSL_CERT ? (process.env.SSL_CA || process.env.DB_SSL_CERT).replace(/\\n/g, '\n') : undefined };
  }

  return false;
};

const pool = new Pool({
  connectionString: databaseUrl,
  max: process.env.VERCEL ? 5 : 20, 
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: sslConfig()
});

pool.on('connect', () => {
  console.log('📦 Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL pool error:', err);
});

module.exports = { pool };
