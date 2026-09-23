import React from 'react';
import { clsx } from 'clsx';

export interface FilterState {
  railwayNetwork: boolean;
  stations: boolean;
  proposedBlocks: boolean;
  finalizedBlocks: boolean;
  activeBlocks: boolean;
  completedBlocks: boolean;
}

interface MapFiltersProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

export default function MapFilters({ filters, setFilters }: MapFiltersProps) {
  const toggleFilter = (key: keyof FilterState) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="absolute top-4 right-4 z-[400] bg-white/95 backdrop-blur-sm border border-irctc-border rounded-lg shadow-irctc-sm p-3 w-48 text-[12px] font-medium text-irctc-navy">
      <h4 className="font-bold mb-2 uppercase tracking-wide text-[10px] text-irctc-muted">Map Layers</h4>
      <div className="space-y-1.5">
        <label className="flex items-center gap-2 cursor-pointer hover:text-irctc-blue transition-colors">
          <input type="checkbox" checked={filters.railwayNetwork} onChange={() => toggleFilter('railwayNetwork')} className="rounded border-gray-300 text-irctc-blue focus:ring-irctc-blue" />
          Railway Network
        </label>
        <label className="flex items-center gap-2 cursor-pointer hover:text-irctc-blue transition-colors">
          <input type="checkbox" checked={filters.stations} onChange={() => toggleFilter('stations')} className="rounded border-gray-300 text-irctc-blue focus:ring-irctc-blue" />
          Stations
        </label>
      </div>

      <h4 className="font-bold mt-3 mb-2 uppercase tracking-wide text-[10px] text-irctc-muted">Block Status</h4>
      <div className="space-y-1.5">
        <label className="flex items-center gap-2 cursor-pointer hover:text-irctc-blue transition-colors">
          <input type="checkbox" checked={filters.proposedBlocks} onChange={() => toggleFilter('proposedBlocks')} className="rounded border-gray-300 text-amber-500 focus:ring-amber-500" />
          Proposed
        </label>
        <label className="flex items-center gap-2 cursor-pointer hover:text-irctc-blue transition-colors">
          <input type="checkbox" checked={filters.finalizedBlocks} onChange={() => toggleFilter('finalizedBlocks')} className="rounded border-gray-300 text-irctc-orange focus:ring-irctc-orange" />
          Finalized
        </label>
        <label className="flex items-center gap-2 cursor-pointer hover:text-irctc-blue transition-colors">
          <input type="checkbox" checked={filters.activeBlocks} onChange={() => toggleFilter('activeBlocks')} className="rounded border-gray-300 text-irctc-blue focus:ring-irctc-blue" />
          Active
        </label>
        <label className="flex items-center gap-2 cursor-pointer hover:text-irctc-blue transition-colors">
          <input type="checkbox" checked={filters.completedBlocks} onChange={() => toggleFilter('completedBlocks')} className="rounded border-gray-300 text-green-600 focus:ring-green-600" />
          Completed
        </label>
      </div>
    </div>
  );
}
