import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { TEMP_THRESHOLDS } from '../../lib/constants';
import { fmtDateTime } from '../../lib/formatters';
import { useTheme } from '../../context/ThemeContext';

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  const over = p.engineTemp >= TEMP_THRESHOLDS.WARNING;
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg px-3 py-2 text-xs">
      <div className="font-medium text-slate-900 dark:text-slate-100">{fmtDateTime(p.ts)}</div>
      <div
        className={`mt-1 ${over ? 'text-red-600 dark:text-red-300 font-medium' : 'text-slate-600 dark:text-slate-300'}`}
      >
        Engine: {p.engineTemp} °C {over && '· Over threshold'}
      </div>
    </div>
  );
}

function BreachDot({ cx, cy, payload }) {
  if (!payload || payload.engineTemp < TEMP_THRESHOLDS.WARNING) return null;
  return <circle cx={cx} cy={cy} r={3} fill="#dc2626" stroke="#fff" strokeWidth={1} />;
}

export default function TemperatureHistoryChart({ data = [] }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const grid = isDark ? '#1e293b' : '#e2e8f0';
  const tickColor = isDark ? '#94a3b8' : '#64748b';
  const axisLine = isDark ? '#334155' : '#e2e8f0';

  return (
    <ResponsiveContainer width="100%" height={380}>
      <ComposedChart data={data} margin={{ top: 8, right: 80, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
        <XAxis
          dataKey="ts"
          type="number"
          scale="time"
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
          unit=" °C"
          domain={['auto', (max) => Math.max(max + 5, TEMP_THRESHOLDS.WARNING + 5)]}
        />
        <Tooltip content={<ChartTooltip />} />
        <ReferenceLine
          y={TEMP_THRESHOLDS.WARNING}
          stroke="#dc2626"
          strokeDasharray="4 4"
          label={{
            value: `Warning ${TEMP_THRESHOLDS.WARNING}°C`,
            position: 'insideTopRight',
            fill: '#dc2626',
            fontSize: 10,
          }}
        />
        <Line
          type="monotone"
          dataKey="engineTemp"
          stroke={isDark ? '#60a5fa' : '#2563eb'}
          strokeWidth={2}
          dot={<BreachDot />}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
