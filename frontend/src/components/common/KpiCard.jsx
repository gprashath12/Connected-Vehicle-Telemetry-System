import { Card } from './Card';

export default function KpiCard({ label, value, hint, icon: Icon, accent = 'brand' }) {
  const accents = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300',
    green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
    red: 'bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-300',
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300',
  };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
          {hint && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{hint}</p>}
        </div>
        {Icon && (
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${accents[accent]}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </Card>
  );
}
