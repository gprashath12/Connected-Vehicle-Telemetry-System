import { Users, Truck, Activity } from 'lucide-react';
import KpiCard from '../common/KpiCard';

export default function SystemStatsCards({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <KpiCard
        label="Registered Clients"
        value={stats?.totalClients ?? '—'}
        icon={Users}
        accent="brand"
      />
      <KpiCard
        label="Total Vehicles"
        value={stats?.totalVehicles ?? '—'}
        icon={Truck}
        accent="green"
      />
      <KpiCard
        label="Active (last 24h)"
        value={stats?.activeVehicles24h ?? '—'}
        hint="vehicles with recent telemetry"
        icon={Activity}
        accent="amber"
      />
    </div>
  );
}
