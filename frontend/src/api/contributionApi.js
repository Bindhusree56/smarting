import api from './axios';

export const getGroupContributions = async () => {
  const { data } = await api.get('/contributions');
  return data;
};

export const addContribution = async (payload) => {
  const { data } = await api.post('/contributions', payload);
  return data;
};

export const getMemberContributions = async (memberId) => {
  const { data } = await api.get(
    `/contributions/member/${memberId}`
  );
  return data;
};