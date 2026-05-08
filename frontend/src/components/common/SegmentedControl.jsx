export default function SegmentedControl({ options, value, onChange }) {
  return (
    <div className="inline-flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-md">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange?.(opt.value)}
          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
            value === opt.value
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
