import React from 'react';
import { Info } from 'lucide-react';

interface DemoNoticeProps {
  type?: 'general' | 'metrics' | 'brand' | 'creator';
  className?: string;
}

export const DemoNotice: React.FC<DemoNoticeProps> = ({ type = 'general', className = '' }) => {
  const message = {
    general: 'Demo Marketplace: Fictional creator, brand, and campaign data simulated for prototype testing.',
    metrics: 'Simulated sample metrics: Performance and follower counts are simulated for demonstration purposes.',
    brand: 'Fictional Brand Concept: All branding, trademarks, and products shown are original demonstration identities.',
    creator: 'Simulated Creator Workspace: Collaboration briefs and metrics are simulated demonstration data.',
  }[type];

  return (
    <div
      role="status"
      aria-label="Demo Data Notice"
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#DBE2EF]/60 text-[#112D4E] text-xs font-medium border border-[#DBE2EF] ${className}`}
    >
      <Info className="w-3.5 h-3.5 text-[#3F72AF] shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
};
