import React from 'react';
import { Link } from 'react-router-dom';

interface AuthCardProps {
  title: string;
  subtitle?: string;
  badge?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  title,
  subtitle,
  badge,
  children,
  footer,
}) => {
  return (
    <div className="w-full max-w-md mx-auto animate-fadeIn my-auto">
      <div className="liquid-glass-surface p-7 sm:p-9 rounded-3xl space-y-6 relative overflow-hidden shadow-glass">
        {/* Subtle top specular reflection line */}
        <div 
          className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" 
          aria-hidden="true" 
        />

        {/* BrandWaves Logo Header */}
        <div className="text-center">
          <Link 
            to="/" 
            className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#3F72AF] text-white shadow-md mb-3 hover:scale-105 active:scale-95 transition-all duration-200"
            aria-label="BrandWaves Home"
          >
            <span className="material-symbols-outlined text-[28px]">waves</span>
          </Link>

          {badge && (
            <div className="mb-2">
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-extrabold tracking-wide uppercase bg-[#DBE2EF]/80 text-[#112D4E] border border-white/60">
                {badge}
              </span>
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl font-black text-[#112D4E] tracking-tight">
            {title}
          </h1>

          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed max-w-sm mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* Form Body */}
        <div>{children}</div>

        {/* Optional Footer Link */}
        {footer && (
          <div className="text-center pt-3 border-t border-[#DBE2EF]/60">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
