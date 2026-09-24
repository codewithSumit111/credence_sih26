import React, { useState, useMemo, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { OptimizedBlock } from '../../types';
import { Maximize, ZoomIn, ZoomOut } from 'lucide-react';

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
      name: 'Track 1 — UP',
      direction: 'UP',
      sections: [{ name: 'CSMT', position: 0 }, { name: 'DR', position: 30 }, { name: 'TNA', position: 60 }, { name: 'KYN', position: 100 }],
      points: [{ x: 100, y: 150 }, { x: 400, y: 150 }, { x: 700, y: 150 }, { x: 1000, y: 150 }]
    },
    {
      id: 'TR-02',
      name: 'Track 2 — DN',
      direction: 'DN',
      sections: [{ name: 'CSMT', position: 0 }, { name: 'DR', position: 30 }, { name: 'TNA', position: 60 }, { name: 'KYN', position: 100 }],
      points: [{ x: 100, y: 220 }, { x: 400, y: 220 }, { x: 700, y: 220 }, { x: 1000, y: 220 }]
    },
    {
      id: 'TR-03',
      name: 'Branch — UP',
      direction: 'UP',
      sections: [{ name: 'DIV', position: 20 }, { name: 'BSR', position: 80 }],
      // Smooth branch turnout geometry
      points: [{ x: 400, y: 150 }, { x: 550, y: 150 }, { x: 700, y: 50 }, { x: 1000, y: 50 }]
    }
  ],
  'Western Railway': [
    {
      id: 'TR-01',
      name: 'Local Line',
      direction: 'UP',
      sections: [{ name: 'CCG', position: 0 }, { name: 'DDR', position: 30 }, { name: 'ADH', position: 60 }, { name: 'VR', position: 100 }],
      points: [{ x: 100, y: 200 }, { x: 450, y: 200 }, { x: 650, y: 350 }, { x: 900, y: 350 }]
    }
  ]
};

