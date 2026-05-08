import { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ThermometerSun, Activity } from 'lucide-react';
import Topbar from '../components/layout/Topbar';
import VehicleSelector from '../components/common/VehicleSelector';
import TimeRangePicker, { computeRange, DEFAULT_RANGE } from '../components/common/TimeRangePicker';
import LastUpdated from '../components/common/LastUpdated';
import { Card, CardHeader, CardBody } from '../components/common/Card';
import KpiCard from '../components/common/KpiCard';
import EmptyState from '../components/common/EmptyState';
import LoadingBlock from '../components/common/LoadingBlock';
import TemperatureHistoryChart from '../components/engine/TemperatureHistoryChart';
import { fetchVehicles, fetchTemperatureHistory } from '../api/vehicles';
import { TEMP_THRESHOLDS } from '../lib/constants';
import { fmtTemp } from '../lib/formatters';

const POLL_MS = 60_000;

export default function EngineHealthPage() {
  const [vehicleId, setVehicleId] = useState(null);
  const [range, setRange] = useState(DEFAULT_RANGE);

  const [nowTs] = useState(Date.now);
  const { from, to } = useMemo(() => computeRange(range, nowTs), [range, nowTs]);

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: fetchVehicles,
  });

  useEffect(() => {
    if (!vehicleId && vehicles.length) setVehicleId(vehicles[0].vehicleid);
  }, [vehicles, vehicleId]);

  const tempQuery = useQuery({
    queryKey: ['temp-history', vehicleId, from, to],
    queryFn: () => fetchTemperatureHistory(vehicleId, from, to),
    enabled: !!vehicleId,
    refetchInterval: POLL_MS,
  });

  const data = tempQuery.data || [];
  const breaches = data.filter((d) => d.engineTemp >= TEMP_THRESHOLDS.WARNING).length;
  const peakTemp = data.reduce((m, d) => Math.max(m, d.engineTemp), 0);
  const avgTemp =
    data.length > 0 ? data.reduce((s, d) => s + d.engineTemp, 0) / data.length : 0;

  return (
    <>
      <Topbar
        title="Engine Health"
        subtitle="Engine temperature diagnostics and threshold monitoring"
        right={
          <div className="flex items-center gap-3">
            <LastUpdated ts={tempQuery.dataUpdatedAt} fetching={tempQuery.isFetching} />
            <VehicleSelector vehicles={vehicles} value={vehicleId} onChange={setVehicleId} />
          </div>
        }
      />
      <div className="p-6 space-y-6">
        {!vehicleId ? (
          <EmptyState title="No vehicles available" />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <KpiCard
                label="Peak Temp"
                value={fmtTemp(peakTemp)}
                icon={ThermometerSun}
                accent={peakTemp >= TEMP_THRESHOLDS.WARNING ? 'red' : 'amber'}
              />
              <KpiCard label="Avg Temp" value={fmtTemp(avgTemp)} icon={Activity} accent="brand" />
              <KpiCard
                label="Threshold Breaches"
                value={breaches}
                hint={`Above ${TEMP_THRESHOLDS.WARNING}°C`}
                icon={AlertTriangle}
                accent={breaches > 0 ? 'red' : 'green'}
              />
            </div>

            <Card>
              <CardHeader
                title="Engine Temperature History"
                subtitle={`Gaps in the line indicate periods when the engine was OFF.`}
                action={<TimeRangePicker value={range} onChange={setRange} />}
              />
              <CardBody>
                {tempQuery.isLoading ? (
                  <LoadingBlock height={380} label="Loading temperature data…" />
                ) : data.length === 0 ? (
                  <EmptyState message="No temperature readings in this range." />
                ) : (
                  <TemperatureHistoryChart data={data} />
                )}
              </CardBody>
            </Card>
          </>
        )}
      </div>
    </>
  );
}
