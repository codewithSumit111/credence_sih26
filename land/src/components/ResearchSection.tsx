import { motion } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const papers = [
  { title: 'Integrated Train Scheduling and Maintenance Optimization', year: '2022', method: 'Mixed-Integer Programming + Rolling Horizon', relevance: 'Multi-dept. block planning framework', color: '#1D4ED8' },
  { title: 'Dynamic Maintenance Scheduling under Operational Uncertainty', year: '2021', method: 'Stochastic Programming, ALNS', relevance: 'Dynamic re-optimization approach', color: '#7C3AED' },
  { title: 'Predictive Maintenance in Railway Infrastructure', year: '2023', method: 'XGBoost, LSTM, Survival Models', relevance: 'Risk & priority scoring engine', color: '#059669' },
  { title: 'GNN-Based Railway Network Maintenance Scheduling', year: '2023', method: 'Graph Neural Networks, RL', relevance: 'GNN-guided ALNS search', color: '#D97706' },
  { title: 'ALNS for Railway Maintenance Window Optimization', year: '2020', method: 'Adaptive Large Neighbourhood Search', relevance: 'Core ALNS optimization layer', color: '#0EA5E9' },
  { title: 'AI Applications in Indian Railways Maintenance', year: '2022', method: 'Predictive Analytics, Digital Twin', relevance: 'Indian Railways operational context', color: '#1D4ED8' },
];

export default function ResearchSection() {
  const { ref, isVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.08 });

  return (
    <section
      id="research"
      ref={ref as unknown as React.RefObject<HTMLElement>}
      className="section-padding"
      style={{ background: '#F7F9FC' }}
      aria-labelledby="research-heading"
    >
      <div className="container-site">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: '3rem' }}
        >
          <span className="section-label" style={{ display: 'block', marginBottom: '0.875rem' }}>Research Foundation</span>
          <h2 id="research-heading" className="section-heading" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', maxWidth: 600, marginBottom: '1rem' }}>
            Architecture grounded in
            <span className="text-gradient-blue"> published research.</span>
          </h2>
          <p className="section-subheading" style={{ maxWidth: 560 }}>
            Every component of the optimization pipeline is informed by peer-reviewed academic work
            in operations research, machine learning, and railway engineering.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.125rem' }}>
          {papers.map((paper, i) => (
            <motion.div
              key={paper.title}
              initial={{ opacity: 0, y: 24 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              style={{
                padding: '1.5rem', borderRadius: 12,
                background: '#FFFFFF', border: '1px solid #E4EDF6',
                boxShadow: '0 1px 4px rgba(16,24,40,0.04)',
                transition: 'box-shadow 0.25s ease, border-color 0.25s ease',
                cursor: 'default',
              }}
              whileHover={{ boxShadow: '0 8px 24px rgba(16,24,40,0.08)', y: -2, borderColor: `${paper.color}30` }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
                <span style={{
                  padding: '0.2rem 0.6rem', borderRadius: 4, fontSize: '0.65rem', fontWeight: 700,
                  background: `${paper.color}10`, color: paper.color,
                  border: `1px solid ${paper.color}20`, fontFamily: 'JetBrains Mono',
                }}>{paper.year}</span>
              </div>

              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#101828', lineHeight: 1.45, marginBottom: '0.75rem' }}>
                {paper.title}
              </h3>

              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Method: </span>
                <span style={{ fontSize: '0.7rem', color: paper.color, fontFamily: 'JetBrains Mono', fontWeight: 600 }}>{paper.method}</span>
              </div>

              <div style={{
                padding: '0.5rem 0.75rem', borderRadius: 6,
                background: `${paper.color}08`, border: `1px solid ${paper.color}15`,
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: paper.color, flexShrink: 0 }} />
                <span style={{ fontSize: '0.75rem', color: '#344054' }}>Supports: {paper.relevance}</span>
              </div>
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
          Representative references — not exhaustive. Full bibliography in technical documentation.
        </motion.p>
      </div>
    </section>
  );
}
