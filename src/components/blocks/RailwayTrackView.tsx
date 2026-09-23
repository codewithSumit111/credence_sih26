import React, { useState, useMemo, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { OptimizedBlock } from '../../types';
import { Maximize, ZoomIn, ZoomOut, Move } from 'lucide-react';

type Point = { x: number; y: number };

interface TrackSection {
  name: string;
  position: number; // 0 to 100
}

interface TrackDef {
  id: string;
  name: string;
  direction: string;
  sections: TrackSection[];
  points: Point[];
}

const REGION_TRACKS: Record<string, TrackDef[]> = {
  'Central Railway': [
    {
      id: 'TR-01',
      name: 'Line No. 1',
      direction: 'UP',
      sections: [
        { name: 'CSMT', position: 0 },
        { name: 'DR', position: 20 },
        { name: 'TNA', position: 50 },
        { name: 'KYN', position: 75 },
        { name: 'KJT', position: 100 }
      ],
      points: [{ x: 150, y: 150 }, { x: 850, y: 150 }]
    },
    {
      id: 'TR-02',
      name: 'Line No. 2',
      direction: 'DN',
      sections: [
        { name: 'CSMT', position: 0 },
        { name: 'DR', position: 20 },
        { name: 'TNA', position: 50 },
        { name: 'KYN', position: 75 },
        { name: 'KJT', position: 100 }
      ],
      points: [{ x: 150, y: 250 }, { x: 850, y: 250 }]
    }
  ],
  'Western Railway': [
    {
      id: 'TR-01',
      name: 'Local Line',
      direction: 'UP',
      sections: [
        { name: 'CCG', position: 0 },
        { name: 'DDR', position: 30 },
        { name: 'ADH', position: 60 },
        { name: 'BVI', position: 85 },
        { name: 'VR', position: 100 }
      ],
      points: [{ x: 150, y: 200 }, { x: 450, y: 200 }, { x: 650, y: 350 }, { x: 850, y: 350 }]
    }
  ]
};

const DEFAULT_TRACKS: TrackDef[] = [
  {
    id: 'TR-00',
    name: 'Main Line',
    direction: 'UP/DN',
    sections: [
      { name: 'STN-A', position: 0 },
      { name: 'STN-B', position: 33 },
      { name: 'STN-C', position: 66 },
      { name: 'STN-D', position: 100 }
    ],
    points: [{ x: 150, y: 200 }, { x: 850, y: 200 }]
  }
];

export interface BlockItem {
  id: string;
  track: string;
  section: string;
  timeWindow: string;
  startTime: string;
  endTime: string;
  duration: string;
  departments: string[];
  jobs: string;
  jobCount: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: string;
  affectedTrains: number;
  rawBlock: OptimizedBlock;
  type?: string; 
}

function getTrackSegments(points: Point[]) {
  let totalLength = 0;
  const segments = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i+1];
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.sqrt(dx*dx + dy*dy);
    segments.push({ p1, p2, len, startAt: totalLength });
    totalLength += len;
  }
  return { segments, totalLength };
}

function getPointAtPercentage(points: Point[], pct: number): Point {
  const { segments, totalLength } = getTrackSegments(points);
  const targetDist = (pct / 100) * totalLength;
  for (const seg of segments) {
    if (targetDist <= seg.startAt + seg.len || seg === segments[segments.length - 1]) {
      const remaining = targetDist - seg.startAt;
      const ratio = seg.len === 0 ? 0 : Math.max(0, Math.min(1, remaining / seg.len));
      return {
        x: seg.p1.x + (seg.p2.x - seg.p1.x) * ratio,
        y: seg.p1.y + (seg.p2.y - seg.p1.y) * ratio
      };
    }
  }
  return points[points.length - 1];
}

