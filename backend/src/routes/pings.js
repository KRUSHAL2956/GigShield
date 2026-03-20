const express = require('express');
const { z } = require('zod');
const Ping = require('../models/ping');
const { authMiddleware } = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

const pingSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  accuracy: z.number().optional(),
  speed: z.number().optional(),
  is_mocked: z.boolean().optional()
});

// POST /api/riders/ping
// Ingests GPS data and performs real-time fraud check
router.post('/', authMiddleware, async (req, res) => {
  try {
    const data = pingSchema.parse(req.body);
    const rider_id = req.user.id;

    // 1. Get previous ping for velocity check
    const prevPing = await Ping.getLatestForRider(rider_id);

    // 2. Log current ping
    const newPing = await Ping.create({
      rider_id,
      ...data
    });

    // 3. Call ML service for fraud check if we have history
    let fraudStatus = { is_suspicious: false, risk_score: 0 };
    if (prevPing) {
      try {
        const mlRes = await axios.post(`${ML_SERVICE_URL}/ml/fraud/check`, {
          rider_id,
          current_ping: {
            lat: data.lat,
            lng: data.lng,
            timestamp: newPing.timestamp, // Use the actual saved timestamp
            accuracy: data.accuracy
          },
          previous_ping: {
            lat: Number(prevPing.lat),
            lng: Number(prevPing.lng),
            timestamp: prevPing.timestamp,
            accuracy: prevPing.accuracy
          }
        }, { timeout: 3000 }); // Fail fast if ML service hangs
        fraudStatus = mlRes.data;
      } catch (mlErr) {
        console.warn('ML Fraud service unavailable or timed out:', mlErr.message);
      }
    }

    res.status(201).json({
      message: 'Ping logged',
      fraudStatus
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: err.errors });
    }
    console.error('Ping error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
