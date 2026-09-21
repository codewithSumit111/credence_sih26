import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Train, AlertTriangle, CheckCircle2, Clock, Shield,
  Navigation, Eye, RefreshCw, Layers, ZoomIn, Info, Wrench,
  Radio, ChevronRight
} from 'lucide-react';

// ─── Data Definitions ─────────────────────────────────────────────────────────

export interface StationNode {
  id: string;
  name: string;
  code: string;
  x: number;
  y: number;
  zone: string;
  health: number; // 0-100
  status: 'normal' | 'maintenance' | 'planned' | 'congested';
  activeBlocks: number;
  speedRestriction?: string;
  dailyTrains: number;
  pendingJobs: number;
}

export interface RouteEdge {
  id: string;
  from: string;
  to: string;
  path: string;
  distanceKm: number;
  status: 'clear' | 'planned-block' | 'active-block' | 'consolidated';
  currentSpeed: number;
  maxSpeed: number;
  blockTime?: string;
  dept?: string;
}

export interface LiveTrain {
  id: string;
  name: string;
  number: string;
  type: 'Vande Bharat' | 'Rajdhani' | 'Express' | 'Freight';
  pathId: string;
  path: string;
  duration: number; // seconds for loop
  delayMin: number;
  direction: 'up' | 'down';
  color: string;
}

const STATIONS: StationNode[] = [
  { id: 'delhi', name: 'New Delhi', code: 'NDLS', x: 260, y: 70, zone: 'Northern (NR)', health: 96, status: 'normal', activeBlocks: 1, dailyTrains: 340, pendingJobs: 2 },
  { id: 'kanpur', name: 'Kanpur Central', code: 'CNB', x: 370, y: 115, zone: 'North Central (NCR)', health: 88, status: 'planned', activeBlocks: 2, speedRestriction: '75 km/h at Yard', dailyTrains: 280, pendingJobs: 4 },
  { id: 'patna', name: 'Patna Junction', code: 'PNBE', x: 470, y: 135, zone: 'East Central (ECR)', health: 92, status: 'normal', activeBlocks: 0, dailyTrains: 210, pendingJobs: 1 },
  { id: 'kolkata', name: 'Howrah / Kolkata', code: 'HWH', x: 530, y: 195, zone: 'Eastern (ER)', health: 94, status: 'normal', activeBlocks: 1, dailyTrains: 310, pendingJobs: 3 },
  { id: 'mumbai', name: 'Mumbai CSMT', code: 'CSMT', x: 130, y: 270, zone: 'Central (CR)', health: 97, status: 'normal', activeBlocks: 1, dailyTrains: 420, pendingJobs: 2 },
  { id: 'karjat', name: 'Karjat Jn', code: 'KJT', x: 155, y: 290, zone: 'Central (CR)', health: 91, status: 'congested', activeBlocks: 2, speedRestriction: '50 km/h Bhor Ghat', dailyTrains: 160, pendingJobs: 5 },
  { id: 'lonavala', name: 'Lonavala', code: 'LNL', x: 175, y: 310, zone: 'Central (CR)', health: 82, status: 'maintenance', activeBlocks: 3, speedRestriction: '30 km/h Ghat Section', dailyTrains: 145, pendingJobs: 7 },
  { id: 'pune', name: 'Pune Junction', code: 'PUNE', x: 200, y: 335, zone: 'Central (CR)', health: 96, status: 'normal', activeBlocks: 0, dailyTrains: 230, pendingJobs: 2 },
  { id: 'hyderabad', name: 'Secunderabad', code: 'SC', x: 290, y: 320, zone: 'South Central (SCR)', health: 94, status: 'normal', activeBlocks: 1, dailyTrains: 195, pendingJobs: 3 },
  { id: 'chennai', name: 'Chennai Central', code: 'MAS', x: 330, y: 440, zone: 'Southern (SR)', health: 95, status: 'normal', activeBlocks: 0, dailyTrains: 260, pendingJobs: 1 },
  { id: 'bangalore', name: 'Bengaluru City', code: 'SBC', x: 260, y: 430, zone: 'South Western (SWR)', health: 93, status: 'planned', activeBlocks: 1, speedRestriction: '80 km/h track renewal', dailyTrains: 220, pendingJobs: 3 },
  { id: 'surat', name: 'Surat', code: 'ST', x: 140, y: 205, zone: 'Western (WR)', health: 95, status: 'normal', activeBlocks: 1, dailyTrains: 240, pendingJobs: 1 },
  { id: 'ahmedabad', name: 'Ahmedabad Jn', code: 'ADI', x: 125, y: 155, zone: 'Western (WR)', health: 98, status: 'normal', activeBlocks: 0, dailyTrains: 215, pendingJobs: 1 },
];

