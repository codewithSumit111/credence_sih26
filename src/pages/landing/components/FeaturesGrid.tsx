import { motion } from 'framer-motion';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import {
  ShieldAlert, CalendarClock, Zap, Database,
  BarChart3, Lock, BrainCircuit, Link2,
} from 'lucide-react';

const features = [
  {
    icon: <ShieldAlert size={22} />,
    title: 'AI Risk Assessment',
    desc: 'XGBoost scores asset maintenance risk using real-world data.',
    color: '#D97706',
  },
  {
    icon: <CalendarClock size={22} />,
    title: 'Optimized Scheduling',
    desc: 'CP-SAT builds the best block plan based on constraints and priorities.',
    color: '#082b71',
  },
  {
    icon: <Zap size={22} />,
    title: 'Real-time Availability',
    desc: 'Redis enables fast corridor checks and near real-time replanning.',
    color: '#f88100',
  },
  {
    icon: <Database size={22} />,
    title: 'Secure & Reliable Data',
    desc: 'PostgreSQL ensures data integrity and prevents double-booking.',
    color: '#7C3AED',
  },
  {
    icon: <BarChart3 size={22} />,
    title: 'Live Visualization',
    desc: 'React + Tailwind power Gantt views and corridor maps for complete visibility.',
    color: '#059669',
  },
  {
    icon: <Lock size={22} />,
    title: 'Role-Based Access',
    desc: 'RBAC + JWT secures access for Depot Incharge, TPC, CTPC and COA.',
    color: '#B8860B',
  },
  {
    icon: <BrainCircuit size={22} />,
    title: 'Explainable AI',
    desc: 'SHAP provides clear, human-readable explanations for every recommendation.',
    color: '#082b71',
  },
  {
    icon: <Link2 size={22} />,
    title: 'Integrated End-to-End',
    desc: 'One system. No hand-offs. Just faster, smarter decisions.',
    color: '#f88100',
  },
];

export default function FeaturesGrid() {
  const { ref, isVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.06 });

  return (
    <section
      id="platform"
      ref={ref as unknown as React.RefObject<HTMLElement>}
      className="section-padding"
      style={{ background: '#F4F9F6', borderTop: '1px solid #E6F0EA' }}
      aria-labelledby="features-heading"
    >
      <div className="container-site">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: '3.5rem' }}
        >
          <span className="section-label" style={{ display: 'block', marginBottom: '0.875rem', color: '#5A7A6C' }}>
            KEY FEATURES
          </span>
          <h2 id="features-heading" className="section-heading" style={{
            fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', marginBottom: '1rem',
          }}>
            Everything You Need for{' '}
            <span className="text-gradient-green">Intelligent Block Planning</span>
          </h2>
        </motion.div>

        {/* Grid: 2 rows × 4 columns */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1.125rem',
        }}>
          {features.map((f, i) => {
            // Wave stagger: row × 4 + col creates a diagonal delay
            const row = Math.floor(i / 4);
            const col = i % 4;
            const delay = (row + col) * 0.08 + 0.15;

            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 28 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay }}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E6F0EA',
                  borderRadius: 16,
                  padding: '1.75rem',
                  cursor: 'default',
                  transition: 'box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease',
                }}
                whileHover={{
                  y: -4,
                  boxShadow: '0 12px 32px rgba(16,40,24,0.08)',
                  borderColor: `${f.color}30`,
                }}
              >
                {/* Icon */}
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: `${f.color}10`,
                  border: `1px solid ${f.color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: f.color, marginBottom: '1.25rem',
                }}>
                  {f.icon}
                </div>

                {/* Title */}
                <h3 style={{
                  fontSize: '0.9375rem', fontWeight: 700, color: '#122A1F',
                  marginBottom: '0.5rem', lineHeight: 1.3,
                }}>
                  {f.title}
                </h3>

                {/* Description */}
                <p style={{
                  fontSize: '0.825rem', color: '#5A7A6C', lineHeight: 1.6,
                }}>
                  {f.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
