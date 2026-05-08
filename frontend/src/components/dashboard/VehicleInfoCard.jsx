import { Card, CardBody } from '../common/Card';
import { Truck, Gauge, Thermometer, MapPin } from 'lucide-react';
import { fmtSpeed, fmtTemp, fmtDateTime } from '../../lib/formatters';
import { TEMP_THRESHOLDS } from '../../lib/constants';

function tempBadge(temp) {
  if (temp == null) return { label: '—', cls: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400' };
  if (temp >= TEMP_THRESHOLDS.WARNING) return { label: 'High', cls: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300' };
  if (temp >= TEMP_THRESHOLDS.NORMAL_MAX) return { label: 'Elevated', cls: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300' };
  return { label: 'Normal', cls: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' };
}

export default function VehicleInfoCard({ vehicle, latest }) {
  if (!vehicle) return null;
  const badge = tempBadge(latest?.engineTemp);

  return (
    <Card>
      <CardBody>
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-brand-50 dark:bg-brand-500/15 flex items-center justify-center">
            <Truck className="h-6 w-6 text-brand-600 dark:text-brand-300" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
                {vehicle.name}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {vehicle.vehicle_code}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {vehicle.manufacturer} {vehicle.model} • Registered {vehicle.registeredon}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <Tile icon={Gauge} label="Current speed" value={fmtSpeed(latest?.speed)} />
          <div className="rounded-lg border border-slate-100 dark:border-slate-800 p-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Thermometer className="h-3.5 w-3.5" />
              Engine temp
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {fmtTemp(latest?.engineTemp)}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.cls}`}>
                {badge.label}
              </span>
            </div>
          </div>
          <div className="rounded-lg border border-slate-100 dark:border-slate-800 p-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <MapPin className="h-3.5 w-3.5" />
              Location
            </div>
            <div className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
              {latest ? `Lat: ${latest.lat}, Lon: ${latest.lon}` : '—'}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {latest ? `Last update: ${fmtDateTime(latest.ts)}` : ''}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function Tile({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-slate-100 dark:border-slate-800 p-4">
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
