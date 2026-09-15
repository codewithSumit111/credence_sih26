import { motion } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { TrendingUp, TrendingDown } from 'lucide-react';

const metrics = [
  { label: 'Asset Availability', direction: 'up', color: '#059669', desc: 'More assets made available through coordinated multi-department block planning.' },
  { label: 'Block Utilisation', direction: 'up', color: '#1D4ED8', desc: 'Higher proportion of each block window utilized through job consolidation.' },
  { label: 'Train Disruption', direction: 'down', color: '#EF4444', desc: 'Reduced train impact by optimizing block windows around traffic patterns.' },
  { label: 'Multi-Dept. Coordination', direction: 'up', color: '#7C3AED', desc: 'Engineering, S&T, and TRD maintenance consolidated into compatible blocks.' },
  { label: 'Unplanned Downtime', direction: 'down', color: '#D97706', desc: 'Risk-driven prioritization reduces reactive emergency interventions.' },
  { label: 'Planning Explainability', direction: 'up', color: '#0EA5E9', desc: 'Every recommendation is traceable, auditable, and human-verifiable.' },
];

export default function ImpactMetrics() {
  const { ref, isVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.08 });

  return (
    <section
      ref={ref as unknown as React.RefObject<HTMLElement>}
      className="section-padding"
      style={{ background: '#EEF3F8' }}
      aria-labelledby="impact-heading"
    >
      <div className="container-site">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '3.5rem' }}
        >
          <span className="section-label" style={{ display: 'block', marginBottom: '0.875rem' }}>Impact Areas</span>
          <h2 id="impact-heading" className="section-heading" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', marginBottom: '1rem' }}>
            Intelligence that moves the needle
          </h2>
          <p className="section-subheading" style={{ maxWidth: 480, margin: '0 auto' }}>
            Key operational dimensions improved through AI-driven block planning.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.125rem' }}>
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 24 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="metric-card"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: `${m.color}10`,
                  border: `1px solid ${m.color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {m.direction === 'up'
                    ? <TrendingUp size={20} style={{ color: m.color }} />
                    : <TrendingDown size={20} style={{ color: m.color }} />}
                </div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: m.color, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'JetBrains Mono' }}>
                  {m.direction === 'up' ? '↑ IMPROVEMENT' : '↓ REDUCTION'}
                </div>
              </div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#101828', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                {m.label}
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#667085', lineHeight: 1.65 }}>{m.description}</p>
              <div style={{ height: 2, background: m.color, borderRadius: 1, marginTop: '1.25rem', opacity: 0.2 }} />
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ delay: 0.7 }}
          className="label-illustrative"
          style={{ textAlign: 'center', marginTop: '2rem' }}
        >
          Directional indicators only — actual results depend on deployment and operational context
        </motion.p>
      </div>
    </section>
  );
}
