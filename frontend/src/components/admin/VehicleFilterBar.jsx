import { Search, RotateCcw } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'IDLE', label: 'Idle' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
];

const TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'PETROL', label: 'Petrol' },
  { value: 'DIESEL', label: 'Diesel' },
  { value: 'CNG', label: 'CNG' },
  { value: 'ELECTRIC', label: 'Electric' },
  { value: 'HYBRID', label: 'Hybrid' },
];

// speed=0 → IDLE overrides stored status.
// Defaults to ACTIVE (not INACTIVE) when none of the fields are available
// so that client vehicles without a stored status still show up under "Active".
export function getVehicleStatus(vehicle) {
  if (Number(vehicle.currentSpeed) === 0) return 'IDLE';
  if (vehicle.active24h) return 'ACTIVE';
  return vehicle.vehicleStatus || vehicle.status || 'ACTIVE';
}

// clientMode=true  → hides Owner dropdown, excludes Idle status option
export default function VehicleFilterBar({
  filters,
  onChange,
  onReset,
  total,
  shown,
  ownerOptions = [],
}) {
  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value });
  const statusOptions = STATUS_OPTIONS;

  const ownerSelectOptions = [
    { value: '', label: 'All owners' },
    ...ownerOptions.map((name) => ({ value: name, label: name })),
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-card p-4">
      <div className="flex flex-col lg:flex-row lg:items-end gap-3">
        {/* Search */}
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Search
          </label>
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filters.search}
              onChange={set('search')}
              placeholder="Search by name, ID, or number plate"
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Owner — only shown for admin (when ownerOptions are provided) */}
        {ownerOptions.length > 0 && (
          <FilterSelect
            label="Owner"
            value={filters.owner}
            onChange={set('owner')}
            options={ownerSelectOptions}
          />
        )}

        {/* Status */}
        <FilterSelect
          label="Status"
          value={filters.status}
          onChange={set('status')}
          options={statusOptions}
        />

        {/* Type (fuel type) */}
        <FilterSelect
          label="Type"
          value={filters.type}
          onChange={set('type')}
          options={TYPE_OPTIONS}
        />

        {/* Reset */}
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Filters
        </button>
      </div>

      {typeof total === 'number' && typeof shown === 'number' && (
        <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{shown}</span>{' '}
          of {total} vehicle{total === 1 ? '' : 's'}
        </div>
      )}
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div className="lg:w-44">
      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 text-slate-900 dark:text-slate-100"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── Pure filtering helpers ────────────────────────────────────────────────────

export const DEFAULT_VEHICLE_FILTERS = {
  search: '',
  owner: '',
  status: '',
  type: '',
};

export function applyVehicleFilters(vehicles, filters) {
  const search = (filters.search || '').trim().toLowerCase();
  return vehicles.filter((v) => {
    if (filters.owner && (v.ownerName || '') !== filters.owner) return false;
    if (filters.status && getVehicleStatus(v) !== filters.status) return false;
    if (filters.type && (v.fuelType || v.fuel_type || '') !== filters.type) return false;
    if (search) {
      const haystack = [
        v.name,
        v.vehicle_code,
        String(v.vehicleid ?? ''),
        v.manufacturer,
        v.model,
        v.ownerName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
}
