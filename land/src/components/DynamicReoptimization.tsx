import { motion } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const steps = [
  { label: 'CURRENT PLAN', icon: '📋', desc: 'Optimized block schedule in place', color: '#1D4ED8' },
  { label: 'NEW DEFECT', icon: '⚠', desc: 'Urgent defect detected on track section', color: '#D97706' },
  { label: 'TRAIN DELAY', icon: '🚆', desc: 'Inbound freight delay alters corridor window', color: '#EF4444' },
  { label: 'RESOURCE CONFLICT', icon: '⚡', desc: 'Engineering crew overlap identified', color: '#D97706' },
  { label: 'AI RE-OPTIMIZATION', icon: '🔄', desc: 'Rolling-horizon re-optimization triggered', color: '#7C3AED' },
  { label: 'UPDATED BLOCK PLAN', icon: '✅', desc: 'Revised plan respects all constraints', color: '#059669' },
];

export default function DynamicReoptimization() {
  const { ref, isVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.1 });

  return (
    <section
      id="intelligence"
      ref={ref as unknown as React.RefObject<HTMLElement>}
      className="section-padding"
      style={{ background: '#FFFFFF' }}
      aria-labelledby="reopt-heading"
    >
      <div className="container-site">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '3.5rem' }}
        >
          <span className="section-label" style={{ display: 'block', marginBottom: '0.875rem' }}>Dynamic Re-optimization</span>
          <h2 id="reopt-heading" className="section-heading" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', marginBottom: '1rem' }}>
            When conditions change,
            <span className="text-gradient-blue"> the plan adapts.</span>
          </h2>
          <p className="section-subheading" style={{ maxWidth: 520, margin: '0 auto' }}>
            Rolling-horizon planning continuously refines schedules as maintenance demand,
            train movements, and operational constraints evolve.
          </p>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 520, margin: '0 auto' }}>
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <div style={{
                width: '100%', padding: '1rem 1.375rem', borderRadius: 10,
                background: '#FFFFFF', border: `1px solid ${step.color}20`,
                display: 'flex', alignItems: 'center', gap: '1rem',
                boxShadow: step.label === 'AI RE-OPTIMIZATION' ? `0 4px 16px ${step.color}18` : '0 1px 4px rgba(16,24,40,0.05)',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: `${step.color}10`,
                  border: `1px solid ${step.color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.125rem', flexShrink: 0,
                }}>
                  {step.icon}
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: step.color, letterSpacing: '0.08em', fontFamily: 'JetBrains Mono', marginBottom: 2 }}>
                    {step.label}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#667085' }}>{step.desc}</div>
                </div>
              </div>
              {i < steps.length - 1 && (
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={isVisible ? { scaleY: 1 } : {}}
                  transition={{ delay: i * 0.1 + 0.3, duration: 0.3 }}
                  style={{
                    width: 2, height: 24,
                    background: `linear-gradient(180deg, ${step.color}50, ${steps[i+1].color}30)`,
                    transformOrigin: 'top', margin: '3px 0',
                  }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
