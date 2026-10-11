import React, { useState, useId } from 'react';
import { TrafficPoint } from '../../../types/traffic';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { Activity, Radio } from 'lucide-react';

interface CyberTrafficWaveformProps {
  points?: TrafficPoint[];
  loading?: boolean;
  className?: string;
}

export const CyberTrafficWaveform: React.FC<CyberTrafficWaveformProps> = ({
  points = [],
  loading = false,
  className = '',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const gradientId = useId();
  const reducedMotion = useReducedMotion();

  if (loading || points.length === 0) {
    return (
      <div className={`relative w-full h-[280px] bg-[#071324] rounded-2xl border border-[#3F72AF]/30 p-6 flex flex-col items-center justify-center font-mono text-center ${className}`}>
        <Radio className="w-8 h-8 text-[#3F72AF] animate-pulse mb-3" />
        <span className="text-white text-sm font-bold tracking-wider">
          {loading ? 'ACQUIRING TELEMETRY WAVEFORM...' : 'NO TRAFFIC SIGNAL CAPTURED'}
        </span>
        <span className="text-xs text-blue-300/50 mt-1 max-w-sm">
          {loading ? 'Synchronizing with distributed edge routers' : 'No requests recorded within the selected temporal interval.'}
        </span>
      </div>
    );
  }

  // Calculate scales and bounds
  const maxReq = Math.max(...points.map(p => p.requests), 10);
  const minReq = 0;
  const paddingX = 40;
  const paddingY = 30;
  const graphWidth = 800;
  const graphHeight = 220;

  const getX = (index: number) => {
    return paddingX + (index / (points.length - 1)) * (graphWidth - paddingX * 2);
  };

  const getY = (val: number) => {
    const norm = (val - minReq) / (maxReq - minReq);
    return graphHeight - paddingY - norm * (graphHeight - paddingY * 2);
  };

  // Generate smooth SVG Catmull-Rom or Cubic Bezier path
  let pathD = `M ${getX(0)} ${getY(points[0].requests)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const x0 = getX(i);
    const y0 = getY(points[i].requests);
    const x1 = getX(i + 1);
    const y1 = getY(points[i + 1].requests);
    const cpX = (x0 + x1) / 2;
    pathD += ` C ${cpX} ${y0}, ${cpX} ${y1}, ${x1} ${y1}`;
  }

  // Area fill under curve
  const areaD = `${pathD} L ${getX(points.length - 1)} ${graphHeight - paddingY} L ${getX(0)} ${graphHeight - paddingY} Z`;

  const activePoint = hoveredIdx !== null ? points[hoveredIdx] : points[points.length - 1];
  const activeX = hoveredIdx !== null ? getX(hoveredIdx) : getX(points.length - 1);
  const activeY = hoveredIdx !== null ? getY(points[hoveredIdx].requests) : getY(points[points.length - 1].requests);

  return (
    <div className={`relative w-full bg-[#071324] rounded-2xl border border-[#3F72AF]/30 p-5 shadow-2xl overflow-hidden font-mono ${className}`}>
      {/* Top Waveform Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-[#3F72AF]/25 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <h4 className="text-xs font-black tracking-widest text-white uppercase flex items-center gap-2">
            <span>TRAFFIC OSCILLOSCOPE WAVEFORM</span>
            <span className="text-[10px] text-cyan-400 font-semibold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">
              LIVE HARMONICS
            </span>
          </h4>
        </div>

        {/* Readout of current inspected point */}
        {activePoint && (
          <div className="flex items-center gap-4 text-[11px] text-blue-200">
            <div>
              <span className="text-blue-400/50 text-[10px] block">INTERVAL</span>
              <span className="font-bold text-white">{activePoint.label}</span>
            </div>
            <div>
              <span className="text-blue-400/50 text-[10px] block">VOLUME</span>
              <span className="font-bold text-cyan-300">{activePoint.requests.toLocaleString()} reqs</span>
            </div>
            <div>
              <span className="text-blue-400/50 text-[10px] block">LATENCY</span>
              <span className="font-bold text-emerald-400">{activePoint.latencyMs} ms</span>
            </div>
          </div>
        )}
      </div>

      {/* SVG Responsive Waveform Graph */}
      <div className="relative w-full h-[220px]">
        <svg
          viewBox={`0 0 ${graphWidth} ${graphHeight}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#3F72AF" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#3F72AF" stopOpacity="0.0" />
            </linearGradient>

            <filter id={`glow-${gradientId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Grid Horizontal Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = paddingY + ratio * (graphHeight - paddingY * 2);
            const val = Math.round(maxReq - ratio * (maxReq - minReq));
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={graphWidth - paddingX}
                  y2={y}
                  stroke="rgba(63, 114, 175, 0.15)"
                  strokeDasharray="4 6"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="rgba(147, 197, 253, 0.5)"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaD} fill={`url(#${gradientId})`} />

          {/* Main Neon Spline Waveform Stroke */}
          <path
            d={pathD}
            fill="none"
            stroke="#00f0ff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={reducedMotion ? undefined : `url(#glow-${gradientId})`}
          />

          {/* Active Inspection Vertical Line */}
          {activeX && (
            <line
              x1={activeX}
              y1={paddingY}
              x2={activeX}
              y2={graphHeight - paddingY}
              stroke="rgba(0, 240, 255, 0.6)"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
          )}

          {/* Active Point Glowing Reticle */}
          {activeX && activeY && (
            <g>
              <circle
                cx={activeX}
                cy={activeY}
                r="7"
                fill="none"
                stroke="#00f0ff"
                strokeWidth="2"
                className={reducedMotion ? '' : 'animate-ping origin-center'}
              />
              <circle
                cx={activeX}
                cy={activeY}
                r="4.5"
                fill="#ffffff"
                stroke="#00f0ff"
                strokeWidth="2"
              />
            </g>
          )}

          {/* Time Labels on X-Axis */}
          {points.map((p, idx) => {
            // Show every 2nd or 3rd label depending on density
            const showLabel = points.length <= 12 || idx % Math.ceil(points.length / 8) === 0 || idx === points.length - 1;
            if (!showLabel) return null;
            const x = getX(idx);
            return (
              <text
                key={idx}
                x={x}
                y={graphHeight - 8}
                textAnchor="middle"
                fill="rgba(147, 197, 253, 0.6)"
                fontSize="9"
                fontFamily="monospace"
              >
                {p.label}
              </text>
            );
          })}
        </svg>

        {/* Transparent Interactive Scrub Columns for Hover Detection */}
        <div className="absolute inset-0 flex items-stretch px-10">
          {points.map((_, idx) => (
            <div
              key={idx}
              className="flex-1 cursor-crosshair z-20"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          ))}
        </div>
      </div>

      {/* Sub-Footer Metric Note */}
      <div className="mt-3 pt-2.5 border-t border-[#3F72AF]/20 flex items-center justify-between text-[10px] text-blue-300/60 font-mono">
        <span className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>AUTONOMOUS SAMPLING RATE: 60s INTERVALS</span>
        </span>
        <span className="text-right">
          MAX AMPLITUDE: <strong className="text-white">{maxReq.toLocaleString()} reqs</strong>
        </span>
      </div>
    </div>
  );
};