interface RailwayTrackViewProps {
  region: string;
  blocks: BlockItem[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function RailwayTrackView({ region, blocks, selectedId, onSelect }: RailwayTrackViewProps) {
  const [tracksState, setTracksState] = useState<Record<string, Point[]>>({});
  
  useEffect(() => {
    const defaultTracks = REGION_TRACKS[region] || DEFAULT_TRACKS;
    setTracksState(prev => {
      const newState = { ...prev };
      let changed = false;
      defaultTracks.forEach(t => {
        if (!newState[t.id]) {
          newState[t.id] = [...t.points];
          changed = true;
        }
      });
      return changed ? newState : prev;
    });
  }, [region]);

  const activeTracks = REGION_TRACKS[region] || DEFAULT_TRACKS;

  const displayBlocks = useMemo(() => {
    let list = [...blocks];
    const hasMulti = list.some(b => b.departments.length > 1);
    if (!hasMulti && list.length > 0) {
      const dummy: BlockItem = {
        ...list[0],
        id: 'BLK-MULTI-999',
        departments: ['ENGG', 'S&T', 'OHE'],
        type: 'ENGG-Renewal Rail Replacement',
        status: 'IMPOSED',
        rawBlock: {
          ...list[0].rawBlock,
          id: 'BLK-MULTI-999',
          departments: ['ENGG', 'S&T', 'OHE'] as any,
          status: 'IMPOSED' as any,
        }
      };
      list.push(dummy);
    }
    return list;
  }, [blocks]);

  // Viewport / SVG Pan Zoom
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 1000, h: 500 });
  const svgRef = useRef<SVGSVGElement>(null);

