import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fmtSpeed, fmtTemp, fmtDateTime } from '../../lib/formatters';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Amber = idle (speed 0), green = moving
function liveIcon(speed) {
  const isIdle = Number(speed) === 0;
  const dot = isIdle ? '#f59e0b' : '#10b981';
  const ring = isIdle ? 'rgba(245,158,11,0.30)' : 'rgba(16,185,129,0.30)';
  const html = `
    <div style="position:relative;width:18px;height:18px;">
      <span style="position:absolute;inset:-6px;border-radius:9999px;background:${ring};${
        isIdle ? '' : 'animation:map-lite-pulse 1.6s ease-out infinite;'
      }"></span>
      <span style="position:absolute;inset:0;border-radius:9999px;background:${dot};border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.25);"></span>
    </div>
  `;
  return L.divIcon({ html, className: 'map-lite-marker', iconSize: [18, 18], iconAnchor: [9, 9], popupAnchor: [0, -10] });
}

// Imperatively pans the map when lat/lon change — more reliable than
// relying on MapContainer's immutable center prop.
function PanToOnUpdate({ lat, lon }) {
  const map = useMap();
  useEffect(() => {
    map.panTo([lat, lon]);
  }, [lat, lon, map]);
  return null;
}

export default function MapLite({ readings = [] }) {
  if (!readings.length) return null;

  const latest = readings[readings.length - 1];
  if (latest?.lat == null || latest?.lon == null) return null;

  return <LiveMap latest={latest} />;
}

// Separate component so hooks (markerRef, useEffect) always run with valid data.
function LiveMap({ latest }) {
  const markerRef = useRef(null);

  // Imperative marker position update — ensures the pin moves even if
  // react-leaflet's declarative position prop doesn't trigger a re-paint.
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng([latest.lat, latest.lon]);
    }
  }, [latest.lat, latest.lon]);

  const isIdle = Number(latest.speed) === 0;

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
      <style>{`
        @keyframes map-lite-pulse {
          0%   { transform: scale(0.6); opacity: 0.9; }
          100% { transform: scale(1.8); opacity: 0;   }
        }
        .leaflet-container { background: #e2e8f0; }
        html.dark .leaflet-container { background: #1e293b; }
      `}</style>
      <MapContainer
        center={[latest.lat, latest.lon]}
        zoom={14}
        style={{ height: '380px', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          ref={markerRef}
          position={[latest.lat, latest.lon]}
          icon={liveIcon(latest.speed)}
        >
          <Popup>
            <div style={{ minWidth: '160px' }} className="text-sm space-y-1">
              <p>
                <strong>Status:</strong>{' '}
                <span style={isIdle ? 'color:#d97706;font-weight:600' : 'color:#059669;font-weight:600'}>
                  {isIdle ? 'Idle' : 'Active'}
                </span>
              </p>
              <p><strong>Speed:</strong> {fmtSpeed(latest.speed)}</p>
              <p><strong>Engine Temp:</strong> {fmtTemp(latest.engineTemp)}</p>
              <p><strong>Updated:</strong> {fmtDateTime(latest.ts)}</p>
            </div>
          </Popup>
        </Marker>
        <PanToOnUpdate lat={latest.lat} lon={latest.lon} />
      </MapContainer>

      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full inline-block ${isIdle ? 'bg-amber-400' : 'bg-emerald-500'}`} />
          <span>{isIdle ? 'Idle' : 'Active'} · {latest.lat.toFixed(5)}, {latest.lon.toFixed(5)}</span>
        </span>
        <span>Updated: {fmtDateTime(latest.ts)}</span>
      </div>
    </div>
  );
}
