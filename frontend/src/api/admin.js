import api from './axios';

export const getAdminStats = async () => {
  const response = await api.get('/api/admin/dashboard');
  return response.data;
};

export const getRidersList = async () => {
  const response = await api.get('/api/admin/riders');
  return response.data;
};

export const simulateTrigger = async (type, city) => {
  const response = await api.post('/api/admin/triggers/simulate', { type, city });
  return response.data;
};

export const getFraudClaims = async () => {
  const response = await api.get('/api/admin/fraud/suspicious');
  return response.data;
};

export const reviewFraudClaim = async (claimId, action) => {
  // action: 'approve' or 'block'
  const response = await api.patch(`/api/admin/fraud/${claimId}`, { action });
  return response.data;
};
