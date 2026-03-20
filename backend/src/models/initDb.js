const { Pool } = require('pg');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables explicitly for the script
const envPath = path.resolve(__dirname, '../../.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ FATAL: .env file missing. Please create one from .env.example');
  process.exit(1);
}
dotenv.config({ path: envPath });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ FATAL: DATABASE_URL environment variable is missing.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: process.env.NODE_ENV === 'production' 
    ? { 
        rejectUnauthorized: true, 
        ca: process.env.DB_SSL_CA ? fs.readFileSync(process.env.DB_SSL_CA).toString() : undefined 
      } 
    : false
});

async function initDb() {
  try {
    // 1. Create delivery_logs
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS delivery_logs (
          id SERIAL PRIMARY KEY,
          rider_id INTEGER REFERENCES riders(id) ON DELETE CASCADE,
          delivery_earning DECIMAL(10,2) NOT NULL,
          premium_deducted DECIMAL(10,2) NOT NULL,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ delivery_logs table created or verified.');
    } catch (err) {
      console.error('❌ Failed to create delivery_logs table (riders table might not exist):', err);
      throw err;
    }

    // 2. Add actual_duration_hours to disruption_events
    try {
      await pool.query(`
        ALTER TABLE disruption_events 
        ADD COLUMN actual_duration_hours DECIMAL(5,2) DEFAULT NULL;
      `);
      console.log('✅ Added actual_duration_hours to disruption_events.');
    } catch (err) {
      if (err.code === '42701') {
        console.log('⏩ column "actual_duration_hours" already exists.');
      } else if (err.code === '42P01') {
        // Table doesn't exist, create it
        await pool.query(`
          CREATE TABLE disruption_events (
            id SERIAL PRIMARY KEY,
            city VARCHAR(100) NOT NULL,
            event_type VARCHAR(50) NOT NULL,
            severity VARCHAR(20) NOT NULL,
            start_time TIMESTAMP NOT NULL,
            end_time TIMESTAMP,
            actual_duration_hours DECIMAL(5,2) DEFAULT NULL,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
        console.log('✅ disruption_events table created.');
      } else {
        throw err;
      }
    }

    // 3. Ensure tenure_months and lifetime_avg_rating exist on riders
    try {
       await pool.query(`ALTER TABLE riders ADD COLUMN IF NOT EXISTS tenure_months INTEGER DEFAULT 0;`);
       console.log('✅ Added or verified tenure_months on riders.');
    } catch (err) {
       console.error('❌ Failed to add tenure_months to riders:', err.message);
       throw err;
    }
    
    try {
       await pool.query(`ALTER TABLE riders ADD COLUMN IF NOT EXISTS lifetime_avg_rating DECIMAL(3,2) DEFAULT 4.5;`);
       console.log('✅ Added or verified lifetime_avg_rating on riders.');
    } catch (err) {
       console.error('❌ Failed to add lifetime_avg_rating to riders:', err.message);
       throw err;
    }

    // 4. Create rider_pings for Anti-Spoofing
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS rider_pings (
          id SERIAL PRIMARY KEY,
          rider_id INTEGER REFERENCES riders(id) ON DELETE CASCADE,
          lat DECIMAL(10, 8) NOT NULL,
          lng DECIMAL(11, 8) NOT NULL,
          accuracy DECIMAL(5, 2),
          speed DECIMAL(5, 2),
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          is_mocked BOOLEAN DEFAULT false
        );
      `);
      console.log('✅ rider_pings table created.');
      
      // Scale Indexes
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_pings_rider_time ON rider_pings(rider_id, timestamp DESC);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_riders_phone ON riders(phone);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_riders_email ON riders(email);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_riders_firebase ON riders(firebase_uid);`);
      console.log('✅ Performance indexes created.');
    } catch (err) {
      console.error('❌ Failed to create rider_pings or indexes:', err.message);
      throw err;
    }

    // 5. Create fraud_flags for persistent auditing
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS fraud_flags (
          id SERIAL PRIMARY KEY,
          rider_id INTEGER REFERENCES riders(id) ON DELETE CASCADE,
          city VARCHAR(100),
          risk_score DECIMAL(3, 2),
          reason TEXT,
          metadata JSONB,
          flagged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ fraud_flags table created.');
    } catch (err) {
      console.error('❌ Failed to create fraud_flags table:', err.message);
      throw err;
    }

    console.log('🎉 Database migrations complete!');
    await pool.end();
    process.exit(0);

  } catch (err) {
    console.error('❌ Migration failed:', err);
    await pool.end();
    process.exit(1);
  }
}

initDb();