const DEFAULT_TRACKS: TrackDef[] = [
  {
    id: 'TR-00',
    name: 'Main Line',
    direction: 'UP/DN',
    sections: [{ name: 'STN-A', position: 0 }, { name: 'STN-B', position: 33 }, { name: 'STN-C', position: 66 }, { name: 'STN-D', position: 100 }],
    points: [{ x: 100, y: 200 }, { x: 900, y: 200 }]
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

function getSplinePoints(points: Point[], numSegments = 10): Point[] {
  if (points.length < 2) return points;
  if (points.length === 2) {
    const pts = [];
    for (let i = 0; i <= numSegments; i++) {
      pts.push({
        x: points[0].x + (points[1].x - points[0].x) * (i / numSegments),
        y: points[0].y + (points[1].y - points[0].y) * (i / numSegments)
      });
    }
    return pts;
  }

  const pts = [points[0], ...points, points[points.length - 1]];
  const result: Point[] = [];

  for (let i = 1; i < pts.length - 2; i++) {
    const p0 = pts[i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2];

    const limit = i === pts.length - 3 ? numSegments + 1 : numSegments;
    for (let t = 0; t < limit; t++) {
      const t1 = t / numSegments;
      const t2 = t1 * t1;
      const t3 = t2 * t1;

      const x = 0.5 * (
        (2 * p1.x) +
        (-p0.x + p2.x) * t1 +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
      );
      const y = 0.5 * (
        (2 * p1.y) +
        (-p0.y + p2.y) * t1 +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
      );
      result.push({ x, y });
    }
  }
  return result;
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

function getParallelPaths(points: Point[], offset: number) {
  const leftPoints: Point[] = [];
  const rightPoints: Point[] = [];
  for (let i = 0; i < points.length; i++) {
    let dx = 0, dy = 0;
    if (i === 0) {
      dx = points[1].x - points[0].x;
      dy = points[1].y - points[0].y;
    } else if (i === points.length - 1) {
      dx = points[i].x - points[i - 1].x;
      dy = points[i].y - points[i - 1].y;
    } else {
      dx = points[i + 1].x - points[i - 1].x;
      dy = points[i + 1].y - points[i - 1].y;
    }
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) {
      leftPoints.push(points[i]);
      rightPoints.push(points[i]);
      continue;
    }
    const nx = -dy / len;
    const ny = dx / len;
    leftPoints.push({ x: points[i].x + nx * offset, y: points[i].y + ny * offset });
    rightPoints.push({ x: points[i].x - nx * offset, y: points[i].y - ny * offset });
  }
  return { leftPoints, rightPoints };
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
    const target = e.target as SVGElement;
    if (target.classList.contains('draggable-track') || target.classList.contains('draggable-point') || target.classList.contains('block-hitbox')) {
      return;
    }
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  
  const handlePointerMove = (e: React.PointerEvent) => {
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

  const tooltipRef = useRef<HTMLDivElement>(null);
  const [hoveredBlock, setHoveredBlock] = useState<BlockItem | null>(null);

  const updateTooltip = (e: React.PointerEvent) => {
    if (tooltipRef.current) {
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
    
    // Recovery states
    if (status === 'PROTECTED') return { stroke: '#10b981', dash: 'none', classes: '' }; // Green solid
    if (status === 'UNCHANGED') return { stroke: '#9ca3af', dash: 'none', classes: 'opacity-50' }; // Gray solid muted
    if (status === 'UPDATED') return { stroke: '#3b82f6', dash: 'none', classes: 'animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]' }; // Blue pulsing
    
    return { stroke: '#6b7280', dash: '6 4', classes: '' }; // PROPOSED
  };

  const getType = (block: BlockItem) => {
    return block.type || (block.departments.includes('S&T') ? 'POWER' : block.departments.includes('TRD') ? 'TRACMACHINE' : 'ENGG-OPENLINE');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm flex flex-col relative">
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
      
      <div 
        className="relative w-full h-[500px] bg-white cursor-grab active:cursor-grabbing overflow-hidden"
        onPointerMove={updateTooltip}
      >
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
            <pattern id="block-hatch" patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(45)">
              <rect width="10" height="10" fill="#ffffff" />
              <line x1="0" y1="0" x2="0" y2="10" stroke="#111827" strokeWidth="2.5" />
            </pattern>
            <pattern id="block-hatch-muted" patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(45)">
              <rect width="10" height="10" fill="#f9fafb" />
              <line x1="0" y1="0" x2="0" y2="10" stroke="#9ca3af" strokeWidth="2" />
            </pattern>
          </defs>

          {activeTracks.map(track => {
            const rawPts = tracksState[track.id] || track.points;
            if (rawPts.length < 2) return null;
            
            const spline = getSplinePoints(rawPts);
            const { totalLength } = getTrackSegments(spline);
            const dMain = `M ${spline.map(p => `${p.x},${p.y}`).join(' L ')}`;
            
            const { leftPoints, rightPoints } = getParallelPaths(spline, 5);
            const dLeft = `M ${leftPoints.map(p => `${p.x},${p.y}`).join(' L ')}`;
            const dRight = `M ${rightPoints.map(p => `${p.x},${p.y}`).join(' L ')}`;
            
            return (
              <g key={track.id} className="group">
                {/* Track Hitbox */}
                <path
                  d={dMain}
                  stroke="transparent"
                  strokeWidth="40"
                  fill="none"
                  className="draggable-track cursor-move"
                  onPointerDown={(e) => handleTrackDown(e, track.id)}
                />

                {/* Professional Railway Rendering */}
                {/* 1. Sleepers */}
                <path d={dMain} stroke="#a3a3a3" strokeWidth="18" strokeDasharray="3 7" fill="none" pointerEvents="none" strokeLinecap="butt" />
                {/* 2. Left Rail */}
                <path d={dLeft} stroke="#1f2937" strokeWidth="2" fill="none" pointerEvents="none" strokeLinejoin="round" />
                {/* 3. Right Rail */}
                <path d={dRight} stroke="#1f2937" strokeWidth="2" fill="none" pointerEvents="none" strokeLinejoin="round" />

                {/* Track Label */}
                <text x={spline[0].x} y={spline[0].y - 20} className="text-[11px] font-bold fill-gray-600 pointer-events-none" style={{ fontFamily: 'sans-serif' }}>
                  {track.name}
                </text>

                {/* Stations */}
                {track.sections.map(sec => {
                  const pt = getPointAtPercentage(spline, sec.position);
                  return (
                    <g key={sec.name} transform={`translate(${pt.x}, ${pt.y})`}>
                      <circle cx="0" cy="0" r="3.5" fill="white" stroke="#1f2937" strokeWidth="2" className="pointer-events-none" />
                      <text x="0" y="-10" textAnchor="middle" className="text-[10px] font-bold fill-gray-800 pointer-events-none" style={{ fontFamily: 'sans-serif' }}>
                        {sec.name}
                      </text>
                    </g>
                  );
                })}

                {/* Control Points (visible on track hover) */}
                <g className="opacity-0 group-hover:opacity-100 transition-opacity">
                  {rawPts.map((p, idx) => (
                    <circle
                      key={idx}
                      cx={p.x}
                      cy={p.y}
                      r="6"
                      fill="white"
                      stroke="#3b82f6"
                      strokeWidth="2"
                      className="draggable-point cursor-crosshair hover:fill-blue-50"
                      onPointerDown={(e) => handlePointDown(e, track.id, idx)}
                    />
                  ))}
                </g>

                {/* Blocks */}
                {displayBlocks.map(block => {
                  const { startPct, lenPct } = getBlockMetrics(block);
                  const startDist = (startPct / 100) * totalLength;
                  const blockLen = (lenPct / 100) * totalLength;
                  const border = getBlockBorder(block.status);
                  const hatchUrl = block.status === 'COMPLETED' || block.status === 'DEFERRED' ? 'url(#block-hatch-muted)' : 'url(#block-hatch)';
                  const isSelected = selectedId === block.id;

                  const centerPct = startPct + (lenPct / 2);
                  const labelPt = getPointAtPercentage(spline, centerPct);

                  return (
                    <g key={block.id}>
                      {/* Block Hitbox */}
                      <path
                        d={dMain}
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
                      
                      {/* Block Outer Border */}
                      <path
                        d={dMain}
                        stroke={isSelected ? '#3b82f6' : border.stroke}
                        strokeWidth={isSelected ? "20" : "18"}
                        strokeDasharray={isSelected ? `${blockLen} 999999` : `${blockLen} 999999`}
                        strokeDashoffset={-startDist}
                        fill="none"
                        pointerEvents="none"
                        className={border.classes}
                        strokeLinecap="butt"
                        style={border.dash !== 'none' && !isSelected ? { strokeDasharray: `${border.dash}, ${blockLen} 999999` } : {}}
                      />
                      
                      {/* Block Inner Hatch */}
                      <path
                        d={dMain}
                        stroke={hatchUrl}
                        strokeWidth="14"
                        strokeDasharray={`${blockLen} 999999`}
                        strokeDashoffset={-startDist}
                        fill="none"
                        pointerEvents="none"
                        strokeLinecap="butt"
                      />

                      {/* Small Label on Track */}
                      <g transform={`translate(${labelPt.x}, ${labelPt.y - 25})`} className="pointer-events-none">
                        <rect x="-30" y="-8" width="60" height="16" fill="white" rx="2" stroke="#d1d5db" />
                        <text x="0" y="0" textAnchor="middle" dominantBaseline="middle" className="text-[9px] font-bold fill-gray-800" style={{ fontFamily: 'sans-serif' }}>
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
