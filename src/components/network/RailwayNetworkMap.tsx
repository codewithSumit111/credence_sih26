import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { OptimizedBlock } from '../../types';
import { RAILWAY_STATIONS, getSectionCoordinates } from './mapUtils';
import MapFilters, { FilterState } from './MapFilters';
import MapSearch from './MapSearch';
import MapLegend from './MapLegend';
import BlockDetailsPanel from './BlockDetailsPanel';
import { Maximize, X } from 'lucide-react';
import { clsx } from 'clsx';

// Fix for leaflet default icons if needed (not heavily used since we use CircleMarker, but good practice)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface RailwayNetworkMapProps {
  blocks: OptimizedBlock[];
  onApproveBlock?: (blockId: string) => void;
  className?: string;
  isExpandedView?: boolean;
}

// Component to handle map center/bounds updates
function MapController({ selectedBlock, searchBounds }: { selectedBlock: OptimizedBlock | null, searchBounds: L.LatLngBoundsExpression | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedBlock) {
      const coords = getSectionCoordinates(selectedBlock.section);
      if (coords) {
        const bounds = L.latLngBounds([coords.start, coords.end]);
        map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
      }
    } else if (searchBounds) {
      map.flyToBounds(searchBounds, { padding: [50, 50], duration: 1.5 });
    }
  }, [selectedBlock, searchBounds, map]);

  return null;
}

