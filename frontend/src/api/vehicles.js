import { apiClient } from './client';

// GET /api/vehicles
export async function fetchVehicles() {
  const { data } = await apiClient.get('/vehicles');
  return data;
}

// GET /api/vehicles/{id}
export async function fetchVehicle(id) {
  const { data } = await apiClient.get(`/vehicles/${id}`);
  return data;
}

// GET /api/vehicles/{id}/latest
export async function fetchLatestReading(id) {
  const { data } = await apiClient.get(`/vehicles/${id}/latest`);
  return data;
}

// GET /api/vehicles/{id}/kpis?from={epochMs}&to={epochMs}
export async function fetchKpis(id, from, to) {
  const { data } = await apiClient.get(`/vehicles/${id}/kpis`, {
    params: { from, to },
  });
  return data;
}

// GET /api/vehicles/{id}/speed-chart?period=day|week|month
export async function fetchSpeedChart(id, period) {
  const { data } = await apiClient.get(`/vehicles/${id}/speed-chart`, {
    params: { period },
  });
  return data;
}

// GET /api/vehicles/{id}/temperature-history?from={epochMs}&to={epochMs}
export async function fetchTemperatureHistory(id, from, to) {
  const { data } = await apiClient.get(`/vehicles/${id}/temperature-history`, {
    params: { from, to },
  });
  return data;
}

// GET /api/vehicles/compare?ids=1,2,3&metric=speed|temp&from={epochMs}&to={epochMs}
export async function fetchCompare(ids, metric, from, to) {
  const { data } = await apiClient.get('/vehicles/compare', {
    params: {
      ids: ids.join(','),
      metric,
      from,
      to,
    },
  });
  return data;
}
