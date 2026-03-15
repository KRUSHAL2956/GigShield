const express = require('express');
const { z } = require('zod');
const DeliveryLog = require('../models/delivery');
const Rider = require('../models/rider');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

const deliverySchema = z.object({
  rider_id: z.number().int().positive(),
  delivery_earning: z.number().positive()
});

async function getPremiumPct(riderId) {
  // In a real app, fetch from rider_scores table
  // For now return a default but encapsulate the logic
  return 2.5; 
}

// POST /api/deliveries/complete
// Logs a delivery and deducts premium based on percentage
router.post('/complete', authMiddleware, async (req, res) => {
  try {
    const data = deliverySchema.parse(req.body);

    // Verify rider exists
    const rider = await Rider.findById(data.rider_id);
    if (!rider) {
      return res.status(404).json({ error: 'Rider not found' });
    }

    if (Number(req.user.id) !== data.rider_id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Server-side premium percentage calculation
    const premium_pct = await getPremiumPct(data.rider_id);

    // Process the delivery log
    const log = await DeliveryLog.create({ ...data, premium_pct });

    // Get updated weekly total to return to the client
    const weeklyTotal = await DeliveryLog.getWeeklyPremiumTotal(data.rider_id);

    res.status(201).json({
      message: 'Delivery logged and premium deducted successfully',
      log,
      weeklyTotal
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.errors });
    }
    console.error('Delivery logging error:', err);
    res.status(500).json({ error: 'Failed to process delivery' });
  }
});

// GET /api/deliveries/:rider_id/history
router.get('/:rider_id/history', authMiddleware, async (req, res) => {
    try {
        const rider_id = parseInt(req.params.rider_id, 10);
        if (Number.isNaN(rider_id)) {
            return res.status(400).json({ error: 'Invalid rider id' });
        }

        if (Number(req.user.id) !== rider_id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
        
        const history = await DeliveryLog.getRecentDeliveries(rider_id, limit);
        const weeklyTotal = await DeliveryLog.getWeeklyPremiumTotal(rider_id);
        
        res.json({
            history,
            weeklyTotal
        });
    } catch(err) {
        console.error('History fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch delivery history' });
    }
})

module.exports = router;
