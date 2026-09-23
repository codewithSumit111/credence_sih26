import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
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

export default function TopBar() {
  const [time, setTime] = useState(new Date());
  const location = useLocation();

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
        <Link
          to="/live"
          className="relative p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white"
          title="Alerts"
          aria-label="View alerts"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-irctc-orange rounded-full border-2 border-irctc-blue" />
        </Link>

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
