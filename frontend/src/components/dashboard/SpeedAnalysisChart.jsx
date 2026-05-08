import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { Card, CardHeader, CardBody } from '../common/Card';
import SegmentedControl from '../common/SegmentedControl';
import EmptyState from '../common/EmptyState';
import LoadingBlock from '../common/LoadingBlock';
import { fetchSpeedChart } from '../../api/vehicles';
import { useTheme } from '../../context/ThemeContext';

const PERIODS = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg px-3 py-2 text-xs">
      <div className="font-medium text-slate-900 dark:text-slate-100">{p.label}</div>
      <div className="text-slate-600 dark:text-slate-300 mt-1">
        Avg: <span className="font-medium">{p.avgSpeed} km/h</span>
      </div>
      <div className="text-slate-600 dark:text-slate-300">
        Max: <span className="font-medium">{p.maxSpeed} km/h</span>
      </div>
    </div>
  );
}

export default function SpeedAnalysisChart({ vehicleId }) {
  const [period, setPeriod] = useState('week');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const { data, isLoading } = useQuery({
    queryKey: ['speed-chart', vehicleId, period],
    queryFn: () => fetchSpeedChart(vehicleId, period),
    enabled: !!vehicleId,
  });

  const buckets = data?.buckets || [];
  const maxKey = data?.maxBucketKey;
  const peak = buckets.find((b) => b.key === maxKey);

  const grid = isDark ? '#1e293b' : '#e2e8f0';
  const tickColor = isDark ? '#94a3b8' : '#64748b';
  const axisLine = isDark ? '#334155' : '#e2e8f0';

  return (
    <Card>
      <CardHeader
        title="Speed Analysis"
        subtitle={
          period === 'day'
            ? 'Average speed per hour over last 24 hours'
            : period === 'week'
            ? 'Average speed per day over last 7 days'
            : 'Average speed per day over last 30 days'
        }
        action={<SegmentedControl options={PERIODS} value={period} onChange={setPeriod} />}
      />
      <CardBody>
        {isLoading ? (
          <LoadingBlock height={300} label="Loading speed data…" />
        ) : buckets.length === 0 ? (
          <EmptyState message="No telemetry readings in this time range." />
        ) : (
          <>
            {peak && (
              <div className="mb-3 inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300">
                <span className="font-medium">Peak speed</span>
                <span>{peak.maxSpeed} km/h</span>
                <span className="text-brand-500 dark:text-brand-400">@ {peak.label}</span>
              </div>
            )}
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={buckets} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: tickColor }}
                  axisLine={{ stroke: axisLine }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: tickColor }}
                  axisLine={{ stroke: axisLine }}
                  tickLine={false}
                  unit=" km/h"
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: isDark ? '#1e293b' : '#f1f5f9' }} />
                <Bar dataKey="avgSpeed" radius={[4, 4, 0, 0]}>
                  {buckets.map((b) => (
                    <Cell key={b.key} fill={b.key === maxKey ? '#2563eb' : isDark ? '#1d4ed8' : '#93c5fd'} />
                  ))}
                </Bar>
                {peak && (
                  <ReferenceLine
                    y={peak.maxSpeed}
                    stroke="#2563eb"
                    strokeDasharray="3 3"
                    label={{
                      value: `Peak ${peak.maxSpeed}`,
                      position: 'right',
                      fill: '#2563eb',
                      fontSize: 10,
                    }}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </CardBody>
    </Card>
  );
}
