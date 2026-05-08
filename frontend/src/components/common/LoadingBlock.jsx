export default function LoadingBlock({ height = 200, label = 'Loading…' }) {
  return (
    <div
      className="flex items-center justify-center text-sm text-slate-400 dark:text-slate-500"
      style={{ height }}
    >
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-brand-500 animate-pulse" />
        {label}
      </div>
    </div>
  );
}
