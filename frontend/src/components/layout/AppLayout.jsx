import Sidebar from './Sidebar';

export default function AppLayout({ children }) {
  return (
    <div className="h-full flex bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-auto">{children}</div>
      </main>
    </div>
  );
}
