import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { 
  Users, 
  Compass, 
  Inbox, 
  ShieldAlert, 
  Flag, 
  CheckCircle2, 
  TrendingUp, 
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Sparkles
} from 'lucide-react';
import { AnimatedCounter } from '../../components/common';

export const AdminOverview: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [overviewStats, auditLogs] = await Promise.all([
          api.getAdminOverview().catch(() => null),
          api.getAdminAuditLogs().catch(() => []),
        ]);
        setStats(overviewStats);
        setActions(auditLogs);
      } catch (err) {
        console.error('Failed to load admin overview', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Overview Title */}
      <div className="border-b border-[#DBE2EF]/60 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#112D4E] text-white text-[11px] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Executive Control Plane
            </span>
            <span className="text-gray-400 text-xs">•</span>
            <span className="text-xs text-gray-500 font-mono">Live PostgreSQL Ledger</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#112D4E] tracking-tight">Admin Overview</h1>
          <p className="text-sm text-gray-600 mt-1">
            Realtime platform telemetry, user account enforcement, and moderation control.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/moderation"
            className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all flex items-center gap-1.5 btn-tactile"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Content Moderation</span>
          </Link>
          <Link
            to="/admin/submissions"
            className="px-4 py-2 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs btn-tactile btn-glow"
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Review Queue</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-[#DBE2EF] shadow-xs card-interactive">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Registered Creators</span>
            <Users className="w-4 h-4 text-[#3F72AF]" />
          </div>
          <div className="text-3xl font-black text-[#112D4E] tabular-nums">
            {loading ? '...' : <AnimatedCounter value={stats?.totalUsers ?? 0} />}
          </div>
          <span className="text-xs font-semibold text-emerald-600 mt-1 block">
            {stats?.activeUsers ?? 0} active accounts
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#DBE2EF] shadow-xs card-interactive">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Campaigns</span>
            <Compass className="w-4 h-4 text-[#3F72AF]" />
          </div>
          <div className="text-3xl font-black text-[#112D4E] tabular-nums">
            {loading ? '...' : <AnimatedCounter value={stats?.activeCampaigns ?? 0} />}
          </div>
          <span className="text-xs font-medium text-gray-500 mt-1 block">
            {stats?.totalCampaigns ?? 0} total briefs
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#DBE2EF] shadow-xs card-interactive">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Reviews</span>
            <Inbox className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-[#112D4E] tabular-nums">
            {loading ? '...' : <AnimatedCounter value={stats?.pendingReviews ?? 0} />}
          </div>
          <span className="text-xs font-semibold text-amber-600 mt-1 block">
            Requires brand audit
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#DBE2EF] shadow-xs card-interactive">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Safety Reports</span>
            <Flag className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-black text-[#112D4E] tabular-nums">
            {loading ? '...' : <AnimatedCounter value={stats?.pendingReports ?? 0} />}
          </div>
          <span className="text-xs font-semibold text-rose-600 mt-1 block">
            Pending resolution
          </span>
        </div>
      </div>

      {/* Main Sections: Quick Actions + Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Quick Operational Shortcuts (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#DBE2EF] shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-[#112D4E] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#3F72AF]" />
              Executive Operations
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                to="/admin/users"
                className="p-4 rounded-2xl bg-[#F9F7F7] hover:bg-[#DBE2EF]/60 border border-[#DBE2EF] transition-all flex flex-col justify-between group card-interactive"
              >
                <div>
                  <h4 className="font-bold text-sm text-[#112D4E] group-hover:text-[#3F72AF] transition-colors">
                    Manage User Accounts
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Inspect creator profiles, suspend abusers, and enforce verification.
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs font-bold text-[#3F72AF]">
                  <span>Open Directory</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>

              <Link
                to="/admin/moderation"
                className="p-4 rounded-2xl bg-[#F9F7F7] hover:bg-[#DBE2EF]/60 border border-[#DBE2EF] transition-all flex flex-col justify-between group card-interactive"
              >
                <div>
                  <h4 className="font-bold text-sm text-[#112D4E] group-hover:text-[#3F72AF] transition-colors">
                    Content Moderation
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Unpublish violating public community posts and audit content flags.
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs font-bold text-[#3F72AF]">
                  <span>Open Moderation</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>

              <Link
                to="/admin/submissions"
                className="p-4 rounded-2xl bg-[#F9F7F7] hover:bg-[#DBE2EF]/60 border border-[#DBE2EF] transition-all flex flex-col justify-between group card-interactive"
              >
                <div>
                  <h4 className="font-bold text-sm text-[#112D4E] group-hover:text-[#3F72AF] transition-colors">
                    Campaign Deliverables
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Approve deliverables, request revisions, and release escrow funds.
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs font-bold text-[#3F72AF]">
                  <span>Review Queue</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>

              <Link
                to="/admin/reports"
                className="p-4 rounded-2xl bg-[#F9F7F7] hover:bg-[#DBE2EF]/60 border border-[#DBE2EF] transition-all flex flex-col justify-between group card-interactive"
              >
                <div>
                  <h4 className="font-bold text-sm text-[#112D4E] group-hover:text-[#3F72AF] transition-colors">
                    Safety & Reports
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Investigate user flags regarding copyright, licensing, and compliance.
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs font-bold text-[#3F72AF]">
                  <span>View Reports</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Audit Trail Log Stream (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-[#DBE2EF] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#DBE2EF]/60 pb-3">
            <h3 className="font-extrabold text-sm text-[#112D4E] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Recent Audit Events
            </h3>
            <span className="text-[11px] text-gray-400 font-mono">Immutable Log</span>
          </div>

          {actions.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">
              No recent audit actions logged.
            </div>
          ) : (
            <div className="space-y-3">
              {actions.slice(0, 5).map(act => (
                <div key={act.id} className="p-3 rounded-xl bg-[#F9F7F7] border border-[#DBE2EF]/60 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#112D4E] uppercase text-[10px] tracking-wider">
                      {act.action.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-gray-600 text-xs">{act.reason || 'Action executed by administrator'}</p>
                  <span className="text-[10px] text-[#3F72AF] font-semibold block">
                    By {act.actorName}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