export default function RailwayNetworkMap({ blocks, onApproveBlock, className, isExpandedView = false }: RailwayNetworkMapProps) {
  const [selectedBlock, setSelectedBlock] = useState<OptimizedBlock | null>(null);
  const [searchBounds, setSearchBounds] = useState<L.LatLngBoundsExpression | null>(null);
  const [isExpanded, setIsExpanded] = useState(isExpandedView);
  
  const [filters, setFilters] = useState<FilterState>({
    railwayNetwork: true,
    stations: true,
    proposedBlocks: true,
    finalizedBlocks: true,
    activeBlocks: true,
    completedBlocks: false,
  });

  const getLineColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return '#ea580c'; // irctc-orange
      case 'AI-OPTIMIZED':
      case 'PROPOSED': return '#f59e0b'; // amber-500
      case 'ACTIVE': return '#2563eb'; // irctc-blue
      case 'COMPLETED': return '#22c55e'; // green-500
      default: return '#9ca3af'; // gray-400
    }
  };

  const getLineStyle = (status: string): L.PathOptions => {
    const color = getLineColor(status);
    if (status === 'PROPOSED' || status === 'AI-OPTIMIZED') {
      return { color, dashArray: '8, 6', weight: 4 };
    }
    return { color, weight: 5 };
  };

  const handleSearch = (query: string) => {
    const q = query.toLowerCase();
    
    // Search blocks
    const block = blocks.find(b => b.id.toLowerCase().includes(q));
    if (block) {
      setSelectedBlock(block);
      return;
    }

    // Search stations
    const station = Object.values(RAILWAY_STATIONS).find(s => 
      s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
    );
    if (station) {
      setSearchBounds(L.latLngBounds([[station.lat - 0.1, station.lng - 0.1], [station.lat + 0.1, station.lng + 0.1]]));
      return;
    }

    // Search corridors (e.g. "NGP-BSL")
    if (q.includes('-')) {
      const coords = getSectionCoordinates(query.toUpperCase());
      if (coords) {
        setSearchBounds(L.latLngBounds([coords.start, coords.end]));
      }
    }
  };

  const filteredBlocks = blocks.filter(b => {
    if (b.status === 'APPROVED' && !filters.finalizedBlocks) return false;
    if ((b.status === 'PROPOSED' || b.status === 'AI-OPTIMIZED') && !filters.proposedBlocks) return false;
    if (b.status === 'ACTIVE' && !filters.activeBlocks) return false;
    if (b.status === 'COMPLETED' && !filters.completedBlocks) return false;
    return true;
  });

  const mapContent = (
    <div className={clsx("relative rounded-xl overflow-hidden border border-irctc-border w-full", className)} style={{ height: isExpanded ? '100%' : '500px' }}>
      
      {/* Map Header */}
      <div className="absolute top-0 left-0 right-0 h-14 bg-white/90 backdrop-blur-md z-[400] border-b border-gray-200 flex items-center justify-between px-4 pointer-events-auto">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-irctc-navy uppercase tracking-wider text-[13px]">Railway Network Command Map</h3>
          <div className="flex items-center gap-1.5 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-green-700 uppercase">Live</span>
          </div>
        </div>
        {!isExpandedView && (
          <button 
            onClick={() => setIsExpanded(true)}
            className="text-gray-500 hover:text-irctc-blue transition-colors p-1.5 hover:bg-gray-100 rounded"
            title="Expand Map"
          >
            <Maximize className="w-4 h-4" />
          </button>
        )}
      </div>

      <MapSearch onSearch={handleSearch} />
      <MapFilters filters={filters} setFilters={setFilters} />
      <MapLegend />

      {selectedBlock && (
        <BlockDetailsPanel 
          block={selectedBlock} 
          onClose={() => setSelectedBlock(null)} 
          onApprove={onApproveBlock} 
        />
      )}

      {/* Initialize bounds to show Maharashtra region */}
      <MapContainer 
        bounds={[[18.0, 73.0], [21.5, 80.0]]} 
        zoomControl={true}
        className="w-full h-full z-0"
        style={{ background: '#f8fafc' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
        />
        
        <MapController selectedBlock={selectedBlock} searchBounds={searchBounds} />

        {/* Base Railway Network (Connecting all stations with simple lines for context) */}
        {filters.railwayNetwork && (
          <Polyline 
            positions={[
              [RAILWAY_STATIONS['PUNE'].lat, RAILWAY_STATIONS['PUNE'].lng],
              [RAILWAY_STATIONS['LNL'].lat, RAILWAY_STATIONS['LNL'].lng],
              [RAILWAY_STATIONS['MMR'].lat, RAILWAY_STATIONS['MMR'].lng],
              [RAILWAY_STATIONS['BSL'].lat, RAILWAY_STATIONS['BSL'].lng],
              [RAILWAY_STATIONS['AK'].lat, RAILWAY_STATIONS['AK'].lng],
              [RAILWAY_STATIONS['BD'].lat, RAILWAY_STATIONS['BD'].lng],
              [RAILWAY_STATIONS['WR'].lat, RAILWAY_STATIONS['WR'].lng],
              [RAILWAY_STATIONS['NGP'].lat, RAILWAY_STATIONS['NGP'].lng]
            ]} 
            pathOptions={{ color: '#9ca3af', weight: 2 }} 
          />
        )}

        {/* Stations */}
        {filters.stations && Object.values(RAILWAY_STATIONS).map(station => (
          <CircleMarker
            key={station.id}
            center={[station.lat, station.lng]}
            radius={6}
            pathOptions={{ color: '#2563eb', fillColor: '#fff', fillOpacity: 1, weight: 3 }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1} className="font-bold text-[12px]">
              {station.name} ({station.code})
            </Tooltip>
          </CircleMarker>
        ))}

        {/* Blocks */}
        {filteredBlocks.map(block => {
          const coords = getSectionCoordinates(block.section);
          if (!coords) return null;

          // Offset slightly if multiple tracks are on the same section? 
          // For now, draw straight line between start and end. 
          // In a real app with GeoJSON, this would be a complex Path.
          
          return (
            <Polyline
              key={block.id}
              positions={[coords.start, coords.end]}
              pathOptions={getLineStyle(block.status)}
              eventHandlers={{
                click: () => {
                  setSelectedBlock(block);
                }
              }}
            >
              <Tooltip sticky className="font-bold text-[12px]">
                <div>
                  <div className="text-irctc-navy">{block.id}</div>
                  <div className="text-[10px] text-gray-500 font-normal">{block.startTime} - {block.endTime}</div>
                  <div className="text-[10px] text-gray-500 font-normal">{block.track}</div>
                </div>
              </Tooltip>
            </Polyline>
          );
        })}
      </MapContainer>
    </div>
  );

  if (isExpandedView) return mapContent;

  return (
    <>
      {mapContent}
      {/* Modal for expanded view */}
      {!isExpandedView && isExpanded && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="bg-white rounded-xl shadow-2xl w-full h-[90vh] flex flex-col relative">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Expanded View: Railway Network</h3>
                <div className="flex items-center gap-1.5 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-green-700 uppercase">Live</span>
                </div>
              </div>
              <button 
                onClick={() => setIsExpanded(false)}
                className="p-1.5 hover:bg-gray-200 rounded text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 relative">
              <RailwayNetworkMap blocks={blocks} onApproveBlock={onApproveBlock} isExpandedView={true} className="rounded-none border-0 h-full" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
