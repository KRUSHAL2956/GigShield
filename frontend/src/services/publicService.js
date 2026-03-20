import api from '../api/axios';

const publicService = {
  /**
   * Fetches live city stats (weather and AQI) from the backend.
   * @returns {Promise<Array<Object>|null>} List of city stats or null on error
   */
  async getCityStats() {
    try {
      const response = await api.get('/api/public/city-stats');
      return response.data;
    } catch (err) {
      console.error('[PublicService] Error fetching city stats:', err);
      return null;
    }
  },

  /**
   * Fetches real-time platform metrics (riders, payouts).
   * @returns {Promise<Object|null>} Global stats or null on error
   */
  async getGlobalStats() {
    try {
      const response = await api.get('/api/public/global-stats');
      return response.data;
    } catch (err) {
      console.error('[PublicService] Error fetching global stats:', err);
      return null;
    }
  }
};

export default publicService;
