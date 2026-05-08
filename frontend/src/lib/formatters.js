export const fmtSpeed = (v) => (v == null ? '—' : `${Math.round(v)} km/h`);
export const fmtTemp = (v) => (v == null ? '—' : `${Math.round(v)} °C`);
export const fmtDistance = (v) => (v == null ? '—' : `${v.toFixed(1)} km`);
export const fmtHours = (h) => {
  if (h == null) return '—';
  const hours = Math.floor(h);
  const mins = Math.round((h - hours) * 60);
  return `${hours}h ${mins}m`;
};
export const fmtDate = (ts) => new Date(ts).toLocaleDateString();
export const fmtTime = (ts) =>
  new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
export const fmtDateTime = (ts) =>
  `${fmtDate(ts)} ${fmtTime(ts)}`;
