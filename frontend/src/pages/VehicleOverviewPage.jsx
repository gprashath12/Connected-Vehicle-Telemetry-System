import { useMemo, useState } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import Topbar from '../components/layout/Topbar';
import { Card, CardHeader, CardBody } from '../components/common/Card';
import EmptyState from '../components/common/EmptyState';
import LoadingBlock from '../components/common/LoadingBlock';
import LastUpdated from '../components/common/LastUpdated';
import VehicleCard from '../components/fleet/VehicleCard';
import GlobalFleetTable from '../components/admin/GlobalFleetTable';
import VehicleFilterBar, {
  DEFAULT_VEHICLE_FILTERS,
  applyVehicleFilters,
} from '../components/admin/VehicleFilterBar';
import { fetchVehicles, fetchLatestReading } from '../api/vehicles';
import { fetchAdminFleet } from '../api/admin';
import { useAuth } from '../context/AuthContext';

const POLL_MS = 60_000;

export default function VehicleOverviewPage() {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminVehicles /> : <ClientVehicles />;
}

function ClientVehicles() {
  const [filters, setFilters] = useState(DEFAULT_VEHICLE_FILTERS);

  const vehiclesQuery = useQuery({
    queryKey: ['vehicles'],
    queryFn: fetchVehicles,
    refetchInterval: POLL_MS,
  });

  const vehicles = vehiclesQuery.data || [];

  // Fetch latest readings for every vehicle so we know each vehicle's current
  // speed. Shares the same query-cache keys used by VehicleCard — no extra
  // network requests are made when the cards are also rendered.
  const latestQueries = useQueries({
    queries: vehicles.map((v) => ({
      queryKey: ['latest', v.vehicleid],
      queryFn: () => fetchLatestReading(v.vehicleid),
      refetchInterval: 20_000,
    })),
  });

  // Merge live speed into each vehicle so getVehicleStatus can detect Idle.
  const enrichedVehicles = useMemo(
    () =>
      vehicles.map((v, i) => ({
        ...v,
        currentSpeed: latestQueries[i]?.data?.speed ?? undefined,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [vehicles, latestQueries],
  );

  const filteredVehicles = useMemo(
    () => applyVehicleFilters(enrichedVehicles, filters),
    [enrichedVehicles, filters],
  );

  return (
    <>
      <Topbar
        title="My Vehicles"
        subtitle="All vehicles assigned to your account"
        right={<LastUpdated ts={vehiclesQuery.dataUpdatedAt} fetching={vehiclesQuery.isFetching} />}
      />
      <div className="p-6 space-y-6">
        {!vehiclesQuery.isLoading && vehicles.length > 0 && (
          <VehicleFilterBar
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters(DEFAULT_VEHICLE_FILTERS)}
            total={enrichedVehicles.length}
            shown={filteredVehicles.length}
          />
        )}

        {vehiclesQuery.isLoading ? (
          <LoadingBlock height={200} />
        ) : vehicles.length === 0 ? (
          <EmptyState
            title="No vehicles yet"
            message="You don't have any vehicles assigned. Contact your administrator to add one."
          />
        ) : filteredVehicles.length === 0 ? (
          <EmptyState message="No vehicles found for selected filters." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVehicles.map((v) => (
              <VehicleCard key={v.vehicleid} vehicle={v} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function AdminVehicles() {
  const fleetQuery = useQuery({
    queryKey: ['admin-fleet'],
    queryFn: fetchAdminFleet,
    refetchInterval: POLL_MS,
  });

  const fleet = fleetQuery.data || [];
  const [filters, setFilters] = useState(DEFAULT_VEHICLE_FILTERS);

  const ownerOptions = useMemo(
    () => [...new Set(fleet.map((v) => v.ownerName).filter(Boolean))].sort(),
    [fleet],
  );

  const filteredFleet = useMemo(
    () => applyVehicleFilters(fleet, filters),
    [fleet, filters],
  );

  return (
    <>
      <Topbar
        title="Vehicle Management"
        subtitle="All vehicles across all clients"
        right={<LastUpdated ts={fleetQuery.dataUpdatedAt} fetching={fleetQuery.isFetching} />}
      />
      <div className="p-6 space-y-6">
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
            title="All Vehicles"
            subtitle={`${filteredFleet.length} vehicle${filteredFleet.length === 1 ? '' : 's'} match${
              filteredFleet.length === 1 ? 'es' : ''
            } the current filters`}
          />
          <CardBody className="p-0">
            {fleetQuery.isLoading ? (
              <LoadingBlock height={240} />
            ) : fleet.length === 0 ? (
              <EmptyState message="No vehicles in the system." />
            ) : filteredFleet.length === 0 ? (
              <EmptyState message="No vehicles found for selected filters." />
            ) : (
              <GlobalFleetTable fleet={filteredFleet} />
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
