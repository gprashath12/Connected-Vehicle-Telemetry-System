import SegmentedControl from './SegmentedControl';
import HourlyRangeSlider from './HourlyRangeSlider';
import CustomDateRange from './CustomDateRange';

const PRESETS = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: 'custom', label: 'Custom' },
];

const DAY_MS = 24 * 60 * 60 * 1000;

function toDateStr(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export const DEFAULT_RANGE = { mode: '7d', hourFrom: 0, hourTo: 24 };

/**
 * Resolve a TimeRangePicker value into absolute epoch-ms `{ from, to }`.
 *
 * Modes:
 *  - '24h'    → [hourFrom..hourTo] hour-of-day on today (clamped to now). Default [0,24] = full last 24h.
 *  - '7d'     → last 7 days
 *  - '30d'    → last 30 days
 *  - 'custom' → arbitrary date range (start-of-day from, end-of-day to)
 */
export function computeRange(value, anchor = Date.now()) {
  if (!value) return { from: anchor - 7 * DAY_MS, to: anchor };

  if (value.mode === 'custom') {
    const fromMs = value.customFrom ? new Date(`${value.customFrom}T00:00:00`).getTime() : anchor - 7 * DAY_MS;
    const toMs = value.customTo ? new Date(`${value.customTo}T23:59:59.999`).getTime() : anchor;
    return { from: fromMs, to: toMs };
  }

  if (value.mode === '24h') {
    const hourFrom = value.hourFrom ?? 0;
    const hourTo = value.hourTo ?? 24;

    // Default full window → genuine "last 24 hours"
    if (hourFrom === 0 && hourTo === 24) {
      return { from: anchor - DAY_MS, to: anchor };
    }

    // Hour window applied to today's calendar day, clamped to now.
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    let from = startOfToday.getTime() + hourFrom * 60 * 60 * 1000;
    let to = startOfToday.getTime() + hourTo * 60 * 60 * 1000;
    return { from, to: Math.min(to, anchor) };
  }

  const days = value.mode === '30d' ? 30 : 7;
  return { from: anchor - days * DAY_MS, to: anchor };
}

export default function TimeRangePicker({ value, onChange }) {
  const v = value || DEFAULT_RANGE;

  const setMode = (mode) => {
    if (mode === 'custom') {
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * DAY_MS);
      onChange?.({ mode: 'custom', customFrom: toDateStr(weekAgo), customTo: toDateStr(today) });
    } else if (mode === '24h') {
      onChange?.({ mode: '24h', hourFrom: 0, hourTo: 24 });
    } else {
      onChange?.({ mode });
    }
  };

  const showPanel = v.mode === '24h' || v.mode === 'custom';

  return (
    <div className="relative inline-flex flex-col items-end">
      <SegmentedControl options={PRESETS} value={v.mode} onChange={setMode} />

      {showPanel && (
        <div className="absolute right-0 top-full mt-2 z-30 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-lg">
          {v.mode === '24h' && (
            <div className="w-72 max-w-[80vw]">
              <HourlyRangeSlider
                from={v.hourFrom ?? 0}
                to={v.hourTo ?? 24}
                onChange={({ from, to }) =>
                  onChange?.({ ...v, mode: '24h', hourFrom: from, hourTo: to })
                }
              />
            </div>
          )}
          {v.mode === 'custom' && (
            <CustomDateRange
              from={v.customFrom}
              to={v.customTo}
              onChange={({ from, to }) =>
                onChange?.({ ...v, mode: 'custom', customFrom: from, customTo: to })
              }
            />
          )}
        </div>
      )}
    </div>
  );
}
