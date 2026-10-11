import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  ShoppingBag, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  UserCheck, 
  Layers, 
  Compass,
  Bookmark
} from 'lucide-react';

export const CustomerDashboard: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#112D4E] to-[#3F72AF] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-white/90 border border-white/15">
            <UserCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Verified Customer Account</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Welcome back, {currentUser?.name || 'Shopper'}!
          </h1>

          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
            Your BrandWaves identity is secure. Discover creator-reviewed products, explore independent DTC brands, and experience unvarnished video testimonials.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/products"
              className="py-2.5 px-5 bg-white text-[#112D4E] hover:bg-[#DBE2EF] font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-[#3F72AF]" />
              <span>Explore Products</span>
            </Link>

            <Link
              to="/creators"
              className="py-2.5 px-5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl backdrop-blur-md transition-all flex items-center gap-2 border border-white/20"
            >
              <Compass className="w-4 h-4" />
              <span>Discover Creators</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Honest Phase 2 Status Notice */}
      <div className="p-5 rounded-2xl bg-[#DBE2EF]/40 border border-[#DBE2EF] flex items-start gap-3.5 text-xs text-[#112D4E]">
        <ShieldCheck className="w-5 h-5 text-[#3F72AF] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-sm block">Phase 2 Identity & Authentication Complete</span>
          <p className="text-gray-600 leading-relaxed">
            Your customer identity and role authorization are actively enforced. The complete Customer Saved Collections & Order Tracking portal is slated for Phase 3. During Phase 2, enjoy secure session management and authentic discovery.
          </p>
        </div>
      </div>

      {/* Discovery Hub Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Products Card */}
        <Link 
          to="/products"
          className="bg-white p-6 rounded-3xl border border-[#DBE2EF] hover:shadow-lg transition-all group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#DBE2EF] text-[#3F72AF] flex items-center justify-center group-hover:bg-[#3F72AF] group-hover:text-white transition-colors">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-[#112D4E]">Standout Products</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Explore 24 tested products across beverage, skincare, streetwear, audio, and coffee categories.
            </p>
          </div>
          <div className="pt-4 flex items-center text-xs font-bold text-[#3F72AF] group-hover:translate-x-1 transition-transform">
            <span>Browse Catalog</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </Link>

        {/* Brands Card */}
        <Link 
          to="/brands"
          className="bg-white p-6 rounded-3xl border border-[#DBE2EF] hover:shadow-lg transition-all group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#DBE2EF] text-[#3F72AF] flex items-center justify-center group-hover:bg-[#3F72AF] group-hover:text-white transition-colors">
              <Layers className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-[#112D4E]">Curated Brands</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Discover the 10 independent partner brands crafting goods with obsessive attention to ingredients.
            </p>
          </div>
          <div className="pt-4 flex items-center text-xs font-bold text-[#3F72AF] group-hover:translate-x-1 transition-transform">
            <span>View Brands</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </Link>

        {/* Creators Card */}
        <Link 
          to="/creators"
          className="bg-white p-6 rounded-3xl border border-[#DBE2EF] hover:shadow-lg transition-all group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#DBE2EF] text-[#3F72AF] flex items-center justify-center group-hover:bg-[#3F72AF] group-hover:text-white transition-colors">
              <Compass className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-[#112D4E]">Creator Roster</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Meet 18 verified creators across 8 content niches sharing real-life routines and unvarnished feedback.
            </p>
          </div>
          <div className="pt-4 flex items-center text-xs font-bold text-[#3F72AF] group-hover:translate-x-1 transition-transform">
            <span>Find Creators</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </Link>
      </div>

      {/* Account Details Box */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DBE2EF] space-y-4">
        <h3 className="text-base font-bold text-[#112D4E]">Your Account Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-[#F9F7F7] rounded-xl border border-[#DBE2EF]">
            <span className="text-gray-400 block mb-0.5">Email Address</span>
            <span className="font-semibold text-[#112D4E]">{currentUser?.email}</span>
          </div>
          <div className="p-3 bg-[#F9F7F7] rounded-xl border border-[#DBE2EF]">
            <span className="text-gray-400 block mb-0.5">Authoritative Role</span>
            <span className="font-semibold text-[#3F72AF] uppercase tracking-wider">{currentUser?.role}</span>
          </div>
          <div className="p-3 bg-[#F9F7F7] rounded-xl border border-[#DBE2EF]">
            <span className="text-gray-400 block mb-0.5">Email Verified</span>
            <span className="font-semibold text-emerald-700">
              {currentUser?.emailVerified ? 'Verified' : 'Verification Pending'}
            </span>
          </div>
        </div>
        <div className="pt-2">
          <Link
            to="/profile"
            className="text-xs font-semibold text-[#3F72AF] hover:underline"
          >
            Update profile preferences →
          </Link>
        </div>
      </div>
    </div>
  );
};
