import { clsx } from 'clsx';
import type { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'right' | 'center';
  className?: string;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  selectedId?: string;
  getRowId?: (row: T) => string;
  emptyMessage?: string;
  className?: string;
  compact?: boolean;
  stickyHeader?: boolean;
}

export default function DataTable<T extends object>({
  columns, data, onRowClick, selectedId, getRowId,
  emptyMessage, className, compact, stickyHeader
}: Props<T>) {
  return (
    <div className={clsx('overflow-x-auto', className)}>
      <table className="irctc-table">
        <thead className={stickyHeader ? 'sticky top-0 z-10' : ''}>
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                className={clsx(
                  compact ? 'px-3 py-2.5' : 'px-4 py-3',
                  col.align === 'right' && 'text-right',
                  col.align === 'center' && 'text-center',
                  col.className,
                )}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-14 text-[14px] text-irctc-muted"
              >
                {emptyMessage ?? 'No data available'}
              </td>
            </tr>
          ) : (
            data.map((row, i) => {
              const id = getRowId?.(row) ?? String(i);
              const isSelected = selectedId === id;
              return (
                <tr
                  key={id}
                  onClick={() => onRowClick?.(row)}
                  className={clsx(
                    onRowClick && 'cursor-pointer',
                    isSelected ? 'irctc-table tbody tr.selected bg-[#EEF4FB]' : ''
                  )}
                  style={isSelected ? { background: '#EEF4FB' } : undefined}
                >
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className={clsx(
                        compact ? 'px-3 py-2.5' : 'px-4 py-3',
                        col.align === 'right' && 'text-right',
                        col.align === 'center' && 'text-center',
                        col.className,
                      )}
                    >
                      {col.render ? col.render(row) : String((row as any)[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
