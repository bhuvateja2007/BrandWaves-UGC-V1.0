import React, { useState } from 'react';
import { 
  Users, 
  Video, 
  Building2, 
  ShieldAlert, 
  Copy, 
  Check, 
  ArrowRight, 
  Sparkles, 
  Lock, 
  Mail, 
  Info,
  ExternalLink
} from 'lucide-react';
import { PublicRole } from '../../types';

export interface DemoAccountInfo {
  role: PublicRole | 'admin';
  roleLabel: string;
  badge: string;
  name: string;
  handle: string;
  email: string;
  password?: string;
  isRestricted?: boolean;
  description: string;
  keyFeatures: string[];
}

export const DEMO_ACCOUNTS: DemoAccountInfo[] = [
  {
    role: 'creator',
    roleLabel: 'Creator Experience',
    badge: 'Verified Pro Creator',
    name: 'Alex Rivera',
    handle: '@alexcreates',
    email: 'creator@brandwaves.io',
    password: 'Password123!',
    description: 'Explore live campaign briefs, test AI matchmaker recommendations, and preview video deliverable workflows.',
    keyFeatures: ['Browse Active Briefs', 'AI Matchmaker Discovery', 'Submit UGC Deliverables', 'Track Escrow Earnings'],
  },
  {
    role: 'brand_owner',
    roleLabel: 'Brand Partner',
    badge: 'Verified Brand Partner',
    name: 'Brand Owner (Velox)',
    handle: '@velox_athletics',
    email: 'brand@brandwaves.io',
    password: 'Password123!',
    description: 'Manage marketing campaigns, generate AI briefs, review creator video submissions, and inspect performance metrics.',
    keyFeatures: ['Campaign Brief Management', 'Creator AI Matching', 'Video Submission Queue', 'Analytics & Velocity'],
  },
  {
    role: 'customer',
    roleLabel: 'Customer & Shopper',
    badge: 'Curator & Reviewer',
    name: 'Rohan Verma',
    handle: '@rohanv',
    email: 'customer@brandwaves.io',
    password: 'Password123!',
    description: 'Discover trending creator-endorsed products, curate saved wishlists, and publish authentic product reviews.',
    keyFeatures: ['Product Showcase Hub', 'Curated Wishlist Storage', 'Verified UGC Reviews', 'Community Feedback'],
  },
  {
    role: 'admin',
    roleLabel: 'Platform Administrator',
    badge: 'Restricted Access',
    name: 'Governance Operator',
    handle: '@platform_admin',
    email: 'admin@brandwaves.io',
    isRestricted: true,
    description: 'Supervised administration, content moderation, fraud mitigation, and compliance auditing. Access restricted to authorized operators.',
    keyFeatures: ['Executive Overview', 'Content Moderation', 'Application Governance', 'System Telemetry'],
  },
];

interface DemoAccountsSectionProps {
  onSelectDemo: (demo: { email: string; password: string; role: PublicRole }) => void;
  selectedRole?: PublicRole;
}

