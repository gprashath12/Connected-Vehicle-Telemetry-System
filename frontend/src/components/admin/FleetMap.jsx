import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fmtSpeed, fmtDateTime } from '../../lib/formatters';
import { getVehicleStatus } from './VehicleFilterBar';

// Reuse the same icon-fix pattern already used by MapLite.jsx
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const STATUS_COLORS = {
  ACTIVE:      { ring: 'rgba(16,185,129,0.35)',  dot: '#10b981', pulse: true },
  IDLE:        { ring: 'rgba(245,158,11,0.35)',   dot: '#f59e0b', pulse: false },
  INACTIVE:    { ring: 'rgba(100,116,139,0.25)',  dot: '#64748b', pulse: false },
  MAINTENANCE: { ring: 'rgba(239,68,68,0.30)',    dot: '#ef4444', pulse: false },
};

function divIcon(status) {
  const cfg = STATUS_COLORS[status] ?? STATUS_COLORS.INACTIVE;
  const html = `
    <div style="position:relative;width:18px;height:18px;">
      <span style="position:absolute;inset:-6px;border-radius:9999px;background:${cfg.ring};${
        cfg.pulse ? 'animation:fleet-pulse 1.6s ease-out infinite;' : ''
      }"></span>
      <span style="position:absolute;inset:0;border-radius:9999px;background:${cfg.dot};border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.25);"></span>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'fleet-map-marker',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10],
  });
}

const STATUS_POPUP_STYLES = {
  ACTIVE:      'color:#059669;font-weight:600',
  IDLE:        'color:#d97706;font-weight:600',
  INACTIVE:    'color:#64748b',
  MAINTENANCE: 'color:#dc2626;font-weight:600',
};

const STATUS_LABELS = {
  ACTIVE: 'Active',
  IDLE: 'Idle',
  INACTIVE: 'Inactive',
  MAINTENANCE: 'Maintenance',
};

function PulseStyles() {
  return (
    <style>{`
      @keyframes fleet-pulse {
        0%   { transform: scale(0.6); opacity: 0.9; }
        100% { transform: scale(1.8); opacity: 0;   }
      }
      .leaflet-container { background: #e2e8f0; }
      html.dark .leaflet-container { background: #1e293b; }
    `}</style>
  );
}

export default function FleetMap({ fleet = [], height = 380 }) {
  const points = useMemo(
    () =>
      fleet.filter(
        (v) =>
          typeof v.lat === 'number' &&
          typeof v.lon === 'number' &&
          !Number.isNaN(v.lat) &&
          !Number.isNaN(v.lon),
      ),
    [fleet],
  );

  const center = useMemo(() => {
    if (!points.length) return [20, 0];
    const lat = points.reduce((s, v) => s + v.lat, 0) / points.length;
    const lon = points.reduce((s, v) => s + v.lon, 0) / points.length;
    return [lat, lon];
  }, [points]);

  const counts = useMemo(() => {
    const c = { ACTIVE: 0, IDLE: 0, INACTIVE: 0, MAINTENANCE: 0 };
    points.forEach((v) => {
      const s = getVehicleStatus(v);
      c[s] = (c[s] ?? 0) + 1;
    });
    return c;
  }, [points]);

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
      <PulseStyles />
      <MapContainer
        center={center}
        zoom={points.length ? 5 : 2}
        style={{ height: `${height}px`, width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map((v) => {
          const status = getVehicleStatus(v);
          return (
            <Marker
              key={v.vehicleid}
              position={[v.lat, v.lon]}
              icon={divIcon(status)}
            >
              <Popup>
                <div style={{ minWidth: '180px' }} className="text-sm space-y-1">
                  <p className="font-semibold">{v.name || `Vehicle #${v.vehicleid}`}</p>
                  <p className="text-xs text-slate-500">
                    {v.manufacturer} {v.model} · {v.vehicle_code}
                  </p>
                  <p><strong>Owner:</strong> {v.ownerName || '—'}</p>
                  <p><strong>Speed:</strong> {fmtSpeed(v.currentSpeed)}</p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <span style={STATUS_POPUP_STYLES[status] ?? ''}>
                      {STATUS_LABELS[status] ?? status}
                    </span>
                  </p>
                  {v.lastSeenTs && (
                    <p className="text-xs text-slate-500">
                      Last seen: {fmtDateTime(v.lastSeenTs)}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-500 dark:text-slate-400">
        <span>
          {points.length} vehicle{points.length === 1 ? '' : 's'} on map
        </span>
        <span className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
            {counts.ACTIVE} active
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400 inline-block" />
            {counts.IDLE} idle
          </span>
          {counts.INACTIVE > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-slate-400 inline-block" />
              {counts.INACTIVE} inactive
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
