import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown, ShieldCheck, Activity, BrainCircuit, Users, Building2 } from 'lucide-react';
import { openPrototype } from '@/lib/config';

export default function Hero() {
  const scrollToNext = () => {
    document.querySelector('#platform')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      className="mesh-gradient-hero"
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
      {/* ── Background Grid & Gradients ── */}
      <div className="bg-grid-light" style={{ position: 'absolute', inset: 0, opacity: 0.6 }} />
      <div style={{
        position: 'absolute',
        top: '-20%', right: '-10%',
        width: 800, height: 800,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(14,165,233,0.04) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div style={{ flex: 1, display: 'flex', position: 'relative', width: '100%', maxWidth: 1440, margin: '0 auto' }}>
        
        {/* ── LEFT: Content (~40%) ── */}
        <div style={{
          width: '40%',
          padding: '4rem 2rem 4rem 4rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 10,
        }}>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}
          >
            <span className="badge badge-blue" style={{ gap: '0.5rem' }}>
              <span className="glow-dot-blue" />
              CENTRAL RAILWAY
            </span>
            <span style={{ color: '#D9E2EC' }}>|</span>
            <span style={{ fontSize: '0.7rem', color: '#64748B', letterSpacing: '0.08em', fontFamily: 'JetBrains Mono, monospace' }}>
              NAGPUR DIVISION
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="font-display"
            style={{ fontSize: 'clamp(2.5rem, 4vw, 4rem)', marginBottom: '1.5rem', color: '#0F172A' }}
          >
            AI-Powered<br/>
            Block Planning for<br/>
            <span className="text-gradient-blue">Smarter Railway</span><br/>
            <span className="text-gradient-blue">Operations</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="section-subheading"
            style={{ maxWidth: 460, marginBottom: '2.5rem', fontSize: '1.0625rem', color: '#64748B' }}
          >
            Coordinate maintenance, infrastructure availability and
            train operations through <strong style={{ color: '#0F172A', fontWeight: 600 }}>explainable AI-driven block optimization</strong> — from
            maintenance demand to executable block plan.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.3 }}
            style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}
          >
            <motion.button
              className="btn-primary"
              style={{ fontSize: '0.9375rem', padding: '1rem 2rem' }}
              onClick={scrollToNext}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              Explore the Intelligence
              <ChevronDown size={17} />
            </motion.button>
            <motion.button
              className="btn-ghost"
              style={{ fontSize: '0.9375rem', padding: '1rem 2rem' }}
              onClick={openPrototype}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              Enter Planning System
              <ArrowRight size={17} />
            </motion.button>
          </motion.div>
        </div>

        {/* ── RIGHT: Railway Digital Twin (~60%) ── */}
        <div style={{
          width: '60%',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Fades */}
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 120, background: 'linear-gradient(90deg, #FFFFFF, transparent)', zIndex: 5 }} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 120, background: 'linear-gradient(-90deg, #FFFFFF, transparent)', zIndex: 5 }} />

          {/* 3D Isometric Railway Placeholder (CSS/SVG based) */}
          <div style={{ position: 'relative', width: '100%', height: '80%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            
            {/* The Railway Track (isometric transform) */}
            <div style={{
              position: 'absolute',
              width: '120%', height: 120,
              background: 'rgba(29,78,216,0.05)',
              transform: 'rotateX(60deg) rotateZ(-45deg)',
              border: '2px dashed rgba(29,78,216,0.2)',
              borderRadius: 8,
              boxShadow: 'inset 0 0 20px rgba(14,165,233,0.1)',
            }}>
              {/* Train */}
              <motion.div
                style={{
                  position: 'absolute', top: '40%', left: 0,
                  width: 120, height: 20, background: 'linear-gradient(90deg, #1D4ED8, #0EA5E9)',
                  borderRadius: 10, boxShadow: '0 4px 12px rgba(29,78,216,0.3)',
                }}
                animate={{ left: ['-20%', '120%'] }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              />
            </div>

            {/* AI Optimization Core */}
            <div style={{
              position: 'absolute', right: '15%', top: '45%',
              width: 140, height: 140,
              transform: 'translateY(-50%)',
              zIndex: 10,
            }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                style={{
                  width: '100%', height: '100%', borderRadius: '50%',
                  background: 'conic-gradient(from 0deg, rgba(29,78,216,0.1), rgba(14,165,233,0.3), rgba(29,78,216,0.1))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <div style={{
                  width: 80, height: 80, borderRadius: 16,
                  background: 'linear-gradient(135deg, #1D4ED8, #0EA5E9)',
                  boxShadow: '0 12px 32px rgba(29,78,216,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', color: '#fff',
                  transform: 'rotateX(20deg) rotateY(15deg)',
                }}>
                  <BrainCircuit size={32} />
                  <span style={{ fontSize: '0.55rem', fontWeight: 800, marginTop: 4, letterSpacing: '0.1em' }}>AI CORE</span>
                </div>
              </motion.div>
              
              {/* Core Output Path */}
              <svg style={{ position: 'absolute', top: '50%', left: -80, width: 80, height: 20, overflow: 'visible' }}>
                <line x1="0" y1="10" x2="80" y2="10" stroke="rgba(29,78,216,0.3)" strokeWidth="2" strokeDasharray="4 4" />
                <motion.circle r="3" fill="#1D4ED8" animate={{ cx: [80, 0], cy: [10, 10] }} transition={{ duration: 1.5, repeat: Infinity }} />
              </svg>
            </div>

            {/* Floating Data Cards */}
            {[
              { id: 'TMS', label: 'Train Movement', top: '15%', left: '10%' },
              { id: 'SMMS', label: 'Signal & Telecom', top: '5%', left: '40%' },
              { id: 'TDMS', label: 'Traction Distribution', top: '45%', left: '5%' },
              { id: 'BDMS', label: 'Block & Disconnection', top: '25%', left: '60%' },
              { id: 'COA', label: 'Corridor Availability', top: '70%', left: '35%' },
            ].map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1, y: [0, -5, 0] }}
                transition={{ duration: 3, delay: i * 0.2, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  position: 'absolute', top: card.top, left: card.left,
                  background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(30,80,150,0.12)', borderRadius: 14,
                  padding: '0.75rem 1rem', boxShadow: '0 4px 16px rgba(16,24,40,0.06)',
                  zIndex: 10, minWidth: 140,
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1D4ED8', fontFamily: 'JetBrains Mono' }}>{card.id}</div>
                <div style={{ fontSize: '0.65rem', color: '#64748B' }}>{card.label}</div>
                <div style={{ height: 12, marginTop: 6, display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                  {[0.4, 0.7, 0.5, 0.9, 0.6].map((h, j) => (
                    <div key={j} style={{ width: 4, height: `${h * 100}%`, background: 'rgba(14,165,233,0.4)', borderRadius: 1 }} />
                  ))}
                </div>
              </motion.div>
            ))}

            {/* Block Window Panel */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              style={{
                position: 'absolute', bottom: '15%', right: '35%',
                background: 'rgba(217,119,6,0.1)', border: '1px solid rgba(217,119,6,0.3)',
                borderRadius: 8, padding: '0.75rem', backdropFilter: 'blur(4px)',
                zIndex: 8,
              }}
            >
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#D97706', letterSpacing: '0.1em' }}>BLOCK WINDOW</div>
              <div style={{ fontSize: '0.875rem', color: '#D97706', fontFamily: 'JetBrains Mono' }}>01:30 — 03:15</div>
            </motion.div>

            {/* Subtle Technical Markers */}
            {[
              { l: 'OHE', top: '30%', left: '20%' },
              { l: 'S&T', top: '60%', left: '70%' },
              { l: 'ENGINEERING', top: '40%', left: '50%' },
            ].map((m, i) => (
              <div key={i} style={{
                position: 'absolute', top: m.top, left: m.left,
                fontSize: '0.55rem', fontWeight: 700, color: '#94A3B8',
                letterSpacing: '0.15em', fontFamily: 'JetBrains Mono',
                display: 'flex', alignItems: 'center', gap: 4, zIndex: 6,
              }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#CBD5E1' }} />
                {m.l}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM: Value Strip ── */}
      <div style={{
        background: '#FFFFFF',
        borderTop: '1px solid #F2F4F7',
        padding: '1.5rem 0',
        zIndex: 20,
      }}>
        <div className="container-site" style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          {[
            { icon: <ShieldCheck size={18} />, t1: 'Safer Operations', t2: 'Minimize disruptions' },
            { icon: <Activity size={18} />, t1: 'Higher Asset Availability', t2: 'Coordinated planning' },
            { icon: <BrainCircuit size={18} />, t1: 'Data-Driven Decisions', t2: 'Explainable & transparent' },
            { icon: <Users size={18} />, t1: 'Multi-Department', t2: 'Engineering • S&T • TRD' },
            { icon: <Building2 size={18} />, t1: 'Built for Indian Railways', t2: 'Scalable • Responsible AI' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
            >
              <div style={{ color: '#1D4ED8' }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0F172A' }}>{item.t1}</div>
                <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{item.t2}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
