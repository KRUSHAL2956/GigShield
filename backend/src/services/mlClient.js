const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

const mlAxios = axios.create({
  baseURL: ML_SERVICE_URL,
  timeout: 5000,
});

const mlClient = {
  async getRiderScore(data) {
    const res = await mlAxios.post('/ml/score/rider', data);
    return res.data;
  },

  async calculatePremium(data) {
    const res = await mlAxios.post('/ml/premium/calculate', data);
    return res.data;
  },

  async checkFraud(data) {
    const res = await mlAxios.post('/ml/fraud/check', data);
    return res.data;
  },

  async getDisruptionForecast(data) {
    const res = await mlAxios.post('/ml/forecast/disruption', data);
    return res.data;
  },

  async healthCheck() {
    const res = await mlAxios.get('/health');
    return res.data;
  }
};

module.exports = mlClient;
