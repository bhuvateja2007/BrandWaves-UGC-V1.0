import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Brand } from '../../types/marketplace';
import { brandOwnerService } from '../../services/brandOwnerService';
import { campaignApplicationService } from '../../services/campaignApplicationService';
import { api } from '../../api/client';
import { 
  Building2, 
  LayoutDashboard, 
  Settings, 
  ShoppingBag, 
  Compass, 
  Users, 
  ClipboardCheck, 
  CheckCircle2, 
  ChevronDown, 
  Database,
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface BrandNavHeaderProps {
  activeBrand: Brand | undefined;
  onBrandChange: (brand: Brand) => void;
  title?: string;
  subtitle?: string;
}

export const BrandNavHeader: React.FC<BrandNavHeaderProps> = ({
  activeBrand,
  onBrandChange,
  title,
  subtitle,
}) => {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [authorizedBrands, setAuthorizedBrands] = useState<Brand[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pendingAppsCount, setPendingAppsCount] = useState<number>(0);
  const [pendingSubsCount, setPendingSubsCount] = useState<number>(0);

  const storageStatus = brandOwnerService.getStorageStatus();

  // Load authorized brands and live pending counts
  useEffect(() => {
    if (!currentUser) return;
    const brands = brandOwnerService.getAuthorizedBrands(currentUser);
    setAuthorizedBrands(brands);

    if (activeBrand) {
      // Pending applications count
      campaignApplicationService.getApplicationsForBrand(activeBrand.id)
        .then((apps) => {
          setPendingAppsCount(apps.filter((a) => a.status === 'pending').length);
        })
        .catch(() => setPendingAppsCount(0));

      // Pending submissions count
      api.getSubmissions({ status: 'pending' })
        .then((subs) => {
          const forBrand = subs.filter(
            (s) => s.brandName.toLowerCase() === activeBrand.name.toLowerCase()
          );
          setPendingSubsCount(forBrand.length);
        })
        .catch(() => setPendingSubsCount(0));
    }
  }, [currentUser, activeBrand]);

  const navLinks = [
    { to: '/brand', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/brand/profile', label: 'Brand Profile', icon: Settings },
    { to: '/brand/products', label: 'Products', icon: ShoppingBag },
    { to: '/brand/campaigns', label: 'Campaigns', icon: Compass },
    { to: '/brand/matchmaker', label: 'AI Matchmaker', icon: Sparkles },
    { to: '/brand/creators', label: 'Discover Creators', icon: Users },
    { 
      to: '/brand/applications', 
      label: 'Applications', 
      icon: ClipboardCheck,
      badge: pendingAppsCount > 0 ? pendingAppsCount : undefined 
    },
    { 
      to: '/brand/submissions', 
      label: 'Submissions', 
      icon: CheckCircle2,
      badge: pendingSubsCount > 0 ? pendingSubsCount : undefined 
    },
  ];

  return (
    <header className="flex flex-col gap-5 mb-8">
      {/* Brand Hero & Switcher Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#DBE2EF] shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 min-w-0">
          {activeBrand?.logo ? (
            <img
              src={activeBrand.logo}
              alt={activeBrand.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#DBE2EF] shadow-sm shrink-0 bg-[#F9F7F7]"
            />
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#DBE2EF] flex items-center justify-center text-[#112D4E] shrink-0">
              <Building2 className="w-8 h-8" />
            </div>
          )}

          <div className="min-w-0 flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#3F72AF] bg-[#DBE2EF]/60 px-2.5 py-0.5 rounded-full">
                Brand Owner Portal
              </span>
              {activeBrand?.category && (
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  • {activeBrand.category}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#112D4E] tracking-tight truncate">
              {title || activeBrand?.name || 'Authorized Brand Portal'}
            </h1>

            <p className="text-xs sm:text-sm text-gray-500 line-clamp-1">
              {subtitle || activeBrand?.tagline || 'Manage your products, creator briefs, and campaign review pipeline.'}
            </p>
          </div>
        </div>

        {/* Brand Switcher & Persistence Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
          {/* Multi-Brand Switcher (If managing multiple brands or Admin) */}
          {authorizedBrands.length > 1 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="px-4 py-2.5 rounded-2xl bg-[#F9F7F7] hover:bg-[#DBE2EF]/60 border border-[#DBE2EF] text-xs font-bold text-[#112D4E] flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                <Building2 className="w-4 h-4 text-[#3F72AF]" />
                <span className="truncate max-w-[140px] sm:max-w-[180px]">
                  {activeBrand?.name || 'Select Brand'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-[#DBE2EF] shadow-floating p-2 z-50 flex flex-col gap-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 px-3 py-1">
                      Your Authorized Brands ({authorizedBrands.length})
                    </span>
                    {authorizedBrands.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          onBrandChange(b);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                          activeBrand?.id === b.id
                            ? 'bg-[#112D4E] text-white shadow-xs'
                            : 'text-[#112D4E] hover:bg-[#F9F7F7]'
                        }`}
                      >
                        <img
                          src={b.logo}
                          alt={b.name}
                          className="w-5 h-5 rounded-md object-cover border border-[#DBE2EF]"
                        />
                        <span className="truncate flex-1">{b.name}</span>
                        {activeBrand?.id === b.id && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Public Profile Link */}
          {activeBrand && (
            <a
              href={`/brands/${activeBrand.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2.5 rounded-2xl bg-white hover:bg-[#F9F7F7] border border-[#DBE2EF] text-xs font-bold text-[#112D4E] flex items-center gap-1.5 transition-all shadow-2xs"
              title="View Public Brand Marketplace Page"
            >
              <span>Public Storefront</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#3F72AF]" />
            </a>
          )}

          {/* Storage Mode Badge */}
          <div 
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#F9F7F7] border border-[#DBE2EF] text-[11px] text-gray-600 font-medium"
            title={storageStatus.message}
          >
            <Database className="w-3.5 h-3.5 text-[#3F72AF]" />
            <span className="hidden sm:inline font-bold text-[#112D4E]">
              {storageStatus.mode === 'supabase' ? 'Cloud Verified' : 'Local Sandbox'}
            </span>
          </div>
        </div>
      </div>

      {/* Brand Navigation Tabs */}
      <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.exact}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer btn-tactile ${
                  isActive
                    ? 'wave-flow-active text-white shadow-xs'
                    : 'bg-white text-gray-600 hover:text-[#112D4E] hover:bg-[#DBE2EF]/50 border border-[#DBE2EF]'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{link.label}</span>
              {link.badge !== undefined && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-[#3F72AF] text-white">
                  {link.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </header>
  );
};