  const handleFit = () => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    activeTracks.forEach(t => {
      const pts = tracksState[t.id] || t.points;
      pts.forEach(p => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      });
    });
    if (minX !== Infinity) {
      const padX = 150;
      const padY = 150;
      setViewBox({ x: minX - padX, y: minY - padY, w: (maxX - minX) + padX*2, h: (maxY - minY) + padY*2 });
    }
  };

  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggingPoint, setDraggingPoint] = useState<{trackId: string, idx: number} | null>(null);
  const [draggingTrack, setDraggingTrack] = useState<string | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Determine if we clicked on an interactive SVG element (like a track or block)
    // If not, we pan the canvas.
    const target = e.target as SVGElement;
    if (target.classList.contains('draggable-track') || target.classList.contains('draggable-point') || target.classList.contains('block-hitbox')) {
      return;
    }
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  
  const handlePointerMove = (e: React.PointerEvent) => {
    updateTooltip(e);

    const svg = svgRef.current;
    if (!svg) return;

    if (isPanning) {
      const rect = svg.getBoundingClientRect();
      const scaleX = viewBox.w / rect.width;
      const scaleY = viewBox.h / rect.height;
      const dx = (e.clientX - panStart.x) * scaleX;
      const dy = (e.clientY - panStart.y) * scaleY;
      setViewBox(prev => ({ ...prev, x: prev.x - dx, y: prev.y - dy }));
      setPanStart({ x: e.clientX, y: e.clientY });
    } else if (draggingPoint) {
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(svg.getScreenCTM()!.inverse());
      
      setTracksState(prev => {
        const newPts = [...(prev[draggingPoint.trackId] || [])];
        newPts[draggingPoint.idx] = { x: svgP.x, y: svgP.y };
        return { ...prev, [draggingPoint.trackId]: newPts };
      });
    } else if (draggingTrack) {
      const rect = svg.getBoundingClientRect();
      const dx = (e.clientX - panStart.x) * (viewBox.w / rect.width);
      const dy = (e.clientY - panStart.y) * (viewBox.h / rect.height);
      
      setTracksState(prev => {
        const newPts = (prev[draggingTrack] || []).map(p => ({ x: p.x + dx, y: p.y + dy }));
        return { ...prev, [draggingTrack]: newPts };
      });
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };
  
  const handlePointerUp = (e: React.PointerEvent) => {
    setIsPanning(false);
    setDraggingPoint(null);
    setDraggingTrack(null);
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  const handlePointDown = (e: React.PointerEvent, trackId: string, idx: number) => {
    e.stopPropagation();
    setDraggingPoint({ trackId, idx });
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const handleTrackDown = (e: React.PointerEvent, trackId: string) => {
    e.stopPropagation();
    setDraggingTrack(trackId);
    setPanStart({ x: e.clientX, y: e.clientY });
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  // Tooltip
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [hoveredBlock, setHoveredBlock] = useState<BlockItem | null>(null);

  const updateTooltip = (e: React.PointerEvent) => {
    if (tooltipRef.current && hoveredBlock) {
      tooltipRef.current.style.left = `${e.clientX + 15}px`;
      tooltipRef.current.style.top = `${e.clientY + 15}px`;
    }
  };

  const getBlockMetrics = (block: BlockItem) => {
    let hash = 0;
    for (let i = 0; i < block.id.length; i++) hash = block.id.charCodeAt(i) + ((hash << 5) - hash);
    const startPct = Math.abs(hash) % 70;
    const lenPct = 10 + (Math.abs(hash) % 20);
    return { startPct, lenPct };
  };

  const getBlockBorder = (status: string) => {
    if (status === 'ACTIVE') return { stroke: '#ef4444', dash: 'none', classes: 'animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]' };
    if (status === 'IMPOSED' || status === 'APPROVED') return { stroke: '#111827', dash: 'none', classes: '' };
    if (status === 'COMPLETED') return { stroke: '#9ca3af', dash: 'none', classes: '' };
    if (status === 'DEFERRED') return { stroke: '#9ca3af', dash: '4 4', classes: '' };
    return { stroke: '#6b7280', dash: '6 4', classes: '' }; // PROPOSED
  };

  const getType = (block: BlockItem) => {
    return block.type || (block.departments.includes('S&T') ? 'POWER' : block.departments.includes('TRD') ? 'TRACMACHINE' : 'ENGG-OPENLINE');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm flex flex-col">
      {/* Header & Tools */}
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
        <div>
          <h3 className="text-[14px] font-bold text-irctc-navy uppercase tracking-wider">{region} — Engineering Schematic</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">Drag tracks to reposition · Drag nodes to reshape · Click block for details</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setViewBox(p => ({ ...p, w: p.w * 0.8, h: p.h * 0.8 }))} className="p-1.5 hover:bg-white rounded border border-transparent hover:border-gray-200 text-gray-500 transition-colors" title="Zoom In"><ZoomIn className="w-4 h-4" /></button>
          <button onClick={() => setViewBox(p => ({ ...p, w: p.w * 1.2, h: p.h * 1.2 }))} className="p-1.5 hover:bg-white rounded border border-transparent hover:border-gray-200 text-gray-500 transition-colors" title="Zoom Out"><ZoomOut className="w-4 h-4" /></button>
          <button onClick={handleFit} className="p-1.5 hover:bg-white rounded border border-transparent hover:border-gray-200 text-gray-500 transition-colors" title="Fit to Screen"><Maximize className="w-4 h-4" /></button>
        </div>
      </div>
      
      {/* Interactive SVG Canvas */}
      <div className="relative w-full h-[500px] bg-white cursor-grab active:cursor-grabbing overflow-hidden">
        <svg 
          ref={svgRef}
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
          className="w-full h-full block"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <defs>
            {/* Standard Block Hatch */}
            <pattern id="block-hatch" patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(45)">
              <rect width="10" height="10" fill="#ffffff" />
              <line x1="0" y1="0" x2="0" y2="10" stroke="#111827" strokeWidth="2.5" />
            </pattern>
            {/* Muted Block Hatch for Completed */}
            <pattern id="block-hatch-muted" patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(45)">
              <rect width="10" height="10" fill="#f9fafb" />
              <line x1="0" y1="0" x2="0" y2="10" stroke="#9ca3af" strokeWidth="2" />
            </pattern>
          </defs>

          {activeTracks.map(track => {
            const pts = tracksState[track.id] || track.points;
            if (pts.length < 2) return null;
            const d = `M ${pts.map(p => `${p.x},${p.y}`).join(' L ')}`;
            const { totalLength } = getTrackSegments(pts);
            
            return (
              <g key={track.id}>
                {/* 1. Track Hitbox for dragging */}
                <path
                  d={d}
                  stroke="transparent"
                  strokeWidth="40"
                  fill="none"
                  className="draggable-track cursor-move"
                  onPointerDown={(e) => handleTrackDown(e, track.id)}
                />

                {/* 2. Railway Track Render */}
                {/* Sleepers */}
                <path d={d} stroke="#a3a3a3" strokeWidth="16" strokeDasharray="3 7" fill="none" pointerEvents="none" strokeLinecap="butt" />
                {/* Outer Rails background (white) */}
                <path d={d} stroke="white" strokeWidth="10" fill="none" pointerEvents="none" strokeLinejoin="round" />
                {/* Rails (black) */}
                <path d={d} stroke="#111827" strokeWidth="12" fill="none" pointerEvents="none" strokeLinejoin="round" />
                {/* Inner center (white) to split the thick black rail into two rails */}
                <path d={d} stroke="white" strokeWidth="8" fill="none" pointerEvents="none" strokeLinejoin="round" />

                {/* 3. Track Label (positioned at first point slightly offset) */}
                <text x={pts[0].x} y={pts[0].y - 20} className="text-[12px] font-bold fill-gray-700 pointer-events-none" style={{ fontFamily: 'sans-serif' }}>
                  {track.name} — {track.direction}
                </text>

                {/* 4. Stations */}
                {track.sections.map(sec => {
                  const pt = getPointAtPercentage(pts, sec.position);
                  return (
                    <g key={sec.name} transform={`translate(${pt.x}, ${pt.y})`}>
                      <circle cx="0" cy="0" r="4" fill="#3b82f6" stroke="white" strokeWidth="2" className="pointer-events-none" />
                      <text x="0" y="20" textAnchor="middle" className="text-[10px] font-bold fill-gray-500 pointer-events-none" style={{ fontFamily: 'sans-serif' }}>
                        {sec.name}
                      </text>
                    </g>
                  );
                })}

                {/* 5. Control Points (visible circles for reshaping) */}
                {pts.map((p, idx) => (
                  <circle
                    key={idx}
                    cx={p.x}
                    cy={p.y}
                    r="8"
                    fill="white"
                    stroke="#d1d5db"
                    strokeWidth="2"
                    className="draggable-point cursor-crosshair hover:stroke-blue-500 hover:fill-blue-50 transition-colors"
                    onPointerDown={(e) => handlePointDown(e, track.id, idx)}
                  />
                ))}

                {/* 6. Blocks */}
                {displayBlocks.map(block => {
                  const { startPct, lenPct } = getBlockMetrics(block);
                  const startDist = (startPct / 100) * totalLength;
                  const blockLen = (lenPct / 100) * totalLength;
                  const border = getBlockBorder(block.status);
                  const hatchUrl = block.status === 'COMPLETED' || block.status === 'DEFERRED' ? 'url(#block-hatch-muted)' : 'url(#block-hatch)';
                  const isSelected = selectedId === block.id;

                  // Label Position (Center of the block)
                  const centerPct = startPct + (lenPct / 2);
                  const labelPt = getPointAtPercentage(pts, centerPct);

                  return (
                    <g key={block.id}>
                      {/* Block Hitbox */}
                      <path
                        d={d}
                        stroke="transparent"
                        strokeWidth="30"
                        fill="none"
                        strokeDasharray={`${blockLen} 999999`}
                        strokeDashoffset={-startDist}
                        className="block-hitbox cursor-pointer"
                        onPointerEnter={(e) => { setHoveredBlock(block); updateTooltip(e); }}
                        onPointerLeave={() => setHoveredBlock(null)}
                        onPointerDown={(e) => { e.stopPropagation(); onSelect(block.id); }}
                      />
                      
                      {/* Outer Border */}
                      <path
                        d={d}
                        stroke={isSelected ? '#3b82f6' : border.stroke}
                        strokeWidth={isSelected ? "20" : "16"}
                        strokeDasharray={isSelected ? `${blockLen} 999999` : `${blockLen} 999999`} // dash parameter used below for status
                        strokeDashoffset={-startDist}
                        fill="none"
                        pointerEvents="none"
                        className={border.classes}
                        strokeLinejoin="round"
                        strokeLinecap="butt"
                        style={border.dash !== 'none' && !isSelected ? { strokeDasharray: `${border.dash}, ${blockLen} 999999` } : {}}
                      />
                      
                      {/* Inner Hatch */}
                      <path
                        d={d}
                        stroke={hatchUrl}
                        strokeWidth="12"
                        strokeDasharray={`${blockLen} 999999`}
                        strokeDashoffset={-startDist}
                        fill="none"
                        pointerEvents="none"
                        strokeLinejoin="round"
                        strokeLinecap="butt"
                      />

                      {/* Small Label on Track (ID) */}
                      <g transform={`translate(${labelPt.x}, ${labelPt.y - 25})`} className="pointer-events-none">
                        <rect x="-35" y="-10" width="70" height="14" fill="white" rx="2" stroke="#e5e7eb" />
                        <text x="0" y="0" textAnchor="middle" dominantBaseline="middle" className="text-[8px] font-bold fill-gray-800" style={{ fontFamily: 'sans-serif' }}>
                          {block.id}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip (HTML overlay tracking mouse) */}
        <div 
          ref={tooltipRef}
          className={clsx(
            "fixed z-50 pointer-events-none transition-opacity duration-150 bg-white border border-gray-200 rounded shadow-lg p-3 w-64 text-[11px]",
            hoveredBlock ? "opacity-100" : "opacity-0 hidden"
          )}
        >
          {hoveredBlock && (
            <>
              <div className="border-b border-gray-100 pb-2 mb-2">
                <span className="font-bold text-irctc-navy text-[13px] block mb-0.5">{hoveredBlock.id}</span>
                <span className="font-bold text-gray-500 uppercase tracking-wider">{getType(hoveredBlock)}</span>
              </div>
              <div className="grid grid-cols-[80px_1fr] gap-y-1.5 text-gray-700">
                <span className="text-gray-400">Status:</span><span className="font-bold">{hoveredBlock.status}</span>
                <span className="text-gray-400">Department:</span><span className="font-bold">{hoveredBlock.departments.join(' • ')}</span>
                <span className="text-gray-400">Track:</span><span className="font-bold">{hoveredBlock.track}</span>
                <span className="text-gray-400">Section:</span><span className="font-bold">{hoveredBlock.section}</span>
                <span className="text-gray-400">Start:</span><span className="font-bold">{hoveredBlock.startTime}</span>
                <span className="text-gray-400">End:</span><span className="font-bold">{hoveredBlock.endTime}</span>
                <span className="text-gray-400">Duration:</span><span className="font-bold">{hoveredBlock.duration}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Legend Footer */}
      <div className="px-5 py-3 bg-gray-50 flex items-center justify-between border-t border-gray-100">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 bg-white border-2 border-dashed border-gray-500 rounded-sm relative overflow-hidden">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)', backgroundSize: '6px 6px' }} />
            </div>
            <span className="text-[10px] font-bold text-gray-600 uppercase">Proposed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 bg-white border-2 border-gray-900 rounded-sm relative overflow-hidden">
              <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)', backgroundSize: '6px 6px' }} />
            </div>
            <span className="text-[10px] font-bold text-gray-600 uppercase">Approved / Imposed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 bg-white border-2 border-red-500 rounded-sm relative overflow-hidden">
              <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)', backgroundSize: '6px 6px' }} />
            </div>
            <span className="text-[10px] font-bold text-gray-600 uppercase">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
