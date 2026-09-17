import { motion } from 'framer-motion';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { AlertTriangle, Clock } from 'lucide-react';

// Mini SVG Bar Chart
function MiniBarChart() {
  const bars = [
    { label: 'NR', value: 28 },
    { label: 'WR', value: 22 },
    { label: 'ER', value: 18 },
    { label: 'SR', value: 14 },
    { label: 'CR', value: 10 },
    { label: 'ECR', value: 8 },
  ];
  const max = 30;
  return (
    <div>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#122A1F', marginBottom: '0.75rem' }}>
        Asset Risk by Division
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: 70 }}>
        {bars.map((b) => (
          <div key={b.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <span style={{ fontSize: '0.55rem', fontWeight: 700, color: '#122A1F', marginBottom: 2 }}>{b.value}%</span>
            <div style={{
              width: '100%', height: (b.value / max) * 55,
              background: '#1B6B45', borderRadius: '3px 3px 0 0', opacity: 0.75,
              minHeight: 4,
            }} />
            <span style={{ fontSize: '0.5rem', color: '#5A7A6C', marginTop: 3, fontWeight: 600 }}>{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Donut Chart
function DonutChart() {
  const total = 744;
  const segments = [
    { label: 'On Time', value: 684, color: '#1B6B45' },
    { label: 'Delayed', value: 48, color: '#D97706' },
    { label: 'Cancelled', value: 12, color: '#EF4444' },
  ];
  const r = 36, cx = 50, cy = 50, circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#122A1F', marginBottom: '0.5rem' }}>
        Block Status
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <svg viewBox="0 0 100 100" style={{ width: 80, height: 80, flexShrink: 0 }}>
          {segments.map((seg) => {
            const dashLen = (seg.value / total) * circumference;
            const gapLen = circumference - dashLen;
            const currentOffset = offset;
            offset += dashLen;
            return (
              <circle key={seg.label} cx={cx} cy={cy} r={r} fill="none"
                stroke={seg.color} strokeWidth="10"
                strokeDasharray={`${dashLen} ${gapLen}`}
                strokeDashoffset={-currentOffset}
                transform={`rotate(-90 ${cx} ${cy})`}
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            );
          })}
          <text x={cx} y={cy - 3} textAnchor="middle" fill="#122A1F" fontSize="14" fontWeight="800" fontFamily="Inter">{total}</text>
          <text x={cx} y={cy + 9} textAnchor="middle" fill="#5A7A6C" fontSize="5" fontWeight="600">Total Blocks</text>
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {segments.map((seg) => (
            <div key={seg.label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: seg.color }} />
              <span style={{ fontSize: '0.6rem', color: '#5A7A6C' }}>{seg.label}</span>
              <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#122A1F', marginLeft: 'auto' }}>
                {seg.value} ({Math.round(seg.value / total * 100)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Mini Corridor Map
function MiniCorridorMap() {
  const cities = [
    { name: 'Delhi', x: 52, y: 15 },
    { name: 'Mumbai', x: 28, y: 52 },
    { name: 'Kolkata', x: 78, y: 42 },
    { name: 'Chennai', x: 62, y: 78 },
    { name: 'Bangalore', x: 45, y: 82 },
  ];
  const routes = [
    { from: 'Delhi', to: 'Mumbai', status: 'available' },
    { from: 'Delhi', to: 'Kolkata', status: 'planned' },
    { from: 'Mumbai', to: 'Chennai', status: 'maintenance' },
    { from: 'Mumbai', to: 'Bangalore', status: 'available' },
    { from: 'Kolkata', to: 'Chennai', status: 'conflict' },
  ];
  const statusColors: Record<string, string> = {
    available: '#1B6B45',
    planned: '#D97706',
    maintenance: '#EF4444',
    conflict: '#7C3AED',
  };
  const cityMap = Object.fromEntries(cities.map(c => [c.name, c]));

  return (
    <div>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#122A1F', marginBottom: '0.5rem' }}>
        Corridor Map
      </div>
      <div style={{ position: 'relative' }}>
        <svg viewBox="0 0 110 100" style={{ width: '100%', height: 'auto' }}>
          {/* Routes */}
          {routes.map((r) => {
            const from = cityMap[r.from];
            const to = cityMap[r.to];
            return (
              <line key={`${r.from}-${r.to}`}
                x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke={statusColors[r.status]} strokeWidth="2"
                opacity={0.6}
                strokeDasharray={r.status === 'conflict' ? '4 3' : 'none'}
              />
            );
          })}
          {/* Cities */}
          {cities.map((c) => (
            <g key={c.name}>
              <circle cx={c.x} cy={c.y} r="4" fill="#1B6B45" stroke="#fff" strokeWidth="1.5" />
              <text x={c.x} y={c.y + 10} textAnchor="middle" fill="#5A7A6C" fontSize="4.5" fontWeight="600">
                {c.name}
              </text>
            </g>
          ))}
        </svg>

        {/* Tooltip bubble */}
        <motion.div
          animate={{ opacity: [0, 1, 1, 0], y: [4, 0, 0, 4] }}
          transition={{ duration: 4, repeat: Infinity, repeatDelay: 1 }}
          style={{
            position: 'absolute', bottom: '12%', right: '10%',
            background: '#FFFFFF', borderRadius: 8, padding: '0.5rem 0.75rem',
            boxShadow: '0 4px 16px rgba(16,40,24,0.12)',
            border: '1px solid #E6F0EA',
          }}
        >
          <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#122A1F' }}>Bangalore – Chennai</div>
          <div style={{ fontSize: '0.5rem', color: '#5A7A6C' }}>12 blocks available</div>
          <div style={{ fontSize: '0.5rem', color: '#5A7A6C' }}>Next maintenance: 21 May</div>
        </motion.div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Available', color: '#1B6B45' },
          { label: 'Planned', color: '#D97706' },
          { label: 'Maintenance', color: '#EF4444' },
          { label: 'Conflict', color: '#7C3AED' },
        ].map((l) => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ width: 8, height: 3, borderRadius: 1, background: l.color, opacity: 0.7 }} />
            <span style={{ fontSize: '0.5rem', color: '#5A7A6C' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Conflicts List
function ConflictsList() {
  const conflicts = [
    { route: 'Bangalore – Chennai', id: 'B-216', time: '09:15 - 12:45', severity: 'high' },
    { route: 'Howrah – Patna', id: 'B-332', time: '11:20 - 14:00', severity: 'medium' },
    { route: 'Delhi – Jaipur', id: 'B-401', time: '16:30 - 18:15', severity: 'high' },
  ];
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#122A1F' }}>Upcoming Conflicts</div>
        <span style={{ fontSize: '0.55rem', color: '#1B6B45', fontWeight: 600, cursor: 'pointer' }}>View All →</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {conflicts.map((c) => (
          <div key={c.id} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem', borderRadius: 8,
            background: c.severity === 'high' ? '#FEF2F2' : '#FFFBEB',
            border: `1px solid ${c.severity === 'high' ? '#FECACA' : '#FDE68A'}`,
          }}>
            <AlertTriangle size={12} style={{ color: c.severity === 'high' ? '#EF4444' : '#D97706', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#122A1F' }}>{c.route}</div>
              <div style={{ fontSize: '0.5rem', color: '#5A7A6C' }}>{c.id}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <Clock size={9} style={{ color: '#8FA99D' }} />
              <span style={{ fontSize: '0.5rem', color: '#5A7A6C', fontFamily: 'JetBrains Mono' }}>{c.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Sparkline Chart
function SparklineChart() {
  const points = [
    { x: 0, high: 4, med: 2, low: 6 },
    { x: 1, high: 3, med: 4, low: 5 },
    { x: 2, high: 5, med: 3, low: 4 },
    { x: 3, high: 4, med: 5, low: 3 },
    { x: 4, high: 6, med: 4, low: 5 },
    { x: 5, high: 3, med: 6, low: 4 },
    { x: 6, high: 5, med: 3, low: 6 },
  ];
  const days = ['12 May', '13 May', '14 May', '15 May', '16 May', '17 May', '18 May'];
  const w = 200, h = 80, px = 20, py = 10;
  const chartW = w - px * 2, chartH = h - py * 2;
  const max = 8;
  const toPath = (key: 'high' | 'med' | 'low') => {
    return points.map((p, i) => {
      const x = px + (i / (points.length - 1)) * chartW;
      const y = py + chartH - (p[key] / max) * chartH;
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    }).join(' ');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#122A1F' }}>Asset Risk Trend</div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[
            { label: 'High', color: '#EF4444' },
            { label: 'Medium', color: '#D97706' },
            { label: 'Low', color: '#1B6B45' },
          ].map((l) => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: l.color }} />
              <span style={{ fontSize: '0.45rem', color: '#5A7A6C' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto' }}>
        {/* Grid lines */}
        {[0, 2, 4, 6, 8].map((v) => (
          <line key={v} x1={px} y1={py + chartH - (v / max) * chartH} x2={w - px} y2={py + chartH - (v / max) * chartH}
            stroke="#E6F0EA" strokeWidth="0.5" />
        ))}
        {/* Lines */}
        <path d={toPath('high')} fill="none" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
        <path d={toPath('med')} fill="none" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
        <path d={toPath('low')} fill="none" stroke="#1B6B45" strokeWidth="1.5" strokeLinecap="round" />
        {/* X labels */}
        {days.map((d, i) => (
          <text key={d} x={px + (i / (days.length - 1)) * chartW} y={h - 1}
            textAnchor="middle" fill="#8FA99D" fontSize="3.5">{d}</text>
        ))}
      </svg>
    </div>
  );
}

export default function OperationalView() {
  const { ref, isVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.08 });

  return (
    <section
      id="intelligence"
      ref={ref as unknown as React.RefObject<HTMLElement>}
      className="section-padding"
      style={{ background: '#EAF2ED' }}
      aria-labelledby="operational-heading"
    >
      <div className="container-site">
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '3rem', alignItems: 'start' }}>
          {/* Left: Title */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="section-label" style={{ display: 'block', marginBottom: '0.875rem', color: '#5A7A6C' }}>
              LIVE OPERATIONAL VIEW
            </span>
            <h2 id="operational-heading" className="section-heading" style={{
              fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', marginBottom: '1.25rem', lineHeight: 1.15,
            }}>
              From Data to Decisions —{' '}
              <span className="text-gradient-blue">In Real Time</span>
            </h2>
            <p className="section-subheading" style={{ fontSize: '0.95rem' }}>
              Get a complete view of your network — from asset health
              to block schedules, corridor availability and risk hotspots.
              All in one place.
            </p>
          </motion.div>

          {/* Right: Bento Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Corridor Map */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 }}
              style={{
                background: '#FFFFFF', borderRadius: 14, padding: '1.25rem',
                border: '1px solid #E6F0EA', boxShadow: '0 2px 12px rgba(16,40,24,0.05)',
                gridRow: 'span 2',
              }}
            >
              <MiniCorridorMap />
            </motion.div>

            {/* Sparkline */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.25 }}
              style={{
                background: '#FFFFFF', borderRadius: 14, padding: '1.25rem',
                border: '1px solid #E6F0EA', boxShadow: '0 2px 12px rgba(16,40,24,0.05)',
              }}
            >
              <SparklineChart />
            </motion.div>

            {/* Donut */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.35 }}
              style={{
                background: '#FFFFFF', borderRadius: 14, padding: '1.25rem',
                border: '1px solid #E6F0EA', boxShadow: '0 2px 12px rgba(16,40,24,0.05)',
              }}
            >
              <DonutChart />
            </motion.div>

            {/* Bars */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.45 }}
              style={{
                background: '#FFFFFF', borderRadius: 14, padding: '1.25rem',
                border: '1px solid #E6F0EA', boxShadow: '0 2px 12px rgba(16,40,24,0.05)',
              }}
            >
              <MiniBarChart />
            </motion.div>

            {/* Conflicts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.55 }}
              style={{
                background: '#FFFFFF', borderRadius: 14, padding: '1.25rem',
                border: '1px solid #E6F0EA', boxShadow: '0 2px 12px rgba(16,40,24,0.05)',
              }}
            >
              <ConflictsList />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
