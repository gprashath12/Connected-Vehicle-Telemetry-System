import { apiClient } from './client';

export async function fetchAdminStats() {
  const { data } = await apiClient.get('/admin/stats');
  return data;
}

export async function fetchAdminFleet() {
  const { data } = await apiClient.get('/admin/fleet');
  return data;
}

export async function fetchTop5SpeedToday() {
  const { data } = await apiClient.get('/admin/top-speed-today');
  return data;
}

export async function fetchAdminClients() {
  const { data } = await apiClient.get('/admin/clients');
  return data;
}

export async function createAdminClient(payload) {
  const { data } = await apiClient.post('/admin/clients', payload);
  return data;
}

export async function fetchClientVehicles(clientId) {
  const { data } = await apiClient.get(`/admin/clients/${clientId}/vehicles`);
  return data;
}

export async function createVehicleForClient(clientId, payload) {
  const { data } = await apiClient.post(`/admin/clients/${clientId}/vehicles`, payload);
  return data;
}

export async function deleteAdminClient(clientId) {
  await apiClient.delete(`/admin/clients/${clientId}`);
}

export async function deleteClientVehicle(clientId, vehicleId) {
  await apiClient.delete(`/admin/clients/${clientId}/vehicles/${vehicleId}`);
}
