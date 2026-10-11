import React from 'react';
import { CyberCell } from '../../components/admin/cyber-cell';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminCyberCell: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="border-b border-[#DBE2EF]/60 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#112D4E] text-white text-[11px] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Live Mesh Ingress Console
            </span>
            <span className="text-gray-400 text-xs">•</span>
            <span className="text-xs text-gray-500 font-mono">Telemetry Sector 07</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#112D4E] tracking-tight">Cyber Cell Control Center</h1>
          <p className="text-sm text-gray-600 mt-1">
            Realtime network topology, edge packet ingress, and platform traffic intelligence.
          </p>
        </div>

        <div>
          <Link
            to="/admin"
            className="px-4 py-2 rounded-xl bg-white hover:bg-gray-50 border border-[#DBE2EF] text-[#112D4E] text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs btn-tactile"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#3F72AF]" />
            <span>Return to Executive Overview</span>
          </Link>
        </div>
      </div>

      <CyberCell />
    </div>
  );
};
