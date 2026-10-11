import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Shield, 
  Bell, 
  Upload, 
  LogOut, 
  User as UserIcon, 
  Settings,
  Sparkles,
  Search,
  Compass,
  Package,
  Building2,
  Users,
  Bookmark,
  ShoppingBag,
  LayoutDashboard,
  Menu,
  X,
  HelpCircle
} from 'lucide-react';

export const Header: React.FC = () => {
  const { currentUser, isAdmin, isBrandAdmin, isCreator, signOut } = useAuth();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className={`fixed top-0 left-0 ${
        currentUser ? 'lg:left-64' : ''
      } right-0 h-16 liquid-glass-header z-40 flex items-center justify-between px-4 sm:px-6 lg:px-8 transition-all`}
    >
      {/* Subtle top specular reflection line */}
      <div 
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" 
        aria-hidden="true" 
      />

      {/* Left side: Brand Logo if not logged in (since sidebar is hidden), or search */}
      <div className="flex items-center gap-6 flex-1 min-w-0">
        {!currentUser && (
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-xl bg-[#3F72AF] group-hover:bg-[#112D4E] transition-colors flex items-center justify-center text-white shadow-xs">
              <span className="material-symbols-outlined text-[18px]">waves</span>
            </div>
            <span className="text-base font-extrabold text-[#112D4E] tracking-tight">
              BrandWaves
            </span>
          </Link>
        )}

        {/* Public Desktop Navigation Links when unauthenticated */}
        {!currentUser && (
          <nav className="hidden lg:flex items-center gap-1 text-xs font-bold text-gray-600">
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg transition-colors ${
                  isActive ? 'bg-[#DBE2EF] text-[#112D4E]' : 'hover:bg-white/60 hover:text-[#112D4E]'
                }`
              }
            >
              Discover
            </NavLink>
            <NavLink
              to="/creators"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg transition-colors ${
                  isActive ? 'bg-[#DBE2EF] text-[#112D4E]' : 'hover:bg-white/60 hover:text-[#112D4E]'
                }`
              }
            >
              Creators
            </NavLink>
            <NavLink
              to="/brands"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg transition-colors ${
                  isActive ? 'bg-[#DBE2EF] text-[#112D4E]' : 'hover:bg-white/60 hover:text-[#112D4E]'
                }`
              }
            >
              Brands
            </NavLink>
            <NavLink
              to="/campaigns"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg transition-colors ${
                  isActive ? 'bg-[#DBE2EF] text-[#112D4E]' : 'hover:bg-white/60 hover:text-[#112D4E]'
                }`
              }
            >
              Campaigns
            </NavLink>
            <NavLink
              to="/faq"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg transition-colors ${
                  isActive ? 'bg-[#DBE2EF] text-[#112D4E]' : 'hover:bg-white/60 hover:text-[#112D4E]'
                }`
              }
            >
              FAQ
            </NavLink>
            <NavLink
              to="/brand"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg transition-colors ${
                  isActive ? 'bg-[#DBE2EF] text-[#112D4E]' : 'hover:bg-white/60 hover:text-[#112D4E]'
                }`
              }
            >
              Brand Portal
            </NavLink>
          </nav>
        )}

        {/* Search input (always available) */}
        <div className="relative w-full max-w-xs sm:max-w-sm hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search creators, products, briefs..."
            className="w-full bg-white/70 text-[#112D4E] placeholder:text-gray-400 text-xs pl-9 pr-4 py-2 rounded-xl border border-[#DBE2EF] focus:border-[#3F72AF] focus:bg-white focus:outline-none shadow-xs transition-all"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const query = (e.target as HTMLInputElement).value;
                if (query.trim()) {
                  navigate(`/products?search=${encodeURIComponent(query)}`);
                }
              }
            }}
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {currentUser ? (
          <>
            {/* Dedicated Admin Portal Link for verified operators */}
            {(isAdmin || isBrandAdmin) && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#112D4E] hover:bg-[#112D4E]/90 text-white text-xs font-bold transition-all shadow-xs btn-tactile"
                title="Enter Protected Administrator Portal"
              >
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Admin Portal</span>
              </Link>
            )}

            {/* Quick Upload Action (Creator & Admin only) */}
            {(isCreator || isAdmin) && (
              <Link
                to="/upload"
                className="hidden sm:inline-flex items-center gap-1.5 bg-[#3F72AF] hover:bg-[#112D4E] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs btn-tactile btn-glow"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Content</span>
              </Link>
            )}

            {/* Notification Bell */}
            <Link
              to="/notifications"
              className="p-2 rounded-xl hover:bg-[#F9F7F7] text-gray-500 hover:text-[#112D4E] transition-colors relative btn-tactile"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#3F72AF] rounded-full ring-2 ring-white"></span>
            </Link>

            {/* User Profile Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-[#F9F7F7] transition-colors cursor-pointer"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-[#DBE2EF]"
                />
                <div className="hidden xl:flex flex-col text-left leading-tight">
                  <span className="text-xs font-bold text-[#112D4E] truncate max-w-[120px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {currentUser.handle}
                  </span>
                </div>
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-[#DBE2EF] py-2 z-50 animate-scaleUp">
                  <div className="px-4 py-2 border-b border-[#DBE2EF]/60">
                    <span className="text-xs font-bold text-[#112D4E] block truncate">{currentUser.name}</span>
                    <span className="text-[10px] text-gray-400 font-mono block">{currentUser.email || currentUser.handle}</span>
                    <span className="mt-1 inline-block px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-[#DBE2EF] text-[#112D4E]">
                      {currentUser.role}
                    </span>
                  </div>

                  {currentUser.role === 'customer' || currentUser.role === 'user' ? (
                    <>
                      <Link
                        to="/customer"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-[#F9F7F7] transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#3F72AF]" />
                        <span>Customer Hub</span>
                      </Link>

                      <Link
                        to="/customer/products"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-[#F9F7F7] transition-colors"
                      >
                        <ShoppingBag className="w-4 h-4 text-gray-400" />
                        <span>Product Discovery</span>
                      </Link>

                      <Link
                        to="/customer/saved"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-[#F9F7F7] transition-colors"
                      >
                        <Bookmark className="w-4 h-4 text-[#3F72AF]" />
                        <span>Saved Wishlist</span>
                      </Link>

                      <Link
                        to="/customer/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-[#F9F7F7] transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-gray-400" />
                        <span>Preferences & Profile</span>
                      </Link>
                    </>
                  ) : currentUser.role === 'creator' ? (
                    <>
                      <Link
                        to="/creator"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-[#F9F7F7] transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#3F72AF]" />
                        <span>Creator Workspace</span>
                      </Link>

                      <Link
                        to="/creator/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-[#F9F7F7] transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-gray-400" />
                        <span>Profile & Presences</span>
                      </Link>

                      <Link
                        to="/creator/portfolio"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-[#F9F7F7] transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px] text-[#3F72AF]">layers</span>
                        <span>Showcase Portfolio</span>
                      </Link>

                      <Link
                        to="/creator/campaigns"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-[#F9F7F7] transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px] text-gray-400">explore</span>
                        <span>Discover Campaigns</span>
                      </Link>

                      <Link
                        to="/creator/applications"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-[#F9F7F7] transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px] text-gray-400">assignment</span>
                        <span>My Applications</span>
                      </Link>

                      <Link
                        to="/creator/submissions"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-[#F9F7F7] transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px] text-gray-400">video_library</span>
                        <span>My Deliverables</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-[#F9F7F7] transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-gray-400" />
                        <span>Profile & Settings</span>
                      </Link>

                      {isAdmin && (
                        <>
                          <Link
                            to="/creator"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-[#F9F7F7] transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px] text-gray-400">dashboard</span>
                            <span>Creator Dashboard</span>
                          </Link>

                          <Link
                            to="/my-posts"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-[#F9F7F7] transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px] text-gray-400">layers</span>
                            <span>My Published Posts</span>
                          </Link>
                        </>
                      )}

                      {(isBrandAdmin) && (
                        <Link
                          to="/reviews"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-[#F9F7F7] transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px] text-[#3F72AF]">rate_review</span>
                          <span>Review Queue</span>
                        </Link>
                      )}
                    </>
                  )}

                  <div className="border-t border-[#DBE2EF]/60 mt-1 pt-1">
                    <Link
                      to="/faq"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-[#F9F7F7] transition-colors"
                    >
                      <HelpCircle className="w-4 h-4 text-[#3F72AF]" />
                      <span>Help & FAQs</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => { setProfileDropdownOpen(false); signOut(); navigate('/login'); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <Link
              to="/faq"
              className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-[#3F72AF] hover:bg-white/60 transition-colors inline-flex items-center gap-1"
            >
              <span>FAQ</span>
            </Link>
            <Link
              to="/creator"
              className="hidden sm:inline-flex px-3 py-1.5 rounded-xl text-xs font-bold text-[#112D4E] hover:bg-white/60 transition-colors"
            >
              Create
            </Link>
            <Link
              to="/login"
              className="px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#112D4E] hover:bg-white/60 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold bg-[#3F72AF] hover:bg-[#112D4E] text-white transition-all shadow-xs"
            >
              Sign Up
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#112D4E] hover:bg-white/80 transition-colors cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        )}
      </div>

      {/* Mobile unauthenticated navigation drawer */}
      {!currentUser && mobileMenuOpen && (
        <div className="lg:hidden absolute top-16 inset-x-0 bg-white/95 backdrop-blur-xl border-b border-[#DBE2EF] shadow-2xl p-5 flex flex-col gap-4 animate-scaleUp z-50 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {/* Mobile search bar */}
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search creators, products, briefs..."
              className="w-full bg-[#F8FAFC] text-[#112D4E] placeholder:text-gray-400 text-xs pl-9 pr-4 py-2.5 rounded-xl border border-[#DBE2EF] focus:border-[#3F72AF] focus:bg-white focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const query = (e.target as HTMLInputElement).value;
                  if (query.trim()) {
                    setMobileMenuOpen(false);
                    navigate(`/products?search=${encodeURIComponent(query)}`);
                  }
                }
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 px-2">
              Marketplace Discovery
            </span>
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-[#112D4E] hover:bg-[#E7F2F8] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-[#3F72AF]" />
                <span>Discover Products</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E7F2F8] text-[#153D56] font-bold">Open</span>
            </Link>
            <Link
              to="/creators"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-[#112D4E] hover:bg-[#E7F2F8] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-[#3F72AF]" />
                <span>Discover Creators</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E7F2F8] text-[#153D56] font-bold">Open</span>
            </Link>
            <Link
              to="/brands"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#112D4E] hover:bg-[#E7F2F8] transition-colors"
            >
              <Building2 className="w-4 h-4 text-[#3F72AF]" />
              <span>Featured Brands</span>
            </Link>
            <Link
              to="/campaigns"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#112D4E] hover:bg-[#E7F2F8] transition-colors"
            >
              <Compass className="w-4 h-4 text-[#3F72AF]" />
              <span>UGC Briefs & Campaigns</span>
            </Link>
          </div>

          <div className="pt-2 border-t border-[#DBE2EF]/60 flex flex-col gap-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 px-2">
              Portals & Workspaces
            </span>
            <Link
              to="/brand"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-[#153D56] hover:bg-[#E7F2F8] transition-colors"
            >
              <span>Brand Portal</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E7F2F8] text-[#153D56] font-bold">Open</span>
            </Link>
            <Link
              to="/creator"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-[#153D56] hover:bg-[#E7F2F8] transition-colors"
            >
              <span>Creator Workspace</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E7F2F8] text-[#153D56] font-bold">Open</span>
            </Link>
            <Link
              to="/faq"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-[#153D56] hover:bg-[#E7F2F8] transition-colors"
            >
              <span>Help & FAQ</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E7F2F8] text-[#153D56] font-bold">Help</span>
            </Link>
          </div>

          <div className="pt-2 border-t border-[#DBE2EF]/60 grid grid-cols-2 gap-2">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl border border-[#DBE2EF] text-xs font-bold text-[#112D4E] hover:bg-gray-50"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl bg-[#3F72AF] text-white text-xs font-bold hover:bg-[#112D4E]"
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
