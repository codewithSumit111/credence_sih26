import { clsx } from 'clsx';
import { ArrowRight, Clock, MapPin } from 'lucide-react';
import type { Train } from '../../types';
import SecondaryButton from '../buttons/SecondaryButton';
import PrimaryButton from '../buttons/PrimaryButton';

interface RouteOption {
  label: string;
  segments: string;
  delay: number;
  extraKm?: number;
  recommended?: boolean;
}

interface Props {
  train: Train;
  options: RouteOption[];
  onAcceptReroute: () => void;
  onKeepOriginal: () => void;
  loading?: boolean;
}

export default function RouteComparison({ train, options, onAcceptReroute, onKeepOriginal, loading }: Props) {
  const recommended = options.find(o => o.recommended);

  return (
    <div className="bg-white border border-gray-200 rounded p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs text-gray-500 uppercase tracking-wide">SELECTED TRAIN: </span>
          <span className="text-sm font-bold text-gray-900">{train.number}</span>
          <span className="text-sm text-gray-500 ml-2">{train.name}</span>
        </div>
        {recommended && (
          <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded font-semibold">
            Recommended: {recommended.label}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {options.map(option => (
          <div
            key={option.label}
            className={clsx(
              'border rounded p-3',
              option.recommended ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={clsx('text-xs font-bold uppercase', option.recommended ? 'text-emerald-700' : 'text-gray-600')}>
                {option.label}
              </span>
              {option.recommended && (
                <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold">RECOMMENDED</span>
              )}
            </div>
            <div className="flex items-center gap-1 mb-1">
              <MapPin className="w-3 h-3 text-gray-400" />
              <p className="text-xs text-gray-700 truncate">{option.segments}</p>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className={clsx(
                'flex items-center gap-1 text-sm font-bold',
                option.delay > 30 ? 'text-red-600' : option.delay > 15 ? 'text-amber-600' : 'text-green-600'
              )}>
                <Clock className="w-3.5 h-3.5" />
                {option.delay > 0 ? `+${option.delay} min` : 'On time'}
              </span>
              {option.extraKm !== undefined && option.extraKm > 0 && (
                <span className="text-xs text-gray-500">+{option.extraKm} km</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Route detail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-100">
        <div>
          <p className="text-[11px] text-gray-500 uppercase tracking-wide mb-1 font-semibold">ORIGINAL ROUTE</p>
          <div className="flex items-center gap-1 flex-wrap">
            {train.originalRoute.map((seg, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className="text-xs font-medium text-gray-700">{seg.from}</span>
                <ArrowRight className="w-3 h-3 text-gray-400" />
                <span className="text-[10px] text-gray-400 font-mono">[{seg.track}]</span>
                <ArrowRight className="w-3 h-3 text-gray-400" />
                {i === train.originalRoute.length - 1 && (
                  <span className="text-xs font-medium text-gray-700">{seg.to}</span>
                )}
              </span>
            ))}
          </div>
        </div>
        {train.proposedRoute && (
          <div>
            <p className="text-[11px] text-emerald-600 uppercase tracking-wide mb-1 font-semibold">PROPOSED ROUTE (A* Algorithm)</p>
            <div className="flex items-center gap-1 flex-wrap">
              {train.proposedRoute.map((seg, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span className="text-xs font-medium text-emerald-800">{seg.from}</span>
                  <ArrowRight className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] text-emerald-500 font-mono">[{seg.track}]</span>
                  <ArrowRight className="w-3 h-3 text-emerald-400" />
                  {i === train.proposedRoute!.length - 1 && (
                    <span className="text-xs font-medium text-emerald-800">{seg.to}</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Why this route */}
      <div className="mb-4 text-xs text-gray-600 flex flex-wrap items-center gap-2">
        <span className="font-semibold text-gray-700">WHY THIS ROUTE? </span>
        <span className="text-green-700 font-medium">✓ Track available</span>
        <span className="text-gray-300">|</span>
        <span className="text-green-700 font-medium">✓ Lowest estimated delay</span>
        <span className="text-gray-300">|</span>
        <span className="text-green-700 font-medium">✓ No train conflict</span>
        <span className="text-gray-300">|</span>
        <span className="text-[11px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded font-mono">Engine: Time-Dependent A*</span>
      </div>

      <div className="flex justify-end gap-2">
        <SecondaryButton onClick={onKeepOriginal}>KEEP ORIGINAL</SecondaryButton>
        <PrimaryButton onClick={onAcceptReroute} loading={loading} variant="green">
          ✓ ACCEPT REROUTE
        </PrimaryButton>
      </div>
    </div>
  );
}

