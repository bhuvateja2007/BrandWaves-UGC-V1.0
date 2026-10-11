import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { 
  Settings, 
  Database, 
  ShieldCheck, 
  HardDrive, 
  Key, 
  CheckCircle2, 
  AlertTriangle,
  FileCode,
  Terminal
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="max-w-4xl space-y-8 animate-fadeIn pb-12">
      <div className="border-b border-[#DBE2EF]/60 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#112D4E] tracking-tight">
          System Architecture & Security Settings
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Supabase infrastructure health, Row-Level Security telemetry, and storage policies.
        </p>
      </div>

      {/* Supabase Connection State Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DBE2EF] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#DBE2EF] text-[#3F72AF] flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#112D4E]">Supabase Backend Integration</h3>
              <p className="text-xs text-gray-500">PostgreSQL, Auth, Storage, and Realtime replication</p>
            </div>
          </div>

          <div>
            {isSupabaseConfigured ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Live Cloud Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Local Resilient Dev Mode
              </span>
            )}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#F9F7F7] border border-[#DBE2EF] text-xs space-y-2">
          <div className="flex justify-between">
            <span className="font-semibold text-gray-500">Target Tables:</span>
            <span className="font-mono text-[#112D4E]">profiles, user_roles, campaigns, posts, submissions, reports, moderation_actions</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-500">Storage Bucket:</span>
            <span className="font-mono text-[#112D4E]">brandwaves-media (25MB limit)</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-500">Realtime Channels:</span>
            <span className="font-mono text-[#112D4E]">posts, submissions, notifications</span>
          </div>
        </div>
      </div>

      {/* Row-Level Security (RLS) Status */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DBE2EF] shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#DBE2EF] text-[#3F72AF] flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-[#112D4E]">PostgreSQL Row-Level Security (RLS)</h3>
            <p className="text-xs text-gray-500">10 database-enforced security policies active in migrations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Cross-tenant profile isolation enforced</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Submissions private to creator & brand</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Unpublished media restricted from public queries</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Client role spoofing blocked by security definer</span>
          </div>
        </div>
      </div>

      {/* Admin Operator Bootstrapping Instructions */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DBE2EF] shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#112D4E] text-white flex items-center justify-center">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-[#112D4E]">Secure Operator Promotion</h3>
            <p className="text-xs text-gray-500">Bootstrap instructions via migration SQL script</p>
          </div>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed">
          To promote an operator account to administrator in your Supabase project, execute the script located in{' '}
          <code className="px-1.5 py-0.5 rounded bg-[#F9F7F7] border border-[#DBE2EF] text-[#112D4E] font-mono text-[11px]">
            supabase/migrations/bootstrap_admin.sql
          </code>{' '}
          in the Supabase SQL editor. Public self-registration of administrators is strictly prohibited.
        </p>
      </div>
    </div>
  );
};
