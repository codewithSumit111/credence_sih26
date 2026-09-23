import { Link } from 'react-router-dom';

const FOOTER_LINKS = [
  { label: 'Block Planning', path: '/plan' },
  { label: 'Train Operations', path: '/trains' },
  { label: 'Live Monitoring', path: '/live' },
  { label: 'Reports', path: '/reports' },
  { label: 'Analytics', path: '/analytics' },
  { label: 'Field Execution', path: '/field' },
];

export default function AppFooter() {
  return (
    <footer className="irctc-footer" aria-label="Application footer">
      {/* Links row */}
      <div className="irctc-footer-links">
        <span className="text-white font-bold text-[13px] whitespace-nowrap mr-2">
          Important Links:
        </span>
        {FOOTER_LINKS.map(link => (
          <Link key={link.path} to={link.path}>
            {link.label}
          </Link>
        ))}
        <div className="ml-auto flex items-center gap-4">
          <a href="#" className="text-white/70 hover:text-white text-[12px]">System Documentation</a>
          <a href="#" className="text-white/70 hover:text-white text-[12px]">Help</a>
          <span className="text-white/40">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-300 text-[12px] font-medium">System Operational</span>
          </div>
        </div>
      </div>

      {/* Bottom attribution row */}
      <div className="irctc-footer-bottom">
        <div className="flex items-center gap-3">
          {/* IR Logo placeholder */}
          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
            IR
          </div>
          <div>
            <p className="text-white font-semibold text-[13px]">Indian Railways — AI-Powered Automatic Block Planning</p>
            <p className="text-white/60 text-[11px]">Railway Block Intelligence System · Central Railway · Nagpur Division</p>
          </div>
        </div>
        <p className="text-white/50 text-[11px] text-right">
          Designed &amp; developed for Railway Block Planning ·{' '}
          <span className="text-white/70">Powered by CRIS</span>
        </p>
      </div>
    </footer>
  );
}
