import { clsx } from 'clsx';

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

const STATIONS: Station[] = [
  { id: 'ST-A', label1: 'ST-A', label2: 'Nagpur', x: 80, y: 90 },
  { id: 'ST-B', label1: 'ST-B', label2: 'Wardha', x: 280, y: 90 },
  { id: 'ST-C', label1: 'ST-C', label2: 'Badnera', x: 480, y: 90 },
  { id: 'ST-D', label1: 'ST-D', label2: 'Akola', x: 380, y: 200 },
];

const TRACKS: Track[] = [
  { id: 'TR-01', from: 'ST-A', to: 'ST-B' },
  { id: 'TR-02', from: 'ST-B', to: 'ST-C' },
  { id: 'TR-04', from: 'ST-A', to: 'ST-D', controlX: 200, controlY: 180 },
  { id: 'TR-05', from: 'ST-D', to: 'ST-C' },
  { id: 'TR-07', from: 'ST-D', to: 'ST-C', controlX: 440, controlY: 160 },
];

interface TrainPosition {
  trainNumber: string;
  trackId: string;
  position: number; // 0-1
}

interface Props {
  blockedTrack?: string;
  proposedRoute?: string[];
  originalRoute?: string[];
  trainPositions?: TrainPosition[];
  onTrackClick?: (trackId: string) => void;
  className?: string;
  compact?: boolean;
}

function getStation(id: string) {
  return STATIONS.find(s => s.id === id);
}

