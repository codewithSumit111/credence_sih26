import { clsx } from 'clsx';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface Props {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export default function Tabs({ tabs, active, onChange, className }: Props) {
  return (
    <div className={clsx('irctc-tabs', className)}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={clsx(
            'irctc-tab',
            active === tab.id && 'active'
          )}
          aria-selected={active === tab.id}
          role="tab"
          type="button"
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={clsx(
              'ml-2 text-[11px] font-bold px-2 py-0.5 rounded-full',
              active === tab.id
                ? 'bg-irctc-blue/10 text-irctc-blue'
                : 'bg-gray-100 text-irctc-muted'
            )}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
