import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Compass, Upload, Layers, User as UserIcon, Sparkles, ClipboardCheck } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  const isCustomerUser = currentUser.role === 'customer' || currentUser.role === 'user';
  const isBrandUser = currentUser.role === 'brand_owner' || currentUser.role === 'brand_admin';

  if (isBrandUser) {
    return (
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#DBE2EF] py-2 px-3 shadow-lg flex justify-around items-center" aria-label="Brand Mobile Navigation">
        <NavLink
          to="/brand"
          end
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-bold transition-colors btn-tactile ${
              isActive ? 'text-[#3F72AF]' : 'text-gray-500 hover:text-[#112D4E]'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Workspace</span>
        </NavLink>

        <NavLink
          to="/brand/campaigns"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-bold transition-colors btn-tactile ${
              isActive ? 'text-[#3F72AF]' : 'text-gray-500 hover:text-[#112D4E]'
            }`
          }
        >
          <Compass className="w-5 h-5" />
          <span>Briefs</span>
        </NavLink>

        {/* Center AI Matchmaker action */}
        <NavLink
          to="/brand/matchmaker"
          className="flex flex-col items-center -mt-4 btn-tactile"
        >
          <div className="w-10 h-10 rounded-full bg-[#112D4E] hover:bg-[#3F72AF] text-white flex items-center justify-center shadow-md transition-transform active:scale-95">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <span className="text-[10px] font-extrabold text-[#112D4E] mt-0.5">Matchmaker</span>
        </NavLink>

        <NavLink
          to="/brand/applications"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-bold transition-colors btn-tactile ${
              isActive ? 'text-[#3F72AF]' : 'text-gray-500 hover:text-[#112D4E]'
            }`
          }
        >
          <ClipboardCheck className="w-5 h-5" />
          <span>Applicants</span>
        </NavLink>

        <NavLink
          to="/brand/profile"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-bold transition-colors btn-tactile ${
              isActive ? 'text-[#3F72AF]' : 'text-gray-500 hover:text-[#112D4E]'
            }`
          }
        >
          <UserIcon className="w-5 h-5" />
          <span>Profile</span>
        </NavLink>
      </nav>
    );
  }

  if (isCustomerUser) {
    return (
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#DBE2EF] py-2 px-3 shadow-lg flex justify-around items-center">
        <NavLink
          to="/customer"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${
              isActive ? 'text-[#3F72AF]' : 'text-gray-500 hover:text-[#112D4E]'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Hub</span>
        </NavLink>

        <NavLink
          to="/customer/products"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${
              isActive ? 'text-[#3F72AF]' : 'text-gray-500 hover:text-[#112D4E]'
            }`
          }
        >
          <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
          <span>Products</span>
        </NavLink>

        {/* Center Saved Wishlist button */}
        <NavLink
          to="/customer/saved"
          className="flex flex-col items-center -mt-4"
        >
          <div className="w-10 h-10 rounded-full bg-[#112D4E] hover:bg-[#3F72AF] text-white flex items-center justify-center shadow-md transition-transform active:scale-95">
            <span className="material-symbols-outlined text-[20px]">bookmark</span>
          </div>
          <span className="text-[10px] font-extrabold text-[#112D4E] mt-0.5">Saved</span>
        </NavLink>

        <NavLink
          to="/customer/creators"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${
              isActive ? 'text-[#3F72AF]' : 'text-gray-500 hover:text-[#112D4E]'
            }`
          }
        >
          <span className="material-symbols-outlined text-[20px]">group</span>
          <span>Creators</span>
        </NavLink>

        <NavLink
          to="/customer/profile"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${
              isActive ? 'text-[#3F72AF]' : 'text-gray-500 hover:text-[#112D4E]'
            }`
          }
        >
          <UserIcon className="w-5 h-5" />
          <span>Profile</span>
        </NavLink>
      </nav>
    );
  }

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#DBE2EF] py-2 px-3 shadow-lg flex justify-around items-center">
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${
            isActive ? 'text-[#3F72AF]' : 'text-gray-500 hover:text-[#112D4E]'
          }`
        }
      >
        <LayoutDashboard className="w-5 h-5" />
        <span>Overview</span>
      </NavLink>

      <NavLink
        to="/campaigns"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${
            isActive ? 'text-[#3F72AF]' : 'text-gray-500 hover:text-[#112D4E]'
          }`
        }
      >
        <Compass className="w-5 h-5" />
        <span>Campaigns</span>
      </NavLink>

      {/* Prominent Upload Center Button */}
      <NavLink
        to="/upload"
        className="flex flex-col items-center -mt-5"
      >
        <div className="w-11 h-11 rounded-full bg-[#112D4E] hover:bg-[#3F72AF] text-white flex items-center justify-center shadow-lg transition-transform active:scale-95">
          <Upload className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-extrabold text-[#112D4E] mt-1">Upload</span>
      </NavLink>

      <NavLink
        to="/feed"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${
            isActive ? 'text-[#3F72AF]' : 'text-gray-500 hover:text-[#112D4E]'
          }`
        }
      >
        <span className="material-symbols-outlined text-[20px]">dynamic_feed</span>
        <span>Feed</span>
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${
            isActive ? 'text-[#3F72AF]' : 'text-gray-500 hover:text-[#112D4E]'
          }`
        }
      >
        <UserIcon className="w-5 h-5" />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
};

