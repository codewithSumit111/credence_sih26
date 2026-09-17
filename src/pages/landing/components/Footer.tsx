import { openPrototype } from '../lib/landingConfig';

const navLinks = [
  { label: 'Platform', href: '#platform' },
  { label: 'How It Works', href: '#pipeline' },
  { label: 'Intelligence', href: '#intelligence' },
  { label: 'Research', href: '#research' },
];

export default function Footer() {
  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer
      id="about"
      style={{ background: '#F4F9F6', borderTop: '1px solid #C5D9CE', padding: '4rem 2rem 2rem' }}
      aria-label="Site footer"
    >
      <div className="container-site">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '2.5rem', marginBottom: '2.5rem', paddingBottom: '2.5rem',
          borderBottom: '1px solid #E6F0EA',
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.875rem' }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'linear-gradient(135deg, #1B6B45, #0D9488)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(27,107,69,0.25)',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.875rem', color: '#122A1F' }}>KAVACH</div>
                <div style={{ fontSize: '0.6rem', color: '#5A7A6C', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Central Railway</div>
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#5A7A6C', lineHeight: 1.7, maxWidth: 220 }}>
              AI-Powered Automatic Block Planning to Maximize Asset Availability for Indian Railways.
            </p>
          </div>

          {/* Platform */}
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#122A1F', marginBottom: '1rem' }}>Platform</div>
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={(e) => handleNav(e, link.href)}
                style={{ display: 'block', fontSize: '0.875rem', color: '#5A7A6C', textDecoration: 'none', marginBottom: '0.5rem', transition: 'color 0.15s' }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#1B6B45'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#5A7A6C'}>
                {link.label}
              </a>
            ))}
          </div>

          {/* System */}
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#122A1F', marginBottom: '1rem' }}>System</div>
            {[
              { label: 'Architecture', href: '#pipeline' },
              { label: 'Research', href: '#research' },
            ].map((item) => (
              <a key={item.label} href={item.href} onClick={(e) => handleNav(e, item.href)}
                style={{ display: 'block', fontSize: '0.875rem', color: '#5A7A6C', textDecoration: 'none', marginBottom: '0.5rem', transition: 'color 0.15s' }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#1B6B45'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#5A7A6C'}>
                {item.label}
              </a>
            ))}
            <a href="#" onClick={(e) => { e.preventDefault(); openPrototype(); }}
              style={{ display: 'block', fontSize: '0.875rem', color: '#5A7A6C', textDecoration: 'none', marginBottom: '0.5rem', transition: 'color 0.15s', cursor: 'pointer' }}
              onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#1B6B45'}
              onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#5A7A6C'}>
              Prototype
            </a>
          </div>

          {/* Tech stack */}
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#122A1F', marginBottom: '1rem' }}>Core Technology</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {['CP-SAT', 'GNN', 'ALNS', 'XGBoost', 'Time-Dep. A*', 'Python'].map((tech) => (
                <span key={tech} style={{
                  padding: '0.2rem 0.55rem', borderRadius: 4, fontSize: '0.65rem', fontWeight: 600,
                  background: '#F0FBF5', color: '#1B6B45',
                  border: '1px solid rgba(27,107,69,0.18)', fontFamily: 'JetBrains Mono',
                }}>{tech}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
          <p style={{ fontSize: '0.75rem', color: '#94A3B8', lineHeight: 1.75, maxWidth: 560 }}>
            <strong style={{ color: '#667085' }}>Disclaimer:</strong> Prototype scenarios are illustrative and do not represent live Indian Railways operational data.
            This system is a research prototype developed for SIH 2025. All block recommendations require authorized railway authority validation and approval before execution.
          </p>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', textAlign: 'right', flexShrink: 0 }}>
            <div>Central Railway · Nagpur Division</div>
            <div style={{ marginTop: 2 }}>Integrated Railway Maintenance Intelligence</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
