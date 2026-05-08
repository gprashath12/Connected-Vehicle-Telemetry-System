import { apiClient } from './client';

export async function login(email, password) {
  const { data } = await apiClient.post('/auth/login', { email, password });
  return data;
}

export async function register(email, password, fullName) {
  const { data } = await apiClient.post('/auth/register', { email, password, fullName });
  return data;
}

export async function logout() {
  await apiClient.post('/auth/logout');
}

export async function fetchMe() {
  const { data } = await apiClient.get('/auth/me');
  return data;
}
