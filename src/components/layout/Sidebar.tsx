import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Compass, 
  Upload, 
  Layers, 
  Video, 
  Trophy, 
  Bell, 
  User as UserIcon, 
  Shield, 
  LayoutDashboard,
  CheckCircle2,
  Bookmark,
  ShoppingBag,
  Users,
  Sparkles,
  HelpCircle
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { currentUser, isAdmin, isBrandAdmin } = useAuth();
  if (!currentUser) return null;

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-[#F9F7F7] z-50 flex-col justify-between py-6 px-4 border-r border-[#DBE2EF] shadow-subtle select-none">
      <div className="flex flex-col gap-6">
        {/* Brand Logo Header */}
        <Link to="/" className="px-2 flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-[#3F72AF] group-hover:bg-[#112D4E] transition-colors flex items-center justify-center text-white shadow-sm">
            <span className="material-symbols-outlined text-[20px]">waves</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-lg font-extrabold text-[#112D4E] tracking-tight">BrandWaves</span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
              Creator Marketplace
            </span>
          </div>
        </Link>

        {/* Normal-User Navigation */}
        <div className="flex flex-col gap-1">
          <span className="px-3 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">
            Marketplace Discovery
          </span>

          <NavLink
            to="/creators"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold tab-transition btn-tactile ${
                isActive
                  ? 'wave-flow-active text-white shadow-xs'
                  : 'text-gray-600 hover:bg-[#DBE2EF]/60 hover:text-[#112D4E]'
              }`
            }
          >
            <span className="material-symbols-outlined text-[18px]">group</span>
            <span>Discover Creators</span>
          </NavLink>

          <NavLink
            to="/products"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold tab-transition btn-tactile ${
                isActive
                  ? 'wave-flow-active text-white shadow-xs'
                  : 'text-gray-600 hover:bg-[#DBE2EF]/60 hover:text-[#112D4E]'
              }`
            }
          >
            <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
            <span>Standout Products</span>
          </NavLink>

          <NavLink
            to="/brands"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold tab-transition btn-tactile ${
                isActive
                  ? 'wave-flow-active text-white shadow-xs'
                  : 'text-gray-600 hover:bg-[#DBE2EF]/60 hover:text-[#112D4E]'
              }`
            }
          >
            <span className="material-symbols-outlined text-[18px]">store</span>
            <span>Brand Directory</span>
          </NavLink>

          <NavLink
            to="/campaigns"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold tab-transition btn-tactile ${
                isActive
                  ? 'wave-flow-active text-white shadow-xs'
                  : 'text-gray-600 hover:bg-[#DBE2EF]/60 hover:text-[#112D4E]'
              }`
            }
          >
            <Compass className="w-4 h-4 shrink-0" />
            <span>Active Briefs</span>
          </NavLink>

          <span className="px-3 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1 mt-3">
            Portal Workspace
          </span>

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold tab-transition btn-tactile ${
                isActive
                  ? 'wave-flow-active text-white shadow-xs'
                  : 'text-gray-600 hover:bg-[#DBE2EF]/60 hover:text-[#112D4E]'
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Overview</span>
          </NavLink>

          <NavLink
            to="/feed"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold tab-transition btn-tactile ${
                isActive
                  ? 'wave-flow-active text-white shadow-xs'
                  : 'text-gray-600 hover:bg-[#DBE2EF]/60 hover:text-[#112D4E]'
              }`
            }
          >
            <span className="material-symbols-outlined text-[18px]">dynamic_feed</span>
            <span>Community Feed</span>
          </NavLink>

          {/* Customer Portal Workflows */}
          {(currentUser.role === 'customer' || currentUser.role === 'user') && (
            <>
              <NavLink
                to="/customer"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold tab-transition btn-tactile ${
                    isActive
                      ? 'bg-[#112D4E] text-white shadow-xs'
                      : 'text-gray-600 hover:bg-[#DBE2EF]/60 hover:text-[#112D4E]'
                  }`
                }
              >
                <LayoutDashboard className="w-4 h-4 shrink-0 text-[#3F72AF]" />
                <span>Customer Hub</span>
              </NavLink>

              <NavLink
                to="/customer/products"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold tab-transition btn-tactile ${
                    isActive
                      ? 'bg-[#112D4E] text-white shadow-xs'
                      : 'text-gray-600 hover:bg-[#DBE2EF]/60 hover:text-[#112D4E]'
                  }`
                }
              >
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <span>Product Discovery</span>
              </NavLink>

              <NavLink
                to="/customer/creators"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold tab-transition btn-tactile ${
                    isActive
                      ? 'bg-[#112D4E] text-white shadow-xs'
                      : 'text-gray-600 hover:bg-[#DBE2EF]/60 hover:text-[#112D4E]'
                  }`
                }
              >
                <Users className="w-4 h-4 shrink-0" />
                <span>Creator Reviews</span>
              </NavLink>

              <NavLink
                to="/customer/saved"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold tab-transition btn-tactile ${
                    isActive
                      ? 'bg-[#112D4E] text-white shadow-xs'
                      : 'text-gray-600 hover:bg-[#DBE2EF]/60 hover:text-[#112D4E]'
                  }`
                }
              >
                <Bookmark className="w-4 h-4 shrink-0 text-[#3F72AF]" />
                <span>Saved Products</span>
              </NavLink>

              <NavLink
                to="/customer/profile"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold tab-transition btn-tactile ${
                    isActive
                      ? 'bg-[#112D4E] text-white shadow-xs'
                      : 'text-gray-600 hover:bg-[#DBE2EF]/60 hover:text-[#112D4E]'
                  }`
                }
              >
                <UserIcon className="w-4 h-4 shrink-0" />
                <span>Preferences & Profile</span>
              </NavLink>
            </>
          )}

          {/* Creator Portal Workflows */}
          {(currentUser.role === 'creator' || currentUser.role === 'admin') && (
            <>
              <NavLink
                to="/creator"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold tab-transition btn-tactile ${
                    isActive
                      ? 'bg-[#112D4E] text-white shadow-xs'
                      : 'text-gray-600 hover:bg-[#DBE2EF]/60 hover:text-[#112D4E]'
                  }`
                }
              >
                <LayoutDashboard className="w-4 h-4 shrink-0 text-[#3F72AF]" />
                <span>Creator Workspace</span>
              </NavLink>

              <NavLink
                to="/creator/profile"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold tab-transition btn-tactile ${
                    isActive
                      ? 'bg-[#112D4E] text-white shadow-xs'
                      : 'text-gray-600 hover:bg-[#DBE2EF]/60 hover:text-[#112D4E]'
                  }`
                }
              >
                <UserIcon className="w-4 h-4 shrink-0" />
                <span>Creator Profile</span>
              </NavLink>

              <NavLink
                to="/creator/portfolio"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold tab-transition btn-tactile ${
                    isActive
                      ? 'bg-[#112D4E] text-white shadow-xs'
                      : 'text-gray-600 hover:bg-[#DBE2EF]/60 hover:text-[#112D4E]'
                  }`
                }
              >
                <Layers className="w-4 h-4 shrink-0 text-[#3F72AF]" />
                <span>Showcase Portfolio</span>
              </NavLink>

              <NavLink
                to="/creator/campaigns"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold tab-transition btn-tactile ${
                    isActive
                      ? 'bg-[#112D4E] text-white shadow-xs'
                      : 'text-gray-600 hover:bg-[#DBE2EF]/60 hover:text-[#112D4E]'
                  }`
                }
              >
                <Compass className="w-4 h-4 shrink-0" />
                <span>Campaign Discovery</span>
              </NavLink>

              <NavLink
                to="/creator/applications"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold tab-transition btn-tactile ${
                    isActive
                      ? 'bg-[#112D4E] text-white shadow-xs'
                      : 'text-gray-600 hover:bg-[#DBE2EF]/60 hover:text-[#112D4E]'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[18px]">assignment</span>
                <span>My Applications</span>
              </NavLink>

              <NavLink
                to="/creator/submissions"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold tab-transition btn-tactile ${
                    isActive
                      ? 'bg-[#112D4E] text-white shadow-xs'
                      : 'text-gray-600 hover:bg-[#DBE2EF]/60 hover:text-[#112D4E]'
                  }`
                }
              >
                <Video className="w-4 h-4 shrink-0" />
                <span>My Deliverables</span>
              </NavLink>

              <NavLink
                to="/upload"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold tab-transition btn-tactile ${
                    isActive
                      ? 'bg-[#112D4E] text-white shadow-xs'
                      : 'text-gray-600 hover:bg-[#DBE2EF]/60 hover:text-[#112D4E]'
                  }`
                }
              >
                <Upload className="w-4 h-4 shrink-0 text-[#3F72AF]" />
                <span>Upload Content</span>
              </NavLink>

              <NavLink
                to="/my-posts"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold tab-transition btn-tactile ${
                    isActive
                      ? 'bg-[#112D4E] text-white shadow-xs'
                      : 'text-gray-600 hover:bg-[#DBE2EF]/60 hover:text-[#112D4E]'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[18px]">dynamic_feed</span>
                <span>My Published Posts</span>
              </NavLink>

              <NavLink
                to="/leaderboard"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold tab-transition btn-tactile ${
                    isActive
                      ? 'bg-[#112D4E] text-white shadow-xs'
                      : 'text-gray-600 hover:bg-[#DBE2EF]/60 hover:text-[#112D4E]'
                  }`
                }
              >
                <Trophy className="w-4 h-4 shrink-0 text-amber-500" />
                <span>Hall of Fame</span>
              </NavLink>
            </>
          )}

          {/* Brand Owner Workflows */}
          {(currentUser.role === 'brand_owner' || currentUser.role === 'brand_admin' || currentUser.role === 'admin') && (
            <>
              <NavLink
                to="/brand"
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold tab-transition btn-tactile ${
                    isActive
                      ? 'bg-[#112D4E] text-white shadow-xs'
                      : 'text-gray-600 hover:bg-[#DBE2EF]/60 hover:text-[#112D4E]'
                  }`
                }
              >
                <LayoutDashboard className="w-4 h-4 shrink-0 text-[#3F72AF]" />
                <span>Brand Workspace</span>
              </NavLink>

              <NavLink
                to="/brand/profile"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold tab-transition btn-tactile ${
                    isActive
                      ? 'bg-[#112D4E] text-white shadow-xs'
                      : 'text-gray-600 hover:bg-[#DBE2EF]/60 hover:text-[#112D4E]'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[18px]">settings</span>
                <span>Brand Profile</span>
              </NavLink>

              <NavLink
                to="/brand/products"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold tab-transition btn-tactile ${
                    isActive
                      ? 'bg-[#112D4E] text-white shadow-xs'
                      : 'text-gray-600 hover:bg-[#DBE2EF]/60 hover:text-[#112D4E]'
                  }`
                }
              >
                <ShoppingBag className="w-4 h-4 shrink-0 text-[#3F72AF]" />
                <span>Product Catalog</span>
              </NavLink>

              <NavLink
                to="/brand/campaigns"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold tab-transition btn-tactile ${
                    isActive
                      ? 'bg-[#112D4E] text-white shadow-xs'
                      : 'text-gray-600 hover:bg-[#DBE2EF]/60 hover:text-[#112D4E]'
                  }`
                }
              >
                <Compass className="w-4 h-4 shrink-0" />
                <span>Campaign Briefs</span>
              </NavLink>

              <NavLink
                to="/brand/matchmaker"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold tab-transition btn-tactile ${
                    isActive
                      ? 'bg-[#112D4E] text-white shadow-xs'
                      : 'text-gray-600 hover:bg-[#DBE2EF]/60 hover:text-[#112D4E]'
                  }`
                }
              >
                <Sparkles className="w-4 h-4 shrink-0 text-[#3F72AF]" />
                <span>AI Matchmaker</span>
              </NavLink>

              <NavLink
                to="/brand/creators"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold tab-transition btn-tactile ${
                    isActive
                      ? 'bg-[#112D4E] text-white shadow-xs'
                      : 'text-gray-600 hover:bg-[#DBE2EF]/60 hover:text-[#112D4E]'
                  }`
                }
              >
                <Users className="w-4 h-4 shrink-0" />
                <span>Discover Creators</span>
              </NavLink>

              <NavLink
                to="/brand/applications"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold tab-transition btn-tactile ${
                    isActive
                      ? 'bg-[#112D4E] text-white shadow-xs'
                      : 'text-gray-600 hover:bg-[#DBE2EF]/60 hover:text-[#112D4E]'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[18px] text-[#3F72AF]">assignment</span>
                <span>Applications</span>
              </NavLink>

              <NavLink
                to="/brand/submissions"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold tab-transition btn-tactile ${
                    isActive
                      ? 'bg-[#112D4E] text-white shadow-xs'
                      : 'text-gray-600 hover:bg-[#DBE2EF]/60 hover:text-[#112D4E]'
                  }`
                }
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
                <span>Review Queue</span>
              </NavLink>
            </>
          )}

          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold tab-transition btn-tactile ${
                isActive
                  ? 'wave-flow-active text-white shadow-xs'
                  : 'text-gray-600 hover:bg-[#DBE2EF]/60 hover:text-[#112D4E]'
              }`
            }
          >
            <Bell className="w-4 h-4 shrink-0" />
            <span>Notifications</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold tab-transition btn-tactile ${
                isActive
                  ? 'wave-flow-active text-white shadow-xs'
                  : 'text-gray-600 hover:bg-[#DBE2EF]/60 hover:text-[#112D4E]'
              }`
            }
          >
            <UserIcon className="w-4 h-4 shrink-0" />
            <span>Profile & Settings</span>
          </NavLink>

          <NavLink
            to="/faq"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold tab-transition btn-tactile ${
                isActive
                  ? 'wave-flow-active text-white shadow-xs'
                  : 'text-gray-600 hover:bg-[#DBE2EF]/60 hover:text-[#112D4E]'
              }`
            }
          >
            <HelpCircle className="w-4 h-4 shrink-0 text-[#3F72AF]" />
            <span>Help & FAQs</span>
          </NavLink>
        </div>
      </div>

      {/* Account Status / Admin Shortcut */}
      <div className="flex flex-col gap-3">
        {(isAdmin || isBrandAdmin) && (
          <Link
            to="/admin"
            className="p-3 bg-[#112D4E] text-white rounded-2xl shadow-sm hover:bg-[#112D4E]/90 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">Restricted Area</span>
                <span className="text-xs font-extrabold text-white">Admin Portal</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-gray-300 text-[18px] group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </Link>
        )}

        <div className="p-3 bg-white rounded-2xl border border-[#DBE2EF] flex items-center justify-between shadow-2xs">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-bold text-gray-400">Account Tier</span>
            <span className="text-xs font-bold text-[#112D4E]">
              {currentUser.tier || 'Rising Star'}
            </span>
          </div>
          <CheckCircle2 className="w-4 h-4 text-[#3F72AF]" />
        </div>
      </div>
    </aside>
  );
};
