import { useEffect, useRef, useState } from 'react';
import { CircleUser, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../common/ThemeToggle';

export default function Topbar({ title, subtitle, right }) {
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function h(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <header
      className={`h-16 shrink-0 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between bg-white dark:bg-slate-900 ${
        isAdmin ? 'border-b-2 border-b-brand-500/60 dark:border-b-brand-400/60' : ''
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100 leading-tight truncate">
              {title}
            </h1>
            {isAdmin && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-brand-600 text-white">
                <ShieldCheck className="h-3 w-3" />
                Admin
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {right}
        <ThemeToggle />
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-700"
          >
            <CircleUser className="h-7 w-7 text-slate-400" />
            <div className="hidden md:block leading-tight text-left">
              <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {user?.fullName || user?.email}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {user?.role}
              </div>
            </div>
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg z-30">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                  {user?.fullName}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user?.email}
                </div>
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
