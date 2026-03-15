import api from './axios';

export const getRiderClaims = async (riderId) => {
  const response = await api.get(`/api/claims/${riderId}`);
  return response.data;
};

export const getClaimDetail = async (id) => {
  const response = await api.get(`/api/claims/${id}/detail`);
  return response.data;
};

export const getClaimsStats = async (riderId) => {
  const response = await api.get(`/api/claims/${riderId}/stats`);
  return response.data;
};
