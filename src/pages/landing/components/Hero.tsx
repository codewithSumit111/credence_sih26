import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, Play, ShieldCheck, Activity, BrainCircuit, Leaf, BarChart3, Calendar } from 'lucide-react';
import { openPrototype } from '../lib/landingConfig';
import trainBannerImg from '../../../assets/train_banner.jpg';

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  // Parallax for background
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);

  const scrollToNext = () => {
    document.querySelector('#platform')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={heroRef}
      id="hero"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        paddingTop: 68,
      }}
      aria-label="Hero section"
    >
      {/* ── Full-bleed Train Photo Background with Parallax ── */}
      <motion.div
        style={{
          position: 'absolute', inset: 0,
          y: bgY,
          backgroundImage: `url(${trainBannerImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          willChange: 'transform',
        }}
      />

      {/* Dark gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(8,43,113,0.92) 0%, rgba(10,61,128,0.85) 40%, rgba(15,42,100,0.65) 100%)',
      }} />

      {/* Subtle grid texture */}
      <div className="bg-grid-light" style={{ position: 'absolute', inset: 0, opacity: 0.15 }} />

      {/* ── Content ── */}
      <div style={{
        flex: 1, display: 'flex', position: 'relative', width: '100%',
        maxWidth: 1280, margin: '0 auto', zIndex: 10,
      }}>

        {/* ── LEFT: Text Content (~50%) ── */}
        <div style={{
          width: '50%', padding: '4rem 2rem 4rem 2rem',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}
          >
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.35rem 0.95rem', borderRadius: 9999,
              background: 'rgba(248,129,0,0.25)', border: '1px solid rgba(248,129,0,0.4)',
              fontSize: '0.72rem', fontWeight: 700, color: '#f88100', letterSpacing: '0.06em',
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%', background: '#f88100',
                boxShadow: '0 0 8px rgba(248,129,0,0.5)',
                animation: 'pulse-node 2s ease-in-out infinite',
              }} />
              IRCTC AI BLOCK PLANNING
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2 }}
            style={{
              fontFamily: 'Inter, sans-serif', fontWeight: 800,
              fontSize: 'clamp(2.25rem, 3.8vw, 3.5rem)',
              letterSpacing: '-0.03em', lineHeight: 1.08,
              color: '#FFFFFF', marginBottom: '1.5rem',
            }}
          >
            Smarter Planning<br/>
            for a Stronger<br/>
            <span style={{
              background: 'linear-gradient(135deg, #f88100 0%, #fbbf24 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Rail Network</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            style={{
              fontSize: '1.0625rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7,
              maxWidth: 460, marginBottom: '2.5rem',
            }}
          >
            Optimize block planning, maximize asset availability, and ensure safer,
            more efficient train operations — with the power of{' '}
            <strong style={{ color: 'rgba(255,255,255,0.95)', fontWeight: 600 }}>explainable AI</strong>.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.45 }}
            style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}
          >
            <motion.button
              onClick={openPrototype}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.9rem 2rem', background: '#f88100', color: '#fff',
                fontWeight: 600, fontSize: '0.9375rem', borderRadius: 10, border: 'none',
                cursor: 'pointer', boxShadow: '0 4px 16px rgba(248,129,0,0.35)',
                transition: 'all 0.2s ease',
              }}
            >
              Get Started
              <ArrowRight size={17} />
            </motion.button>
            <motion.button
              onClick={scrollToNext}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.9rem 2rem', background: 'rgba(255,255,255,0.1)',
                color: '#fff', fontWeight: 600, fontSize: '0.9375rem', borderRadius: 10,
                border: '1.5px solid rgba(255,255,255,0.25)', cursor: 'pointer',
                backdropFilter: 'blur(8px)', transition: 'all 0.2s ease',
              }}
            >
              <Play size={15} />
              Watch Demo
            </motion.button>
          </motion.div>
        </div>

        {/* ── RIGHT: Dashboard Preview Card (~50%) ── */}
        <div style={{
          width: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '3rem 1rem',
        }}>
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5, type: 'spring', damping: 20, stiffness: 100 }}
            style={{
              width: '100%', maxWidth: 480,
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(20px) saturate(1.4)',
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: 20, padding: '1.5rem',
              boxShadow: '0 24px 60px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.15)',
            }}
          >
            {/* Mini navbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7,
                background: 'linear-gradient(135deg, #0a3d80, #082b71)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                </svg>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.01em' }}>
                IRCTC
              </span>
              <div style={{ flex: 1 }} />
              {['Dashboard', 'Block Planning', 'Corridor Map'].map((tab, i) => (
                <span key={tab} style={{
                  fontSize: '0.55rem', fontWeight: 600, color: i === 0 ? '#f88100' : 'rgba(255,255,255,0.4)',
                  padding: '0.25rem 0.5rem', borderRadius: 5,
                  background: i === 0 ? 'rgba(248,129,0,0.12)' : 'transparent',
                }}>
                  {tab}
                </span>
              ))}
            </div>

            {/* Block Schedule header */}
            <div style={{
              background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '1rem',
              border: '1px solid rgba(255,255,255,0.1)', marginBottom: '0.75rem',
            }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
                BLOCK SCHEDULE
              </div>
              {/* Mini Gantt bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {[
                  { name: 'Delhi – Mumbai', w: '70%', color: '#f88100' },
                  { name: 'Pune – Lonavala', w: '45%', color: '#FBBF24' },
                  { name: 'Mumbai – Chennai', w: '60%', color: '#2DD4BF' },
                  { name: 'Howrah – Patna', w: '35%', color: '#F87171' },
                ].map((bar) => (
                  <div key={bar.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.5)', width: 72, flexShrink: 0, fontFamily: 'JetBrains Mono' }}>
                      {bar.name}
                    </span>
                    <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: bar.w }}
                        transition={{ duration: 1.2, delay: 0.8, ease: 'easeOut' }}
                        style={{ height: '100%', background: bar.color, borderRadius: 3, opacity: 0.8 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom row: Corridor Map mini + AI Risk Score */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {/* Mini corridor map */}
              <div style={{
                background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '0.75rem',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
                <div style={{ fontSize: '0.55rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                  CORRIDOR MAP
                </div>
                <svg viewBox="0 0 120 90" style={{ width: '100%', height: 'auto' }}>
                  {/* Simplified India rail routes */}
                  <path d="M60,10 L40,35 L30,70" stroke="#f88100" strokeWidth="1.5" fill="none" opacity="0.6" />
                  <path d="M60,10 L85,40 L90,70" stroke="#2DD4BF" strokeWidth="1.5" fill="none" opacity="0.6" />
                  <path d="M40,35 L85,40" stroke="#FBBF24" strokeWidth="1.5" fill="none" opacity="0.5" strokeDasharray="3 2" />
                  <path d="M30,70 L70,80" stroke="#F87171" strokeWidth="1.5" fill="none" opacity="0.4" />
                  {/* City dots */}
                  {[
                    { cx: 60, cy: 10, label: 'Delhi' },
                    { cx: 40, cy: 35, label: 'Mumbai' },
                    { cx: 85, cy: 40, label: 'Kolkata' },
                    { cx: 30, cy: 70, label: 'Bangalore' },
                    { cx: 90, cy: 70, label: 'Chennai' },
                  ].map((city) => (
                    <g key={city.label}>
                      <circle cx={city.cx} cy={city.cy} r="3" fill="#f88100" opacity="0.8" />
                      <circle cx={city.cx} cy={city.cy} r="5" fill="none" stroke="#f88100" strokeWidth="0.5" opacity="0.3" />
                    </g>
                  ))}
                </svg>
              </div>

              {/* AI Risk Score */}
              <div style={{
                background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '0.75rem',
                border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center',
              }}>
                <div style={{ fontSize: '0.55rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                  AI RISK SCORE
                </div>
                <svg viewBox="0 0 80 80" style={{ width: 64, height: 64, margin: '0 auto' }}>
                  <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                  <motion.circle
                    cx="40" cy="40" r="32" fill="none" stroke="#f88100" strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${0.78 * 2 * Math.PI * 32} ${2 * Math.PI * 32}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
                    animate={{ strokeDashoffset: 0.22 * 2 * Math.PI * 32 }}
                    transition={{ duration: 1.5, delay: 1, ease: 'easeOut' }}
                    transform="rotate(-90 40 40)"
                  />
                  <text x="40" y="38" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="800" fontFamily="Inter">78</text>
                  <text x="40" y="50" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="5" fontWeight="600">%</text>
                </svg>
                <div style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>
                  High-Risk Assets: 12 / 156
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── BOTTOM: Value Strip ── */}
      <div style={{
        background: 'rgba(0,0,0,0.2)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '1.25rem 0',
        zIndex: 20, position: 'relative',
      }}>
        <div className="container-site" style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          {[
            { icon: <ShieldCheck size={18} />, t1: 'Safer Operations', t2: 'Minimize disruptions' },
            { icon: <Activity size={18} />, t1: 'Higher Asset Availability', t2: 'Coordinated planning' },
            { icon: <BrainCircuit size={18} />, t1: 'Faster Re-planning', t2: 'Rolling-horizon AI' },
            { icon: <Leaf size={18} />, t1: 'Greener Railways', t2: 'Optimized resource use' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
            >
              <div style={{ color: '#f88100' }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{item.t1}</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)' }}>{item.t2}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
