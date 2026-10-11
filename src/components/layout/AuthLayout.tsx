import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface AuthLayoutProps {
  children?: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen atmospheric-mesh-bg text-[#112D4E] flex flex-col justify-between font-sans relative overflow-x-hidden selection:bg-[#DBE2EF] selection:text-[#112D4E]">
      {/* Ambient Lighting Orbs */}
      <div 
        className="absolute top-[-10%] left-[15%] w-[450px] h-[450px] rounded-full bg-[#3F72AF]/10 blur-[120px] pointer-events-none" 
        aria-hidden="true"
      />
      <div 
        className="absolute bottom-[5%] right-[10%] w-[500px] h-[500px] rounded-full bg-[#DBE2EF]/60 blur-[130px] pointer-events-none" 
        aria-hidden="true"
      />

      {/* Clean, Focused BrandWaves Auth Header */}
      <header className="liquid-glass-header sticky top-0 z-30 h-16 px-4 sm:px-8 flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center gap-2.5 group"
          aria-label="BrandWaves Home"
        >
          <div className="w-8 h-8 rounded-xl bg-[#3F72AF] group-hover:bg-[#112D4E] transition-colors flex items-center justify-center text-white shadow-xs">
            <span className="material-symbols-outlined text-[18px]">waves</span>
          </div>
          <span className="text-base font-extrabold text-[#112D4E] tracking-tight">
            BrandWaves
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/faq"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3F72AF] hover:text-[#112D4E] px-3 py-1.5 rounded-xl hover:bg-white/60 transition-colors"
          >
            <span>Help & FAQ</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#112D4E] px-3 py-1.5 rounded-xl hover:bg-white/60 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Marketplace</span>
          </Link>
        </div>
      </header>

      {/* Main Form Content Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        {children || <Outlet />}
      </main>

      {/* Minimal Focused Footer */}
      <footer className="py-6 px-4 text-center text-xs text-gray-400 relative z-10 border-t border-[#DBE2EF]/40">
        <div className="max-w-md mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} BrandWaves. All rights reserved.</span>
          <div className="flex gap-4">
            <Link to="/" className="hover:text-[#112D4E] transition-colors">Marketplace</Link>
            <Link to="/products" className="hover:text-[#112D4E] transition-colors">Products</Link>
            <Link to="/creators" className="hover:text-[#112D4E] transition-colors">Creators</Link>
            <Link to="/faq" className="hover:text-[#112D4E] transition-colors font-semibold text-[#3F72AF]">FAQ</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
