import { useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: 'sm' | 'md' | 'lg';
}

export default function Drawer({ open, onClose, title, subtitle, children, width = 'md' }: Props) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const widthClass = {
    sm: 'w-[400px]',
    md: 'w-[500px]',
    lg: 'w-[640px]',
  }[width];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/25 z-40 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        className={clsx(
          'fixed top-0 right-0 h-full bg-white z-50 flex flex-col',
          'border-l border-irctc-border shadow-irctc-xl',
          widthClass
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        {(title || subtitle) && (
          <div className="px-6 py-5 border-b border-irctc-border flex items-start justify-between flex-shrink-0 bg-white">
            <div>
              {title && (
                <h2 className="irctc-section-title">{title}</h2>
              )}
              {subtitle && (
                <p className="text-[13px] text-irctc-muted mt-1">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-irctc-muted hover:text-irctc-text hover:bg-gray-100 transition-colors ml-4 flex-shrink-0"
              aria-label="Close drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 irctc-body">
          {children}
        </div>
      </div>
    </>
  );
}
