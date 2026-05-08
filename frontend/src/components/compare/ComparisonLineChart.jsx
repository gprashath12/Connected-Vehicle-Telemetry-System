import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { COMPARE_COLORS } from '../../lib/constants';
import { fmtDateTime } from '../../lib/formatters';
import { useTheme } from '../../context/ThemeContext';

function buildCombined(series) {
  const map = new Map();
  series.forEach((s) => {
    s.points.forEach((p) => {
      if (!map.has(p.ts)) map.set(p.ts, { ts: p.ts });
      map.get(p.ts)[`v_${s.vehicleid}`] = p.value;
    });
  });
  return Array.from(map.values()).sort((a, b) => a.ts - b.ts);
}

function ChartTooltip({ active, payload, label, series, unit }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg px-3 py-2 text-xs">
      <div className="font-medium text-slate-900 dark:text-slate-100 mb-1">
        {fmtDateTime(label)}
      </div>
      {payload.map((p) => {
        const s = series.find((x) => `v_${x.vehicleid}` === p.dataKey);
        return (
          <div key={p.dataKey} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="font-medium text-slate-700 dark:text-slate-200">{s?.name}</span>
            <span>
              {p.value != null ? `${Math.round(p.value * 10) / 10} ${unit}` : '—'}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function ComparisonLineChart({ data, metric }) {
  const series = data?.series || [];
  const combined = buildCombined(series);
  const unit = metric === 'temp' ? '°C' : 'km/h';

  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const grid = isDark ? '#1e293b' : '#e2e8f0';
  const tickColor = isDark ? '#94a3b8' : '#64748b';
  const axisLine = isDark ? '#334155' : '#e2e8f0';

  return (
    <ResponsiveContainer width="100%" height={380}>
      <LineChart data={combined} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
        <XAxis
          dataKey="ts"
          type="number"
          domain={['dataMin', 'dataMax']}
          tickFormatter={(t) =>
            new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
          }
          tick={{ fontSize: 11, fill: tickColor }}
          axisLine={{ stroke: axisLine }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: tickColor }}
          axisLine={{ stroke: axisLine }}
          tickLine={false}
          unit={` ${unit}`}
        />
        <Tooltip content={<ChartTooltip series={series} unit={unit} />} />
        <Legend wrapperStyle={{ fontSize: 12, color: tickColor }} />
        {series.map((s, idx) => (
          <Line
            key={s.vehicleid}
            type="monotone"
            dataKey={`v_${s.vehicleid}`}
            name={s.name}
            stroke={COMPARE_COLORS[idx % COMPARE_COLORS.length]}
            strokeWidth={2}
            dot={false}
            connectNulls={false}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
