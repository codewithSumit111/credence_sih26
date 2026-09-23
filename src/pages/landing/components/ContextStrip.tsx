import { motion } from 'framer-motion';

export default function ContextStrip() {
  return (
    <div style={{
      width: '100%',
      background: '#EDF5F0',
      borderTop: '1px solid #C5D9CE',
      borderBottom: '1px solid #C5D9CE',
      padding: '1rem 2rem',
    }}
    aria-label="Ministry Context Strip">
      <div className="container-site" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '2rem',
      }}>
        {/* Left: Ministry */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: '#082b71', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.875rem', color: '#122A1F', lineHeight: 1.2 }}>Ministry of Railways</div>
            <div style={{ fontSize: '0.7rem', color: '#5A7A6C', fontWeight: 500 }}>Government of India</div>
          </div>
        </div>

        {/* Center: Departments */}
        <div style={{
          display: 'flex', gap: '1.5rem', alignItems: 'center',
          fontSize: '0.75rem', fontWeight: 600, color: '#122A1F',
          letterSpacing: '0.04em', textTransform: 'uppercase',
        }}>
          <span>Engineering</span>
          <span style={{ color: '#8FA99D' }}>•</span>
          <span>S&T</span>
          <span style={{ color: '#8FA99D' }}>•</span>
          <span>TRD</span>
          <span style={{ color: '#8FA99D' }}>•</span>
          <span>Operations</span>
        </div>

        {/* Right: Tagline */}
        <div style={{
          fontSize: '0.8125rem', color: '#5A7A6C', fontWeight: 500,
          textAlign: 'right', lineHeight: 1.4,
        }}>
          Connecting a Smarter India<br/>
          <span style={{ color: '#122A1F', fontWeight: 600 }}>Through Intelligent Infrastructure</span>
        </div>
      </div>
    </div>
  );
}
