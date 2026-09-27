import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CalendarClock,
  Train, AlertTriangle, BarChart3,
  Wrench, FileText, FileQuestion, LogOut,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../../contexts/AuthContext';

const getPrimaryNav = (role: string) => {
  const allNav = [
    { path: '/command', label: 'Command', icon: LayoutDashboard, matchPaths: ['/command', '/dashboard', '/overview'], roles: ['SECTION_CONTROLLER'] },
    { path: '/plan', label: 'Plan', icon: CalendarClock, matchPaths: ['/plan', '/blocks', '/priority'], roles: ['SECTION_CONTROLLER', 'BDMS_INCHARGE'] },
    { path: '/requests', label: 'Requests', icon: FileQuestion, matchPaths: ['/requests'], roles: ['SECTION_CONTROLLER', 'BDMS_INCHARGE'] },
    { path: '/trains', label: 'Trains', icon: Train, matchPaths: ['/trains', '/rerouting'], roles: ['SECTION_CONTROLLER'] },
    { path: '/live', label: 'Live Recovery', icon: AlertTriangle, matchPaths: ['/live', '/events', '/reoptimization'], badge: 1, roles: ['SECTION_CONTROLLER', 'BDMS_INCHARGE', 'FIELD_MANAGER'] },
    { path: '/analytics', label: 'Analytics', icon: BarChart3, matchPaths: ['/analytics', '/what-if'], roles: ['SECTION_CONTROLLER'] },
    { path: '/reports', label: 'Reports', icon: FileText, matchPaths: ['/reports'], roles: ['SECTION_CONTROLLER'] },
    { path: '/field', label: 'Field Execution', icon: Wrench, matchPaths: ['/field'], roles: ['FIELD_MANAGER'] },
  ];
  return allNav.filter(nav => nav.roles.includes(role));
};

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const primaryNav = getPrimaryNav(user?.role || 'SECTION_CONTROLLER');

  const [isPinned, setIsPinned] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('kavach_sidebar_pinned');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isExpanded = isPinned || isHovered;

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 160);
  };

  const togglePinned = () => {
    setIsPinned((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('kavach_sidebar_pinned', String(next));
      } catch {}
      if (!next) {
        setIsHovered(false);
      } else {
        setIsHovered(true);
      }
      return next;
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        togglePinned();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, [isPinned]);

  const isActive = (item: typeof primaryNav[number]) => {
    return item.matchPaths.some(p =>
      p === location.pathname
        ? true
        : location.pathname.startsWith(p + '/') || location.pathname.startsWith(p + '?') || location.pathname === p
    );
  };

  return (
    <aside
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={clsx(
        'hidden md:flex flex-col min-h-screen bg-gradient-to-b from-[#0D221A] via-[#0B1A14] to-[#07140F] text-slate-100 flex-shrink-0 border-r border-[#163828] shadow-2xl select-none z-30 transition-all duration-300 ease-in-out relative',
        isExpanded ? 'w-[220px]' : 'w-[64px]'
      )}
    >
      {/* Brand Header */}
      <div
        className={clsx(
          'py-4 border-b border-[#163828]/80 bg-[#081510]/40 transition-all',
          isExpanded ? 'px-4 flex items-center justify-between' : 'px-2 flex flex-col items-center gap-1.5'
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Link
            to="/"
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1B6B45] to-[#0D9488] flex items-center justify-center shadow-md shadow-emerald-950/60 ring-1 ring-emerald-400/30 flex-shrink-0 transition-all hover:ring-emerald-400/60 hover:scale-105 active:scale-95 group"
            title="Go to Landing Page"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#A7F3D0"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-xs group-hover:stroke-white transition-colors"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </Link>
          {isExpanded && (
            <Link to="/" className="min-w-0 overflow-hidden group/text no-underline" title="Go to Landing Page">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-black tracking-wider text-white group-hover/text:text-emerald-300 uppercase leading-tight font-sans transition-colors">
                  VAJRA
                </span>
                <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-950/90 border border-blue-500/30 px-1.5 py-0.5 rounded leading-none">
                  CR
                </span>
              </div>
              <p className="text-[10.5px] text-emerald-300/70 font-medium tracking-wide truncate mt-0.5 transition-colors">
                Railway Intelligence
              </p>
            </Link>
          )}
        </div>

        <button
          onClick={togglePinned}
          className={clsx(
            'p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors',
            !isExpanded && 'mt-0.5'
          )}
          title={isPinned ? 'Collapse sidebar (Ctrl+B)' : 'Pin sidebar open (Ctrl+B)'}
          aria-label={isPinned ? 'Collapse sidebar' : 'Pin sidebar open'}
        >
          {isPinned ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4 text-emerald-400" />
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className={clsx('flex-1 py-4 overflow-y-auto space-y-1', isExpanded ? 'px-3' : 'px-2')}>
        {primaryNav.map((item) => {
          const active = isActive(item);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={!isExpanded ? item.label : undefined}
              className={clsx(
                'flex items-center rounded-xl text-[13.5px] font-medium transition-all duration-150 group relative',
                isExpanded ? 'gap-3 px-3 py-2.5' : 'justify-center w-10 h-10 mx-auto',
                active
                  ? 'bg-gradient-to-r from-[#1B6B45] to-[#145536] text-white font-semibold shadow-md shadow-emerald-950/50 border border-emerald-400/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.07]'
              )}
            >
              <item.icon className={clsx(
                'w-[17px] h-[17px] flex-shrink-0 transition-colors',
                active ? 'text-emerald-300' : 'text-emerald-400/70 group-hover:text-emerald-300'
              )} />

              {isExpanded && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {'badge' in item && item.badge ? (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none shadow-xs ring-2 ring-[#0B1A14]">
                      {item.badge}
                    </span>
                  ) : null}
                </>
              )}

              {!isExpanded && 'badge' in item && item.badge ? (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#0B1A14]" />
              ) : null}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Profile Card */}
      <div className={clsx('border-t border-[#163828]/80 bg-[#081510]/70 transition-all flex flex-col', isExpanded ? 'p-3 gap-2' : 'p-2 gap-2')}>
        {!isExpanded ? (
          <div
            className="flex flex-col items-center py-1"
            title={`${user?.name} • ${user?.role.replace('_', ' ')}`}
          >
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1B6B45] to-[#0D9488] flex items-center justify-center text-[11px] font-bold text-white shadow-xs ring-1 ring-emerald-400/30">
                {user?.name?.substring(0, 2).toUpperCase() || 'U'}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 border-2 border-[#0B1A14] rounded-full" />
            </div>
            <button onClick={handleLogout} className="mt-4 p-2 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-lg transition-colors" title="Logout">
                <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.04] border border-white/[0.07]">
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1B6B45] to-[#0D9488] flex items-center justify-center text-[11px] font-bold text-white shadow-xs ring-1 ring-emerald-400/30">
                  {user?.name?.substring(0, 2).toUpperCase() || 'U'}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 border-2 border-[#0B1A14] rounded-full" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-white truncate leading-snug">{user?.name || 'User'}</p>
                <p className="text-[10px] text-emerald-400/85 font-medium truncate leading-tight uppercase">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-lg border border-transparent hover:border-slate-700 transition-colors">
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
