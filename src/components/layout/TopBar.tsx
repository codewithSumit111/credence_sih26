import { useState, useEffect, useRef } from 'react';
import { Bell, AlertTriangle, Shield, Layers, Info } from 'lucide-react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';

const navLinks = [
  { path: '/command', label: 'HOME' },
  { path: '/plan',    label: 'BLOCKS' },
  { path: '/trains',  label: 'TRAINS' },
  { path: '/live',    label: 'ALERTS' },
  { path: '/assets',  label: 'ASSETS' },
  { path: '/analytics', label: 'ANALYTICS' },
  { path: '/reports', label: 'REPORTS' },
  { path: '/field',   label: 'FIELD' },
];

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'CRITICAL', title: 'Track Failure Detected', detail: 'TR-02 near km 112. Immediate attention required.', time: 'Just now', link: '/live', icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
  { id: 2, type: 'ACTION REQUIRED', title: 'Block BR-00231 Optimized', detail: 'Pending controller approval for tomorrow\'s possession.', time: '12m ago', link: '/plan?view=blocks', icon: Layers, color: 'text-amber-600 bg-amber-50' },
  { id: 3, type: 'SYSTEM', title: 'TMS Sync Completed', detail: 'Live train positions updated successfully.', time: '25m ago', link: '/command', icon: Info, color: 'text-blue-600 bg-blue-50' },
  { id: 4, type: 'WARNING', title: 'Train 12003 Delayed', detail: 'Projected +18 min delay due to maintenance block.', time: '1h ago', link: '/trains', icon: Shield, color: 'text-orange-600 bg-orange-50' },
];

export default function TopBar() {
  const [time, setTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeFormatted = time.toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  });
  const dateFormatted = time.toLocaleDateString('en-IN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).replace(/\//g, '-');

  const isActive = (path: string) => {
    if (path === '/command') return location.pathname === '/command';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="irctc-header" role="navigation" aria-label="Main navigation">
      {/* ── Left: Logo & Branding ── */}
      <Link to="/command" className="flex items-center gap-2.5 no-underline group flex-shrink-0 mr-4">
        {/* IR Circular Badge */}
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md flex-shrink-0 border-2 border-white/30">
          <span className="text-[10px] font-black text-irctc-navy leading-none">IR</span>
        </div>
        <div className="hidden lg:block">
          <p className="text-[13px] font-bold text-white tracking-wide leading-tight uppercase">
            Indian Railways
          </p>
          <p className="text-[10px] text-blue-200 leading-tight font-medium">
            AI-Powered Block Planning
          </p>
        </div>
      </Link>

      {/* ── Center: Text-only navigation pill ── */}
      <nav className="hidden md:flex items-center flex-1 justify-center px-4" aria-label="Primary navigation">
        <div className="irctc-nav-pill">
          {navLinks.map((item) => {
            const active = isActive(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={clsx('irctc-nav-link', active && 'active')}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* ── Right: Tools ── */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Alerts Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white"
            title="Alerts"
            aria-label="View alerts"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-irctc-orange rounded-full border-2 border-irctc-blue" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Notifications</p>
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">4 New</span>
              </div>
              <div className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto">
                {MOCK_NOTIFICATIONS.map(notif => (
                  <Link
                    key={notif.id}
                    to={notif.link}
                    onClick={() => setShowNotifications(false)}
                    className="flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', notif.color)}>
                      <notif.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-gray-900 leading-tight">{notif.title}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{notif.detail}</p>
                      <p className="text-[9px] text-gray-400 mt-1">{notif.time} · <span className="font-semibold">{notif.type}</span></p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Date / Time */}
        <div className="hidden sm:flex flex-col items-end leading-tight text-right text-blue-200 border-l border-white/20 pl-3 whitespace-nowrap">
          <span className="text-[12px] font-bold text-white">{dateFormatted}</span>
          <span className="text-[11px] font-medium">{timeFormatted}</span>
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2 border-l border-white/20 pl-3 cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-white text-irctc-navy flex items-center justify-center text-[12px] font-bold shadow-md hover:shadow-lg transition-shadow">
            RS
          </div>
        </div>
      </div>
    </header>
  );
}
