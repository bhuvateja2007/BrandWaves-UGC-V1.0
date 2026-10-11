import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2
} from 'lucide-react';
import { LegalTrustModal, LegalModalType } from './LegalTrustModal';

export const SkyFooter: React.FC = () => {
  const [activeModal, setActiveModal] = useState<LegalModalType>(null);

  // Social icon destinations with verified accessible labels
  const socialLinks = [
    {
      name: 'Facebook',
      href: 'https://facebook.com',
      label: 'Visit BrandWaves on Facebook',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
    },
    {
      name: 'Instagram',
      href: 'https://instagram.com',
      label: 'Visit BrandWaves on Instagram',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
    },
    {
      name: 'YouTube',
      href: 'https://youtube.com',
      label: 'Visit BrandWaves on YouTube',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
    },
    {
      name: 'Discord',
      href: 'https://discord.com',
      label: 'Join BrandWaves Creator Community on Discord',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
        </svg>
      ),
    },
  ];

  return (
    <footer
      className="relative w-full bg-[#F8FAFC] border-t border-[#DCE5EB] mt-20 select-none"
      role="contentinfo"
      aria-label="BrandWaves Marketplace Footer"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12">
        {/* EDITORIAL BANNER (Brand Statement & Call to Action) */}
        <div className="mb-14 p-8 sm:p-10 rounded-2xl bg-white border border-[#DCE5EB] shadow-subtle">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-[#397AA8] uppercase">
                <Sparkles className="w-3.5 h-3.5 text-[#397AA8]" />
                <span>Verified Creator &amp; Brand Collaboration</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#163B53] tracking-tight">
                Turn authentic storytelling into high-converting UGC campaigns.
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Direct access to tested products, vetted creator talent, and guaranteed escrow protection for every milestone.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <Link
                to="/campaigns"
                className="px-5 py-3 rounded-xl bg-[#163B53] hover:bg-[#26323A] text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 group active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#397AA8]"
              >
                <span>Discover Active Briefs</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/products"
                className="px-5 py-3 rounded-xl bg-white hover:bg-[#F8FAFC] border border-[#DCE5EB] text-[#163B53] font-bold text-xs sm:text-sm transition-all shadow-2xs flex items-center justify-center gap-2 hover:border-[#397AA8] focus:outline-none focus:ring-2 focus:ring-[#397AA8]"
              >
                <span>Browse Products</span>
              </Link>
            </div>
          </div>
        </div>

        {/* STRUCTURED EDITORIAL LINK COLUMNS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-8 mb-12">
          {/* Column 1: BrandWaves Identity & Mission (3 Cols) */}
          <div className="lg:col-span-3 sm:col-span-2 md:col-span-3 flex flex-col gap-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#163B53] flex items-center justify-center text-white shadow-2xs">
                <span className="material-symbols-outlined text-[16px]">waves</span>
              </div>
              <span className="text-lg font-black text-[#163B53] tracking-tight">
                BrandWaves
              </span>
            </div>
            
            <p className="text-xs text-[#64748B] leading-relaxed max-w-xs">
              The verified creator orchestration platform connecting independent brands, creators, and shoppers with milestone escrow.
            </p>

            <div className="text-xs text-[#64748B]">
              <span className="font-semibold text-[#64748B] block text-[10px] uppercase tracking-wider">Inquiries &amp; Support</span>
              <a
                href="mailto:support@brandwaves.io"
                className="text-[#397AA8] font-semibold hover:underline text-xs"
              >
                support@brandwaves.io
              </a>
            </div>

            {/* Platform Operational Status Badge */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setActiveModal('status')}
                className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs hover:bg-emerald-100 transition-colors cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-emerald-500"
                title="Inspect real system status"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>All Systems Operational (99.98%)</span>
              </button>
            </div>
          </div>

          {/* Column 2: Marketplace Discovery (2 Cols) */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <span className="text-[11px] uppercase tracking-wider text-[#64748B] font-bold">
              Marketplace
            </span>
            <nav className="flex flex-col gap-2 text-xs" aria-label="Marketplace Navigation">
              <Link to="/products" className="text-[#64748B] hover:text-[#163B53] transition-colors inline-block">
                Standout Products
              </Link>
              <Link to="/creators" className="text-[#64748B] hover:text-[#163B53] transition-colors inline-block">
                Discover Creators
              </Link>
              <Link to="/brands" className="text-[#64748B] hover:text-[#163B53] transition-colors inline-block">
                Brand Directory
              </Link>
              <Link to="/campaigns" className="text-[#64748B] hover:text-[#163B53] transition-colors inline-block">
                Active UGC Briefs
              </Link>
              <Link to="/leaderboard" className="text-[#64748B] hover:text-[#163B53] transition-colors inline-block">
                Creator Hall of Fame
              </Link>
            </nav>
          </div>

          {/* Column 3: Workspaces & Journeys (2 Cols) */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <span className="text-[11px] uppercase tracking-wider text-[#64748B] font-bold">
              Journeys &amp; Portals
            </span>
            <nav className="flex flex-col gap-2 text-xs" aria-label="Workspaces Navigation">
              <Link to="/join/customer" className="text-[#64748B] hover:text-[#163B53] transition-colors inline-block">
                For Shoppers
              </Link>
              <Link to="/join/creator" className="text-[#397AA8] font-bold hover:text-[#163B53] transition-colors inline-block">
                For Creators
              </Link>
              <Link to="/join/brand" className="text-[#64748B] hover:text-[#163B53] transition-colors inline-block">
                For Brands
              </Link>
              <Link to="/creator" className="text-[#64748B] hover:text-[#163B53] transition-colors inline-block">
                Creator Workspace
              </Link>
              <Link to="/brand" className="text-[#64748B] hover:text-[#163B53] transition-colors inline-block">
                Brand Management
              </Link>
            </nav>
          </div>

          {/* Column 4: Legal and Privacy (2 Cols) */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <span className="text-[11px] uppercase tracking-wider text-[#64748B] font-bold">
              Legal &amp; Privacy
            </span>
            <nav className="flex flex-col gap-2 text-xs" aria-label="Legal Navigation">
              <button
                type="button"
                onClick={() => setActiveModal('terms')}
                className="text-left text-[#64748B] hover:text-[#163B53] transition-colors focus:outline-none focus:underline"
              >
                Terms of Service
              </button>
              <button
                type="button"
                onClick={() => setActiveModal('privacy')}
                className="text-left text-[#64748B] hover:text-[#163B53] transition-colors focus:outline-none focus:underline"
              >
                Privacy &amp; Data Policy
              </button>
              <button
                type="button"
                onClick={() => setActiveModal('rights')}
                className="text-left text-[#64748B] hover:text-[#163B53] transition-colors focus:outline-none focus:underline"
              >
                Commercial Media Rights
              </button>
              <button
                type="button"
                onClick={() => setActiveModal('legal')}
                className="text-left text-[#64748B] hover:text-[#163B53] transition-colors focus:outline-none focus:underline"
              >
                Legal Notice
              </button>
            </nav>
          </div>

          {/* Column 5: Platform Status & Social Platforms (3 Cols) */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#64748B] font-bold block mb-2">
                Support &amp; Platform Status
              </span>
              <div className="flex flex-col gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveModal('security')}
                  className="text-left text-[#64748B] hover:text-[#163B53] transition-colors flex items-center gap-1.5 focus:outline-none focus:underline"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Security &amp; Compliance Center</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal('status')}
                  className="text-left text-[#64748B] hover:text-[#163B53] transition-colors flex items-center gap-1.5 focus:outline-none focus:underline"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#397AA8]" />
                  <span>System Architecture Health</span>
                </button>
              </div>
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#64748B] font-bold block mb-2">
                Social Platforms
              </span>
              <div className="flex items-center gap-2">
                {socialLinks.map((soc) => (
                  <a
                    key={soc.name}
                    href={soc.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-white hover:bg-[#163B53] border border-[#DCE5EB] hover:border-[#163B53] text-[#64748B] hover:text-white flex items-center justify-center transition-colors shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#397AA8]"
                    aria-label={soc.label}
                    title={soc.name}
                  >
                    {soc.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* EDITORIAL SUB-FOOTER STRIP */}
        <div className="pt-6 border-t border-[#DCE5EB] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
          <div>
            <span>© 2026 BrandWaves Inc. All rights reserved. Built for authentic creative collaboration.</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-medium">
            <button
              type="button"
              onClick={() => setActiveModal('legal')}
              className="hover:text-[#163B53] transition-colors focus:outline-none focus:underline"
            >
              Legal Notice
            </button>
            <span className="text-[#DCE5EB]" aria-hidden="true">•</span>
            <button
              type="button"
              onClick={() => setActiveModal('security')}
              className="hover:text-[#163B53] transition-colors focus:outline-none focus:underline"
            >
              Security Operations
            </button>
            <span className="text-[#DCE5EB]" aria-hidden="true">•</span>
            <button
              type="button"
              onClick={() => setActiveModal('status')}
              className="hover:text-[#163B53] transition-colors focus:outline-none focus:underline"
            >
              System Status
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Policy & Status Inspection Modal */}
      <LegalTrustModal type={activeModal} onClose={() => setActiveModal(null)} />
    </footer>
  );
};
