import { motion } from 'framer-motion';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { HardHat, Radio, Zap } from 'lucide-react';

export default function ProblemSection() {
  const { ref, isVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.1 });

  return (
    <section
      id="platform"
      ref={ref as unknown as React.RefObject<HTMLElement>}
      className="mesh-gradient-hero"
      style={{
        padding: '6rem 2rem',
        borderTop: '1px solid #F2F4F7',
      }}
      aria-labelledby="problem-heading"
    >
      <div className="container-site" style={{ display: 'flex', flexWrap: 'wrap', gap: '4rem', alignItems: 'center' }}>
        
        {/* Left: Text */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={isVisible ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ flex: '1 1 400px' }}
        >
          <span className="section-label" style={{ display: 'block', marginBottom: '1rem', color: '#64748B' }}>THE PROBLEM</span>
          <h2 id="problem-heading" className="section-heading" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '1.5rem', color: '#0F172A', lineHeight: 1.15 }}>
            Railway maintenance is interconnected.<br/>
            <span className="text-gradient-blue">Planning shouldn’t be isolated.</span>
          </h2>
          <p className="section-subheading" style={{ fontSize: '1.125rem', color: '#64748B', lineHeight: 1.6 }}>
            Today, each department plans maintenance independently,
            leading to under-utilized blocks, poor coordination
            and operational disruptions.
          </p>
        </motion.div>

        {/* Right: Premium Cards */}
        <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            {
              title: 'ENGINEERING',
              desc: 'Track, bridges, civil assets and infrastructure defects',
              icon: <HardHat size={24} />,
              color: '#1B6B45'
            },
            {
              title: 'S&T',
              desc: 'Signalling, telecom and electronic systems',
              icon: <Radio size={24} />,
              color: '#7C3AED'
            },
            {
              title: 'TRD',
              desc: 'OHE, power supply and traction distribution',
              icon: <Zap size={24} />,
              color: '#D97706'
            }
          ].map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, x: 24 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              style={{
                background: '#FFFFFF',
                border: '1px solid rgba(29,78,216,0.1)',
                borderRadius: 16,
                padding: '1.5rem 1.75rem',
                display: 'flex', alignItems: 'center', gap: '1.5rem',
                boxShadow: '0 4px 16px rgba(16,24,40,0.04)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'default',
              }}
              whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(16,24,40,0.08)' }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: `${card.color}10`, color: card.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {card.icon}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A', marginBottom: 4 }}>{card.title}</div>
                <div style={{ fontSize: '0.875rem', color: '#64748B', lineHeight: 1.5 }}>{card.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
