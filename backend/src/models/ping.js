const { pool } = require('./db');

const Ping = {
  async create({ rider_id, lat, lng, accuracy, speed, is_mocked = false }) {
    const result = await pool.query(
      `INSERT INTO rider_pings (rider_id, lat, lng, accuracy, speed, is_mocked)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, timestamp`,
      [rider_id, lat, lng, accuracy, speed, is_mocked]
    );
    return result.rows[0];
  },

  async getLatestForRider(rider_id) {
    const result = await pool.query(
      `SELECT lat, lng, timestamp, accuracy, speed
       FROM rider_pings
       WHERE rider_id = $1
       ORDER BY timestamp DESC
       LIMIT 1`,
      [rider_id]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  }
};

module.exports = Ping;
