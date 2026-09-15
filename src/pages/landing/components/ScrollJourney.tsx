import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { openPrototype } from '../lib/landingConfig';

// ============================================================
// 10-STAGE SCROLL JOURNEY
// ============================================================

export default function ScrollJourney() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [activePhase, setActivePhase] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // 10 stages = 10 buckets
  const thresholds = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];

  useEffect(() => {
    if (reducedMotion) { setActivePhase(9); return; }
    const unsub = scrollYProgress.on('change', (v) => {
      let current = 0;
      for (let i = 0; i < thresholds.length - 1; i++) {
        if (v >= thresholds[i]) current = i;
      }
      setActivePhase(current);
    });
    return unsub;
  }, [scrollYProgress, reducedMotion]);

  // Transform values for smooth continuous motion
  const railX = useTransform(scrollYProgress, [0, 0.1], ['0%', '10%']);
  const railY = useTransform(scrollYProgress, [0, 0.1], ['0%', '-10%']);
  const railScale = useTransform(scrollYProgress, [0, 0.1, 0.8, 0.9], [1, 0.95, 0.95, 0.8]);

  // Stage 2: Cards move to AI
  const cardProgress = useTransform(scrollYProgress, [0.1, 0.2], [0, 1]);
  
  // Stage 3: AI Brightens & Text Shows
  const aiGlow = useTransform(scrollYProgress, [0.2, 0.25], [0, 1]);
  
  // Stage 4: Risk panel slides in
  const riskY = useTransform(scrollYProgress, [0.25, 0.35], ['100%', '0%']);
  const riskOp = useTransform(scrollYProgress, [0.25, 0.35], [0, 1]);

  // Stage 5: Block timeline
  const blockTimelineOp = useTransform(scrollYProgress, [0.35, 0.45], [0, 1]);

  // Stage 6: Consolidation
  const deptConsolidate = useTransform(scrollYProgress, [0.45, 0.55], [0, 1]);

  // Stage 7: Train Impact
  const trainImpactProg = useTransform(scrollYProgress, [0.55, 0.65], [0, 1]);

  // Stage 8: Explainability Card
  const explainOp = useTransform(scrollYProgress, [0.65, 0.75], [0, 1]);
  const explainY = useTransform(scrollYProgress, [0.65, 0.75], [50, 0]);

  // Stage 9: Re-optimization
  const reoptOp = useTransform(scrollYProgress, [0.75, 0.85], [0, 1]);
  
  // Stage 10: Final
  const finalOp = useTransform(scrollYProgress, [0.85, 0.95], [0, 1]);
  const finalBlur = useTransform(scrollYProgress, [0.85, 0.95], ['blur(0px)', 'blur(8px)']);

  const getStageTitle = (p: number) => {
    switch (p) {
      case 0: return "1. Initial State";
      case 1: return "2. Data Ingestion";
      case 2: return "3. Data Integration";
      case 3: return "4. Risk Intelligence";
      case 4: return "5. Block Candidates";
      case 5: return "6. Multi-Dept Consolidation";
      case 6: return "7. Train-Aware Optimization";
      case 7: return "8. Explainable Decision";
      case 8: return "9. Dynamic Re-optimization";
      case 9: return "10. Final Executable Plan";
      default: return "";
    }
  };

  return (
    <div id="pipeline" ref={containerRef} className="mesh-gradient-bg" style={{ height: '1000vh', position: 'relative' }}>
      
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', display: 'flex' }}>
        
        {/* Background Grid */}
        <div className="bg-grid-light" style={{ position: 'absolute', inset: 0, opacity: 0.5 }} />

        {/* Phase Indicator (Left Sticky) */}
        <div style={{ position: 'absolute', left: '2rem', top: '50%', transform: 'translateY(-50%)', zIndex: 50 }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#1D4ED8', letterSpacing: '0.1em', marginBottom: 12 }}>
            PIPELINE STAGE
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', transition: '0.3s' }}>
            {getStageTitle(activePhase)}
          </div>
          
          {/* Text descriptions matching the stages */}
          <div style={{ marginTop: '1.5rem', maxWidth: 300, fontSize: '0.9rem', color: '#64748B', lineHeight: 1.6, height: 100 }}>
            {activePhase === 0 && "Railway infrastructure and train operations occur continuously."}
            {activePhase === 1 && "Maintenance demand is gathered from all sub-systems."}
            {activePhase === 2 && "The AI core integrates inputs to generate a unified intelligent plan."}
            {activePhase === 3 && "Asset criticality and defect severity drive priority scoring."}
            {activePhase === 4 && "The system evaluates multiple candidate block windows."}
            {activePhase === 5 && "Engineering, S&T, and TRD jobs are consolidated into one block."}
            {activePhase === 6 && "Train impact is assessed (delay/rerouting) and blocks shift to avoid conflict."}
            {activePhase === 7 && "The AI provides a full reasoning trace for its recommendation."}
            {activePhase === 8 && "New defects or delays trigger rolling-horizon re-optimization."}
            {activePhase === 9 && "An executable, safe, and coordinated block plan is ready for approval."}
          </div>
        </div>

        {/* ── CENTRAL VISUALIZATION AREA ── */}
        <motion.div style={{
          position: 'absolute', right: '5%', top: '5%', bottom: '5%', width: '65%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          x: railX, y: railY, scale: railScale,
          filter: finalBlur,
        }}>
          
          {/* Main SVG/Isometric Container */}
          <div style={{ position: 'relative', width: 800, height: 600 }}>
            
            {/* Railway Track Background */}
            <div style={{
              position: 'absolute', inset: '10% 0',
              background: 'rgba(29,78,216,0.03)',
              transform: 'rotateX(60deg) rotateZ(-45deg)',
              border: '2px solid rgba(29,78,216,0.1)',
              borderRadius: 16,
            }}>
              {/* Animated Train (Stage 1-6) */}
              <motion.div
                style={{
                  position: 'absolute', top: '35%', left: 0,
                  width: 100, height: 16, background: '#1D4ED8', borderRadius: 8,
                  opacity: activePhase >= 7 ? 0 : 1, // Hides when stage 7 takes over train animation
                }}
                animate={{ left: ['-10%', '110%'] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              />
            </div>

            {/* AI Core (Center Right) */}
            <div style={{ position: 'absolute', right: '10%', top: '40%', zIndex: 20 }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                style={{
                  width: 100, height: 100, borderRadius: '50%',
                  background: 'conic-gradient(from 0deg, rgba(29,78,216,0.1), rgba(14,165,233,0.3), rgba(29,78,216,0.1))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <div style={{
                  width: 60, height: 60, borderRadius: 12,
                  background: 'linear-gradient(135deg, #1D4ED8, #0EA5E9)',
                  boxShadow: '0 8px 24px rgba(29,78,216,0.4)',
                }} />
              </motion.div>
              
              {/* Stage 3 text over AI */}
              <motion.div style={{ position: 'absolute', top: -40, left: -60, width: 220, textAlign: 'center', opacity: aiGlow }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1D4ED8', letterSpacing: '0.1em' }}>MULTIPLE INPUTS</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0F172A' }}>ONE INTELLIGENT PLAN</div>
              </motion.div>
            </div>

            {/* Stage 2 & 3: Input Cards Sliding */}
            {[
              { id: 'TMS', sx: -100, sy: -100 },
              { id: 'SMMS', sx: 100, sy: -150 },
              { id: 'TDMS', sx: -150, sy: 100 },
              { id: 'BDMS', sx: 200, sy: -50 },
              { id: 'COA', sx: 50, sy: 150 },
            ].map((card, i) => (
              <motion.div
                key={card.id}
                style={{
                  position: 'absolute',
                  // Initial position relative to center
                  left: 300 + card.sx,
                  top: 250 + card.sy,
                  // Move towards AI core (approx left: 600, top: 250)
                  x: useTransform(cardProgress, [0, 1], [0, 300 - card.sx]),
                  y: useTransform(cardProgress, [0, 1], [0, -card.sy]),
                  opacity: useTransform(cardProgress, [0.8, 1], [1, 0]), // fade out as they hit core
                  background: 'rgba(255,255,255,0.9)',
                  border: '1px solid rgba(29,78,216,0.15)',
                  padding: '0.5rem 1rem', borderRadius: 8,
                  fontSize: '0.75rem', fontWeight: 700, color: '#0F172A',
                  boxShadow: '0 4px 12px rgba(16,24,40,0.05)',
                  zIndex: 15,
                  display: activePhase < 3 ? 'block' : 'none',
                }}
              >
                {card.id}
              </motion.div>
            ))}

            {/* Stage 4: Risk Intelligence Panel */}
            <motion.div style={{
              position: 'absolute', left: 0, top: '20%',
              background: '#FFFFFF', padding: '1.5rem', borderRadius: 16,
              border: '1px solid rgba(217,119,6,0.2)', boxShadow: '0 8px 32px rgba(16,24,40,0.08)',
              width: 260, zIndex: 25,
              y: riskY, opacity: riskOp,
              display: activePhase >= 3 && activePhase < 8 ? 'block' : 'none',
            }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#D97706', letterSpacing: '0.1em', marginBottom: 12 }}>ASSET RISK</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', marginBottom: 16 }}>0.91</div>
              {[
                { l: 'Criticality', v: 95 },
                { l: 'Urgency', v: 88 },
                { l: 'Condition', v: 75 },
              ].map(r => (
                <div key={r.l} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748B', marginBottom: 4 }}>
                    <span>{r.l}</span><span>{r.v}%</span>
                  </div>
                  <div style={{ height: 4, background: '#F1F5F9', borderRadius: 2 }}>
                    <div style={{ height: 4, width: `${r.v}%`, background: '#D97706', borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Stage 5: Block Candidates Timeline */}
            <motion.div style={{
              position: 'absolute', bottom: '10%', left: '10%', right: '10%',
              background: '#FFFFFF', padding: '1rem', borderRadius: 12,
              border: '1px solid rgba(29,78,216,0.15)',
              opacity: blockTimelineOp,
              display: activePhase >= 4 && activePhase < 8 ? 'flex' : 'none',
              gap: '1rem', zIndex: 30,
            }}>
              {[
                { id: 'A', status: 'subdued' },
                { id: 'B', status: 'subdued' },
                { id: 'C', status: 'optimal' },
                { id: 'D', status: 'subdued' },
              ].map(b => (
                <div key={b.id} style={{
                  flex: 1, padding: '0.5rem', borderRadius: 6,
                  background: b.status === 'optimal' ? '#EFF6FF' : '#F8FAFC',
                  border: b.status === 'optimal' ? '2px solid #1D4ED8' : '1px solid #E2E8F0',
                  opacity: b.status === 'optimal' ? 1 : 0.4,
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: b.status === 'optimal' ? '#1D4ED8' : '#64748B' }}>BLOCK {b.id}</div>
                  {b.status === 'optimal' && <div style={{ fontSize: '0.6rem', color: '#1D4ED8', marginTop: 4 }}>01:30-03:15</div>}
                </div>
              ))}
            </motion.div>

            {/* Stage 6: Multi-Department Consolidation */}
            <motion.div style={{
              position: 'absolute', top: '10%', left: '30%',
              display: activePhase >= 5 && activePhase < 8 ? 'flex' : 'none',
              flexDirection: 'column', alignItems: 'center', zIndex: 30,
              opacity: deptConsolidate,
            }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                {['ENGINEERING', 'S&T', 'TRD'].map(d => (
                  <motion.div key={d}
                    animate={{ y: [0, 20], opacity: [1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    style={{ padding: '0.5rem', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.65rem', fontWeight: 800, color: '#0F172A' }}
                  >
                    {d}
                  </motion.div>
                ))}
              </div>
              <motion.div
                animate={{ scale: [0.8, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                style={{ padding: '0.75rem 1.5rem', background: '#059669', color: '#fff', borderRadius: 8, fontSize: '0.75rem', fontWeight: 800 }}
              >
                1 COORDINATED BLOCK
              </motion.div>
            </motion.div>

            {/* Stage 7: Train Impact Animation */}
            {activePhase >= 6 && activePhase < 8 && (
              <div style={{
                position: 'absolute', top: '50%', left: 0, right: 0, height: 60,
                borderTop: '2px solid rgba(29,78,216,0.3)', borderBottom: '2px solid rgba(29,78,216,0.3)',
                zIndex: 35,
              }}>
                {/* Proposed Block */}
                <motion.div
                  style={{
                    position: 'absolute', top: 0, bottom: 0, width: 100,
                    background: 'rgba(239,68,68,0.2)', border: '2px solid #EF4444',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem', fontWeight: 800, color: '#EF4444',
                  }}
                  animate={{ left: ['40%', '60%'] }} // Block shifts
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  SHIFTING
                </motion.div>

                {/* Train approaching */}
                <motion.div
                  style={{
                    position: 'absolute', top: 10, height: 40, width: 80,
                    background: '#0F172A', borderRadius: 4,
                  }}
                  animate={{ left: ['-20%', '35%', '110%'] }}
                  transition={{ duration: 4, times: [0, 0.4, 1], repeat: Infinity, ease: 'linear' }}
                />

                {/* Impact labels */}
                <motion.div
                  style={{ position: 'absolute', left: '30%', top: -30, color: '#EF4444', fontSize: '0.7rem', fontWeight: 800 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 4, times: [0, 0.3, 0.5], repeat: Infinity }}
                >
                  WAITING → DELAY
                </motion.div>
                
                <motion.div
                  style={{ position: 'absolute', left: '50%', top: 70, color: '#059669', fontSize: '0.7rem', fontWeight: 800 }}
                  animate={{ opacity: [0, 0, 1, 0] }}
                  transition={{ duration: 4, times: [0, 0.5, 0.7, 1], repeat: Infinity }}
                >
                  RE-OPTIMIZED (SAFE PASSAGE)
                </motion.div>
              </div>
            )}

            {/* Stage 8: Explainability Card */}
            <motion.div style={{
              position: 'absolute', right: '5%', top: '20%',
              background: '#FFFFFF', padding: '1.5rem', borderRadius: 16,
              border: '2px solid #1D4ED8', boxShadow: '0 8px 32px rgba(29,78,216,0.15)',
              width: 300, zIndex: 40,
              y: explainY, opacity: explainOp,
              display: activePhase >= 7 && activePhase < 9 ? 'block' : 'none',
            }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.1em' }}>RECOMMENDED BLOCK</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>PUNE — LONAVALA</div>
              <div style={{ fontSize: '0.875rem', color: '#1D4ED8', fontFamily: 'JetBrains Mono', marginBottom: 16 }}>01:30 — 03:15</div>
              
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.1em', marginBottom: 8 }}>WHY THIS BLOCK?</div>
              {[
                'High-priority maintenance',
                'Engineering + S&T compatibility',
                'Corridor available',
                'Lower train impact'
              ].map(r => (
                <div key={r} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                  <CheckCircle size={14} style={{ color: '#059669', flexShrink: 0, marginTop: 2 }} />
                  <div style={{ fontSize: '0.75rem', color: '#334155' }}>{r}</div>
                </div>
              ))}
            </motion.div>

            {/* Stage 9: Dynamic Re-optimization */}
            <motion.div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(4px)',
              display: activePhase === 8 ? 'flex' : 'none',
              alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
              zIndex: 45, opacity: reoptOp,
            }}>
              <AlertTriangle size={48} style={{ color: '#EF4444', marginBottom: 16 }} />
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#EF4444', marginBottom: 24 }}>NEW DEFECT DETECTED</div>
              
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ padding: '0.75rem 1rem', background: '#F1F5F9', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700 }}>CURRENT PLAN</div>
                <ArrowRight size={16} />
                <div style={{ padding: '0.75rem 1rem', background: '#FEF2F2', color: '#EF4444', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700 }}>CONSTRAINT CHANGE</div>
                <ArrowRight size={16} />
                <motion.div
                  animate={{ scale: [1, 1.05, 1], boxShadow: ['0 0 0 rgba(29,78,216,0)', '0 0 20px rgba(29,78,216,0.3)', '0 0 0 rgba(29,78,216,0)'] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ padding: '0.75rem 1rem', background: '#1D4ED8', color: '#fff', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700 }}
                >
                  AI RE-OPTIMIZATION
                </motion.div>
                <ArrowRight size={16} />
                <div style={{ padding: '0.75rem 1rem', background: '#ECFDF5', color: '#059669', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700 }}>UPDATED PLAN</div>
              </div>
            </motion.div>

          </div>
        </motion.div>

        {/* ── FINAL CTA OVERLAY (Stage 10) ── */}
        <motion.div style={{
          position: 'absolute', inset: 0, zIndex: 60,
          display: activePhase === 9 ? 'flex' : 'none',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          opacity: finalOp,
        }}>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 800, color: '#0F172A', textAlign: 'center', lineHeight: 1.1, marginBottom: '2rem' }}>
            OPTIMIZED<br/>
            COORDINATED<br/>
            <span className="text-gradient-blue">TRAIN-AWARE</span><br/>
            BLOCK PLAN READY
          </h2>
          <button
            className="btn-primary"
            style={{ fontSize: '1.125rem', padding: '1.25rem 2.5rem' }}
            onClick={openPrototype}
          >
            Enter Planning System <ArrowRight size={20} />
          </button>
        </motion.div>

      </div>
    </div>
  );
}
