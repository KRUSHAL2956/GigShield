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

module.exports = router;
