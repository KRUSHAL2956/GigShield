const express = require('express');
const { getCurrentWeather } = require('../services/weatherService');
const { getAirQuality } = require('../services/aqiService');

const router = express.Router();

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata'];

// GET /api/public/city-stats
// Returns live weather and AQI for all monitored cities
router.get('/city-stats', async (req, res) => {
  try {
    const stats = await Promise.all(CITIES.map(async (city) => {
      const weather = await getCurrentWeather(city);
      const aqi = await getAirQuality(city);

      // Map risk levels to a display status
      let statusText = 'Unknown';
      let temp = null;
      let weatherCondition = 'Unknown';

      if (weather) {
        temp = weather.raw?.temp ?? weather.value;
        weatherCondition = weather.condition;
        if (weather.condition === 'Rain' || weather.condition === 'Drizzle' || weather.condition === 'Thunderstorm') {
          statusText = `Rain ${weather.value}mm/hr`;
        } else if (weather.condition === 'Clear' || weather.condition === 'Clouds') {
          statusText = `${weather.condition} ${temp !== null ? Math.round(temp) : '--'}°C`;
        } else if (weather.condition) {
          statusText = `${weather.condition} ${weather.value ?? ''}`;
        }
      }

      // Add AQI info if it's significant
      const aqiValue = aqi?.aqi;
      const aqiText = aqiValue > 100 ? ` • AQI ${aqiValue}` : '';

      // Determine overall risk
      const overallRisk = (weather?.risk === 'HIGH' || aqi?.risk === 'HIGH') ? 'HIGH' : 
                          (weather?.risk === 'MODERATE' || aqi?.risk === 'MODERATE') ? 'MODERATE' : 'LOW';

      return {
        city,
        risk: overallRisk,
        status: `${statusText}${aqiText}`,
        temp,
        aqi: aqiValue,
        weatherCondition
      };
    }));

    res.json(stats);
  } catch (err) {
    console.error('[PublicRouter] Error fetching city stats:', err);
    res.status(500).json({ error: 'Failed to fetch live city stats' });
  }
});

// GET /api/public/global-stats
// Returns simulated real-time platform stats
router.get('/global-stats', (req, res) => {
  // Base numbers
  const BASE_RIDERS = 14200;
  const BASE_PAYOUTS = 8524190;
  
  // Use current time to create a deterministic but growing number
  const now = new Date();
  const minutesSinceEpoch = Math.floor(now.getTime() / 60000);
  const hoursSinceEpoch = Math.floor(now.getTime() / 3600000);

  // Growth: ~1 rider every 5 mins, ~₹500 every 2 mins
  const activeRiders = BASE_RIDERS + Math.floor(minutesSinceEpoch / 5);
  const payoutsSent = BASE_PAYOUTS + Math.floor(minutesSinceEpoch / 2) * 500;
  
  // Live events: 3-12 based on hour
  const liveEvents = 3 + (hoursSinceEpoch % 10);

  res.json({
    activeRiders,
    payoutsSent,
    liveEvents,
    timestamp: now.toISOString()
  });
});

module.exports = router;
