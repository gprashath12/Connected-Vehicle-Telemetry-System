import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';
import { COMPARE_COLORS } from '../../lib/constants';

export default function VehicleMultiSelect({ vehicles = [], values = [], onChange, max = 6 }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function h(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const toggle = (id) => {
    if (values.includes(id)) onChange?.(values.filter((v) => v !== id));
    else if (values.length < max) onChange?.([...values, id]);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 min-w-[260px] px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-sm hover:border-slate-300 dark:hover:border-slate-600"
      >
        <span className="flex-1 text-left text-slate-600 dark:text-slate-300">
          {values.length === 0
            ? 'Select vehicles to compare…'
            : `${values.length} selected`}
        </span>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>

      {values.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {values.map((id, idx) => {
            const v = vehicles.find((x) => x.vehicleid === id);
            if (!v) return null;
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1.5 pl-2 pr-1 py-1 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: COMPARE_COLORS[idx % COMPARE_COLORS.length] }}
                />
                {v.name}
                <button
                  onClick={() => toggle(id)}
                  className="h-4 w-4 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {open && (
        <div className="absolute z-20 mt-1 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg">
          <div className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
            Choose up to {max} vehicles
          </div>
          <div className="max-h-72 overflow-auto py-1">
            {vehicles.map((v) => {
              const checked = values.includes(v.vehicleid);
              return (
                <button
                  key={v.vehicleid}
                  onClick={() => toggle(v.vehicleid)}
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
                  <div
                    className={`h-4 w-4 rounded border flex items-center justify-center ${
                      checked
                        ? 'bg-brand-600 border-brand-600'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {checked && <Check className="h-3 w-3 text-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
