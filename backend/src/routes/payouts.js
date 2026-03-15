const express = require('express');
const { z } = require('zod');
const Rider = require('../models/rider');
const { pool } = require('../models/db');
const { authMiddleware } = require('../middleware/auth');
const { getCurrentWeather } = require('../services/weatherService');
const { getAirQuality } = require('../services/aqiService');
const { initiatePayout } = require('../services/paymentService');

const router = express.Router();
const MONITOR_CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune'];

const triggerSchema = z.object({
  city: z.string(),
  event_type: z.string(),
  severity: z.string()
});

// Helper: Get historical average duration for an event in a city
async function getHistoricalAverageDuration(city, event_type) {
  const result = await pool.query(
    `SELECT AVG(actual_duration_hours) as avg_duration
     FROM disruption_events
     WHERE city = $1 AND event_type = $2
     AND actual_duration_hours IS NOT NULL
     AND start_time >= NOW() - INTERVAL '1 year'`,
    [city, event_type]
  );
  
  // Default to 4 hours if no historical data exists
  return parseFloat(result.rows[0].avg_duration) || 4.0;
}

// Helper: Calculate loyalty multiplier
function getLoyaltyMultiplier(tenure_months, rating) {
  if (tenure_months > 12 && rating > 4.8) {
    return { tier: 'Titanium', multiplier: 1.25 }; // 25% Bonus
  } else if (tenure_months > 6 && rating > 4.5) {
    return { tier: 'Gold', multiplier: 1.15 }; // 15% Bonus
  }
  return { tier: 'Silver', multiplier: 1.00 }; // Standard
}

const MIN_PAYOUT = 5;

// Helper: Standardized payout calculation
function calculatePayout(weeklyEarnings, durationHours = null) {
  let baseAmount;
  if (durationHours !== null) {
    // Formula for /trigger (based on hourly rate)
    const hourlyRate = parseFloat(weeklyEarnings) / 60;
    baseAmount = hourlyRate * durationHours;
  } else {
    // Formula for /auto-check (30% of daily avg)
    baseAmount = (parseFloat(weeklyEarnings || 0) / 7) * 0.3;
  }
  
  return Math.max(baseAmount, MIN_PAYOUT);
}

