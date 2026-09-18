import { clsx } from 'clsx';
import { useMemo } from 'react';

interface Station {
  id: string;
  label1: string;
  label2: string;
  x: number;
  y: number;
}

interface Track {
  id: string;
  from: string;
  to: string;
  controlX?: number;
  controlY?: number;
}

// Coordinate system mapped to SVG viewBox="0 0 800 300"
const STATIONS: Station[] = [
  { id: 'ST-A', label1: 'ST-A', label2: 'Nagpur', x: 100, y: 150 },
  { id: 'ST-B', label1: 'ST-B', label2: 'Wardha', x: 350, y: 150 },
  { id: 'ST-C', label1: 'ST-C', label2: 'Badnera', x: 700, y: 150 },
  { id: 'ST-D', label1: 'ST-D', label2: 'Akola', x: 525, y: 250 },
];

const TRACKS: Track[] = [
  { id: 'TR-01', from: 'ST-A', to: 'ST-B' },
  { id: 'TR-02', from: 'ST-B', to: 'ST-C' },
  { id: 'TR-04', from: 'ST-A', to: 'ST-D', controlX: 250, controlY: 230 },
  { id: 'TR-05', from: 'ST-D', to: 'ST-C' },
  { id: 'TR-07', from: 'ST-D', to: 'ST-C', controlX: 610, controlY: 200 },
];

export interface TrainPosition {
  trainNumber: string;
  trackId: string;
  position: number; // 0-1 percentage along the track
  status?: 'ON_TIME' | 'DELAYED' | 'REROUTED' | 'STOPPED' | 'CANCELLED';
}

interface DynamicNetworkMapProps {
  blockedTracks?: string[]; // Array of blocked track IDs
  trainPositions?: TrainPosition[];
  proposedRoutes?: string[]; // Array of track IDs in proposed alternative route
  originalRoutes?: string[]; // Array of track IDs in original route
  onTrainClick?: (trainNumber: string) => void;
  onBlockClick?: (trackId: string) => void;
  onTrackClick?: (trackId: string) => void;
  className?: string;
  compact?: boolean;
}

function getStation(id: string) {
  return STATIONS.find(s => s.id === id);
}

