import { Link } from 'react-router-dom';
import { Truck, Gauge, Thermometer, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchLatestReading } from '../../api/vehicles';
import { fmtSpeed, fmtTemp, fmtDateTime } from '../../lib/formatters';
import { TEMP_THRESHOLDS } from '../../lib/constants';

function tempBadge(temp) {
  if (temp == null) return 'bg-slate-100 dark:bg-slate-800 text-slate-500';
  if (temp >= TEMP_THRESHOLDS.WARNING) return 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300';
  if (temp >= TEMP_THRESHOLDS.NORMAL_MAX) return 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300';
  return 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300';
}

function statusStyle(speed) {
  if (speed == null) return null;
  return speed === 0
    ? { dot: 'bg-amber-500', badge: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300', label: 'Idle' }
    : { dot: 'bg-emerald-500', badge: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300', label: 'Active' };
}

export default function VehicleCard({ vehicle }) {
  const { data: latest } = useQuery({
    queryKey: ['latest', vehicle.vehicleid],
    queryFn: () => fetchLatestReading(vehicle.vehicleid),
    refetchInterval: 20_000,
  });

  const status = statusStyle(latest?.speed);

  return (
    <Link
      to={`/vehicles/${vehicle.vehicleid}`}
      className="group block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-card p-5 hover:border-brand-300 dark:hover:border-brand-500/50 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-brand-50 dark:bg-brand-500/15 flex items-center justify-center">
          <Truck className="h-5 w-5 text-brand-600 dark:text-brand-300" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
              {vehicle.name}
            </h3>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
              {vehicle.vehicle_code}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {vehicle.manufacturer} {vehicle.model}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <Gauge className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-medium">{fmtSpeed(latest?.speed)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Thermometer className="h-3.5 w-3.5 text-slate-400" />
          <span className={`px-1.5 py-0.5 rounded ${tempBadge(latest?.engineTemp)} font-medium`}>
            {fmtTemp(latest?.engineTemp)}
          </span>
        </div>
        <div className="col-span-2 flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <MapPin className="h-3.5 w-3.5" />
          <span className="truncate">
            {latest ? `${latest.lat}, ${latest.lon}` : '—'}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        {status ? (
          <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${status.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        ) : (
          <span />
        )}
        {latest && (
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            {fmtDateTime(latest.ts)}
          </span>
        )}
      </div>
    </Link>
  );
}
