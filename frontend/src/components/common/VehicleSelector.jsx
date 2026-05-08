import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

export default function VehicleSelector({ vehicles = [], value, onChange }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = vehicles.find((v) => v.vehicleid === value);
  const filtered = vehicles.filter((v) =>
    `${v.name} ${v.vehicle_code} ${v.manufacturer} ${v.model}`
      .toLowerCase()
      .includes(q.toLowerCase())
  );

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 min-w-[220px] px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-sm hover:border-slate-300 dark:hover:border-slate-600"
      >
        <span className="flex-1 text-left">
          {selected ? (
            <>
              <span className="font-medium text-slate-900 dark:text-slate-100">{selected.name}</span>
              <span className="text-slate-400 dark:text-slate-500 ml-2">{selected.vehicle_code}</span>
            </>
          ) : (
            <span className="text-slate-400 dark:text-slate-500">Select vehicle…</span>
          )}
        </span>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg">
          <div className="p-2 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name or reg ID"
                className="w-full pl-8 pr-2 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
          <div className="max-h-72 overflow-auto py-1">
            {filtered.length === 0 && (
              <div className="px-3 py-4 text-xs text-slate-400 dark:text-slate-500 text-center">
                No matches
              </div>
            )}
            {filtered.map((v) => (
              <button
                key={v.vehicleid}
                onClick={() => {
                  onChange?.(v.vehicleid);
                  setOpen(false);
                  setQ('');
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {v.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {v.manufacturer} {v.model} • {v.vehicle_code}
                  </div>
                </div>
                {value === v.vehicleid && <Check className="h-4 w-4 text-brand-600" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
