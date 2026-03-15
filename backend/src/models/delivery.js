const { pool } = require('./db');

const DeliveryLog = {
  // Create a new delivery log and deduct premium
  async create({ rider_id, delivery_earning, premium_pct }) {
    if (!rider_id || isNaN(Number(rider_id)) || Number(rider_id) <= 0 || delivery_earning === undefined || premium_pct === undefined || isNaN(delivery_earning) || isNaN(premium_pct) || Number(delivery_earning) < 0 || Number(premium_pct) < 0 || Number(premium_pct) > 100) {
      throw new Error("Invalid earning or premium inputs");
    }
    const cents = Math.round(Number(delivery_earning) * 100);
    const premium_cents = Math.round(cents * (Number(premium_pct) / 100));
    
    const result = await pool.query(
      `INSERT INTO delivery_logs (rider_id, delivery_earning, premium_deducted)
       VALUES ($1, $2, $3)
       RETURNING id, rider_id, delivery_earning, premium_deducted, created_at`,
      [rider_id, cents, premium_cents]
    );
    
    return {
      ...result.rows[0],
      delivery_earning: result.rows[0].delivery_earning / 100,
      premium_deducted: result.rows[0].premium_deducted / 100
    };
  },

  // Get weekly total premium deducted for a rider
  async getWeeklyPremiumTotal(rider_id) {
    if (!rider_id || isNaN(Number(rider_id)) || Number(rider_id) <= 0) {
      throw new Error("Invalid rider_id");
    }
    const result = await pool.query(
      `SELECT COALESCE(SUM(premium_deducted), 0) as total
       FROM delivery_logs
       WHERE rider_id = $1
       AND created_at >= date_trunc('week', CURRENT_DATE)`,
      [rider_id]
    );
    return parseInt(result.rows[0].total) / 100;
  },
  
  // Get recent deliveries for tracking
  async getRecentDeliveries(rider_id, limit = 10) {
     if (!rider_id || isNaN(Number(rider_id)) || Number(rider_id) <= 0) {
       throw new Error("Invalid rider_id");
     }
     const safeLimit = Math.min(Math.max(1, parseInt(limit, 10) || 10), 100);
     const result = await pool.query(
      `SELECT id, delivery_earning, premium_deducted, created_at
       FROM delivery_logs
       WHERE rider_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [rider_id, safeLimit]
    );
    return result.rows.map(row => ({
      ...row,
      delivery_earning: row.delivery_earning / 100,
      premium_deducted: row.premium_deducted / 100
    }));
  }
};

module.exports = DeliveryLog;
