import { motion } from 'framer-motion';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { Search, CalendarClock, CheckSquare, Radio, ArrowRight } from 'lucide-react';
import { openPrototype } from '../lib/landingConfig';

const steps = [
  {
    icon: <Search size={24} />,
    title: 'Assess',
    desc: 'Analyze asset health & risk using XGBoost predictive scoring across all departments.',
    color: '#D97706',
    detail: 'TMS • SMMS • TDMS • BDMS',
  },
  {
    icon: <CalendarClock size={24} />,
    title: 'Plan',
    desc: 'Generate optimized block schedules with CP-SAT and ALNS, respecting all hard constraints.',
    color: '#1B6B45',
    detail: 'Multi-dept consolidation',
  },
  {
    icon: <CheckSquare size={24} />,
    title: 'Approve',
    desc: 'Controller review & grant with full AI explainability — SHAP reasoning for every decision.',
    color: '#7C3AED',
    detail: 'Human-in-the-loop',
  },
  {
    icon: <Radio size={24} />,
    title: 'Operate',
    desc: 'Monitor, re-plan, and keep trains on track with rolling-horizon dynamic re-optimization.',
    color: '#0D9488',
    detail: 'Real-time adaptation',
  },
];

export default function PipelineFlow() {
  const { ref, isVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.12 });

  return (
    <section
      id="pipeline"
      ref={ref as unknown as React.RefObject<HTMLElement>}
      className="section-padding"
      style={{ background: '#FFFFFF' }}
      aria-labelledby="pipeline-heading"
    >
      <div className="container-site">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '4rem' }}
        >
          <span className="section-label" style={{ display: 'block', marginBottom: '0.875rem' }}>
            HOW IT WORKS
          </span>
          <h2 id="pipeline-heading" className="section-heading" style={{
            fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', marginBottom: '1rem',
          }}>
            From Data to Decisions —{' '}
            <span className="text-gradient-blue">In One Flow</span>
          </h2>
          <p className="section-subheading" style={{ maxWidth: 560, margin: '0 auto' }}>
            KAVACH brings together risk analysis, optimization, and real-time operations
            in a single, seamless pipeline.
          </p>
        </motion.div>

        {/* Pipeline Steps */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0',
          position: 'relative', maxWidth: 1100, margin: '0 auto',
        }}>
          {/* Connecting line behind steps */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isVisible ? { scaleX: 1 } : {}}
            transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
            style={{
              position: 'absolute', top: 52, left: '12%', right: '12%', height: 2,
              background: 'linear-gradient(90deg, #D97706, #1B6B45, #7C3AED, #0D9488)',
              transformOrigin: 'left center', zIndex: 0, opacity: 0.25,
              borderRadius: 1,
            }}
          />

          {/* Traveling glow dot */}
          {isVisible && (
            <motion.div
              animate={{ left: ['12%', '88%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
              style={{
                position: 'absolute', top: 48, width: 10, height: 10,
                borderRadius: '50%', background: '#1B6B45',
                boxShadow: '0 0 12px rgba(27,107,69,0.5), 0 0 24px rgba(27,107,69,0.25)',
                zIndex: 1,
              }}
            />
          )}

          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 32 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.15 + i * 0.15, ease: 'easeOut' }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                textAlign: 'center', padding: '0 1rem', position: 'relative', zIndex: 5,
              }}
            >
              {/* Step number */}
              <motion.div
                animate={isVisible ? {
                  scale: [1, 1.06, 1],
                  boxShadow: [
                    `0 0 0 rgba(${step.color === '#D97706' ? '217,119,6' : step.color === '#1B6B45' ? '27,107,69' : step.color === '#7C3AED' ? '124,58,237' : '13,148,136'},0)`,
                    `0 0 20px rgba(${step.color === '#D97706' ? '217,119,6' : step.color === '#1B6B45' ? '27,107,69' : step.color === '#7C3AED' ? '124,58,237' : '13,148,136'},0.25)`,
                    `0 0 0 rgba(${step.color === '#D97706' ? '217,119,6' : step.color === '#1B6B45' ? '27,107,69' : step.color === '#7C3AED' ? '124,58,237' : '13,148,136'},0)`,
                  ],
                } : {}}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}
                style={{
                  width: 64, height: 64, borderRadius: 18,
                  background: `${step.color}10`,
                  border: `2px solid ${step.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: step.color, marginBottom: '1.25rem',
                  cursor: 'default',
                }}
              >
                {step.icon}
              </motion.div>

              {/* Step counter */}
              <div style={{
                fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.15em',
                color: step.color, fontFamily: 'JetBrains Mono', marginBottom: '0.5rem',
              }}>
                {String(i + 1)}. {step.title.toUpperCase()}
              </div>

              {/* Title */}
              <h3 style={{
                fontSize: '1.0625rem', fontWeight: 700, color: '#122A1F',
                marginBottom: '0.5rem', lineHeight: 1.3,
              }}>
                {step.title}
              </h3>

              {/* Description */}
              <p style={{
                fontSize: '0.825rem', color: '#5A7A6C', lineHeight: 1.6,
                marginBottom: '0.75rem',
              }}>
                {step.desc}
              </p>

              {/* Detail tag */}
              <span style={{
                fontSize: '0.6rem', fontWeight: 700, padding: '0.2rem 0.6rem',
                borderRadius: 4, background: `${step.color}08`,
                border: `1px solid ${step.color}18`,
                color: step.color, fontFamily: 'JetBrains Mono',
                letterSpacing: '0.04em',
              }}>
                {step.detail}
              </span>

              {/* Arrow connector (except last) */}
              {i < steps.length - 1 && (
                <div style={{
                  position: 'absolute', right: -12, top: 48,
                  color: '#C5D9CE', zIndex: 10,
                }}>
                  <ArrowRight size={16} />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1, duration: 0.5 }}
          style={{ textAlign: 'center', marginTop: '3.5rem' }}
        >
          <motion.button
            className="btn-primary"
            onClick={openPrototype}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            See It In Action
            <ArrowRight size={17} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