export default function RailwayNetwork({
  blockedTrack,
  proposedRoute = [],
  originalRoute = [],
  trainPositions = [],
  onTrackClick,
  className,
  compact = false,
}: Props) {
  function getTrackColor(trackId: string): string {
    if (trackId === blockedTrack) return '#dc2626';
    if (proposedRoute.includes(trackId)) return '#2563eb';
    if (originalRoute.includes(trackId)) return '#1e3a5f';
    return '#9ca3af';
  }

  function getStrokeDash(trackId: string): string {
    if (trackId === blockedTrack) return '6,4';
    if (proposedRoute.includes(trackId)) return '8,4';
    return 'none';
  }

  function getStrokeWidth(trackId: string): number {
    if (trackId === blockedTrack) return 3;
    if (proposedRoute.includes(trackId)) return 3;
    if (originalRoute.includes(trackId)) return 3;
    return 2;
  }

  return (
    <div className={clsx('bg-white border border-gray-200 rounded overflow-hidden', className)}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">LIVE CORRIDOR</h3>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-semibold text-green-700">LIVE</span>
        </div>
      </div>

      <svg
        viewBox="0 0 580 260"
        width="100%"
        height={compact ? 200 : 250}
        className="block"
      >
        {/* Track lines */}
        {TRACKS.map(track => {
          const fromSt = getStation(track.from);
          const toSt = getStation(track.to);
          if (!fromSt || !toSt) return null;
          const color = getTrackColor(track.id);
          const dash = getStrokeDash(track.id);
          const sw = getStrokeWidth(track.id);
          const midX = (fromSt.x + toSt.x) / 2;
          const midY = (fromSt.y + toSt.y) / 2 - 8;

          // Use quadratic bezier for tracks that have control points
          const pathD = track.controlX
            ? `M ${fromSt.x} ${fromSt.y} Q ${track.controlX} ${track.controlY ?? midY} ${toSt.x} ${toSt.y}`
            : `M ${fromSt.x} ${fromSt.y} L ${toSt.x} ${toSt.y}`;

          return (
            <g key={track.id}>
              <path
                d={pathD}
                stroke={color}
                strokeWidth={sw}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={dash === 'none' ? undefined : dash}
                onClick={() => onTrackClick?.(track.id)}
                className={onTrackClick ? 'cursor-pointer hover:opacity-70' : ''}
              />
              {/* Track ID label */}
              <text
                x={midX}
                y={midY - 4}
                textAnchor="middle"
                fontSize="9"
                fill={color}
                fontWeight="700"
                fontFamily="Inter, sans-serif"
                className="select-none"
              >
                {track.id}
              </text>
              {/* Status label */}
              {track.id === blockedTrack && (
                <text
                  x={midX}
                  y={midY + 14}
                  textAnchor="middle"
                  fontSize="8"
                  fill="#dc2626"
                  fontWeight="700"
                  fontFamily="Inter, sans-serif"
                  className="select-none"
                >
                  ✕ BLOCKED
                </text>
              )}
              {proposedRoute.includes(track.id) && (
                <text
                  x={midX}
                  y={midY + 14}
                  textAnchor="middle"
                  fontSize="8"
                  fill="#2563eb"
                  fontWeight="600"
                  fontFamily="Inter, sans-serif"
                  className="select-none"
                >
                  ↝ ALTERNATE
                </text>
              )}
            </g>
          );
        })}

        {/* Station nodes */}
        {STATIONS.map(station => (
          <g key={station.id}>
            <circle
              cx={station.x}
              cy={station.y}
              r={11}
              fill="#0F2240"
              stroke="white"
              strokeWidth={2}
            />
            <text
              x={station.x}
              y={station.y + 5}
              textAnchor="middle"
              fontSize="7"
              fill="white"
              fontWeight="700"
              fontFamily="Inter, sans-serif"
              className="select-none"
            >
              {station.label1.split('-')[1]}
            </text>
            <text
              x={station.x}
              y={station.y + 24}
              textAnchor="middle"
              fontSize="10"
              fill="#1f2937"
              fontWeight="600"
              fontFamily="Inter, sans-serif"
              className="select-none"
            >
              {station.label1}
            </text>
            <text
              x={station.x}
              y={station.y + 36}
              textAnchor="middle"
              fontSize="9"
              fill="#6b7280"
              fontFamily="Inter, sans-serif"
              className="select-none"
            >
              {station.label2}
            </text>
          </g>
        ))}

        {/* Train position dots */}
        {trainPositions.map(tp => {
          const track = TRACKS.find(t => t.id === tp.trackId);
          if (!track) return null;
          const fromSt = getStation(track.from);
          const toSt = getStation(track.to);
          if (!fromSt || !toSt) return null;
          const x = fromSt.x + (toSt.x - fromSt.x) * tp.position;
          const y = fromSt.y + (toSt.y - fromSt.y) * tp.position;
          return (
            <g key={tp.trainNumber}>
              <circle cx={x} cy={y} r={7} fill="#f59e0b" stroke="white" strokeWidth={2} />
              <circle cx={x} cy={y} r={11} fill="#f59e0b" fillOpacity={0.2} className="animate-ping" style={{ animationDuration: '2s' }} />
              <text
                x={x}
                y={y - 14}
                textAnchor="middle"
                fontSize="9"
                fill="#d97706"
                fontWeight="700"
                fontFamily="Inter, sans-serif"
                className="select-none"
              >
                {tp.trainNumber}
              </text>
            </g>
          );
        })}

        {/* Legend */}
        <g transform="translate(10, 230)">
          <rect x={0} y={-6} width={80} height={8} fill="#1e3a5f" rx={1} />
          <text x={86} y={2} fontSize="9" fill="#6b7280" fontFamily="Inter, sans-serif">Original Route</text>

          <line x1={0} y1={14} x2={80} y2={14} stroke="#2563eb" strokeWidth={2} strokeDasharray="8,4" />
          <text x={86} y={18} fontSize="9" fill="#2563eb" fontFamily="Inter, sans-serif">Alternate Route</text>

          <line x1={0} y1={32} x2={80} y2={32} stroke="#dc2626" strokeWidth={2} strokeDasharray="6,4" />
          <text x={86} y={36} fontSize="9" fill="#dc2626" fontFamily="Inter, sans-serif">Blocked</text>
        </g>
      </svg>
    </div>
  );
}
