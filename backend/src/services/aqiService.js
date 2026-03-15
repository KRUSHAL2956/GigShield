const axios = require('axios');

const TOKEN = process.env.WAQI_API_KEY;
const BASE_URL = 'https://api.waqi.info/feed';

const isProd = process.env.NODE_ENV === 'production';

/**
 * Fetches AQI for a city and determines risk level.
 * @param {string} city 
 * @returns {Promise<{risk: string, aqi: number|null}>}
 */
async function getAirQuality(city) {
  if (!TOKEN || TOKEN === 'xxxxx') {
    if (isProd) {
      throw new Error('[AQIService] WAQI_API_KEY is missing in production');
    }
    console.warn(`[AQIService] Missing token for ${city}. Returning safe sentinel.`);
    return { risk: 'UNKNOWN', aqi: null };
  }

  try {
    const encodedCity = encodeURIComponent(city);
    const response = await axios.get(`${BASE_URL}/${encodedCity}/`, {
      params: { token: TOKEN },
      timeout: 5000
    });

    if (response.data.status !== 'ok') {
      throw new Error(response.data.data || 'Unknown API error');
    }

    const rawAqi = response.data.data.aqi;
    const parsedAqi = Number(rawAqi);
    
    if (!Number.isFinite(parsedAqi)) {
      return { risk: 'UNKNOWN', aqi: rawAqi };
    }

    let risk = 'LOW';
    if (parsedAqi > 300) {
      risk = 'HIGH';
    } else if (parsedAqi > 150) {
      risk = 'MODERATE';
    }

    return { risk, aqi: parsedAqi };
  } catch (err) {
    console.error(`[AQIService] Error fetching AQI for ${city}:`, err.message);
    return { risk: 'UNKNOWN', aqi: null };
  }
}

module.exports = { getAirQuality };
