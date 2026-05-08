export default function CustomDateRange({ from, to, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <DateInput
        value={from}
        max={to}
        onChange={(v) => onChange?.({ from: v, to })}
        label="From"
      />
      <span className="text-xs text-slate-400">→</span>
      <DateInput
        value={to}
        min={from}
        onChange={(v) => onChange?.({ from, to: v })}
        label="To"
      />
    </div>
  );
}

function DateInput({ value, onChange, min, max, label }) {
  return (
    <label className="flex flex-col">
      <span className="text-[10px] uppercase tracking-wide text-slate-400 mb-0.5">{label}</span>
      <input
        type="date"
        value={value || ''}
        min={min || undefined}
        max={max || undefined}
        onChange={(e) => onChange(e.target.value)}
        className="text-xs px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500"
      />
    </label>
  );
}
