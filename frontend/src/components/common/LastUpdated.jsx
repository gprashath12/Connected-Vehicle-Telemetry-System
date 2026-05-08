import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

function formatRelative(ms) {
  const sec = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (sec < 5) return 'just now';
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  return `${hr}h ago`;
}

/**
 * Live "Last updated: Xs ago" indicator.
 * Pass `ts` = epoch-ms of the last successful fetch (e.g. TanStack Query `dataUpdatedAt`).
 * Pass `fetching` = true while a refresh is in-flight to spin the icon.
 */
export default function LastUpdated({ ts, fetching = false }) {
  const [, force] = useState(0);

  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 5000);
    return () => clearInterval(id);
  }, []);

  if (!ts) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
        <RefreshCw className="h-3 w-3" />
        Awaiting first data…
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
      <RefreshCw className={`h-3 w-3 ${fetching ? 'animate-spin text-brand-500' : ''}`} />
      Last updated {formatRelative(ts)}
    </span>
  );
}