// POST /api/payouts/trigger
// Triggers payouts for all active riders in an affected city
router.post('/trigger', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const data = triggerSchema.parse(req.body);

    const client = await pool.connect();
    let eventId, avgDurationHours, payoutsPreview = [], ridersProcessed = 0;

    try {
      await client.query('BEGIN');

      const existingEvent = await client.query(
        `SELECT id FROM disruption_events 
         WHERE city = $1 AND event_type = $2 AND severity = $3 AND start_time > NOW() - INTERVAL '5 minutes'`,
        [data.city, data.event_type, data.severity]
      );
      
      if (existingEvent.rows.length > 0) {
         eventId = existingEvent.rows[0].id;
      } else {
         const eventResult = await client.query(
           `INSERT INTO disruption_events (city, event_type, severity, start_time)
            VALUES ($1, $2, $3, NOW())
            RETURNING id`,
           [data.city, data.event_type, data.severity]
         );
         eventId = eventResult.rows[0].id;
      }

      avgDurationHours = await getHistoricalAverageDuration(data.city, data.event_type);

      const ridersResult = await client.query(
        `SELECT id, avg_weekly_earnings, tenure_months, lifetime_avg_rating
         FROM riders
         WHERE city = $1 AND is_active = true`,
        [data.city]
      );
      const affectedRiders = ridersResult.rows;

      const payouts = [];

      for (const rider of affectedRiders) {
        const baseAmount = calculatePayout(rider.avg_weekly_earnings, avgDurationHours);

        const loyalty = getLoyaltyMultiplier(
          parseInt(rider.tenure_months) || 0,
          parseFloat(rider.lifetime_avg_rating) || 4.0
        );

        const finalPayout = baseAmount * loyalty.multiplier;

        payouts.push({
          rider_id: rider.id,
          rider: rider, // Keep full rider for initiatePayout
          base_payout: Number(baseAmount.toFixed(2)),
          loyalty_tier: loyalty.tier,
          multiplier_applied: loyalty.multiplier,
          final_payout: Number(finalPayout.toFixed(2)),
          event_id: eventId
        });
      }

      if (payouts.length > 0) {
        for (const p of payouts) {
          const insertRes = await client.query(
            `INSERT INTO payouts (rider_id, event_id, amount, base_payout, final_payout, loyalty_tier, multiplier_applied, status, trigger_event) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
            [p.rider_id, p.event_id, p.base_payout, p.base_payout, p.final_payout, p.loyalty_tier, p.multiplier_applied, 'pending', `${data.event_type} in ${data.city}`]
          );
          p.dbId = insertRes.rows[0].id;
        }
      }

      await client.query('COMMIT');

      // 4. Initiate External Payments (Post-Commit)
      let successCount = 0;
      let failureCount = 0;

      for (const p of payouts) {
        try {
          const payResult = await initiatePayout(p.rider, p.final_payout);
          await pool.query(
            'UPDATE payouts SET status = $1 WHERE id = $2',
            [payResult.success ? 'processed' : 'failed', p.dbId]
          );
          if (payResult.success) successCount++;
          else failureCount++;
        } catch (payErr) {
          console.error(`[ManualTrigger] Payment failure for ${p.dbId}:`, payErr);
          await pool.query('UPDATE payouts SET status = $1 WHERE id = $2', ['failed', p.dbId]);
          failureCount++;
        }
      }

      ridersProcessed = successCount;
      ridersFailed = failureCount;
      payoutsPreview = payouts.slice(0, 5).map(p => ({ rider_id: p.rider_id, amount: p.final_payout }));

    } catch (txnErr) {
      await client.query('ROLLBACK');
      throw txnErr;
    } finally {
      client.release();
    }

    res.json({
      message: 'Event triggered and payouts initiated',
      event_id: eventId,
      historical_duration_used_hours: avgDurationHours,
      riders_processed: ridersProcessed,
      riders_failed: ridersFailed || 0,
      payouts_preview: payoutsPreview
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.errors });
    }
    console.error('Trigger logic error:', err);
    res.status(500).json({ error: 'Failed to process event trigger' });
  }
});

// POST /api/payouts/auto-check
// Polling service to check real-time weather/AQI and trigger payouts
router.post('/auto-check', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin only' });
  }

  const triggerSummary = [];

  try {
    for (const city of MONITOR_CITIES) {
      const weather = await getCurrentWeather(city);
      const aqi = await getAirQuality(city);

      const isDisruption = weather.risk === 'HIGH' || aqi.risk === 'HIGH';
      
      if (isDisruption) {
        const reason = weather.risk === 'HIGH' 
          ? `Extreme Weather: ${weather.condition} (${weather.value})` 
          : `Hazardous Air Quality: AQI ${aqi.aqi}`;

        // Find all active riders in this city
        const riders = await Rider.findByCity(city);
        const activeRiders = riders.filter(r => r.account_status === 'active');

        if (activeRiders.length > 0) {
          const client = await pool.connect();
          const MIN_PAYOUT = 5;
          const successfulPayouts = [];

          try {
            await client.query('BEGIN');
            
            for (const rider of activeRiders) {
              // 0. Idempotency Check: Don't pay twice for same event in 15 mins
              const recentPayout = await client.query(
                `SELECT id FROM payouts 
                 WHERE rider_id = $1 AND trigger_event = $2 
                 AND created_at >= NOW() - INTERVAL '15 minutes'`,
                [rider.id, reason]
              );

              if (recentPayout.rows.length > 0) continue;

              // 1. Calculate payout
              const baseAmount = calculatePayout(rider.avg_weekly_earnings);
              const amount = baseAmount;
              
              const loyalty = getLoyaltyMultiplier(
                parseInt(rider.tenure_months) || 0,
                parseFloat(rider.lifetime_avg_rating) || 4.0
              );
              const finalAmount = Number((amount * loyalty.multiplier).toFixed(2));

              // 2. Record Payout in DB (Pending)
              const insertRes = await client.query(
                `INSERT INTO payouts (rider_id, amount, base_payout, final_payout, loyalty_tier, multiplier_applied, trigger_event, status) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
                [rider.id, amount, amount, finalAmount, loyalty.tier, loyalty.multiplier, reason, 'pending']
              );

              successfulPayouts.push({ 
                payoutId: insertRes.rows[0].id,
                rider,
                amount: finalAmount 
              });
            }

            await client.query('COMMIT');

            // 3. Initiate External Payments (Outside Transaction)
            let successCount = 0;
            let failureCount = 0;

            for (const p of successfulPayouts) {
              try {
                const payResult = await initiatePayout(p.rider, p.amount);
                await pool.query(
                  'UPDATE payouts SET status = $1 WHERE id = $2',
                  [payResult.success ? 'processed' : 'failed', p.payoutId]
                );
                
                if (payResult.success) successCount++;
                else failureCount++;
              } catch (payErr) {
                console.error(`[Payouts] Payment loop failure for ${p.payoutId}:`, payErr);
                await pool.query('UPDATE payouts SET status = $1 WHERE id = $2', ['failed', p.payoutId]);
                failureCount++;
              }
            }

            triggerSummary.push({ 
              city, 
              status: 'TRIGGERED', 
              ridersProcessed: successCount, 
              ridersFailed: failureCount,
              reason 
            });
          } catch (dbErr) {
            await client.query('ROLLBACK');
            console.error(`Failed to process payouts for ${city}:`, dbErr);
            triggerSummary.push({ city, status: 'FAILED', reason: dbErr.message });
          } finally {
            client.release();
          }
        } else {
          triggerSummary.push({ city, status: 'NO_RIDERS', reason });
        }
      } else {
        triggerSummary.push({ city, status: 'CLEAR', weather: weather.risk, aqi: aqi.risk });
      }
    }

    res.json({
      message: 'Auto-check completed',
      timestamp: new Date().toISOString(),
      summary: triggerSummary
    });
  } catch (err) {
    console.error('Auto-check error:', err);
    res.status(500).json({ error: 'Failed to complete auto-check' });
  }
});

module.exports = router;
