import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const publicService = {
   /**
    * Fetches live city stats (weather and AQI) from the backend.
    * @returns {Promise<Array<Object>|null>} List of city stats or null on error
    */
  async getCityStats() {
    try {
      const response = await axios.get(`${API_URL}/api/public/city-stats`);
      return response.data;
    } catch (err) {
      console.error('[PublicService] Error fetching city stats:', err);
      // Fallback to static data pattern if API fails
      return null;
    }
  }
};

export default publicService;