export default function DynamicNetworkMap({
  blockedTracks = [],
  trainPositions = [],
  proposedRoutes = [],
  originalRoutes = [],
  onTrainClick,
  onBlockClick,
  onTrackClick,
  className,
  compact = false,
}: DynamicNetworkMapProps) {
  
  function getTrackStyle(trackId: string) {
    if (blockedTracks.includes(trackId)) {
      return { color: '#dc2626', dash: '6,4', width: 4 }; // Red blocked
    }
    if (proposedRoutes.includes(trackId)) {
      return { color: '#2563eb', dash: '8,4', width: 4 }; // Blue alternate
    }
    if (originalRoutes.includes(trackId)) {
      return { color: '#1e3a5f', dash: 'none', width: 4 }; // Dark original
    }
    return { color: '#9ca3af', dash: 'none', width: 2 }; // Gray standard
  }

  function getTrainColor(status?: string) {
    switch (status) {
      case 'DELAYED': return '#ef4444'; // Red
      case 'REROUTED': return '#3b82f6'; // Blue
      case 'STOPPED': return '#f59e0b'; // Amber
      case 'ON_TIME':
      default: return '#10b981'; // Emerald
    }
  }

  return (
    <div className={clsx('bg-white border border-gray-200 rounded overflow-hidden shadow-sm relative', className)}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Live Operational Network</h3>
        <div className="flex items-center gap-1.5 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold text-green-700 uppercase">Live</span>
        </div>
      </div>

      <svg
        viewBox="0 0 800 300"
        width="100%"
        height={compact ? 220 : 300}
        className="block"
      >
        {/* Background Grid for better operational feel */}
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
        </pattern>
        <rect width="800" height="300" fill="url(#grid)" />

        {/* Tracks */}
        {TRACKS.map(track => {
          const fromSt = getStation(track.from);
          const toSt = getStation(track.to);
          if (!fromSt || !toSt) return null;
          const { color, dash, width } = getTrackStyle(track.id);
          const midX = (fromSt.x + toSt.x) / 2;
          const midY = (fromSt.y + toSt.y) / 2 - 10;

          // Quadratic bezier if control points exist
          const pathD = track.controlX
            ? `M ${fromSt.x} ${fromSt.y} Q ${track.controlX} ${track.controlY ?? midY} ${toSt.x} ${toSt.y}`
            : `M ${fromSt.x} ${fromSt.y} L ${toSt.x} ${toSt.y}`;

          const isBlocked = blockedTracks.includes(track.id);

          return (
            <g key={track.id} className={onTrackClick || (isBlocked && onBlockClick) ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}>
              {/* Invisible wider path for easier clicking */}
              <path
                d={pathD}
                stroke="transparent"
                strokeWidth={20}
                fill="none"
                onClick={() => {
                  if (isBlocked && onBlockClick) onBlockClick(track.id);
                  else if (onTrackClick) onTrackClick(track.id);
                }}
              />
              <path
                d={pathD}
                stroke={color}
                strokeWidth={width}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={dash === 'none' ? undefined : dash}
                style={{ pointerEvents: 'none' }}
              />
              {/* Track ID label */}
              <text
                x={midX}
                y={midY - 5}
                textAnchor="middle"
                fontSize="11"
                fill={isBlocked ? '#dc2626' : (proposedRoutes.includes(track.id) ? '#2563eb' : '#6b7280')}
                fontWeight="700"
                fontFamily="Inter, sans-serif"
                className="select-none"
              >
                {track.id}
              </text>

              {/* Blocked Indicator Box */}
              {isBlocked && (
                <g 
                  transform={`translate(${midX - 35}, ${midY + 5})`}
                  onClick={() => onBlockClick?.(track.id)}
                  className={onBlockClick ? 'cursor-pointer hover:opacity-80' : ''}
                >
                  <rect x={0} y={0} width={70} height={18} fill="#fef2f2" stroke="#dc2626" strokeWidth="1" rx="4" />
                  <text x={35} y={13} textAnchor="middle" fontSize="9" fill="#dc2626" fontWeight="700" fontFamily="Inter, sans-serif">
                    ✕ BLOCKED
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Stations */}
        {STATIONS.map(station => (
          <g key={station.id}>
            <circle cx={station.x} cy={station.y} r={14} fill="#1B6B45" stroke="white" strokeWidth={3} />
            <text x={station.x} y={station.y + 6} textAnchor="middle" fontSize="9" fill="white" fontWeight="800" fontFamily="Inter, sans-serif" className="select-none">
              {station.label1.split('-')[1]}
            </text>
            <text x={station.x} y={station.y + 32} textAnchor="middle" fontSize="12" fill="#1f2937" fontWeight="700" fontFamily="Inter, sans-serif" className="select-none">
              {station.label1}
            </text>
            <text x={station.x} y={station.y + 46} textAnchor="middle" fontSize="11" fill="#6b7280" fontFamily="Inter, sans-serif" className="select-none">
              {station.label2}
            </text>
          </g>
        ))}

        {/* Live Train Positions */}
        {trainPositions.map(tp => {
          const track = TRACKS.find(t => t.id === tp.trackId);
          if (!track) return null;
          const fromSt = getStation(track.from);
          const toSt = getStation(track.to);
          if (!fromSt || !toSt) return null;
          
          let x, y;
          if (track.controlX) {
            // Quadratic bezier calculation for curves
            const t = tp.position;
            const cy = track.controlY ?? ((fromSt.y + toSt.y) / 2 - 10);
            x = Math.pow(1-t, 2)*fromSt.x + 2*(1-t)*t*track.controlX + Math.pow(t, 2)*toSt.x;
            y = Math.pow(1-t, 2)*fromSt.y + 2*(1-t)*t*cy + Math.pow(t, 2)*toSt.y;
          } else {
            // Linear interpolation
            x = fromSt.x + (toSt.x - fromSt.x) * tp.position;
            y = fromSt.y + (toSt.y - fromSt.y) * tp.position;
          }

          const trainColor = getTrainColor(tp.status);

          return (
            <g 
              key={tp.trainNumber} 
              className={onTrainClick ? 'cursor-pointer hover:opacity-80 transition-opacity drop-shadow-md' : ''}
              onClick={() => onTrainClick?.(tp.trainNumber)}
            >
              {/* Pulse effect if delayed or rerouted */}
              {(tp.status === 'DELAYED' || tp.status === 'REROUTED') && (
                <circle cx={x} cy={y} r={16} fill={trainColor} fillOpacity={0.2} className="animate-ping" style={{ animationDuration: '2s' }} />
              )}
              
              <circle cx={x} cy={y} r={10} fill={trainColor} stroke="white" strokeWidth={2} />
              
              {/* Train Icon (Triangle pointing right for direction, simplified) */}
              <path d={`M ${x-3} ${y-4} L ${x+4} ${y} L ${x-3} ${y+4} Z`} fill="white" />
              
              <rect x={x - 22} y={y - 28} width={44} height={16} fill={trainColor} rx={3} />
              <text x={x} y={y - 17} textAnchor="middle" fontSize="10" fill="white" fontWeight="800" fontFamily="Inter, sans-serif" className="select-none">
                {tp.trainNumber}
              </text>
            </g>
          );
        })}

        {/* Legend */}
        <g transform="translate(16, 220)">
          <rect x={0} y={0} width={130} height={70} fill="white" fillOpacity={0.9} stroke="#e5e7eb" rx="4" />
          
          <circle cx={15} cy={15} r={4} fill="#10b981" />
          <text x={26} y={18} fontSize="10" fill="#4b5563" fontFamily="Inter, sans-serif">On Time</text>
          
          <circle cx={15} cy={30} r={4} fill="#ef4444" />
          <text x={26} y={33} fontSize="10" fill="#4b5563" fontFamily="Inter, sans-serif">Delayed</text>

          <circle cx={15} cy={45} r={4} fill="#3b82f6" />
          <text x={26} y={48} fontSize="10" fill="#4b5563" fontFamily="Inter, sans-serif">Rerouted</text>

          <line x1={80} y1={15} x2={100} y2={15} stroke="#1e3a5f" strokeWidth={3} />
          <text x={105} y={18} fontSize="10" fill="#4b5563" fontFamily="Inter, sans-serif">Route</text>

          <line x1={80} y1={30} x2={100} y2={30} stroke="#2563eb" strokeWidth={3} strokeDasharray="4,2" />
          <text x={105} y={33} fontSize="10" fill="#4b5563" fontFamily="Inter, sans-serif">Alternate</text>

          <line x1={80} y1={45} x2={100} y2={45} stroke="#dc2626" strokeWidth={3} strokeDasharray="4,2" />
          <text x={105} y={48} fontSize="10" fill="#4b5563" fontFamily="Inter, sans-serif">Blocked</text>
        </g>
      </svg>
    </div>
  );
}
