import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'No data available', message, icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
        <Icon className="h-6 w-6 text-slate-400 dark:text-slate-500" />
      </div>
      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h4>
      {message && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">{message}</p>}
    </div>
  );
}
