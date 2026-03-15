const { pool } = require('./db');

const Policy = {
  // Get active policy for a rider
  async findActiveByRiderId(riderId) {
    const result = await pool.query(
      `SELECT * FROM policies 
       WHERE rider_id = $1 AND status = 'active'
       ORDER BY week_start DESC LIMIT 1`,
      [riderId]
    );
    return result.rows[0];
  },

  // Get coverage usage for a rider (weekly and monthly)
  async getCoverageUsage(riderId) {
    const result = await pool.query(
      `SELECT 
        COALESCE(SUM(total_claimed) FILTER (WHERE week_start >= date_trunc('week', CURRENT_DATE)), 0) as weekly_total,
        COALESCE(SUM(total_claimed) FILTER (WHERE week_start >= date_trunc('month', CURRENT_DATE)), 0) as monthly_total
       FROM weekly_coverage_usage
       WHERE rider_id = $1`,
      [riderId]
    );
    return result.rows[0];
  }
};

module.exports = Policy;
