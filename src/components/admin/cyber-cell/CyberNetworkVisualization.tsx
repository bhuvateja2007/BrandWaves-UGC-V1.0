import React, { useRef, useEffect, useState } from 'react';
import { NetworkNode, NetworkConnection } from '../../../types/traffic';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { ShieldCheck, Activity, Server, Database, Globe, Cpu } from 'lucide-react';

interface CyberNetworkVisualizationProps {
  nodes?: NetworkNode[];
  connections?: NetworkConnection[];
  className?: string;
}

export const CyberNetworkVisualization: React.FC<CyberNetworkVisualizationProps> = ({
  nodes = [],
  connections = [],
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();
  const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    // Resize canvas to match display size
    const resize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Particle pool for packet flow
    const packets = connections.map((conn, idx) => ({
      fromId: conn.from,
      toId: conn.to,
      progress: (idx * 0.23) % 1,
      speed: (conn.speed || 1) * 0.006,
      size: 2.5,
    }));

    const render = () => {
      if (!containerRef.current || !canvas) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      ctx.clearRect(0, 0, width, height);

      // 1. Perspective Cyber Grid Layer
      ctx.save();
      const gridCols = 16;
      const gridRows = 9;
      const colStep = width / gridCols;
      const rowStep = height / gridRows;

      ctx.strokeStyle = 'rgba(63, 114, 175, 0.08)';
      ctx.lineWidth = 1;

      // Vertical grid lines with subtle breathing
      for (let c = 0; c <= gridCols; c++) {
        const x = c * colStep;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal grid lines
      for (let r = 0; r <= gridRows; r++) {
        const y = r * rowStep;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Slow sweeping radar horizon line
      if (!reducedMotion) {
        t += 0.02;
        const scanY = ((Math.sin(t * 0.4) + 1) / 2) * height;
        const grad = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
        grad.addColorStop(0, 'rgba(0, 240, 255, 0)');
        grad.addColorStop(0.5, 'rgba(0, 240, 255, 0.12)');
        grad.addColorStop(1, 'rgba(0, 240, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, scanY - 20, width, 40);
      }
      ctx.restore();

      // Node coordinates map
      const nodeCoords = new Map<string, { x: number; y: number }>();
      nodes.forEach(n => {
        nodeCoords.set(n.id, {
          x: (n.x / 100) * width,
          y: (n.y / 100) * height,
        });
      });

      // 2. Draw Connections
      connections.forEach(conn => {
        const p1 = nodeCoords.get(conn.from);
        const p2 = nodeCoords.get(conn.to);
        if (!p1 || !p2) return;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = 'rgba(63, 114, 175, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.restore();
      });

      // 3. Draw Flowing Luminous Packets
      if (!reducedMotion) {
        packets.forEach(pkt => {
          const p1 = nodeCoords.get(pkt.fromId);
          const p2 = nodeCoords.get(pkt.toId);
          if (!p1 || !p2) return;

          pkt.progress = (pkt.progress + pkt.speed) % 1;
          const px = p1.x + (p2.x - p1.x) * pkt.progress;
          const py = p1.y + (p2.y - p1.y) * pkt.progress;

          ctx.save();
          ctx.beginPath();
          ctx.arc(px, py, pkt.size, 0, Math.PI * 2);
          ctx.fillStyle = '#00f0ff';
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.restore();
        });
      }

      // 4. Draw Network Nodes
      nodes.forEach(n => {
        const pt = nodeCoords.get(n.id);
        if (!pt) return;

        const isHovered = hoveredNode?.id === n.id;
        const baseRadius = isHovered ? 14 : 11;

        // Gentle Pulse Ring
        ctx.save();
        if (!reducedMotion) {
          const pulse = (Math.sin(t * 2 + n.x) + 1) / 2;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, baseRadius + 4 + pulse * 6, 0, Math.PI * 2);
          ctx.strokeStyle = n.status === 'active' 
            ? `rgba(0, 240, 255, ${0.15 + pulse * 0.25})`
            : 'rgba(245, 158, 11, 0.25)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Core Node Circle
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, baseRadius, 0, Math.PI * 2);
        ctx.fillStyle = n.status === 'active' ? '#07182c' : '#1a1811';
        ctx.fill();
        ctx.strokeStyle = n.status === 'active' ? '#3F72AF' : '#f59e0b';
        ctx.lineWidth = isHovered ? 2.5 : 1.5;
        ctx.shadowColor = n.status === 'active' ? '#00f0ff' : '#f59e0b';
        ctx.shadowBlur = isHovered ? 12 : 6;
        ctx.stroke();

        // Inner nucleus dot
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = n.status === 'active' ? '#00f0ff' : '#fbbf24';
        ctx.fill();
        ctx.restore();
      });

      if (!reducedMotion) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [nodes, connections, reducedMotion, hoveredNode]);

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'edge': return Globe;
      case 'service': return Server;
      case 'storage': return Database;
      case 'ledger': return ShieldCheck;
      default: return Cpu;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[340px] sm:h-[400px] bg-[#071324] rounded-2xl overflow-hidden border border-[#3F72AF]/30 shadow-2xl select-none ${className}`}
    >
      {/* Background radial ambient lights */}
      <div className="absolute -top-24 left-1/4 w-96 h-96 bg-[#3F72AF]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Cyber Technical Grid Overlay */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10" />

      {/* Top Left Telemetry HUD Badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#091524]/90 border border-[#3F72AF]/40 backdrop-blur-md font-mono text-[11px] text-blue-200">
        <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
        <span className="font-bold tracking-wider text-white">TOPOLOGY MAP</span>
        <span className="text-blue-400/40">|</span>
        <span className="text-cyan-300 font-semibold">{nodes.length} MESH NODES ONLINE</span>
      </div>

      {/* Top Right Latency Indicator */}
      <div className="absolute top-4 right-4 z-20 hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-[#091524]/90 border border-[#3F72AF]/40 backdrop-blur-md font-mono text-[10px] text-blue-200">
        <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          EDGE ROUTING OK
        </span>
        <span className="text-blue-400/40">•</span>
        <span className="text-blue-200/70">SPLINE PACKET DYNAMICS</span>
      </div>

      {/* Interactive HTML Node Overlay for Tooltips & Accessibility */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {nodes.map(node => {
          const Icon = getNodeIcon(node.type);
          const isHovered = hoveredNode?.id === node.id;

          return (
            <div
              key={node.id}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* Invisible touch/click hit target */}
              <button
                type="button"
                className="w-8 h-8 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-cyan-400/60 transition-transform cursor-pointer"
                aria-label={`Node ${node.label}: ${node.reqPerSec} requests per second, ${node.ping}ms ping`}
              >
                <span className="sr-only">{node.label}</span>
              </button>

              {/* Node Label Chip */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2 py-0.5 rounded-md bg-[#091524]/90 border border-[#3F72AF]/40 font-mono text-[9px] text-blue-200 tracking-wider whitespace-nowrap shadow-md pointer-events-none">
                {node.label.split(' ')[0]}
              </div>

              {/* Hover Popover Details */}
              {isHovered && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-52 p-3 rounded-xl bg-[#081527] border border-cyan-400/60 shadow-[0_0_25px_rgba(0,240,255,0.25)] text-white font-mono text-[10px] z-50 pointer-events-none animate-fadeIn">
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#3F72AF]/40 mb-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-cyan-300 truncate">
                      <Icon className="w-3.5 h-3.5" />
                      <span className="truncate">{node.label}</span>
                    </div>
                    <span className="text-[9px] text-emerald-400 font-extrabold uppercase">
                      {node.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-blue-200/80 pt-0.5">
                    <div>
                      <span className="text-[9px] text-blue-400/60 block">THROUGHPUT</span>
                      <span className="font-bold text-white text-xs tabular-nums">{node.reqPerSec} rps</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-blue-400/60 block">EDGE PING</span>
                      <span className="font-bold text-cyan-300 text-xs tabular-nums">{node.ping} ms</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Corner Coordinates Framing */}
      <div className="absolute bottom-3 left-4 z-20 font-mono text-[9px] text-blue-400/50 flex items-center gap-2">
        <span>SYS.SURVEILLANCE: MESH_PASS_01</span>
        <span>•</span>
        <span>ENCRYPTED POSTGRESQL LEDGER LINK</span>
      </div>
    </div>
  );
};
