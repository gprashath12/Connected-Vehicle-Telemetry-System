import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  BarChart2,
  Gauge,
  Truck,
  LayoutDashboard,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const homeRoute = isAdmin ? '/admin/dashboard' : '/';

  // For admins: Dashboard is the FIRST navigation item.
  // For clients: original ordering preserved.
  const navItems = isAdmin
    ? [
        { to: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
        // { to: '/', label: 'Vehicles', icon: LayoutGrid, end: true },
        { to: '/analytics', label: 'Analytics', icon: BarChart2 },
        { to: '/engine-health', label: 'Engine Health', icon: Gauge },
        { to: '/admin/clients', label: 'Client Management', icon: Users },
      ]
    : [
        { to: '/', label: 'Vehicles', icon: LayoutGrid, end: true },
        { to: '/analytics', label: 'Analytics', icon: BarChart2 },
        { to: '/engine-health', label: 'Engine Health', icon: Gauge },
      ];

  return (
    <aside className="w-60 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
      <button
        onClick={() => navigate(homeRoute)}
        className="h-16 flex items-center gap-2 px-5 border-b border-slate-200 dark:border-slate-800 w-full hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="h-9 w-9 rounded-lg bg-brand-600 flex items-center justify-center shrink-0">
          <Truck className="h-5 w-5 text-white" />
        </div>
        <div className="leading-tight text-left">
          <div className="font-semibold text-slate-900 dark:text-slate-100">Telemetry</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Vehicle Console</div>
        </div>
      </button>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100',
              ].join(' ')
            }
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        v0.2 • {isAdmin ? 'Admin' : 'Client'} mode
      </div>
    </aside>
  );
}
