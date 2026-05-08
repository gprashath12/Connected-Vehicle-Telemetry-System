import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Topbar from '../components/layout/Topbar';
import { Card, CardHeader, CardBody } from '../components/common/Card';
import LoadingBlock from '../components/common/LoadingBlock';
import EmptyState from '../components/common/EmptyState';
import SystemStatsCards from '../components/admin/SystemStatsCards';
import GlobalFleetTable from '../components/admin/GlobalFleetTable';
import FleetMap from '../components/admin/FleetMap';
import LastUpdated from '../components/common/LastUpdated';
import VehicleFilterBar, {
  DEFAULT_VEHICLE_FILTERS,
  applyVehicleFilters,
} from '../components/admin/VehicleFilterBar';
import { fmtSpeed } from '../lib/formatters';
import { fetchAdminStats, fetchAdminFleet, fetchTop5SpeedToday } from '../api/admin';

const POLL_MS = 60_000;

export default function AdminDashboardPage() {
  const [filters, setFilters] = useState(DEFAULT_VEHICLE_FILTERS);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: fetchAdminStats,
    refetchInterval: POLL_MS,
  });

  const fleetQuery = useQuery({
    queryKey: ['admin-fleet'],
    queryFn: fetchAdminFleet,
    refetchInterval: POLL_MS,
  });
  const fleet = fleetQuery.data || [];

  const { data: topSpeed = [], isLoading: topSpeedLoading } = useQuery({
    queryKey: ['admin-top-speed-today'],
    queryFn: fetchTop5SpeedToday,
    refetchInterval: POLL_MS,
  });

  // Derive unique owner names from fleet data — auto-updates when new clients appear.
  const ownerOptions = useMemo(
    () => [...new Set(fleet.map((v) => v.ownerName).filter(Boolean))].sort(),
    [fleet],
  );

  const filteredFleet = useMemo(
    () => applyVehicleFilters(fleet, filters),
    [fleet, filters],
  );

  const mappableCount = filteredFleet.filter(
    (v) => typeof v.lat === 'number' && typeof v.lon === 'number',
  ).length;

  return (
    <>
      <Topbar
        title="Admin Dashboard"
        subtitle="Platform-wide telemetry health and vehicle activity"
        right={<LastUpdated ts={fleetQuery.dataUpdatedAt} fetching={fleetQuery.isFetching} />}
      />
      <div className="p-6 space-y-6">
        {statsLoading ? <LoadingBlock height={120} /> : <SystemStatsCards stats={stats} />}

        {/* Filter bar */}
        {!fleetQuery.isLoading && (
          <VehicleFilterBar
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters(DEFAULT_VEHICLE_FILTERS)}
            ownerOptions={ownerOptions}
            total={fleet.length}
            shown={filteredFleet.length}
          />
        )}

        <Card>
          <CardHeader
            title="Vehicle Overview"
            subtitle="Click any row to drill into a vehicle"
          />
          <CardBody className="p-0">
            {fleetQuery.isLoading ? (
              <LoadingBlock height={240} />
            ) : filteredFleet.length === 0 ? (
              <EmptyState
                message={
                  fleet.length === 0
                    ? 'No vehicles registered.'
                    : 'No vehicles found for selected filters.'
                }
              />
            ) : (
              <GlobalFleetTable fleet={filteredFleet} />
            )}
          </CardBody>
        </Card>

        {/* Live connected map */}
        <Card>
          <CardHeader
            title="Live Vehicle Map"
            subtitle={
              mappableCount
                ? `${mappableCount} vehicle${mappableCount === 1 ? '' : 's'} currently reporting GPS`
                : 'Real-time vehicle locations'
            }
          />
          <CardBody className="p-0">
            {fleetQuery.isLoading ? (
              <LoadingBlock height={380} />
            ) : mappableCount === 0 ? (
              <EmptyState message="No GPS data available yet." />
            ) : (
              <FleetMap fleet={filteredFleet} height={420} />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Top 5 Vehicles by Peak Speed Today"
            subtitle="Highest single-reading speed recorded since midnight UTC"
          />
          <CardBody className="p-0">
            {topSpeedLoading ? (
              <LoadingBlock height={200} />
            ) : topSpeed.length === 0 ? (
              <EmptyState message="No speed data recorded today." />
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Rank
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Vehicle
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Reg. Plate
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Peak Speed
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topSpeed.map((row, i) => (
                    <tr
                      key={row.vehicleId}
                      className="border-b border-slate-100 dark:border-slate-800 last:border-0"
                    >
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{i + 1}</td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                        {row.vehicleName ?? '—'}
                      </td>
                      <td className="px-5 py-3 font-mono text-slate-600 dark:text-slate-300">
                        {row.vehicleCode ?? '—'}
                      </td>
                      <td className="px-5 py-3 font-semibold text-slate-900 dark:text-slate-100">
                        {fmtSpeed(row.peakSpeed)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
