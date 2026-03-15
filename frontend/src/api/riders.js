import api from './axios';

export const getRiderProfile = async (id) => {
  const response = await api.get(`/api/riders/${id}/profile`);
  return response.data;
};

export const getRiderEarnings = async (id) => {
  const response = await api.get(`/api/riders/${id}/earnings`);
  return response.data;
};

export const updateRiderSettings = async (id, data) => {
  const response = await api.put(`/api/riders/${id}/settings`, data);
  return response.data;
};
