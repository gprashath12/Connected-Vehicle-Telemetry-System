import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink } from 'lucide-react';
import Topbar from '../components/layout/Topbar';
import VehicleMultiSelect from '../components/common/VehicleMultiSelect';
import SegmentedControl from '../components/common/SegmentedControl';
import TimeRangePicker, { computeRange, DEFAULT_RANGE } from '../components/common/TimeRangePicker';
import LastUpdated from '../components/common/LastUpdated';
import { Card, CardHeader, CardBody } from '../components/common/Card';
import EmptyState from '../components/common/EmptyState';
import LoadingBlock from '../components/common/LoadingBlock';
import ComparisonLineChart from '../components/compare/ComparisonLineChart';
import { fetchVehicles, fetchCompare } from '../api/vehicles';

const METRICS = [
  { value: 'speed', label: 'Speed' },
  { value: 'temp', label: 'Engine Temp' },
];

const POLL_MS = 60_000;

export default function AnalyticsPage() {
  const [selected, setSelected] = useState([]);
  const [metric, setMetric] = useState('speed');
  const [range, setRange] = useState(DEFAULT_RANGE);

  const [nowTs] = useState(Date.now);
  const { from, to } = useMemo(() => computeRange(range, nowTs), [range, nowTs]);

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: fetchVehicles,
  });

  const compareQuery = useQuery({
    queryKey: ['compare', selected, metric, from, to],
    queryFn: () => fetchCompare(selected, metric, from, to),
    enabled: selected.length >= 2,
    refetchInterval: selected.length >= 2 ? POLL_MS : false,
  });

  const debugUrl = selected.length >= 2
    ? `http://localhost:8082/api/vehicles/compare?ids=${selected.join(',')}&metric=${metric}&from=${from}&to=${to}`
    : null;

  return (
    <>
      <Topbar
        title="Analytics"
        subtitle="Compare performance across multiple vehicles"
        right={selected.length >= 2 && (
          <LastUpdated ts={compareQuery.dataUpdatedAt} fetching={compareQuery.isFetching} />
        )}
      />
      <div className="p-6 space-y-6">
        <Card>
          <CardBody className="flex flex-wrap items-start gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                Vehicles
              </label>
              <VehicleMultiSelect
                vehicles={vehicles}
                values={selected}
                onChange={setSelected}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                Metric
              </label>
              <SegmentedControl options={METRICS} value={metric} onChange={setMetric} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                Range
              </label>
              <TimeRangePicker value={range} onChange={setRange} />
            </div>

            {debugUrl && (
              <a
                href={debugUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-slate-200 dark:border-slate-700 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 transition-colors self-end"
                title={debugUrl}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View API Response
              </a>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title={metric === 'temp' ? 'Engine Temperature vs Time' : 'Speed vs Time'}
            subtitle={`Comparing ${selected.length} vehicle${selected.length === 1 ? '' : 's'}. Gaps indicate engine-off periods.`}
          />
          <CardBody>
            {selected.length < 2 ? (
              <EmptyState
                title="Select at least 2 vehicles"
                message="Use the selector above to choose vehicles you'd like to compare."
              />
            ) : compareQuery.isLoading ? (
              <LoadingBlock height={380} label="Loading comparison data…" />
            ) : (
              <ComparisonLineChart data={compareQuery.data} metric={metric} />
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