export const DemoAccountsSection: React.FC<DemoAccountsSectionProps> = ({
  onSelectDemo,
  selectedRole,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-[#DBE2EF] p-5 sm:p-7 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DBE2EF]/70">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DBE2EF] text-[#112D4E] text-xs font-bold mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#3F72AF]" />
            <span>Hackathon & Judge Testing</span>
          </div>
          <h2 className="text-xl font-black text-[#112D4E] tracking-tight">
            Explore Demo Accounts
          </h2>
          <p className="text-xs text-gray-600 mt-0.5">
            Test full role-specific journeys without creating a new account. Select an account to auto-fill the login form.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Supabase Auth Live
          </span>
        </div>
      </div>

      {/* Shared Environment Notice */}
      <div className="p-3.5 rounded-2xl bg-[#F9F7F7] border border-[#DBE2EF] flex items-start gap-3">
        <Info className="w-4 h-4 text-[#3F72AF] shrink-0 mt-0.5" />
        <div className="text-xs text-gray-600 space-y-1">
          <p className="font-bold text-[#112D4E]">
            Shared Sandbox Notice
          </p>
          <p className="leading-relaxed text-[11px]">
            Demo accounts are public, shared accounts for evaluation and hackathon judging. Test records and submissions may be periodically refreshed. Please do not store sensitive personal information or passwords.
          </p>
        </div>
      </div>

      {/* Demo Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DEMO_ACCOUNTS.map((account) => {
          const isSelected = selectedRole === account.role;
          const isRestricted = account.isRestricted;

          return (
            <div
              key={account.role}
              className={`rounded-2xl p-4 sm:p-5 border transition-all flex flex-col justify-between space-y-4 ${
                isRestricted
                  ? 'bg-gray-50/70 border-gray-200 opacity-90'
                  : isSelected
                  ? 'bg-blue-50/40 border-[#3F72AF] shadow-sm ring-1 ring-[#3F72AF]'
                  : 'bg-white border-[#DBE2EF] hover:border-[#3F72AF]/60 hover:shadow-2xs'
              }`}
            >
              {/* Card Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      account.role === 'creator'
                        ? 'bg-purple-100 text-purple-700'
                        : account.role === 'brand_owner'
                        ? 'bg-blue-100 text-[#3F72AF]'
                        : account.role === 'customer'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}>
                      {account.role === 'creator' && <Video className="w-4 h-4" />}
                      {account.role === 'brand_owner' && <Building2 className="w-4 h-4" />}
                      {account.role === 'customer' && <Users className="w-4 h-4" />}
                      {account.role === 'admin' && <Lock className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#112D4E] leading-none">
                        {account.roleLabel}
                      </h3>
                      <span className="text-[11px] text-gray-500 font-medium">
                        {account.name} ({account.handle})
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isRestricted
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-[#DBE2EF] text-[#112D4E]'
                  }`}>
                    {account.badge}
                  </span>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed pt-1">
                  {account.description}
                </p>

                {/* Key features pill list */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {account.keyFeatures.map((feat, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-[#F9F7F7] text-gray-700 font-medium border border-[#DBE2EF]/60"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Credentials & Actions */}
              <div className="pt-3 border-t border-[#DBE2EF]/60 space-y-3">
                {isRestricted ? (
                  <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/60 text-rose-800 text-xs flex items-start gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-relaxed">
                      Administrator access is protected by strict PostgreSQL RLS policies and requires private operator authentication. Public credentials are not published.
                    </span>
                  </div>
                ) : (
                  <>
                    {/* Credentials Display Box */}
                    <div className="bg-[#F9F7F7] rounded-xl p-2.5 border border-[#DBE2EF]/80 space-y-1.5 text-xs">
                      {/* Email row */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-gray-600 truncate min-w-0">
                          <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="text-[11px] font-mono text-[#112D4E] truncate select-all">
                            {account.email}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(account.email, `${account.role}-email`)}
                          className="shrink-0 p-1 text-gray-500 hover:text-[#112D4E] hover:bg-white rounded transition-colors"
                          title="Copy Email"
                          aria-label={`Copy ${account.roleLabel} Email`}
                        >
                          {copiedKey === `${account.role}-email` ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                              <Check className="w-3 h-3" />
                              <span>Copied</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-gray-500">
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </span>
                          )}
                        </button>
                      </div>

                      {/* Password row */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-gray-600 truncate min-w-0">
                          <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="text-[11px] font-mono text-[#112D4E] truncate select-all">
                            {account.password}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(account.password!, `${account.role}-password`)}
                          className="shrink-0 p-1 text-gray-500 hover:text-[#112D4E] hover:bg-white rounded transition-colors"
                          title="Copy Password"
                          aria-label={`Copy ${account.roleLabel} Password`}
                        >
                          {copiedKey === `${account.role}-password` ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                              <Check className="w-3 h-3" />
                              <span>Copied</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-gray-500">
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </span>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Use Demo Account Button */}
                    <button
                      type="button"
                      onClick={() => onSelectDemo({
                        email: account.email,
                        password: account.password!,
                        role: account.role as PublicRole,
                      })}
                      className="w-full py-2.5 px-3 bg-[#3F72AF] hover:bg-[#112D4E] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 btn-tactile cursor-pointer"
                    >
                      <span>Use {account.role === 'creator' ? 'Creator' : account.role === 'brand_owner' ? 'Brand' : 'Customer'} Demo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
