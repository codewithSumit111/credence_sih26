import { useState, useEffect } from 'react';
import { Info, Minus, Plus } from 'lucide-react';

export default function AdvisoryBar() {
  const [time, setTime] = useState(new Date());
  const [fontSize, setFontSize] = useState(0); // -1 small, 0 normal, 1 large

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Apply font size modifier to root
  useEffect(() => {
    const sizes = [13, 15, 17];
    document.documentElement.style.fontSize = `${sizes[fontSize + 1]}px`;
  }, [fontSize]);

  const dateStr = time.toLocaleDateString('en-IN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).replace(/\//g, '-');
  const timeStr = time.toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  });

  return (
    <div className="irctc-advisory" role="banner">
      {/* Left: advisory message */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Info className="w-4 h-4 text-[#1a1a1a] flex-shrink-0" />
        <span className="text-[13px] font-medium text-[#1a1a1a] truncate">
          <strong>Operational Advisory:</strong>{' '}
          Review active blocks, train conflicts and pending approvals before authorizing execution.
        </span>
      </div>

      {/* Right: date/time + accessibility */}
      <div className="flex items-center gap-4 flex-shrink-0 pl-4">
        <span className="text-[12px] font-semibold text-[#1a1a1a] whitespace-nowrap">
          {dateStr} | {timeStr}
        </span>
        <div className="flex items-center gap-1 border-l border-black/20 pl-3">
          <button
            onClick={() => setFontSize(f => Math.max(-1, f - 1))}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-black/10 transition-colors text-[11px] font-bold text-[#1a1a1a]"
            title="Decrease text size"
            aria-label="Decrease text size"
          >
            A-
          </button>
          <button
            onClick={() => setFontSize(0)}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-black/10 transition-colors text-[12px] font-bold text-[#1a1a1a]"
            title="Normal text size"
            aria-label="Normal text size"
          >
            A
          </button>
          <button
            onClick={() => setFontSize(f => Math.min(1, f + 1))}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-black/10 transition-colors text-[13px] font-bold text-[#1a1a1a]"
            title="Increase text size"
            aria-label="Increase text size"
          >
            A+
          </button>
        </div>
      </div>
    </div>
  );
}