const ROUTES: RouteEdge[] = [
  // Delhi - Kanpur - Patna - Kolkata (Main Northern/Eastern Trunk)
  { id: 'r-ndls-cnb', from: 'delhi', to: 'kanpur', path: 'M 260 70 Q 315 88 370 115', distanceKm: 435, status: 'planned-block', currentSpeed: 110, maxSpeed: 130, blockTime: '02:00 - 05:00', dept: 'TRD (OHE Insulator replacement)' },
  { id: 'r-cnb-pnbe', from: 'kanpur', to: 'patna', path: 'M 370 115 Q 420 120 470 135', distanceKm: 550, status: 'clear', currentSpeed: 125, maxSpeed: 130 },
  { id: 'r-pnbe-hwh', from: 'patna', to: 'kolkata', path: 'M 470 135 Q 500 160 530 195', distanceKm: 532, status: 'consolidated', currentSpeed: 105, maxSpeed: 130, blockTime: '01:30 - 04:30', dept: 'ENG + S&T (Consolidated Tamping)' },

  // Delhi - Ahmedabad - Surat - Mumbai (Western Trunk)
  { id: 'r-ndls-adi', from: 'delhi', to: 'ahmedabad', path: 'M 260 70 Q 185 105 125 155', distanceKm: 934, status: 'clear', currentSpeed: 130, maxSpeed: 130 },
  { id: 'r-adi-st', from: 'ahmedabad', to: 'surat', path: 'M 125 155 L 140 205', distanceKm: 229, status: 'clear', currentSpeed: 120, maxSpeed: 130 },
  { id: 'r-st-csmt', from: 'surat', to: 'mumbai', path: 'M 140 205 Q 132 235 130 270', distanceKm: 263, status: 'planned-block', currentSpeed: 100, maxSpeed: 120, blockTime: '03:15 - 05:45', dept: 'ENG (Deep Screening Machine)' },

  // Mumbai - Karjat - Lonavala - Pune (Western Ghats Bhor Corridor - High Detail)
  { id: 'r-csmt-kjt', from: 'mumbai', to: 'karjat', path: 'M 130 270 Q 142 280 155 290', distanceKm: 100, status: 'clear', currentSpeed: 85, maxSpeed: 105 },
  { id: 'r-kjt-lnl', from: 'karjat', to: 'lonavala', path: 'M 155 290 Q 165 300 175 310', distanceKm: 28, status: 'active-block', currentSpeed: 30, maxSpeed: 60, blockTime: 'ACTIVE: 00:30 - 04:30', dept: 'ENG + TRD (Catch Siding Maintenance & OHE)' },
  { id: 'r-lnl-pune', from: 'lonavala', to: 'pune', path: 'M 175 310 Q 188 322 200 335', distanceKm: 64, status: 'consolidated', currentSpeed: 95, maxSpeed: 110, blockTime: 'Tomorrow 01:00 - 04:00', dept: 'S&T (Axle Counter Sensor Testing)' },

  // Central Cross Connections
  { id: 'r-ndls-sc', from: 'delhi', to: 'hyderabad', path: 'M 260 70 Q 280 195 290 320', distanceKm: 1667, status: 'clear', currentSpeed: 120, maxSpeed: 130 },
  { id: 'r-pune-sc', from: 'pune', to: 'hyderabad', path: 'M 200 335 Q 245 325 290 320', distanceKm: 597, status: 'clear', currentSpeed: 110, maxSpeed: 120 },
  { id: 'r-sc-mas', from: 'hyderabad', to: 'chennai', path: 'M 290 320 Q 315 380 330 440', distanceKm: 704, status: 'clear', currentSpeed: 115, maxSpeed: 130 },
  { id: 'r-pune-sbc', from: 'pune', to: 'bangalore', path: 'M 200 335 Q 225 385 260 430', distanceKm: 834, status: 'clear', currentSpeed: 105, maxSpeed: 110 },
  { id: 'r-sbc-mas', from: 'bangalore', to: 'chennai', path: 'M 260 430 Q 295 438 330 440', distanceKm: 362, status: 'planned-block', currentSpeed: 110, maxSpeed: 130, blockTime: '02:30 - 05:00', dept: 'TRD (Neutral Section Overhaul)' },
  { id: 'r-hwh-mas', from: 'kolkata', to: 'chennai', path: 'M 530 195 Q 430 320 330 440', distanceKm: 1662, status: 'clear', currentSpeed: 120, maxSpeed: 130 },
];

