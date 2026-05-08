import KpiCard from '../common/KpiCard';
import { Gauge, TrendingUp, Route, Clock, PauseCircle } from 'lucide-react';
import { fmtSpeed, fmtDistance, fmtHours } from '../../lib/formatters';

export default function KpiGrid({ kpis }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <KpiCard
        label="Max Speed"
        value={fmtSpeed(kpis?.maxSpeed)}
        icon={TrendingUp}
        accent="brand"
      />
      <KpiCard
        label="Avg Speed"
        value={fmtSpeed(kpis?.avgSpeed)}
        hint="while moving"
        icon={Gauge}
        accent="green"
      />
      <KpiCard
        label="Total Distance"
        value={fmtDistance(kpis?.totalDistanceKm)}
        icon={Route}
        accent="brand"
      />
      <KpiCard
        label="Engine Hours"
        value={fmtHours(kpis?.engineHours)}
        icon={Clock}
        accent="amber"
      />
      <KpiCard
        label="Idle Time"
        value={fmtHours(kpis?.idleHours)}
        icon={PauseCircle}
        accent="slate"
      />
    </div>
  );
}
