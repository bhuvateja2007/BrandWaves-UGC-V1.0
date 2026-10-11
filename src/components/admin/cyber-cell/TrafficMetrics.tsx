import React from 'react';
import { TrafficMetricsData } from '../../../types/traffic';
import { AnimatedCounter } from '../../common/AnimatedCounter';
import { Users, Eye, Activity, TrendingUp, Zap, Clock } from 'lucide-react';

interface TrafficMetricsProps {
  metrics?: TrafficMetricsData;
  loading?: boolean;
}

export const TrafficMetrics: React.FC<TrafficMetricsProps> = ({ metrics, loading }) => {
  const isAvailable = Boolean(metrics && !loading);

  const cards = [
    {
      id: 'visitors',
      label: 'ACTIVE VISITORS',
      value: metrics?.activeVisitors ?? 0,
      icon: Users,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10 border-cyan-500/30',
      subtext: 'Concurrent live sockets',
    },
    {
      id: 'views',
      label: 'TOTAL PAGE VIEWS',
      value: metrics?.totalPageViews ?? 0,
      icon: Eye,
      color: 'text-[#3F72AF]',
      bgColor: 'bg-[#3F72AF]/10 border-[#3F72AF]/30',
      subtext: 'Aggregated route requests',
    },
    {
      id: 'sessions',
      label: 'ACTIVE SESSIONS',
      value: metrics?.activeSessions ?? 0,
      icon: Activity,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/30',
      subtext: 'Platform engagement depth',
    },
    {
      id: 'trend',
      label: 'TRAFFIC VELOCITY',
      value: metrics?.trafficTrendPercent ?? 0,
      suffix: '%',
      prefix: '+',
      icon: TrendingUp,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/30',
      subtext: 'Comparison to prev window',
    },
    {
      id: 'latency',
      label: 'AVG LATENCY',
      value: metrics?.avgLatencyMs ?? 0,
      suffix: 'ms',
      icon: Clock,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10 border-indigo-500/30',
      subtext: 'Edge round-trip time',
    },
    {
      id: 'peak',
      label: 'PEAK THROUGHPUT',
      value: metrics?.peakRps ?? 0,
      suffix: ' rps',
      icon: Zap,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/10 border-sky-500/30',
      subtext: 'Peak ingress velocity',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="p-3.5 rounded-2xl bg-[#091524]/90 border border-[#3F72AF]/25 hover:border-[#3F72AF]/60 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono tracking-wider text-blue-200/60 uppercase font-semibold truncate">
                {card.label}
              </span>
              <div className={`w-6 h-6 rounded-lg ${card.bgColor} border flex items-center justify-center shrink-0`}>
                <Icon className={`w-3.5 h-3.5 ${card.color}`} />
              </div>
            </div>

            <div className="my-1">
              <div className="text-2xl font-black text-white font-mono tracking-tight tabular-nums group-hover:text-cyan-300 transition-colors">
                {!isAvailable ? (
                  <span className="text-gray-500 text-lg">---</span>
                ) : (
                  <AnimatedCounter
                    value={card.value}
                    prefix={card.prefix}
                    suffix={card.suffix}
                  />
                )}
              </div>
            </div>

            <span className="text-[10px] text-blue-200/40 font-mono truncate block mt-1">
              {card.subtext}
            </span>
          </div>
        );
      })}
    </div>
  );
};
