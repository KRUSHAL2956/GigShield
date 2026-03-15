import axios from 'axios';

const isProduction = window.location.hostname.endsWith('vercel.app');
const API_URL = process.env.REACT_APP_API_URL || 
                (isProduction ? 'https://gig-shield-backend.vercel.app' : 'http://127.0.0.1:5000');

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
  },

  /**
   * Fetches real-time platform metrics (riders, payouts).
   * @returns {Promise<Object|null>} Global stats or null on error
   */
  async getGlobalStats() {
    try {
      const response = await axios.get(`${API_URL}/api/public/global-stats`);
      return response.data;
    } catch (err) {
      console.error('[PublicService] Error fetching global stats:', err);
      return null;
    }
  }
};

export default publicService;
