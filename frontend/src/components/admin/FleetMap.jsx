import { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fmtSpeed, fmtTemp } from '../../lib/formatters';
import { getVehicleStatus } from './VehicleFilterBar';

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
  });
}

const STATUS_COLORS_TEXT = {
  ACTIVE:      '#059669',
  IDLE:        '#d97706',
  INACTIVE:    '#64748b',
  MAINTENANCE: '#dc2626',
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
      .fleet-map-marker { cursor: pointer !important; }
    `}</style>
  );
}

export default function FleetMap({ fleet = [], height = 380 }) {
  const [activeVehicle, setActiveVehicle] = useState(null);
  const [pinnedVehicle, setPinnedVehicle] = useState(null);

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

  const displayed = activeVehicle ?? pinnedVehicle;

  return (
    <div
      className="rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
      style={{ position: 'relative', overflow: 'hidden' }}
    >
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
              eventHandlers={{
                mouseover: () => setActiveVehicle({ v, status }),
                mouseout: () => setActiveVehicle(null),
                click: (e) => {
                  e.originalEvent.stopPropagation();
                  setPinnedVehicle((prev) =>
                    prev?.v.vehicleid === v.vehicleid ? null : { v, status },
                  );
                },
              }}
            />
          );
        })}
      </MapContainer>

      {/* Info card — React overlay, not Leaflet Tooltip */}
      {displayed && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 54,
            zIndex: 1000,
            pointerEvents: 'none',
            minWidth: 165,
          }}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-lg px-3 py-2 text-xs text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
        >
          <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
            {displayed.v.name || displayed.v.vehicle_code}
          </p>
          <p className="my-0.5">Speed: <span className="font-medium">{fmtSpeed(displayed.v.currentSpeed)}</span></p>
          <p className="my-0.5">Engine Temp: <span className="font-medium">{fmtTemp(displayed.v.currentEngineTemp)}</span></p>
          <p className="my-0.5">
            Status:{' '}
            <span style={{ color: STATUS_COLORS_TEXT[displayed.status] ?? '#64748b', fontWeight: 600 }}>
              {STATUS_LABELS[displayed.status] ?? displayed.status}
            </span>
          </p>
        </div>
      )}

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
