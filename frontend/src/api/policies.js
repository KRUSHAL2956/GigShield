import api from './axios';

export const getActivePolicy = async (riderId) => {
  const response = await api.get(`/api/policies/active/${riderId}`);
  return response.data;
};

export const getPolicyHistory = async (riderId) => {
  const response = await api.get(`/api/policies/history/${riderId}`);
  return response.data;
};

export const renewPolicy = async (riderId, data) => {
  const response = await api.post(`/api/policies/create`, { riderId, ...data });
  return response.data;
};
