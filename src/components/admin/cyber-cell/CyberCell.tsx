import React, { useState } from 'react';
import { useTrafficAnalytics } from '../../../hooks/useTrafficAnalytics';
import { TrafficMetrics } from './TrafficMetrics';
import { TrafficTimeRange } from './TrafficTimeRange';
import { CyberNetworkVisualization } from './CyberNetworkVisualization';
import { CyberTrafficWaveform } from './CyberTrafficWaveform';
import { 
  ShieldCheck, 
  Terminal, 
  Radio, 
  RefreshCw, 
  Sliders, 
  ArrowUpRight, 
  Layers, 
  Cpu, 
  Wifi, 
  Globe 
} from 'lucide-react';

interface CyberCellProps {
  className?: string;
}

export const CyberCell: React.FC<CyberCellProps> = ({ className = '' }) => {
  const {
    data,
    loading,
    error,
    timeRange,
    setTimeRange,
    mode,
    setMode,
    refresh,
  } = useTrafficAnalytics('24h', 'demo');

  const [activeTab, setActiveTab] = useState<'both' | 'mesh' | 'waveform'>('both');

  const getStatusBadge = () => {
    const status = data?.status || (loading ? 'CONNECTED' : 'DEMO MODE');

    if (error) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-400 font-mono text-[11px] font-bold">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          ERROR
        </span>
      );
    }

    switch (status) {
      case 'CONNECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-mono text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            CONNECTED
          </span>
        );
      case 'DEMO MODE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            DEMO MODE
          </span>
        );
      case 'NO DATA':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-500/15 border border-slate-500/40 text-slate-300 font-mono text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            NO DATA
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/40 text-blue-300 font-mono text-[11px] font-bold">
            CONNECTING...
          </span>
        );
    }
  };

  return (
    <section
      aria-label="Cyber Cell Traffic Control Center"
      className={`relative w-full rounded-3xl bg-[#06111f] border-2 border-[#3F72AF]/40 p-5 sm:p-7 shadow-[0_12px_45px_rgba(11,26,46,0.6)] overflow-hidden text-white font-sans ${className}`}
    >
      {/* Perspective ambient cyber glow and scanlines */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-[#3F72AF]/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Cyber Cell Operations Console Header */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#3F72AF]/25">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#3F72AF]/20 border border-[#3F72AF]/40 font-mono text-[11px] text-cyan-300 font-bold uppercase tracking-widest">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>SECTOR 07 // CYBER CELL</span>
            </div>
            {getStatusBadge()}
            <span className="text-blue-300/40 font-mono text-xs hidden sm:inline">•</span>
            <span className="text-[11px] font-mono text-blue-200/60 hidden sm:inline">
              LIVE POSTGRESQL TELEMETRY CORE
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5 font-display">
            <span>Live Traffic Intelligence System</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-[#3F72AF]/30 text-cyan-300 font-mono font-bold uppercase tracking-wider border border-[#3F72AF]/40">
              v2.8
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-blue-200/70 max-w-2xl leading-relaxed">
            Realtime ingress mesh monitoring, visitor concurrency tracking, distributed edge packet dynamics, and route-level velocity audit.
          </p>
        </div>

        {/* Console Action Controls */}
        <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
          {/* Mode Switcher (Live vs Demo) */}
          <div className="flex items-center bg-[#091524] border border-[#3F72AF]/40 rounded-xl p-1 font-mono text-[11px]">
            <button
              type="button"
              onClick={() => setMode('live')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                mode === 'live'
                  ? 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.5)] font-black'
                  : 'text-blue-300/60 hover:text-white'
              }`}
            >
              Live Telemetry
            </button>
            <button
              type="button"
              onClick={() => setMode('demo')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                mode === 'demo'
                  ? 'bg-[#3F72AF] text-white shadow-[0_0_12px_rgba(63,114,175,0.5)] font-black'
                  : 'text-blue-300/60 hover:text-white'
              }`}
            >
              Demo Matrix
            </button>
          </div>

          {/* Time Range Selector */}
          <TrafficTimeRange
            value={timeRange}
            onChange={setTimeRange}
            disabled={loading}
          />

          {/* Refresh Action Button */}
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="p-2 rounded-xl bg-[#091524] hover:bg-[#3F72AF]/20 border border-[#3F72AF]/40 text-blue-200 hover:text-white transition-all cursor-pointer shadow-xs disabled:opacity-40"
            title="Refresh Live Telemetry Feed"
            aria-label="Refresh Live Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Analytics Metric Cards Grid */}
      <div className="relative z-10 my-6">
        <TrafficMetrics metrics={data?.metrics} loading={loading} />
      </div>

      {/* View Mode Segmented Switcher */}
      <div className="relative z-10 flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5 p-1 bg-[#091524] border border-[#3F72AF]/30 rounded-xl font-mono text-[11px]">
          <button
            type="button"
            onClick={() => setActiveTab('both')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'both'
                ? 'bg-[#3F72AF] text-white shadow-[0_0_10px_rgba(63,114,175,0.4)]'
                : 'text-blue-300/60 hover:text-white'
            }`}
          >
            Command Split (Mesh + Wave)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mesh')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'mesh'
                ? 'bg-[#3F72AF] text-white shadow-[0_0_10px_rgba(63,114,175,0.4)]'
                : 'text-blue-300/60 hover:text-white'
            }`}
          >
            Network Mesh
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('waveform')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'waveform'
                ? 'bg-[#3F72AF] text-white shadow-[0_0_10px_rgba(63,114,175,0.4)]'
                : 'text-blue-300/60 hover:text-white'
            }`}
          >
            Oscilloscope
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-blue-300/60">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>SYNCHRONIZED PACKET STREAM ACTIVE</span>
        </div>
      </div>

      {/* Central Visualizers */}
      <div className="relative z-10 space-y-6">
        {activeTab === 'both' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Network Mesh (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col">
              <CyberNetworkVisualization
                nodes={data?.nodes}
                connections={data?.connections}
                className="h-full min-h-[380px]"
              />
            </div>
            {/* Traffic Oscilloscope Waveform (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <CyberTrafficWaveform
                points={data?.points}
                loading={loading}
                className="h-full"
              />
            </div>
          </div>
        ) : activeTab === 'mesh' ? (
          <CyberNetworkVisualization
            nodes={data?.nodes}
            connections={data?.connections}
            className="h-[460px]"
          />
        ) : (
          <CyberTrafficWaveform
            points={data?.points}
            loading={loading}
            className="h-[380px]"
          />
        )}
      </div>

      {/* Bottom Sub-Telemetry Analytics Breakdown */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 mt-6 pt-6 border-t border-[#3F72AF]/25 font-mono text-xs">
        {/* Top Routes (7 Cols) */}
        <div className="md:col-span-7 p-4 sm:p-5 rounded-2xl bg-[#091524]/90 border border-[#3F72AF]/30">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#3F72AF]/20">
            <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-2 text-xs">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>TOP ACTIVE TRAFFIC ROUTES</span>
            </h4>
            <span className="text-[10px] text-blue-300/50">MEASURED BY VOLUME</span>
          </div>

          <div className="space-y-3">
            {(!data?.metrics?.topRoutes || data.metrics.topRoutes.length === 0) ? (
              <div className="text-gray-500 py-6 text-center text-xs">No route requests recorded in window</div>
            ) : (
              data.metrics.topRoutes.map((route, i) => (
                <div key={route.path} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400/50 font-bold">0{i + 1}.</span>
                      <span className="text-white font-bold">{route.name}</span>
                      <span className="text-blue-300/50 text-[10px]">({route.path})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-cyan-300 font-bold tabular-nums">
                        {route.count.toLocaleString()} hits
                      </span>
                      <span className="text-blue-200/60 font-semibold tabular-nums w-8 text-right">
                        {route.percent}%
                      </span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 rounded-full bg-[#071324] overflow-hidden border border-[#3F72AF]/20">
                    <div
                      className="h-full bg-gradient-to-r from-[#3F72AF] to-cyan-400 rounded-full transition-all duration-700"
                      style={{ width: `${route.percent}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Traffic Sources & Live Packet Ticker (5 Cols) */}
        <div className="md:col-span-5 p-4 sm:p-5 rounded-2xl bg-[#091524]/90 border border-[#3F72AF]/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#3F72AF]/20">
              <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-2 text-xs">
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>REFERRAL & INGRESS SOURCES</span>
              </h4>
              <span className="text-[10px] text-blue-300/50">CHANNEL MIX</span>
            </div>

            <div className="space-y-2.5">
              {(!data?.metrics?.sources || data.metrics.sources.length === 0) ? (
                <div className="text-gray-500 py-4 text-center text-xs">No source telemetry captured</div>
              ) : (
                data.metrics.sources.map(src => (
                  <div key={src.source} className="flex items-center justify-between p-2 rounded-xl bg-[#071324] border border-[#3F72AF]/20 text-[11px]">
                    <span className="text-blue-200 font-medium">{src.source}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold tabular-nums">{src.percent}%</span>
                      <span className="text-blue-400/50 text-[10px]">({src.count.toLocaleString()})</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Status Ledger Footer */}
          <div className="mt-4 pt-3 border-t border-[#3F72AF]/20 flex items-center justify-between text-[10px] text-blue-300/60">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>TLS 1.3 // ZERO-PII AGGREGATION</span>
            </span>
            <span className="text-right">
              {data?.lastUpdated ? `SYNC ${new Date(data.lastUpdated).toLocaleTimeString()}` : 'STANDBY'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
