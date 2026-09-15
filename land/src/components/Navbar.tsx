import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { openPrototype } from '@/lib/config';
import { ArrowRight, Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Platform', href: '#platform' },
  { label: 'How It Works', href: '#pipeline' },
  { label: 'Intelligence', href: '#intelligence' },
  { label: 'Research', href: '#research' },
  { label: 'About', href: '#about' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 100,
        background: scrolled ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0)',
        backdropFilter: scrolled ? 'blur(20px) saturate(1.6)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(209,220,236,0.7)' : '1px solid transparent',
        boxShadow: scrolled ? '0 1px 12px rgba(16,24,40,0.06)' : 'none',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}
      aria-label="Main navigation"
    >
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        padding: '0 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 68,
      }}>
        {/* Logo */}
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: 'linear-gradient(135deg, #1D4ED8 0%, #0EA5E9 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(29,78,216,0.25)',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: '#101828', letterSpacing: '-0.01em', lineHeight: 1 }}>
              KAVACH
            </div>
            <div style={{ fontSize: '0.6rem', color: '#94A3B8', letterSpacing: '0.12em', textTransform: 'uppercase', lineHeight: 1.2, marginTop: 1 }}>
              SIH26027
            </div>
          </div>
        </a>

        {/* Desktop nav */}
        <nav className="desktop-nav" style={{ display: 'flex', gap: '0.125rem', alignItems: 'center' }}>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNav(e, link.href)}
              style={{
                color: '#344054',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
                padding: '0.5rem 0.875rem',
                borderRadius: 7,
                transition: 'color 0.15s, background 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = '#1D4ED8';
                (e.target as HTMLElement).style.background = '#EFF6FF';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color = '#344054';
                (e.target as HTMLElement).style.background = 'transparent';
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <motion.button
            onClick={openPrototype}
            className="btn-primary"
            style={{ fontSize: '0.875rem', padding: '0.625rem 1.25rem' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-label="Open Planning System"
          >
            Open Planning System
            <ArrowRight size={15} />
          </motion.button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="mobile-menu-btn"
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '0.375rem', color: '#344054', borderRadius: 6 }}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(209,220,236,0.7)',
            padding: '1rem',
          }}
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNav(e, link.href)}
              style={{
                display: 'block',
                color: '#344054',
                textDecoration: 'none',
                fontSize: '1rem',
                fontWeight: 500,
                padding: '0.875rem 1rem',
                borderRadius: 8,
                transition: 'color 0.15s',
              }}
            >
              {link.label}
            </a>
          ))}
          <button onClick={openPrototype} className="btn-primary" style={{ width: '100%', marginTop: '0.75rem', justifyContent: 'center' }}>
            Open Planning System <ArrowRight size={15} />
          </button>
        </motion.div>
      )}

      <style>{`
        @media (max-width: 860px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </motion.header>
  );
}
