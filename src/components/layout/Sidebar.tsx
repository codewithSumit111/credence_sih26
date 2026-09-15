import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, CalendarClock, ListOrdered, Train,
  GitBranch, AlertTriangle, CheckSquare, BarChart3,
  Plus, FlaskConical, Wrench, Zap
} from 'lucide-react';
import { clsx } from 'clsx';

const mainNav = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/blocks', label: 'Block Plans', icon: CalendarClock },
  { path: '/priority', label: 'Priority', icon: ListOrdered },
  { path: '/trains', label: 'Trains', icon: Train },
  { path: '/rerouting', label: 'Rerouting', icon: GitBranch },
  { path: '/events', label: 'Live Events', icon: AlertTriangle, badge: 3 },
  { path: '/approvals', label: 'Approvals', icon: CheckSquare, badge: 2 },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
];

const toolsNav = [
  { path: '/requests/new', label: 'New Request', icon: Plus },
  { path: '/what-if', label: 'What-If Simulator', icon: FlaskConical },
  { path: '/field', label: 'Field Execution', icon: Wrench },
];

export default function Sidebar() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard' || location.pathname === '/overview';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="hidden md:flex flex-col w-[220px] min-h-screen bg-[#0F2240] text-white flex-shrink-0 border-r border-[#162E4D]">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-[#1A3355]">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <span className="text-[11px] font-bold tracking-widest text-white uppercase leading-tight">
            Railway Intelligence
          </span>
        </div>
        <p className="text-[10px] text-[#6B8AAA] ml-6">Central Railway • CR Division</p>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        <div className="px-3 mb-1">
          <p className="text-[10px] font-semibold text-[#4A6A8A] uppercase tracking-widest px-2 mb-1.5">Operations</p>
          {mainNav.map((item) => {
            const active = isActive(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={clsx(
                  'flex items-center gap-2.5 px-2 py-1.5 rounded text-[13px] mb-0.5 transition-colors group relative',
                  active
                    ? 'bg-[#1A3355] text-white border-l-2 border-blue-400 pl-[6px]'
                    : 'text-[#8AAABF] hover:bg-[#162E4D] hover:text-white'
                )}
              >
                <item.icon className={clsx(
                  'w-3.5 h-3.5 flex-shrink-0',
                  active ? 'text-blue-400' : 'text-[#4A6A8A] group-hover:text-[#8AAABF]'
                )} />
                <span className="flex-1 font-medium">{item.label}</span>
                {'badge' in item && item.badge ? (
                  <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center leading-none">
                    {item.badge}
                  </span>
                ) : null}
              </NavLink>
            );
          })}
        </div>

        <div className="px-3 mt-4">
          <p className="text-[10px] font-semibold text-[#4A6A8A] uppercase tracking-widest px-2 mb-1.5">Planning</p>
          {toolsNav.map((item) => {
            const active = isActive(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={clsx(
                  'flex items-center gap-2.5 px-2 py-1.5 rounded text-[13px] mb-0.5 transition-colors group',
                  active
                    ? 'bg-[#1A3355] text-white border-l-2 border-blue-400 pl-[6px]'
                    : 'text-[#8AAABF] hover:bg-[#162E4D] hover:text-white'
                )}
              >
                <item.icon className={clsx(
                  'w-3.5 h-3.5 flex-shrink-0',
                  active ? 'text-blue-400' : 'text-[#4A6A8A] group-hover:text-[#8AAABF]'
                )} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[#1A3355]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
            RS
          </div>
          <div>
            <p className="text-xs font-semibold text-white">R. Sharma</p>
            <p className="text-[10px] text-[#4A6A8A]">Section Controller</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
