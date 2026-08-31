import { Bell, AlertOctagon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TopBar() {
  return (
    <header className="h-[52px] bg-white border-b border-gray-200 flex items-center justify-between px-5 flex-shrink-0 z-10">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-[#0F2240]">
          TODAY • 27 AUG 2026
        </span>
        <span className="text-gray-300 hidden sm:block">|</span>
        <span className="text-xs text-gray-500 hidden sm:block">Nagpur Division • NGP-BSL Corridor</span>
      </div>
      <div className="flex items-center gap-3">
        <Link
          to="/events"
          className="flex items-center gap-1.5 bg-red-600 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-full hover:bg-red-700 transition-colors"
        >
          <AlertOctagon className="w-3 h-3" />
          3 ACTIVE ALERTS
        </Link>
        <button className="relative p-1.5 hover:bg-gray-100 rounded transition-colors" title="Notifications">
          <Bell className="w-4 h-4 text-gray-500" />
          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
          <div className="w-7 h-7 rounded-full bg-[#0F2240] flex items-center justify-center text-[10px] font-bold text-white">
            RS
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-gray-800">R. Sharma</p>
            <p className="text-[10px] text-gray-500">Section Controller</p>
          </div>
        </div>
      </div>
    </header>
  );
}
