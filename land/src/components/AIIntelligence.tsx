import { motion } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const cards = [
  {
    title: 'Risk Intelligence',
    subtitle: 'XGBoost Priority Model',
    color: '#D97706',
    lightBg: '#FFFBEB',
    border: 'rgba(217,119,6,0.15)',
    body: 'Asset criticality × defect severity × overdue days × train dependency → unified priority score driving block urgency.',
    bars: [
      { label: 'Asset Criticality', value: 95 },
      { label: 'Risk Score', value: 90 },
      { label: 'Overdue Factor', value: 82 },
    ],
  },
  {
    title: 'Hybrid Optimizer',
    subtitle: 'CP-SAT + GNN + ALNS',
    color: '#1D4ED8',
    lightBg: '#EFF6FF',
    border: 'rgba(29,78,216,0.15)',
    body: 'CP-SAT validates feasibility against hard constraints. GNN guides neighbourhood search. ALNS iteratively refines to optimality.',
    bars: [
      { label: 'Feasibility Check', value: 100 },
      { label: 'GNN Guidance', value: 88 },
      { label: 'ALNS Refinement', value: 91 },
    ],
  },
  {
    title: 'Train Evaluation',
    subtitle: 'Time-Dependent A*',
    color: '#0EA5E9',
    lightBg: '#F0F9FF',
    border: 'rgba(14,165,233,0.15)',
    body: 'Time-dependent shortest-path algorithm quantifies delay, rerouting, and waiting time for each candidate block window.',
    bars: [
      { label: 'Impact Accuracy', value: 94 },
      { label: 'Rerouting Opt.', value: 86 },
      { label: 'Delay Min.', value: 88 },
    ],
  },
];

export default function AIIntelligence() {
  const { ref, isVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.08 });

  return (
    <section
      id="intelligence"
      ref={ref as unknown as React.RefObject<HTMLElement>}
      className="section-padding"
      style={{ background: '#FFFFFF' }}
      aria-labelledby="intelligence-heading"
    >
      <div className="container-site">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '3.5rem' }}
        >
          <span className="section-label" style={{ display: 'block', marginBottom: '0.875rem' }}>Intelligence Stack</span>
          <h2 id="intelligence-heading" className="section-heading" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.625rem)', marginBottom: '1rem' }}>
            Three layers of decision intelligence
          </h2>
          <p className="section-subheading" style={{ maxWidth: 520, margin: '0 auto' }}>
            Risk prediction, constraint-based optimization, and train-aware evaluation
            work in concert to produce the optimal block recommendation.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 28 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              style={{
                background: '#FFFFFF',
                borderRadius: 16,
                border: `1px solid ${card.border}`,
                padding: '1.75rem',
                boxShadow: '0 2px 12px rgba(16,24,40,0.05)',
                transition: 'box-shadow 0.25s ease, transform 0.25s ease',
              }}
              whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(16,24,40,0.1)' }}
            >
              {/* Header */}
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: card.lightBg, border: `1px solid ${card.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1.25rem',
              }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: card.color }} />
              </div>

              <div style={{ marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.6875rem', color: card.color, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'JetBrains Mono' }}>
                  {card.subtitle}
                </span>
              </div>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#101828', marginBottom: '0.75rem', lineHeight: 1.3 }}>
                {card.title}
              </h3>
              <p style={{ fontSize: '0.825rem', color: '#667085', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                {card.body}
              </p>

              {/* Bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {card.bars.map((bar) => (
                  <div key={bar.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.75rem', color: '#667085' }}>{bar.label}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: card.color, fontFamily: 'JetBrains Mono' }}>
                        {bar.value}%
                      </span>
                    </div>
                    <div className="score-bar-track">
                      <motion.div
                        className="score-bar-fill"
                        style={{ background: `linear-gradient(90deg, ${card.color}90, ${card.color})` }}
                        initial={{ width: 0 }}
                        animate={isVisible ? { width: `${bar.value}%` } : {}}
                        transition={{ duration: 1.2, delay: i * 0.12 + 0.4 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="label-illustrative" style={{ marginTop: '1rem' }}>Illustrative values</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
