import React from 'react';

export default function MapLegend() {
  return (
    <div className="absolute bottom-6 right-4 z-[400] bg-white/95 backdrop-blur-sm border border-irctc-border rounded-lg shadow-irctc-sm p-3 w-44 text-[11px] font-medium text-irctc-navy pointer-events-none">
      <h4 className="font-bold mb-2 uppercase tracking-wide text-[10px] text-irctc-muted">Legend</h4>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-gray-500"></div>
          <span>Railway Network</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-white border-[2px] border-blue-600 ml-1"></div>
          <span className="ml-1">Station</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 border-b-[3px] border-dashed border-amber-500"></div>
          <span>Proposed Block</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-[4px] bg-irctc-orange"></div>
          <span>Finalized Block</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-[4px] bg-irctc-blue animate-pulse"></div>
          <span>Active Block</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-[4px] bg-green-500 opacity-60"></div>
          <span>Completed</span>
        </div>
      </div>
    </div>
  );
}
