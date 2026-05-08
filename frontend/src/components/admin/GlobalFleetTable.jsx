import { useNavigate } from 'react-router-dom';
import { fmtSpeed, fmtTemp, fmtDateTime } from '../../lib/formatters';
import { TEMP_THRESHOLDS } from '../../lib/constants';
import { getVehicleStatus } from './VehicleFilterBar';

function tempCls(t) {
  if (t == null) return 'text-slate-500 dark:text-slate-400';
  if (t >= TEMP_THRESHOLDS.WARNING) return 'text-red-600 dark:text-red-300 font-medium';
  if (t >= TEMP_THRESHOLDS.NORMAL_MAX) return 'text-amber-600 dark:text-amber-300';
  return 'text-emerald-600 dark:text-emerald-300';
}

export default function GlobalFleetTable({ fleet = [] }) {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b border-slate-200 dark:border-slate-800">
            <Th>Vehicle</Th>
            <Th>Owner</Th>
            <Th>Speed</Th>
            <Th>Engine Temp</Th>
            <Th>Last Seen</Th>
            <Th>Status</Th>
          </tr>
        </thead>
        <tbody>
          {fleet.map((v) => (
            <tr
              key={v.vehicleid}
              onClick={() => navigate(`/vehicles/${v.vehicleid}`)}
              className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
            >
              <Td>
                <div className="font-medium text-slate-900 dark:text-slate-100">{v.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {v.manufacturer} {v.model} · {v.vehicle_code}
                </div>
              </Td>
              <Td>
                <div className="text-slate-700 dark:text-slate-200">{v.ownerName || '—'}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{v.ownerEmail}</div>
              </Td>
              <Td className="text-slate-700 dark:text-slate-200">{fmtSpeed(v.currentSpeed)}</Td>
              <Td className={tempCls(v.currentEngineTemp)}>{fmtTemp(v.currentEngineTemp)}</Td>
              <Td className="text-slate-500 dark:text-slate-400 text-xs">
                {v.lastSeenTs ? fmtDateTime(v.lastSeenTs) : '—'}
              </Td>
              <Td>
                <StatusBadge vehicle={v} />
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const STATUS_STYLES = {
  ACTIVE:      'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
  IDLE:        'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',
  INACTIVE:    'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
  MAINTENANCE: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300',
};

const STATUS_LABELS = {
  ACTIVE: 'Active',
  IDLE: 'Idle',
  INACTIVE: 'Inactive',
  MAINTENANCE: 'Maintenance',
};

function StatusBadge({ vehicle }) {
  const status = getVehicleStatus(vehicle);
  const cls = STATUS_STYLES[status] ?? STATUS_STYLES.INACTIVE;
  const label = STATUS_LABELS[status] ?? status;
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>
      {label}
    </span>
  );
}

function Th({ children }) {
  return (
    <th className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {children}
    </th>
  );
}

function Td({ children, className = '' }) {
  return <td className={`px-3 py-3 ${className}`}>{children}</td>;
}
