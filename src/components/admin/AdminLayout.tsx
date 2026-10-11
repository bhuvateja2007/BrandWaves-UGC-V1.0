import React from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Compass, 
  Inbox, 
  ShieldAlert, 
  Flag, 
  BarChart3, 
  Settings, 
  ArrowLeft, 
  ShieldCheck, 
  LogOut,
  AlertOctagon,
  Sparkles,
  Activity
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { currentUser, isAdmin, isBrandAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  // Strict client-side route guard (backed by server-side 403 validation)
  if (!currentUser || (!isAdmin && !isBrandAdmin)) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-16 px-4 animate-fadeIn">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-rose-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
            <AlertOctagon className="w-8 h-8" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold uppercase tracking-wider mb-2">
              403 Forbidden Access
            </span>
            <h2 className="text-2xl font-black text-[#112D4E]">Admin Portal Protected</h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
              You do not have verified administrative privileges. Client-side role overrides are strictly rejected by the server and PostgreSQL RLS.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              to="/dashboard"
              className="w-full py-3 px-4 bg-[#112D4E] hover:bg-[#112D4E]/90 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              Return to Normal User Portal
            </Link>
            <Link
              to="/login"
              className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition-all"
            >
              Sign In as Authorized Administrator
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { to: '/admin', label: 'Executive Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/traffic', label: 'Cyber Cell Traffic', icon: Activity },
    { to: '/admin/users', label: 'User Management', icon: Users },
    { to: '/admin/campaigns', label: 'Campaign Ops', icon: Compass },
    { to: '/admin/submissions', label: 'Submission Queue', icon: Inbox },
    { to: '/admin/moderation', label: 'Content Moderation', icon: ShieldAlert },
    { to: '/admin/reports', label: 'Safety Reports', icon: Flag },
    { to: '/admin/analytics', label: 'Platform Analytics', icon: BarChart3 },
    { to: '/admin/settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F9F7F7] flex flex-col antialiased">
      {/* Admin Top Telemetry Ribbon */}
      <header className="bg-[#112D4E] text-white py-2.5 px-4 sm:px-8 flex items-center justify-between text-xs border-b border-black/20 shadow-sm z-30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-black text-sm tracking-tight text-white">
            <div className="w-6 h-6 rounded-lg bg-[#3F72AF] flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
            </div>
            <span>BrandWaves Admin OS</span>
          </div>
          <span className="text-blue-300/40">|</span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-blue-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Verified Operator: {currentUser.name} ({currentUser.email || currentUser.handle})
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-blue-100 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Switch to User View</span>
          </Link>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Admin Left Sidebar */}
        <aside className="w-64 bg-white border-r border-[#DBE2EF] py-6 px-4 hidden lg:flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            <div className="px-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 block mb-2">
                Administration Modules
              </span>
              <nav className="space-y-1">
                {navItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-[#112D4E] text-white shadow-xs'
                            : 'text-gray-600 hover:text-[#112D4E] hover:bg-[#F9F7F7]'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#F9F7F7] border border-[#DBE2EF] text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Security Level</span>
              <span className="font-extrabold text-[#3F72AF] text-[10px]">Level 3 Superadmin</span>
            </div>
            <p className="text-[11px] text-gray-500 leading-snug">
              Every sensitive action is committed with audit trail telemetry.
            </p>
          </div>
        </aside>

        {/* Admin Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
