import { motion } from 'framer-motion';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const horizons = [
  { label: '52-WEEK STRATEGIC', period: 'Annual', color: '#1B6B45', tag: 'Strategic', desc: 'Long-range maintenance strategy aligned with infrastructure overhaul plans.' },
  { label: 'MONTHLY', period: '30-day rolling', color: '#D4A843', tag: 'Tactical', desc: 'Monthly planning with demand forecasts and resource allocation optimization.' },
  { label: 'WEEKLY', period: '7-day rolling', color: '#0D9488', tag: 'Operational', desc: 'Weekly block scheduling refined against current train movements and defect status.' },
  { label: 'EXECUTABLE BLOCK PLAN', period: 'Authorized output', color: '#059669', tag: 'Executable', desc: 'Final multi-department block plan ready for railway authority validation and approval.' },
];

export default function PlanningHorizons() {
  const { ref, isVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.1 });

  return (
    <section
      ref={ref as unknown as React.RefObject<HTMLElement>}
      className="section-padding"
      style={{ background: '#F4F9F6' }}
      aria-labelledby="horizons-heading"
    >
      <div className="container-site">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="section-label" style={{ display: 'block', marginBottom: '1rem' }}>Planning Horizons</span>
            <h2 id="horizons-heading" className="section-heading" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', marginBottom: '1.25rem' }}>
              From strategic intent to
              <span className="text-gradient-accent"> executable plan.</span>
            </h2>
            <p className="section-subheading" style={{ marginBottom: '2rem' }}>
              The optimization engine operates across multiple time horizons — providing a decision
              intelligence layer from annual maintenance strategy down to weekly executable block plans.
            </p>
            <div style={{
              padding: '1.25rem', borderRadius: 12,
              background: '#EDF5F0', border: '1px solid rgba(27,107,69,0.18)',
            }}>
              <p style={{ fontSize: '0.8125rem', color: '#2D4A3E', lineHeight: 1.7 }}>
                <strong>Positioned as:</strong> An optimization and decision intelligence layer
                that complements existing railway planning systems — not a replacement.
              </p>
            </div>
          </motion.div>

          <div>
            {horizons.map((h, i) => (
              <motion.div
                key={h.label}
                initial={{ opacity: 0, x: 24 }}
                animate={isVisible ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.55, delay: i * 0.1 }}
                style={{ display: 'flex', gap: '1.25rem' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: `${h.color}12`, border: `2px solid ${h.color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 800, color: h.color,
                    fontFamily: 'JetBrains Mono, monospace',
                    boxShadow: `0 2px 8px ${h.color}25`,
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  {i < horizons.length - 1 && (
                    <motion.div
                      initial={{ scaleY: 0 }}
                      animate={isVisible ? { scaleY: 1 } : {}}
                      transition={{ delay: i * 0.1 + 0.25, duration: 0.35 }}
                      style={{
                        width: 2, flex: 1, minHeight: 28,
                        background: `linear-gradient(180deg, ${h.color}50, ${horizons[i+1].color}25)`,
                        transformOrigin: 'top', margin: '4px 0',
                      }}
                    />
                  )}
                </div>

                <div style={{ paddingBottom: i < horizons.length - 1 ? '1.5rem' : '0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.08em', color: h.color, fontFamily: 'JetBrains Mono' }}>
                      {h.label}
                    </span>
                    <span className="badge" style={{ fontSize: '0.6rem', padding: '0.125rem 0.5rem', background: `${h.color}12`, color: h.color, border: `1px solid ${h.color}20` }}>
                      {h.tag}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginBottom: '0.25rem', fontFamily: 'JetBrains Mono' }}>{h.period}</div>
                  <p style={{ fontSize: '0.825rem', color: '#667085', lineHeight: 1.6 }}>{h.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
