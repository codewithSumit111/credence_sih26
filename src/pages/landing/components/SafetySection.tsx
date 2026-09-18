import { motion } from 'framer-motion';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { Shield, Eye, Lock, CheckCircle2, UserCheck } from 'lucide-react';

const trustChain = [
  { label: 'AI Recommendation', icon: <Eye size={18} />, desc: 'Explainable, multi-department optimized block proposal', color: '#1B6B45' },
  { label: 'Dept. Validation', icon: <UserCheck size={18} />, desc: 'Department heads review maintenance jobs and resource assignments', color: '#7C3AED' },
  { label: 'Safety Verification', icon: <Shield size={18} />, desc: 'Hard constraint checks — safety, timetable, corridor availability', color: '#D4A843' },
  { label: 'Authorized Approval', icon: <Lock size={18} />, desc: 'Competent railway authority grants or modifies the block', color: '#059669' },
  { label: 'Execution', icon: <CheckCircle2 size={18} />, desc: 'Block executed under authorized supervision', color: '#0D9488' },
];

const principles = [
  { icon: <Eye size={17} />, label: 'Full Explainability', desc: 'Every recommendation includes a complete reasoning trace.' },
  { icon: <Shield size={17} />, label: 'Hard Constraint Validation', desc: 'Safety, timetable, and corridor constraints are never violated.' },
  { icon: <UserCheck size={17} />, label: 'Human Oversight', desc: 'AI recommends. Railway authorities decide.' },
  { icon: <Lock size={17} />, label: 'Auditability', desc: 'Full decision history preserved for review and compliance.' },
];

export default function SafetySection() {
  const { ref, isVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.08 });

  return (
    <section
      ref={ref as unknown as React.RefObject<HTMLElement>}
      className="section-padding"
      style={{ background: '#FFFFFF' }}
      aria-labelledby="safety-heading"
    >
      <div className="container-site">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '3.5rem' }}
        >
          <span className="section-label" style={{ display: 'block', marginBottom: '0.875rem' }}>Safety & Oversight</span>
          <h2 id="safety-heading" className="section-heading" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', marginBottom: '1rem' }}>
            AI recommends.
            <span className="text-gradient-accent"> Railway authorities decide.</span>
          </h2>
          <p className="section-subheading" style={{ maxWidth: 540, margin: '0 auto' }}>
            Every block recommendation passes through a rigorous human validation chain before any
            railway block is executed. The AI is a decision support tool — not a decision maker.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'start' }}>
          {/* Decision chain */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div style={{
              padding: '1.75rem', borderRadius: 16,
              background: '#F4F9F6', border: '1px solid #C5D9CE',
              boxShadow: '0 2px 12px rgba(16,40,24,0.04)',
            }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#5A7A6C', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                Decision Chain
              </div>
              {trustChain.map((step, i) => (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.2 + i * 0.09, duration: 0.45 }}
                  style={{ display: 'flex', gap: '1rem' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%',
                      background: '#FFFFFF', border: `1.5px solid ${step.color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: step.color, boxShadow: `0 2px 8px ${step.color}15`,
                    }}>
                      {step.icon}
                    </div>
                    {i < trustChain.length - 1 && (
                      <div style={{ width: 2, height: 28, background: `${step.color}20`, margin: '4px 0' }} />
                    )}
                  </div>
                  <div style={{ paddingBottom: i < trustChain.length - 1 ? '0.875rem' : '0' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#122A1F', marginBottom: 2 }}>{step.label}</div>
                    <div style={{ fontSize: '0.8rem', color: '#5A7A6C', lineHeight: 1.55 }}>{step.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Principles */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#5A7A6C', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
              Design Principles
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.5rem' }}>
              {principles.map((p, i) => (
                <motion.div
                  key={p.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  style={{
                    display: 'flex', gap: '1rem', padding: '1.125rem 1.25rem',
                    borderRadius: 10, background: '#FFFFFF',
                    border: '1px solid #E6F0EA', alignItems: 'flex-start',
                    boxShadow: '0 1px 4px rgba(16,40,24,0.04)',
                  }}
                >
                  <div style={{
                    width: 34, height: 34, borderRadius: 8,
                    background: '#F0FBF5', border: '1px solid rgba(27,107,69,0.18)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#1B6B45', flexShrink: 0,
                  }}>
                    {p.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#101828', marginBottom: 3 }}>{p.label}</div>
                    <div style={{ fontSize: '0.8rem', color: '#667085', lineHeight: 1.6 }}>{p.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div style={{
              padding: '1.25rem', borderRadius: 10,
              background: '#FFFBEB', border: '1px solid rgba(217,119,6,0.2)',
            }}>
              <p style={{ fontSize: '0.8125rem', color: '#344054', lineHeight: 1.7 }}>
                <strong style={{ color: '#D97706' }}>Important:</strong> This system does not autonomously grant,
                execute, or approve railway maintenance blocks. All recommendations require authorized
                railway personnel review and approval.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
