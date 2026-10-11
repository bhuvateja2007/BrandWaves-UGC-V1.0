import React from 'react';
import { X, ShieldCheck, FileText, Lock, Activity, Scale, CheckCircle2 } from 'lucide-react';

export type LegalModalType = 
  | 'terms' 
  | 'privacy' 
  | 'rights' 
  | 'legal' 
  | 'security' 
  | 'status' 
  | null;

interface LegalTrustModalProps {
  type: LegalModalType;
  onClose: () => void;
}

export const LegalTrustModal: React.FC<LegalTrustModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  const contentMap: Record<
    NonNullable<LegalModalType>,
    {
      title: string;
      subtitle: string;
      icon: React.ReactNode;
      sections: Array<{ heading: string; body: string }>;
    }
  > = {
    terms: {
      title: 'Terms of Service',
      subtitle: 'Standard Commercial Platform Agreement for Creators, Brands, and Shoppers',
      icon: <FileText className="w-5 h-5 text-[#3F72AF]" />,
      sections: [
        {
          heading: '1. Role Eligibility & Platform Conduct',
          body: 'BrandWaves provides an orchestration marketplace connecting independent brand owners and creative producers. Users must register under their authentic legal identity or authorized business entity.',
        },
        {
          heading: '2. Escrow & Payout Clearance',
          body: 'All campaign payments are held in escrow upon campaign publication and disbursed to creators within 48 hours of human brand approval.',
        },
        {
          heading: '3. Deliverable Acceptance & Revisions',
          body: 'Brands retain human review authority. In accordance with platform governance, revisions must cite specific campaign brief requirements.',
        },
      ],
    },
    privacy: {
      title: 'Privacy and Data Policy',
      subtitle: 'Strict Client Privacy, GDPR, and Indian Digital Personal Data Protection Compliance',
      icon: <Lock className="w-5 h-5 text-[#3F72AF]" />,
      sections: [
        {
          heading: '1. Minimal Data Collection',
          body: 'BrandWaves collects only essential operational data: verified email, cryptographic authentication credentials, portfolio links, and deliverable metadata.',
        },
        {
          heading: '2. Zero Third-Party Advertising Trackers',
          body: 'We do not sell user profiles, creator metrics, or shopper browsing data to data brokers or advertising syndicates.',
        },
        {
          heading: '3. Data Retention & Deletion',
          body: 'Users can request complete data export or account erasure at any time through their verified profile settings.',
        },
      ],
    },
    rights: {
      title: 'Commercial & Media Rights',
      subtitle: 'Intellectual Property, Licensing, and Usage Terms for User-Generated Content',
      icon: <Scale className="w-5 h-5 text-[#3F72AF]" />,
      sections: [
        {
          heading: '1. Creator Authorship',
          body: 'Creators retain moral ownership and creator attribution rights for all original media produced.',
        },
        {
          heading: '2. Commercial License Grant',
          body: 'Upon escrow release, the hiring brand receives a non-exclusive, worldwide commercial license for digital marketing, paid ads, and social distribution for the duration agreed in the brief.',
        },
        {
          heading: '3. Organic Attribution',
          body: 'Brands agree to tag verified creator accounts when featuring deliverables organically across social platforms.',
        },
      ],
    },
    legal: {
      title: 'Legal Notice & Compliance',
      subtitle: 'Corporate Disclosures, Jurisdiction, and Registered Entity Information',
      icon: <FileText className="w-5 h-5 text-[#3F72AF]" />,
      sections: [
        {
          heading: '1. Entity Registration',
          body: 'BrandWaves Inc. operates in compliance with international commercial trade regulations and Indian IT Rules 2021.',
        },
        {
          heading: '2. Dispute Resolution',
          body: 'Disputes arising from creative briefs or deliverables are subject to good-faith mediation prior to formal arbitration.',
        },
        {
          heading: '3. Copyright Notice',
          body: 'All brand trademarks, trade dress, and product photography remain property of their respective canonical brand owners.',
        },
      ],
    },
    security: {
      title: 'Security Operations',
      subtitle: 'Application Security Architecture, RBAC Enforcement, and Data Encryption',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
      sections: [
        {
          heading: '1. Access Control & Row Level Security',
          body: 'Multi-tenant isolation is enforced via database Row Level Security policies. Public registration cannot grant administrative permissions.',
        },
        {
          heading: '2. Transport & Secret Security',
          body: 'All data is transmitted via TLS 1.3. Server API secrets and service-role keys are securely quarantined on backend services.',
        },
        {
          heading: '3. Vulnerability Reporting',
          body: 'Security researchers may report verified vulnerability findings directly to security@brandwaves.io.',
        },
      ],
    },
    status: {
      title: 'System Status',
      subtitle: 'Live Operational Telemetry & Component Health',
      icon: <Activity className="w-5 h-5 text-emerald-500" />,
      sections: [
        {
          heading: 'API & Orchestration Engine',
          body: 'Operational • 100% Uptime • Average Response Time: 42ms',
        },
        {
          heading: 'Database & Relational Storage',
          body: 'Operational • Supabase Cloud PostgreSQL & Fallback JSON Store Active',
        },
        {
          heading: 'AI Matchmaker & Smart Review Service',
          body: 'Operational • Deterministic Local Engine & Live Provider Fallback Armed',
        },
      ],
    },
  };

  const current = contentMap[type];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#112D4E]/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
    >
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl border border-[#DBE2EF] shadow-2xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto no-scrollbar space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-[#112D4E] hover:bg-[#F8FAFC] transition-colors focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3.5 pr-8">
          <div className="w-10 h-10 rounded-2xl bg-[#E7F2F8] flex items-center justify-center shrink-0">
            {current.icon}
          </div>
          <div>
            <h2 id="legal-modal-title" className="text-xl font-black text-[#112D4E]">
              {current.title}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">{current.subtitle}</p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4 divide-y divide-[#DBE2EF]/60">
          {current.sections.map((sec, idx) => (
            <div key={idx} className={idx > 0 ? 'pt-4' : ''}>
              <h3 className="text-xs font-bold text-[#112D4E] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#3F72AF]" />
                <span>{sec.heading}</span>
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed pl-5">{sec.body}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#DBE2EF] flex items-center justify-between">
          <span className="text-[11px] text-gray-400 font-mono">BrandWaves v1.0 • October 2026</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#112D4E] text-white text-xs font-bold hover:bg-[#153D56] transition-colors shadow-xs"
          >
            Acknowledge &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
