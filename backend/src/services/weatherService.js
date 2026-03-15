const axios = require('axios');

const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

/**
 * Fetches current weather for a city and determines risk level.
 * @param {string} city 
 * @returns {Promise<{risk: string, condition: string, value: number}>}
 */
async function getCurrentWeather(city) {
  if (!API_KEY || API_KEY === 'xxxxx') {
    console.warn(`[WeatherService] Missing API key for ${city}. Returning mock data.`);
    return { 
      risk: 'LOW', 
      condition: 'Clear', 
      value: 28,
      raw: { temp: 28, rain: 0, condition: 'Clear', mock: true } 
    };
  }

  try {
    const response = await axios.get(BASE_URL, {
      params: {
        q: `${city},IN`,
        appid: API_KEY,
        units: 'metric'
      },
      timeout: 5000
    });

    const data = response.data;
    const temp = data.main.temp;
    const rain = data.rain ? (data.rain['1h'] || 0) : 0;
    const condition = data.weather?.[0]?.main ?? 'Unknown';

    let risk = 'LOW';
    let value = temp;

    if (rain > 15 || temp > 42) {
      risk = 'HIGH';
      value = rain > 15 ? rain : temp;
    } else if (rain > 5 || temp > 38) {
      risk = 'MODERATE';
      value = rain > 5 ? rain : temp;
    }

    return { 
      risk, 
      condition, 
      value,
      raw: { temp, rain, condition } 
    };
  } catch (err) {
    console.error(`[WeatherService] Error fetching weather for ${city}:`, err.message);
    return { 
      risk: 'UNKNOWN', 
      condition: 'Error', 
      value: 0,
      raw: { error: err.message } 
    };
  }
}

module.exports = { getCurrentWeather };
