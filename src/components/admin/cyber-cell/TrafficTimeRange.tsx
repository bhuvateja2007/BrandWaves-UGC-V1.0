import React from 'react';
import { TimeRange } from '../../../types/traffic';

interface TrafficTimeRangeProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
  disabled?: boolean;
}

export const TrafficTimeRange: React.FC<TrafficTimeRangeProps> = ({ value, onChange, disabled }) => {
  const options: { label: string; value: TimeRange }[] = [
    { label: 'Last 1h', value: '1h' },
    { label: 'Last 24h', value: '24h' },
    { label: 'Last 7d', value: '7d' },
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-[#0b1a2e]/90 border border-[#3F72AF]/30 rounded-xl shadow-inner font-mono">
      {options.map(opt => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              active
                ? 'bg-[#3F72AF] text-white shadow-[0_0_12px_rgba(63,114,175,0.5)] border border-[#3F72AF]'
                : 'text-blue-200/60 hover:text-white hover:bg-white/5'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};
