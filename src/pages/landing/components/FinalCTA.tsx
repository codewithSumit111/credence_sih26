import { motion } from 'framer-motion';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { ArrowRight } from 'lucide-react';
import { openPrototype } from '../lib/landingConfig';

export default function FinalCTA() {
  const { ref, isVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.15 });

  return (
    <section
      ref={ref as unknown as React.RefObject<HTMLElement>}
      style={{ position: 'relative', overflow: 'hidden', background: '#FFFFFF', padding: '6rem 2rem' }}
      aria-labelledby="cta-heading"
    >
      {/* Subtle top border */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, #D9E2EC, transparent)' }} />

      {/* Background dot pattern */}
      <div className="bg-dot-pattern" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />

      {/* Subtle blue gradient center */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600, height: 400, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(29,78,216,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="container-site" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <span className="section-label" style={{ display: 'block', marginBottom: '1.5rem' }}>Ready to Explore?</span>

          <h2
            id="cta-heading"
            className="font-display"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '1.5rem', maxWidth: 680, margin: '0 auto 1.5rem' }}
          >
            <span style={{ color: '#101828' }}>From maintenance requests</span>
            <br />
            <span className="text-gradient-blue">to intelligent block decisions.</span>
          </h2>

          <p className="section-subheading" style={{ maxWidth: 500, margin: '0 auto 3rem', fontSize: '1.0625rem' }}>
            Transform fragmented maintenance demand into coordinated, explainable,
            and train-aware planning with AI decision intelligence.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.button
              className="btn-primary"
              style={{ fontSize: '1rem', padding: '1rem 2.25rem' }}
              onClick={openPrototype}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              Enter Planning System
              <ArrowRight size={18} />
            </motion.button>
            <motion.button
              className="btn-ghost"
              style={{ fontSize: '1rem', padding: '1rem 2.25rem' }}
              onClick={() => document.querySelector('#pipeline')?.scrollIntoView({ behavior: 'smooth' })}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              Explore Architecture
            </motion.button>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
            style={{ display: 'flex', gap: '2.5rem', justifyContent: 'center', marginTop: '3rem', flexWrap: 'wrap' }}
          >
            {['Explainable AI', 'Hard-Constraint Feasibility', 'Multi-Dept. Coordination', 'Human Oversight'].map((tag) => (
              <span key={tag} style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span style={{ color: '#059669', fontWeight: 700 }}>✓</span>
                {tag}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
