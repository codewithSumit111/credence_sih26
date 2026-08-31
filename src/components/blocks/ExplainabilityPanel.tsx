import { CheckCircle2, Info } from 'lucide-react';

interface Props {
  title?: string;
  reasons: string[];
  algorithm?: string;
  score?: number;
  scoreBreakdown?: { label: string; value: number; weight: number }[];
  plainLanguage?: string;
}

export default function ExplainabilityPanel({ title, reasons, algorithm, score, scoreBreakdown, plainLanguage }: Props) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600" />
          <h4 className="text-sm font-semibold text-blue-900">{title ?? 'WHY THIS RECOMMENDATION?'}</h4>
        </div>
        {algorithm && (
          <span className="text-[10px] text-blue-600 font-semibold bg-blue-100 px-2 py-0.5 rounded">
            {algorithm}
          </span>
        )}
      </div>

      {score !== undefined && (
        <div className="mb-3 pb-3 border-b border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-blue-700 font-medium">Composite Score</span>
            <span className="text-lg font-bold text-blue-900">{score}<span className="text-xs font-normal text-blue-600">/100</span></span>
          </div>
          {scoreBreakdown?.map(item => (
            <div key={item.label} className="mb-1.5">
              <div className="flex justify-between text-[11px] text-blue-700 mb-0.5">
                <span>{item.label}</span>
                <span className="font-medium">{item.value}%</span>
              </div>
              <div className="h-1.5 bg-blue-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <ul className="space-y-1.5">
        {reasons.map((reason, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-blue-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
            {reason}
          </li>
        ))}
      </ul>

      {plainLanguage && (
        <div className="mt-3 pt-3 border-t border-blue-200">
          <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">In plain language</p>
          <p className="text-sm text-blue-800">{plainLanguage}</p>
        </div>
      )}
    </div>
  );
}
