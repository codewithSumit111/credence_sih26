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
    <div className={clsx('flex gap-0 border-b border-gray-200', className)}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={clsx(
            'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
            active === tab.id
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          )}
          aria-selected={active === tab.id}
          role="tab"
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={clsx(
              'ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full',
              active === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
            )}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
