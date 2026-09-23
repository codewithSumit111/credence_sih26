import React, { useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export const REGIONS = [
  'Central Railway',
  'Western Railway',
  'Northern Railway',
  'Eastern Railway',
  'Southern Railway',
  'South Central Railway',
  'South Western Railway'
];

interface RegionSelectorProps {
  selectedRegion: string;
  onRegionChange: (region: string) => void;
  selectedDate?: string;
  onDateChange?: (date: string) => void;
}

export default function RegionSelector({ selectedRegion, onRegionChange, selectedDate, onDateChange }: RegionSelectorProps) {
  useEffect(() => {
    const saved = localStorage.getItem('irctc_selected_region');
    if (saved && REGIONS.includes(saved) && saved !== selectedRegion) {
      onRegionChange(saved);
    } else if (!saved) {
      localStorage.setItem('irctc_selected_region', selectedRegion);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    localStorage.setItem('irctc_selected_region', val);
    onRegionChange(val);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm flex items-center gap-6 flex-wrap">
      <div>
        <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Region</h2>
        <div className="relative inline-block w-64">
          <select
            value={selectedRegion}
            onChange={handleChange}
            className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded px-3 py-2 outline-none focus:border-irctc-blue focus:ring-1 focus:ring-irctc-blue cursor-pointer"
          >
            {REGIONS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
      </div>
      
      {onDateChange && (
        <div>
          <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Date</h2>
          <div className="relative inline-block">
            <input
              type="date"
              value={selectedDate || ''}
              onChange={(e) => onDateChange(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded px-3 py-2 outline-none focus:border-irctc-blue focus:ring-1 focus:ring-irctc-blue cursor-pointer"
            />
          </div>
        </div>
      )}

      <div className="text-[11px] text-gray-400 font-medium flex-1 text-right">
        Block Planning constraints and data will be scoped to the selected region{onDateChange && ' and date'}.
      </div>
    </div>
  );
}
