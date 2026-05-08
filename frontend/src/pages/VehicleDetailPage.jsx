import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import Topbar from '../components/layout/Topbar';
import VehicleInfoCard from '../components/dashboard/VehicleInfoCard';
import KpiGrid from '../components/dashboard/KpiGrid';
import SpeedAnalysisChart from '../components/dashboard/SpeedAnalysisChart';
import MapLite from '../components/map/MapLite';
import EmptyState from '../components/common/EmptyState';
import LoadingBlock from '../components/common/LoadingBlock';
import TimeRangePicker, { computeRange, DEFAULT_RANGE } from '../components/common/TimeRangePicker';
import LastUpdated from '../components/common/LastUpdated';
import {
  fetchVehicle,
  fetchLatestReading,
  fetchKpis,
} from '../api/vehicles';

const POLL_MS = 60_000;
const LOCATION_POLL_MS = 20_000;

export default function VehicleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const vehicleId = Number(id);

  const [range, setRange] = useState({ ...DEFAULT_RANGE, mode: '30d' });
  const [nowTs] = useState(Date.now);
  const { from, to } = useMemo(() => computeRange(range, nowTs), [range, nowTs]);

  const { data: vehicle, error: vehicleError } = useQuery({
    queryKey: ['vehicle', vehicleId],
    queryFn: () => fetchVehicle(vehicleId),
    enabled: !!vehicleId,
    retry: (failureCount, err) => {
      const status = err?.response?.status;
      return status !== 403 && status !== 404 && failureCount < 2;
    },
  });

  const latestQuery = useQuery({
    queryKey: ['latest', vehicleId],
    queryFn: () => fetchLatestReading(vehicleId),
    enabled: !!vehicleId && !vehicleError,
    refetchInterval: LOCATION_POLL_MS,
  });

  const kpisQuery = useQuery({
    queryKey: ['kpis', vehicleId, from, to],
    queryFn: () => fetchKpis(vehicleId, from, to),
    enabled: !!vehicleId && !vehicleError,
    refetchInterval: POLL_MS,
  });

  if (vehicleError) {
    const status = vehicleError?.response?.status;
    return (
      <>
        <Topbar title="Vehicle Detail" />
        <div className="p-6">
          <EmptyState
            title={status === 403 ? 'Access denied' : 'Vehicle not found'}
            message={
              status === 403
                ? "You don't have permission to view this vehicle."
                : 'This vehicle does not exist.'
            }
          />
          <div className="text-center mt-4">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-brand-600 dark:text-brand-400 hover:underline"
            >
              Back to vehicles
            </button>
          </div>
        </div>
      </>
    );
  }

  const lastTs = Math.max(latestQuery.dataUpdatedAt || 0, kpisQuery.dataUpdatedAt || 0);
  const isFetching = latestQuery.isFetching || kpisQuery.isFetching;

  return (
    <>
      <Topbar
        title="Vehicle Detail"
        subtitle="Real-time and historical telemetry"
        right={
          <div className="flex items-center gap-3">
            <LastUpdated ts={lastTs} fetching={isFetching} />
            <TimeRangePicker value={range} onChange={setRange} />
          </div>
        }
      />
      <div className="p-6 space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to fleet
        </Link>

        <VehicleInfoCard vehicle={vehicle} latest={latestQuery.data} />

        <div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
            Performance · {rangeLabel(range)}
          </h3>
          {kpisQuery.isLoading ? <LoadingBlock height={120} /> : <KpiGrid kpis={kpisQuery.data} />}
        </div>

        <SpeedAnalysisChart vehicleId={vehicleId} />

        <div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
            Location
          </h3>
          {latestQuery.isLoading ? (
            <LoadingBlock height={160} />
          ) : !latestQuery.data || (latestQuery.data.lat == null && latestQuery.data.lon == null) ? (
            <EmptyState message="No location data available for this vehicle." />
          ) : (
            <MapLite key={vehicleId} readings={[latestQuery.data]} />
          )}
        </div>
      </div>
    </>
  );
}

function rangeLabel(range) {
  if (!range) return '';
  if (range.mode === 'custom') return `${range.customFrom} → ${range.customTo}`;
  if (range.mode === '24h') {
    const f = range.hourFrom ?? 0;
    const t = range.hourTo ?? 24;
    return f === 0 && t === 24
      ? 'Last 24 hours'
      : `Today ${String(f).padStart(2, '0')}:00 – ${String(t).padStart(2, '0')}:00`;
  }
  return range.mode === '30d' ? 'Last 30 days' : 'Last 7 days';
}
