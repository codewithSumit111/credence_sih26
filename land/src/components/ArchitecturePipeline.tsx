import { useState } from 'react';
import { motion } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const steps = [
  {
    id: '01', title: 'Data Integration', color: '#1D4ED8',
    description: 'Unified ingestion from maintenance and operational systems.',
    tags: ['TMS', 'SMMS', 'TDMS', 'BDMS', 'COA', 'Timetable', 'Goods Forecast'],
  },
  {
    id: '02', title: 'Risk Intelligence', color: '#D97706',
    description: 'XGBoost-based asset risk prediction and maintenance priority scoring.',
    tags: ['XGBoost', 'Risk Prediction', 'Priority Score', 'Defect Severity'],
  },
  {
    id: '03', title: 'Block Formation', color: '#7C3AED',
    description: 'Candidate block generation with spatial, temporal, and resource constraints.',
    tags: ['Spatial', 'Temporal', 'Resource', 'Safety', 'Operational Compat.'],
  },
  {
    id: '04', title: 'Optimization', color: '#059669',
    description: 'Hybrid CP-SAT feasibility solver guided by GNN and refined with ALNS.',
    tags: ['CP-SAT', 'ALNS', 'GNN Guidance', 'Feasibility'],
  },
  {
    id: '05', title: 'Train Impact', color: '#0EA5E9',
    description: 'Time-dependent evaluation of block impact on train paths and timetables.',
    tags: ['Time-Dep. A*', 'Delay', 'Rerouting', 'Waiting Time'],
  },
  {
    id: '06', title: 'Decision', color: '#1D4ED8',
    description: 'Explainable, multi-department optimized block recommendation.',
    tags: ['Optimized', 'Explainable', 'Multi-dept.', 'Block Plan'],
  },
];

export default function ArchitecturePipeline() {
  const { ref, isVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.08 });
  const [active, setActive] = useState<number | null>(null);

  return (
    <section
      id="pipeline"
      ref={ref as unknown as React.RefObject<HTMLElement>}
      className="section-padding"
      style={{ background: '#F7F9FC' }}
      aria-labelledby="pipeline-heading"
    >
      <div className="container-site">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '3.5rem' }}
        >
          <span className="section-label" style={{ display: 'block', marginBottom: '0.875rem' }}>Core Pipeline</span>
          <h2 id="pipeline-heading" className="section-heading" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.625rem)', marginBottom: '1rem' }}>
            From Data to Decision
          </h2>
          <p className="section-subheading" style={{ maxWidth: 520, margin: '0 auto' }}>
            Six interconnected intelligence stages transform raw maintenance demand into
            coordinated, train-aware block recommendations.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(196px, 1fr))', gap: '1rem' }}>
          {steps.map((step, i) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 28 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className={`pipeline-step ${active === i ? 'active' : ''}`}
              style={{ borderColor: active === i ? step.color : undefined, cursor: 'pointer' }}
              onClick={() => setActive(active === i ? null : i)}
              tabIndex={0}
              role="button"
              aria-expanded={active === i}
              aria-label={`Pipeline step ${step.id}: ${step.title}`}
              onKeyDown={(e) => e.key === 'Enter' && setActive(active === i ? null : i)}
            >
              <div className="pipeline-step-number" style={{ color: step.color, marginBottom: '0.625rem' }}>{step.id}</div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#101828', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                {step.title}
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#667085', lineHeight: 1.6, marginBottom: '1rem' }}>
                {step.description}
              </p>
              <div style={{ height: 2, background: step.color, borderRadius: 1, opacity: active === i ? 1 : 0.2 }} />
              {active === i && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}
                >
                  {step.tags.map((tag) => (
                    <span key={tag} className="tech-tag" style={{
                      background: `${step.color}10`,
                      color: step.color,
                      border: `1px solid ${step.color}20`,
                    }}>{tag}</span>
                  ))}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ delay: 0.7 }}
          style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem', color: '#98A2B3' }}
        >
          Click any stage to expand details
        </motion.p>
      </div>
    </section>
  );
}
