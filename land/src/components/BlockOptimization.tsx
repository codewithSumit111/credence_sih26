import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const trains = [
  { id: 'TRAIN 12001', y: 0, color: '#38BDF8', speed: 1.8 },
  { id: 'TRAIN 11010', y: 1, color: '#818CF8', speed: 1.2 },
  { id: 'TRAIN 11020', y: 2, color: '#38BDF8', speed: 2.0 },
];

const depts = [
  { label: 'ENGINEERING', color: '#22C55E' },
  { label: 'S&T', color: '#818CF8' },
  { label: 'TRD', color: '#F59E0B' },
];

const metrics = [
  { label: '3 Jobs Consolidated', value: '3', icon: '⚡' },
  { label: '2 Separate Blocks Avoided', value: '2', icon: '✓' },
  { label: 'Est. Train Impact', value: '6 min', icon: '⏱' },
  { label: 'Block Utilisation', value: '86%', icon: '📊' },
];

export default function BlockOptimization() {
  const { ref, isVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.1 });
  const reducedMotion = useReducedMotion();
  const [candidateIdx, setCandidateIdx] = useState(0);
  const [optimized, setOptimized] = useState(false);

  const candidates = [
    { start: '00:45', end: '02:30', label: 'Candidate A' },
    { start: '01:15', end: '03:00', label: 'Candidate B' },
    { start: '01:30', end: '03:15', label: 'Optimal Window', optimal: true },
  ];

  useEffect(() => {
    if (!isVisible || reducedMotion) {
      if (isVisible) setOptimized(true);
      return;
    }

    const interval = setInterval(() => {
      setCandidateIdx((prev) => {
        if (prev >= candidates.length - 1) {
          clearInterval(interval);
          setOptimized(true);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isVisible, reducedMotion]);

  return (
    <section
      className="section-padding"
      ref={ref as unknown as React.RefObject<HTMLElement>}
      style={{ background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' }}
      aria-labelledby="block-opt-heading"
    >
      {/* BG grid */}
      <div className="bg-grid" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />

      <div className="container-site" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: '3rem', textAlign: 'center' }}
        >
          <span className="section-label" style={{ display: 'block', marginBottom: '1rem' }}>Block Optimization</span>
          <h2 id="block-opt-heading" className="section-heading" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', marginBottom: '0.75rem' }}>
            Finding the optimal window
          </h2>
          <p className="section-subheading">
            Multiple candidate block windows are evaluated; one optimal window is selected.
          </p>
          <p className="label-illustrative" style={{ marginTop: '0.5rem' }}>Illustrative optimization scenario</p>
        </motion.div>

        {/* Main visualization */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: 16,
            padding: '2rem',
            overflow: 'hidden',
          }}
        >
          {/* Track timeline header */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              {['00:00', '00:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30', '04:00'].map((t) => (
                <span key={t} style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>{t}</span>
              ))}
            </div>
            <div style={{ height: 1, background: 'var(--border-card)' }} />
          </div>

          {/* Train paths */}
          {trains.map((train, ti) => (
            <div key={train.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.875rem' }}>
              <span style={{ fontSize: '0.7rem', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)', minWidth: 95 }}>{train.id}</span>
              <div style={{ flex: 1, height: 28, borderRadius: 4, background: 'rgba(255,255,255,0.02)', position: 'relative', overflow: 'hidden' }}>
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={isVisible ? { x: 0 } : {}}
                  transition={{ delay: 0.3 + ti * 0.15, duration: 0.8, ease: 'easeOut' }}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '10%',
                    transform: 'translateY(-50%)',
                    width: '55%',
                    height: 8,
                    borderRadius: 4,
                    background: `linear-gradient(90deg, ${train.color}00, ${train.color}CC, ${train.color})`,
                  }}
                />
                {/* Train head indicator */}
                <motion.div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: train.color,
                    boxShadow: `0 0 8px ${train.color}`,
                  }}
                  animate={isVisible && !reducedMotion ? {
                    left: ['65%', '75%', '65%'],
                  } : { left: '65%' }}
                  transition={{ repeat: Infinity, duration: train.speed, ease: 'linear' }}
                />
              </div>
            </div>
          ))}

          {/* Block window area */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.7rem', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)', minWidth: 95 }}>BLOCK WINDOW</span>

              {/* Candidate windows evaluating */}
              <div style={{ flex: 1, position: 'relative', height: 44 }}>
                {candidates.map((c, ci) => (
                  <motion.div
                    key={c.label}
                    initial={{ opacity: 0, scaleX: 0.8 }}
                    animate={{
                      opacity: ci <= candidateIdx ? 1 : 0,
                      scaleX: ci <= candidateIdx ? 1 : 0.8,
                    }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: `${(ci / candidates.length) * 15 + 10}%`,
                      width: '28%',
                      height: '100%',
                      borderRadius: 6,
                      background: c.optimal && optimized
                        ? 'rgba(245,158,11,0.18)'
                        : ci < candidateIdx
                        ? 'rgba(56,189,248,0.04)'
                        : 'rgba(56,189,248,0.1)',
                      border: c.optimal && optimized
                        ? '2px solid rgba(245,158,11,0.8)'
                        : ci < candidateIdx
                        ? '1px solid rgba(56,189,248,0.1)'
                        : '1px solid rgba(56,189,248,0.35)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transformOrigin: 'left',
                    }}
                  >
                    <span style={{ fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace', color: c.optimal && optimized ? '#F59E0B' : 'var(--accent-cyan)', fontWeight: 700 }}>
                      {c.start} — {c.end}
                    </span>
                    {c.optimal && optimized && (
                      <span style={{ fontSize: '0.55rem', color: '#F59E0B', marginTop: 2 }}>★ OPTIMAL</span>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Dept consolidation inside block */}
            {optimized && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ display: 'flex', gap: '0.5rem', marginLeft: 111, flexWrap: 'wrap' }}
              >
                {depts.map((d) => (
                  <span
                    key={d.label}
                    style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: 4,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      fontFamily: 'JetBrains Mono, monospace',
                      background: `${d.color}15`,
                      color: d.color,
                      border: `1px solid ${d.color}30`,
                    }}
                  >
                    {d.label}
                  </span>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Metrics row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isVisible && optimized ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.5 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem',
          }}
        >
          {metrics.map((m) => (
            <div
              key={m.label}
              style={{
                padding: '1.25rem',
                borderRadius: 10,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.25rem', marginBottom: '0.375rem' }}>{m.icon}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--accent-cyan)', fontFamily: 'JetBrains Mono, monospace' }}>{m.value}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{m.label}</div>
            </div>
          ))}
        </motion.div>
        <p className="label-illustrative" style={{ textAlign: 'center', marginTop: '0.75rem' }}>All values are illustrative prototype scenarios</p>
      </div>
    </section>
  );
}
