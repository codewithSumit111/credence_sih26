import { useState, useEffect } from 'react';
import { Bell, Shield, CalendarClock, Train, Radio, Wrench, BarChart3, FileText, LayoutDashboard } from 'lucide-react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';

const navLinks = [
  { path: '/command', label: 'Home', icon: LayoutDashboard },
  { path: '/plan', label: 'Blocks & Plan', icon: CalendarClock },
  { path: '/trains', label: 'Trains', icon: Train },
  { path: '/live', label: 'Live', icon: Radio },
  { path: '/assets', label: 'Assets', icon: Shield },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/field', label: 'Field', icon: Wrench },
];

export default function TopBar() {
  const [time, setTime] = useState(new Date());
  const location = useLocation();

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeFormatted = time.toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
  const dateFormatted = time.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  const isActive = (path: string) => {
    if (path === '/command') return location.pathname === '/command';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="h-[64px] bg-[#0A3D80] text-white flex items-center justify-between px-6 flex-shrink-0 z-20 shadow-md">
      {/* Left: Branding */}
      <div className="flex items-center gap-2 h-full">
        <Link to="/" className="flex items-center gap-2 no-underline group h-full">
          {/* Logo Placeholder */}
          <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center p-1 border-2 border-white/20 group-hover:border-white/50 transition-colors overflow-hidden">
             <div className="w-full h-full bg-[#0A3D80] rounded-full flex items-center justify-center text-[9px] font-bold">IR</div>
          </div>
          <div className="hidden lg:block leading-tight">
             <h1 className="text-[13px] font-bold text-white tracking-wide uppercase">Indian Railways</h1>
             <p className="text-[9px] text-blue-200">AI-Powered Automatic Block Planning</p>
          </div>
        </Link>
        <div className="hidden xl:block h-8 w-px bg-blue-700/50 mx-2"></div>
        <div className="hidden xl:block text-[10px] text-blue-200 leading-tight">
          Maximizing Asset Availability<br />for Train Operations
        </div>
      </div>

      {/* Center: Navigation */}
      <nav className="hidden md:flex items-center h-full gap-0.5 flex-1 justify-center px-2">
        {navLinks.map((item) => {
          const active = isActive(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={clsx(
                'flex items-center gap-1.5 px-2 py-2 rounded-lg text-[12px] font-medium transition-all duration-200 whitespace-nowrap',
                active 
                  ? 'bg-blue-600/60 text-white shadow-inner border border-blue-500/50' 
                  : 'text-blue-100 hover:bg-blue-700/40 hover:text-white'
              )}
            >
              <item.icon className={clsx('w-3.5 h-3.5', active ? 'text-white' : 'text-blue-200')} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Right: Tools & Profile */}
      <div className="flex items-center gap-3 h-full">
        {/* Alerts Bell */}
        <Link 
          to="/live"
          className="relative p-2 hover:bg-blue-700/50 rounded-full transition-colors text-blue-100" 
          title="Alerts"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-[#0A3D80]" />
        </Link>

        {/* Date / Time */}
        <div className="hidden sm:flex flex-col items-end leading-tight text-right text-blue-100 border-l border-blue-700/50 pl-3 whitespace-nowrap">
           <span className="text-[12px] font-semibold text-white">{dateFormatted}</span>
           <span className="text-[10px] font-medium">{timeFormatted}</span>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-2 border-l border-blue-700/50 pl-3 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 rounded-full bg-white text-[#0A3D80] flex items-center justify-center text-[13px] font-bold shadow-md">
            RS
          </div>
          <ChevronDown className="w-4 h-4 text-blue-200 hidden sm:block" />
        </div>
      </div>
    </header>
  );
}

function ChevronDown(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
  );
}
