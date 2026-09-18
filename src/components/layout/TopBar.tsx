import { useState, useEffect } from 'react';
import { Bell, AlertOctagon, CheckSquare, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TopBar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="h-[52px] bg-white border-b border-gray-200 flex items-center justify-between px-5 flex-shrink-0 z-10">
      {/* Left: date + corridor */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-[#1B6B45] tracking-wider uppercase">
          TODAY • 27 AUG 2026
        </span>
        <span className="text-gray-300 hidden sm:block">|</span>
        <span className="text-xs font-medium text-gray-500 hidden sm:block">
          Nagpur Division • NGP-BSL Corridor
        </span>
      </div>

      {/* Right: alerts + bell + user profile */}
      <div className="flex items-center gap-3">
        {/* Active Alerts Pill */}
        <Link
          to="/events"
          className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs transition-colors ml-2"
        >
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>3 ACTIVE ALERTS</span>
        </Link>

        {/* Bell */}
        <Link 
          to="/events"
          className="relative p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-600" 
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full" />
        </Link>

        {/* User */}
        <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
          <div className="w-7 h-7 rounded-full bg-[#1B6B45] flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
            RS
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="text-xs font-bold text-gray-900">R. Sharma</p>
            <p className="text-[10px] text-gray-500 font-medium">Section Controller</p>
          </div>
        </div>
      </div>
    </header>
  );
}
