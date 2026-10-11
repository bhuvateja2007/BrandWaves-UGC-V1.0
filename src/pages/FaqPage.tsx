import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaqAccordion } from '../components/common/FaqAccordion';
import { FAQS, FAQ_CATEGORIES } from '../lib/faqData';
import { HelpCircle, Sparkles, Users, Video, Building2, ShieldCheck } from 'lucide-react';

export const FaqPage: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();

  // Determine initial active tab based on user role
  const getInitialRole = (): 'customer' | 'creator' | 'brand' | 'admin' => {
    if (!currentUser) return 'customer';
    if (currentUser.role === 'admin') return 'admin';
    if (currentUser.role === 'creator') return 'creator';
    if (currentUser.role === 'brand_owner' || currentUser.role === 'brand_admin') return 'brand';
    return 'customer';
  };

  const [activeTab, setActiveTab] = useState<'customer' | 'creator' | 'brand' | 'admin'>(getInitialRole);

  useEffect(() => {
    setActiveTab(getInitialRole());
  }, [currentUser?.role]);

  const roleFaqs = FAQS.filter(item => item.role === activeTab || item.role === 'all');
  const roleCategories = FAQ_CATEGORIES[activeTab] || ['All'];

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto px-4 sm:px-6 py-6">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DBE2EF] text-[#112D4E] text-xs font-bold shadow-2xs">
          <HelpCircle className="w-3.5 h-3.5 text-[#3F72AF]" />
          <span>BrandWaves Knowledge Base</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#112D4E] tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
          Explore answers tailored to your platform experience. Switch roles below to view customer, creator, or brand guidance.
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div className="flex items-center justify-center">
        <div className="inline-flex p-1.5 rounded-2xl bg-white border border-[#DBE2EF] shadow-2xs gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('customer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all btn-tactile ${
              activeTab === 'customer'
                ? 'bg-[#112D4E] text-white shadow-xs'
                : 'text-gray-600 hover:text-[#112D4E] hover:bg-[#F9F7F7]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Customer</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('creator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all btn-tactile ${
              activeTab === 'creator'
                ? 'bg-[#112D4E] text-white shadow-xs'
                : 'text-gray-600 hover:text-[#112D4E] hover:bg-[#F9F7F7]'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Creator</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('brand')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all btn-tactile ${
              activeTab === 'brand'
                ? 'bg-[#112D4E] text-white shadow-xs'
                : 'text-gray-600 hover:text-[#112D4E] hover:bg-[#F9F7F7]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Brand Owner</span>
          </button>

          {/* Admin tab is only visible to verified administrators */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all btn-tactile ${
                activeTab === 'admin'
                  ? 'bg-[#3F72AF] text-white shadow-xs'
                  : 'text-gray-600 hover:text-[#112D4E] hover:bg-[#F9F7F7]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admin Operations</span>
            </button>
          )}
        </div>
      </div>

      {/* Accordion Component */}
      <div className="pt-2">
        <FaqAccordion
          items={roleFaqs}
          categories={roleCategories}
          allowMultiple={false}
        />
      </div>

      {/* Help Footer Callout */}
      <div className="p-6 bg-white rounded-2xl border border-[#DBE2EF] shadow-2xs max-w-2xl mx-auto text-center space-y-2">
        <h3 className="text-sm font-bold text-[#112D4E]">Still have questions?</h3>
        <p className="text-xs text-gray-600">
          Our engineering and community support teams are available around the clock. Reach us directly at{' '}
          <a href="mailto:support@brandwaves.io" className="text-[#3F72AF] font-bold hover:underline">
            support@brandwaves.io
          </a>
        </p>
      </div>
    </div>
  );
};
