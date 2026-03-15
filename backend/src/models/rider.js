const { pool } = require('./db');

const Rider = {
  // Create a new rider
  async create({ name, phone, city, zone, platform, avg_weekly_earnings, password_hash }) {
    const result = await pool.query(
      `INSERT INTO riders (name, phone, city, zone, platform, avg_weekly_earnings, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, phone, city, zone, platform, avg_weekly_earnings, tenure_months, lifetime_avg_rating, created_at`,
      [name, phone, city, zone, platform, avg_weekly_earnings, password_hash]
    );
    return result.rows[0];
  },

  // Find rider by phone (Sanitized)
  async findByPhone(phone) {
    const result = await pool.query(
      `SELECT id, name, phone, city, zone, platform, avg_weekly_earnings, 
              tenure_months, lifetime_avg_rating, is_active, created_at 
       FROM riders WHERE phone = $1`,
      [phone]
    );
    return result.rows[0] || null;
  },

  // Find rider by phone including password hash (Auth only)
  async findByPhoneWithHash(phone) {
    const result = await pool.query(
      'SELECT * FROM riders WHERE phone = $1',
      [phone]
    );
    return result.rows[0] || null;
  },

  // Find rider by ID
  async findById(id) {
    const result = await pool.query(
      `SELECT id, name, phone, city, zone, platform, avg_weekly_earnings,
              tenure_months, lifetime_avg_rating, is_active, created_at
       FROM riders WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  // Get rider with latest score
  async findByIdWithScore(id) {
    const result = await pool.query(
      `SELECT r.id, r.name, r.phone, r.city, r.zone, r.platform, r.avg_weekly_earnings,
              r.tenure_months, r.lifetime_avg_rating, r.is_active, r.created_at,
              rs.total_score, rs.rating_score, rs.tenure_score,
              rs.earnings_score, rs.claims_score, rs.consistency_score,
              rs.city_risk_score, rs.premium_pct
       FROM riders r
       LEFT JOIN rider_scores rs ON r.id = rs.rider_id
       AND rs.week_start = (SELECT MAX(week_start) FROM rider_scores WHERE rider_id = r.id)
       WHERE r.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  // Count claims in last 6 months
  async getClaimsCount(riderId) {
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM claims
       WHERE rider_id = $1
       AND created_at >= NOW() - INTERVAL '6 months'
       AND status != 'fraud_blocked'`,
      [riderId]
    );
    return parseInt(result.rows[0].count);
  },

  // Get all riders (admin)
  async findAll(limit = 50, offset = 0) {
    const result = await pool.query(
      `SELECT id, name, phone, city, zone, platform, avg_weekly_earnings,
              tenure_months, lifetime_avg_rating, is_active, created_at
       FROM riders ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  },

  // Find all active riders in a city
  async findByCity(city) {
    const result = await pool.query(
      `SELECT id, name, phone, city, zone, platform, avg_weekly_earnings, is_active
       FROM riders WHERE city = $1 AND is_active = true`,
      [city]
    );
    return result.rows;
  }
};

module.exports = Rider;
