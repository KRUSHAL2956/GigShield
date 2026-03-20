const { pool } = require('./db');
const DeliveryLog = require('./delivery');

const Rider = {
  // Create a new rider
  async create({ name, email, phone, city, zone, platform, avg_weekly_earnings, upi_id, password_hash, firebase_uid }) {
    const result = await pool.query(
      `INSERT INTO riders (name, email, phone, city, zone, platform, avg_weekly_earnings, upi_id, password_hash, firebase_uid)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, name, email, phone, city, zone, platform, avg_weekly_earnings, upi_id, tenure_months, lifetime_avg_rating, created_at`,
      [name, email, phone, city, zone, platform, avg_weekly_earnings, upi_id, password_hash, firebase_uid]
    );
    return result.rows[0];
  },

  // Find rider by phone (Sanitized)
  async findByPhone(phone) {
    const result = await pool.query(
      `SELECT id, name, email, phone, city, zone, platform, avg_weekly_earnings, upi_id,
              tenure_months, lifetime_avg_rating, is_active, firebase_uid, created_at 
       FROM riders WHERE phone = $1`,
      [phone]
    );
    return result.rows[0] || null;
  },

  // Find rider by email
  async findByEmail(email) {
    const result = await pool.query(
      `SELECT id, name, email, phone, city, zone, platform, avg_weekly_earnings, upi_id,
              tenure_months, lifetime_avg_rating, is_active, firebase_uid, created_at 
       FROM riders WHERE email = $1`,
      [email]
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
      `SELECT id, name, email, phone, city, zone, platform, avg_weekly_earnings, upi_id,
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
  },

  // Find rider by Firebase UID
  async findByFirebaseUid(uid) {
    const result = await pool.query(
      `SELECT id, name, email, phone, city, zone, platform, avg_weekly_earnings, upi_id,
              tenure_months, lifetime_avg_rating, is_active, created_at
       FROM riders WHERE firebase_uid = $1`,
      [uid]
    );
    return result.rows[0] || null;
  },

  // Update Firebase UID for a rider
  async updateFirebaseUid(id, uid) {
    await pool.query(
      'UPDATE riders SET firebase_uid = $1 WHERE id = $2',
      [uid, id]
    );
  },

  // Aggregate dashboard stats
  async getDashboardStats(riderId) {
    const weeklyPremium = await pool.query(
      `SELECT COALESCE(SUM(premium_deducted), 0) as total
       FROM delivery_logs
       WHERE rider_id = $1 AND created_at >= date_trunc('week', CURRENT_DATE)`,
      [riderId]
    );

    const weeklyEarnings = await pool.query(
      `SELECT COALESCE(SUM(delivery_earning), 0) as total
       FROM delivery_logs
       WHERE rider_id = $1 AND created_at >= date_trunc('week', CURRENT_DATE)`,
      [riderId]
    );

    const payouts = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM payout_transactions pt
       JOIN claims c ON pt.claim_id = c.id
       WHERE c.rider_id = $1 AND pt.status = 'completed'`,
      [riderId]
    );

    const policy = await pool.query(
      `SELECT weekly_cap FROM policies WHERE rider_id = $1 AND status = 'active' LIMIT 1`,
      [riderId]
    );

    const usage = await pool.query(
      `SELECT COALESCE(SUM(total_claimed), 0) as used
       FROM weekly_coverage_usage
       WHERE rider_id = $1 AND week_start >= date_trunc('week', CURRENT_DATE)`,
      [riderId]
    );

    const policyCap = policy.rows[0]?.weekly_cap ?? "200000";
    const usageUsed = usage.rows[0]?.used ?? "0";

    return {
      weekly_earnings: parseFloat(weeklyEarnings.rows[0].total) / 100,
      premium_paid: parseFloat(weeklyPremium.rows[0].total) / 100,
      payouts_received: (parseFloat(payouts.rows[0].total) || 0) / 100,
      coverage_left: (Math.max(0, parseFloat(policyCap) - parseFloat(usageUsed))) / 100
    };
  }
};

module.exports = Rider;