const LIVE_TRAINS: LiveTrain[] = [
  { id: 't1', name: 'Vande Bharat Exp', number: '20901', type: 'Vande Bharat', pathId: 'r-st-csmt', path: 'M 140 205 Q 132 235 130 270', duration: 9, delayMin: 0, direction: 'down', color: '#10B981' },
  { id: 't2', name: 'Rajdhani Express', number: '12952', type: 'Rajdhani', pathId: 'r-ndls-adi', path: 'M 260 70 Q 185 105 125 155', duration: 14, delayMin: 4, direction: 'up', color: '#B45309' },
  { id: 't3', name: 'Deccan Queen', number: '12124', type: 'Express', pathId: 'r-csmt-kjt', path: 'M 130 270 Q 142 280 155 290', duration: 8, delayMin: 2, direction: 'down', color: '#38BDF8' },
  { id: 't4', name: 'Prayagraj Exp', number: '12418', type: 'Express', pathId: 'r-ndls-cnb', path: 'M 260 70 Q 315 88 370 115', duration: 11, delayMin: 7, direction: 'down', color: '#F59E0B' },
  { id: 't5', name: 'Coromandel Exp', number: '12841', type: 'Express', pathId: 'r-hwh-mas', path: 'M 530 195 Q 430 320 330 440', duration: 16, delayMin: 0, direction: 'down', color: '#34D399' },
  { id: 't6', name: 'Chennai Shatabdi', number: '12028', type: 'Express', pathId: 'r-sbc-mas', path: 'M 260 430 Q 295 438 330 440', duration: 7, delayMin: 0, direction: 'down', color: '#A855F7' },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CorridorMap() {
  const [selectedStation, setSelectedStation] = useState<StationNode | null>(STATIONS[6]); // Lonavala by default
  const [selectedRoute, setSelectedRoute] = useState<RouteEdge | null>(ROUTES[7]); // Karjat-Lonavala active block
  const [filterMode, setFilterMode] = useState<'all' | 'active' | 'planned' | 'congested'>('all');
  const [showLiveTrains, setShowLiveTrains] = useState(true);

  // Filter routes based on mode
  const filteredRoutes = ROUTES.filter(r => {
    if (filterMode === 'all') return true;
    if (filterMode === 'active') return r.status === 'active-block';
    if (filterMode === 'planned') return r.status === 'planned-block' || r.status === 'consolidated';
    if (filterMode === 'congested') return r.currentSpeed < 80;
    return true;
  });

  const getRouteColor = (status: RouteEdge['status']) => {
    switch (status) {
      case 'active-block':
        return '#DC2626'; // Bright Red
      case 'planned-block':
        return '#D97706'; // Amber
      case 'consolidated':
        return '#7C3AED'; // Purple
      case 'clear':
      default:
        return '#10B981'; // Green
    }
  };

  const getStationColor = (status: StationNode['status']) => {
    switch (status) {
      case 'maintenance':
        return '#DC2626';
      case 'planned':
        return '#D97706';
      case 'congested':
        return '#F59E0B';
      case 'normal':
      default:
        return '#10B981';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
      {/* Header bar */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-50 via-white to-emerald-50/20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-700">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[13px] font-bold text-slate-900 tracking-wide uppercase">
                Active Corridor GIS Network
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                LIVE TELEMETRY
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Interactive block scheduling, train movements & corridor health visualization
            </p>
          </div>
        </div>

        {/* Filter controls & Toggles */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 text-xs">
          {(['all', 'active', 'planned', 'congested'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-2.5 py-1 rounded-lg font-medium capitalize transition-all text-[11px] ${
                filterMode === mode
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {mode === 'all' ? 'All Corridors' : mode === 'active' ? 'Active Blocks (1)' : mode === 'planned' ? 'Planned (4)' : 'Slow Zones'}
            </button>
          ))}

          <div className="h-4 w-px bg-slate-300 mx-1" />

          <button
            onClick={() => setShowLiveTrains(!showLiveTrains)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all ${
              showLiveTrains
                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <Train className="w-3 h-3" />
            {showLiveTrains ? 'Trains On' : 'Trains Off'}
          </button>
        </div>
      </div>

      {/* Main Grid: SVG Map on Left/Center + Detail Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
        {/* SVG Canvas Area */}
        <div className="lg:col-span-8 bg-slate-950 relative overflow-hidden flex items-center justify-center p-4 select-none">
          {/* Subtle Railway Grid Texture */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px), radial-gradient(#10b981 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              backgroundPosition: '0 0, 12px 12px',
            }}
          />

          {/* India Boundary Outline Silhouette (Stylized Railway Geo Frame) */}
          <svg
            viewBox="0 0 620 500"
            className="w-full h-full max-h-[480px] drop-shadow-2xl"
            style={{ filter: 'drop-shadow(0 0 20px rgba(16,185,129,0.05))' }}
          >
            <defs>
              {/* Glow filter for selected tracks */}
              <filter id="corridor-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Geographical Region Shading (North, West, South, East) */}
            <path
              d="M 220,30 Q 320,35 400,80 Q 560,140 540,230 Q 400,320 340,460 Q 250,450 180,350 Q 90,260 110,140 Z"
              fill="rgba(15, 23, 42, 0.6)"
              stroke="rgba(51, 65, 85, 0.4)"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />

            {/* Ghats Mountain Terrain accent for Karjat-Lonavala */}
            <g opacity="0.35">
              <polygon points="148,310 165,280 180,315" fill="#334155" />
              <polygon points="160,318 172,292 188,322" fill="#475569" />
              <text x="135" y="325" fill="#64748b" fontSize="8" fontFamily="monospace" fontWeight="600">
                BHOR GHAT GRADIENT 1:37
              </text>
            </g>

            {/* Route Tracks (Underlay Glow for Active Selection) */}
            {filteredRoutes.map(route => {
              const isSelected = selectedRoute?.id === route.id;
              const color = getRouteColor(route.status);
              return (
                <g key={route.id} onClick={() => setSelectedRoute(route)} className="cursor-pointer group">
                  {/* Outer Click Hitbox */}
                  <path
                    d={route.path}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="18"
                    strokeLinecap="round"
                  />

                  {/* Wide blurred halo for active or selected */}
                  {(isSelected || route.status === 'active-block') && (
                    <path
                      d={route.path}
                      fill="none"
                      stroke={color}
                      strokeWidth={isSelected ? '7' : '5'}
                      strokeLinecap="round"
                      opacity={isSelected ? 0.6 : 0.35}
                      filter="url(#corridor-glow)"
                    />
                  )}

                  {/* Base Track Rail Bed (Dark double line) */}
                  <path
                    d={route.path}
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />

                  {/* Main Route Color Line */}
                  <path
                    d={route.path}
                    fill="none"
                    stroke={color}
                    strokeWidth={isSelected ? '3.5' : '2.5'}
                    strokeDasharray={
                      route.status === 'active-block'
                        ? '6 3'
                        : route.status === 'consolidated'
                        ? '8 3'
                        : 'none'
                    }
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                </g>
              );
            })}

            {/* Animated Live Trains moving along routes */}
            {showLiveTrains &&
              LIVE_TRAINS.map(train => (
                <g key={train.id} pointerEvents="none">
                  {/* Moving train circle */}
                  <circle r="4.5" fill={train.color} stroke="#ffffff" strokeWidth="1.5">
                    <animateMotion
                      path={train.path}
                      dur={`${train.duration}s`}
                      repeatCount="indefinite"
                      keyPoints={train.direction === 'down' ? '0;1' : '1;0'}
                      keyTimes="0;1"
                    />
                  </circle>
                  {/* Radar pulse around train */}
                  <circle r="8" fill="none" stroke={train.color} strokeWidth="1" opacity="0.7">
                    <animateMotion
                      path={train.path}
                      dur={`${train.duration}s`}
                      repeatCount="indefinite"
                      keyPoints={train.direction === 'down' ? '0;1' : '1;0'}
                      keyTimes="0;1"
                    />
                    <animate
                      attributeName="r"
                      values="4;12;4"
                      dur="1.8s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.8;0;0.8"
                      dur="1.8s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              ))}

            {/* Station Nodes */}
            {STATIONS.map(st => {
              const isSelected = selectedStation?.id === st.id;
              const color = getStationColor(st.status);
              return (
                <g
                  key={st.id}
                  transform={`translate(${st.x}, ${st.y})`}
                  onClick={() => setSelectedStation(st)}
                  className="cursor-pointer group"
                >
                  {/* Pulsing ring for stations under maintenance or congested */}
                  {(st.status === 'maintenance' || st.status === 'congested') && (
                    <circle r="12" fill="none" stroke={color} strokeWidth="1.5" opacity="0.6">
                      <animate
                        attributeName="r"
                        values="7;18;7"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.9;0;0.9"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}

                  {/* Selection Ring */}
                  {isSelected && (
                    <circle r="11" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 2" className="animate-spin" />
                  )}

                  {/* Station Outer Hub Circle */}
                  <circle
                    r={isSelected ? '7.5' : '6'}
                    fill="#0f172a"
                    stroke={color}
                    strokeWidth="2.5"
                    className="transition-all duration-200 group-hover:scale-125"
                  />

                  {/* Station Inner Core */}
                  <circle
                    r="2.5"
                    fill={color}
                  />

                  {/* Station Code / Name Label */}
                  <text
                    x={st.x > 300 ? 10 : -10}
                    y="4"
                    textAnchor={st.x > 300 ? 'start' : 'end'}
                    fill={isSelected ? '#ffffff' : '#94a3b8'}
                    fontSize="10"
                    fontWeight={isSelected ? 'bold' : '600'}
                    fontFamily="ui-sans-serif, system-ui, sans-serif"
                    className="drop-shadow-md select-none group-hover:fill-emerald-300"
                  >
                    {st.name}
                  </text>

                  {/* Status Indicator Pill below */}
                  <text
                    x={st.x > 300 ? 10 : -10}
                    y="15"
                    textAnchor={st.x > 300 ? 'start' : 'end'}
                    fill={color}
                    fontSize="7.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                    className="select-none"
                  >
                    {st.code} • {st.health}%
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Floating mini legend overlay in bottom-left */}
          <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl px-3 py-2 text-[10px] text-slate-300 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-500/20" />
              <span>Normal Route</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-red-500/20 animate-pulse" />
              <span>Active Block</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-500/20" />
              <span>Planned Block</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 ring-2 ring-purple-500/20" />
              <span>Consolidated (ENG+S&T)</span>
            </div>
          </div>
        </div>

        {/* Right-hand Detail Inspector / Telemetry Panel */}
        <div className="lg:col-span-4 bg-slate-50/50 border-t lg:border-t-0 lg:border-l border-slate-200/80 p-4 flex flex-col justify-between">
          <div>
            {/* Context Badge */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Navigation className="w-3 h-3 text-blue-600" />
                CORRIDOR TELEMETRY
              </span>
              {selectedRoute?.status === 'active-block' ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 animate-pulse">
                  CRITICAL BLOCK ACTIVE
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                  OPTIMAL FLOW
                </span>
              )}
            </div>

            {/* Selected Station Card */}
            {selectedStation && (
              <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs mb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      {selectedStation.name}
                      <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                        {selectedStation.code}
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{selectedStation.zone}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-black text-blue-600">
                      {selectedStation.health}%
                    </span>
                    <p className="text-[9px] text-slate-400 uppercase font-semibold">Health Score</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-100 text-center">
                  <div className="bg-slate-50 rounded-lg p-1.5">
                    <p className="text-[14px] font-bold font-mono text-slate-800">{selectedStation.dailyTrains}</p>
                    <p className="text-[9px] text-slate-400 uppercase font-medium">Daily Trains</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-1.5">
                    <p className="text-[14px] font-bold font-mono text-amber-600">{selectedStation.activeBlocks}</p>
                    <p className="text-[9px] text-slate-400 uppercase font-medium">Blocks 24h</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-1.5">
                    <p className="text-[14px] font-bold font-mono text-blue-600">{selectedStation.pendingJobs}</p>
                    <p className="text-[9px] text-slate-400 uppercase font-medium">Job Queue</p>
                  </div>
                </div>

                {selectedStation.speedRestriction && (
                  <div className="mt-2.5 p-2 rounded-lg bg-amber-50/80 border border-amber-200/70 flex items-start gap-1.5 text-[11px] text-amber-800">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span><strong>Speed Restriction:</strong> {selectedStation.speedRestriction}</span>
                  </div>
                )}
              </div>
            )}

            {/* Selected Route Segment Card */}
            {selectedRoute ? (
              <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-700 uppercase">
                    Route Segment Analysis
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedRoute.status === 'active-block'
                        ? 'bg-red-100 text-red-700'
                        : selectedRoute.status === 'planned-block'
                        ? 'bg-amber-100 text-amber-700'
                        : selectedRoute.status === 'consolidated'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {selectedRoute.status.replace('-', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Distance</span>
                    <span className="font-mono font-semibold text-slate-800">{selectedRoute.distanceKm} km</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Current / Max Speed</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {selectedRoute.currentSpeed} / {selectedRoute.maxSpeed} km/h
                    </span>
                  </div>
                  {selectedRoute.blockTime && (
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Block Window</span>
                      <span className="font-mono font-semibold text-amber-700">{selectedRoute.blockTime}</span>
                    </div>
                  )}
                  {selectedRoute.dept && (
                    <div className="pt-1 text-[11px] text-slate-600">
                      <span className="font-semibold text-slate-800">Reason: </span>
                      {selectedRoute.dept}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-100/70 rounded-xl p-4 text-center text-xs text-slate-500">
                Click any track line or station node on the map to inspect telemetry
              </div>
            )}
          </div>

          {/* Quick Action Footer */}
          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Next Opt. Run in 18m</span>
            </div>
            <button
              onClick={() => {
                setSelectedRoute(ROUTES[7]); // Karjat-Lonavala
                setSelectedStation(STATIONS[6]);
              }}
              className="px-3 py-1.5 rounded-lg bg-[#E85D04] hover:bg-[#D05303] text-white font-medium text-[11px] flex items-center gap-1 transition-colors shadow-xs"
            >
              Focus Critical Zone <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
