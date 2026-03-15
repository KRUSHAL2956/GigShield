const { pool } = require('./db');

const Claim = {
  // Get claims history for a rider
  async findByRiderId(riderId, limit = 10) {
    const result = await pool.query(
      `SELECT c.*, e.disruption_type, e.city, e.started_at as event_date
       FROM claims c
       JOIN disruption_events e ON c.event_id = e.id
       WHERE c.rider_id = $1
       ORDER BY c.created_at DESC
       LIMIT $2`,
      [riderId, limit]
    );
    return result.rows;
  },

  // Get claim stats for dashboard
  async getStats(riderId) {
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_count,
        COALESCE(SUM(final_payout) FILTER (WHERE status = 'paid'), 0) as total_paid,
        COALESCE(SUM(raw_payout) FILTER (WHERE status = 'pending'), 0) as total_pending,
        COUNT(*) FILTER (WHERE status = 'fraud_blocked') as blocked_count
       FROM claims
       WHERE rider_id = $1`,
      [riderId]
    );
    return result.rows[0];
  }
};

module.exports = Claim;
