import { motion } from 'framer-motion';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

const reasons = [
  'High-priority TRD defect identified',
  'Engineering + S&T spatial compatibility confirmed',
  'Corridor window available — traffic low',
  'Lower estimated train impact vs. alternatives',
  'Required resources and personnel available',
];

export default function Explainability() {
  const { ref, isVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.15 });
  const [visibleReasons, setVisibleReasons] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setVisibleReasons(count);
      if (count >= reasons.length) clearInterval(interval);
    }, 450);
    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <section
      ref={ref as unknown as React.RefObject<HTMLElement>}
      className="section-padding"
      style={{ background: '#EEF3F8' }}
      aria-labelledby="explain-heading"
    >
      <div className="container-site">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="section-label" style={{ display: 'block', marginBottom: '1rem' }}>Explainability</span>
            <h2 id="explain-heading" className="section-heading" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', marginBottom: '1.25rem' }}>
              Every recommendation<br />
              <span className="text-gradient-blue">comes with a reason.</span>
            </h2>
            <p className="section-subheading" style={{ marginBottom: '2rem', maxWidth: 400 }}>
              The AI doesn't deliver a black-box answer. Every block recommendation includes a full
              reasoning trace — so railway authorities can validate, override, or approve with confidence.
            </p>
            <button
              className="btn-ghost"
              aria-label="View decision logic"
            >
              View Decision Logic
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div style={{
              background: '#FFFFFF', border: '2px solid #1D4ED8',
              borderRadius: 16, padding: '2rem',
              boxShadow: '0 4px 24px rgba(29,78,216,0.08)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid #F2F4F7' }}>
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#94A3B8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Recommended Block</div>
                  <div style={{ fontWeight: 800, fontSize: '1.125rem', color: '#101828' }}>PUNE — LONAVALA</div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.875rem', color: '#1D4ED8', marginTop: 2 }}>01:30 — 03:15</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-blue">Optimal</span>
                  <div className="label-illustrative" style={{ marginTop: 4 }}>Illustrative</div>
                </div>
              </div>

              <div style={{ marginBottom: '0.875rem', fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                WHY THIS BLOCK?
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {reasons.map((reason, i) => (
                  <motion.div
                    key={reason}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: i < visibleReasons ? 1 : 0.2, x: i < visibleReasons ? 0 : 12 }}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}
                  >
                    <CheckCircle size={16} style={{ color: '#059669', flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: '0.875rem', color: '#344054', lineHeight: 1.5 }}>{reason}</span>
                  </motion.div>
                ))}
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['TRD', 'ENGINEERING', 'S&T'].map((d) => (
                  <span key={d} className="tech-tag">{d}</span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
