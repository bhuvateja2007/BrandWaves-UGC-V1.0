import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { SkyFooter } from './components/layout/SkyFooter';
import { api } from './api/client';

// Public & Normal-User Pages
import { CommunityHome } from './pages/CommunityHome';
import { BrandDashboard } from './pages/BrandDashboard';
import { CreatorDashboard } from './pages/CreatorDashboard';
import { CustomerDashboard } from './pages/dashboard/CustomerDashboard';
import { ExploreCampaigns } from './pages/ExploreCampaigns';
import { CampaignDetails } from './pages/CampaignDetails';
import { SubmissionPortal } from './pages/SubmissionPortal';
import { MySubmissions } from './pages/MySubmissions';
import { ReviewQueue } from './pages/ReviewQueue';
import { Leaderboard } from './pages/Leaderboard';
import { ContentFeed } from './pages/ContentFeed';
import { UploadContent } from './pages/user/UploadContent';
import { MyPosts } from './pages/user/MyPosts';
import { NotificationsPage } from './pages/user/NotificationsPage';
import { ProfileSettings } from './pages/user/ProfileSettings';

// Phase 2 Auth Pages
import { AudienceLoginPage } from './pages/auth/AudienceLoginPage';
import { AudienceRegisterPage } from './pages/auth/AudienceRegisterPage';
import { AuthCallback } from './pages/auth/AuthCallback';
import { AuthVerify } from './pages/auth/AuthVerify';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Layouts
import { AuthLayout } from './components/layout/AuthLayout';

// Security Route Guards
import { ProtectedRoute, RoleGuard } from './components/auth/RouteGuards';

// Admin Portal Components
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminModeration } from './pages/admin/AdminModeration';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminCyberCell } from './pages/admin/AdminCyberCell';

// Onboarding
import { OnboardingWizard } from './pages/onboarding/OnboardingWizard';

// Public Marketplace Pages
import { CreatorsPage } from './pages/marketplace/CreatorsPage';
import { CreatorDetailPage } from './pages/marketplace/CreatorDetailPage';
import { ProductsPage } from './pages/marketplace/ProductsPage';
import { ProductDetailPage } from './pages/marketplace/ProductDetailPage';
import { BrandsPage } from './pages/marketplace/BrandsPage';
import { BrandDetailPage } from './pages/marketplace/BrandDetailPage';

// Phase 3 Customer Portal Pages
import { CustomerDashboardPage } from './pages/customer/CustomerDashboardPage';
import { CustomerProductsPage } from './pages/customer/CustomerProductsPage';
import { CustomerCreatorsPage } from './pages/customer/CustomerCreatorsPage';
import { SavedProductsPage } from './pages/customer/SavedProductsPage';
import { CustomerProfilePage } from './pages/customer/CustomerProfilePage';

// Phase 4 Creator Portal Pages
import { CreatorDashboardPage } from './pages/creator/CreatorDashboardPage';
import { CreatorProfilePage } from './pages/creator/CreatorProfilePage';
import { CreatorPortfolioPage } from './pages/creator/CreatorPortfolioPage';
import { CreatorCampaignsPage } from './pages/creator/CreatorCampaignsPage';
import { CreatorApplicationsPage } from './pages/creator/CreatorApplicationsPage';

// Phase 5 Brand Owner Portal Pages
import { BrandDashboardPage } from './pages/brand/BrandDashboardPage';
import { BrandProfilePage } from './pages/brand/BrandProfilePage';
import { BrandProductsPage } from './pages/brand/BrandProductsPage';
import { BrandProductFormPage } from './pages/brand/BrandProductFormPage';
import { BrandCampaignsPage } from './pages/brand/BrandCampaignsPage';
import { BrandCampaignCreatePage } from './pages/brand/BrandCampaignCreatePage';
import { BrandCampaignDetailPage } from './pages/brand/BrandCampaignDetailPage';
import { BrandCreatorsPage } from './pages/brand/BrandCreatorsPage';
import { BrandMatchmakerPage } from './pages/brand/BrandMatchmakerPage';
import { BrandApplicationsPage } from './pages/brand/BrandApplicationsPage';
import { BrandSubmissionsPage } from './pages/brand/BrandSubmissionsPage';

import { getRoleLandingRoute } from './lib/authValidation';

const RoleBasedDashboard: React.FC = () => {
  const { currentUser, loading, onboardingCompleted, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-[#DBE2EF] border-t-[#3F72AF] rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Admins skip onboarding — they have system-level access
  // All other users are directed to onboarding until completed
  if (!onboardingCompleted && !isAdmin) {
    return <Navigate to="/onboarding" replace />;
  }

  // Authoritative role destination
  return <Navigate to={getRoleLandingRoute(currentUser.role)} replace />;
};

// Wrapper that conditionally renders the Normal User shell (Sidebar/Header/Footer)
const UserShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  React.useEffect(() => {
    api.pingTraffic(location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen atmospheric-mesh-bg text-[#112D4E] flex flex-col font-sans selection:bg-[#DBE2EF] selection:text-[#112D4E] relative overflow-x-hidden">
      {/* Ambient Atmospheric Lighting Orbs */}
      <div 
        className="fixed top-[-5%] left-[20%] w-[550px] h-[550px] rounded-full bg-[#3F72AF]/5 blur-[140px] pointer-events-none" 
        aria-hidden="true" 
      />
      <div 
        className="fixed bottom-[10%] right-[15%] w-[600px] h-[600px] rounded-full bg-[#DBE2EF]/50 blur-[150px] pointer-events-none" 
        aria-hidden="true" 
      />

      {/* Desktop Sidebar (only displays when authenticated) */}
      <Sidebar />

      {/* Global Fixed Header */}
      <Header />

      {/* Main Content Layout Container */}
      <div className={`flex-1 ${currentUser ? 'lg:pl-64' : ''} pt-16 flex flex-col min-h-screen relative z-10`}>
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-12">
          {children}
        </main>

        {/* Animated Sky Footer */}
        <SkyFooter />
      </div>

      {/* Responsive Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};

export const App: React.FC = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F7F7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#3F72AF] flex items-center justify-center text-white shadow-md animate-pulse">
            <span className="material-symbols-outlined text-[28px]">waves</span>
          </div>
          <span className="text-sm font-bold text-[#112D4E]">Loading BrandWaves...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* =========================================================================
            0. ONBOARDING — Full-screen, no shell, outside normal layout
            Only shown to authenticated users who have not completed onboarding.
            ========================================================================= */}
        <Route path="/onboarding" element={<OnboardingWizard />} />

        {/* =========================================================================
            1. PROTECTED ADMINISTRATOR PORTAL (/admin)
            Isolated layout, server-side authorization check & database RLS
            ========================================================================= */}
        <Route 
          path="/admin" 
          element={
            <RoleGuard allowedRoles={['admin']}>
              <AdminLayout />
            </RoleGuard>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="traffic" element={<AdminCyberCell />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="campaigns" element={<ExploreCampaigns />} />
          <Route path="submissions" element={<ReviewQueue />} />
          <Route path="moderation" element={<AdminModeration />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="analytics" element={<BrandDashboard />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* =========================================================================
            2. FOCUSED AUTHENTICATION PORTAL (AuthLayout)
            Clean layout separation: NO marketplace navigation, NO global search bar.
            ========================================================================= */}
        <Route element={<AuthLayout />}>
          {/* Phase 2: Audience Onboarding & Registration Entry Hubs */}
          <Route path="/join/customer" element={<AudienceRegisterPage />} />
          <Route path="/join/creator" element={<AudienceRegisterPage />} />
          <Route path="/join/brand" element={<AudienceRegisterPage />} />
          <Route path="/register" element={<AudienceRegisterPage />} />

          {/* Phase 2: Audience Tailored Login */}
          <Route path="/login" element={<AudienceLoginPage />} />
          <Route path="/login/customer" element={<AudienceLoginPage />} />
          <Route path="/login/creator" element={<AudienceLoginPage />} />
          <Route path="/login/brand" element={<AudienceLoginPage />} />

          {/* Phase 2: Session Exchange & Recovery Callbacks */}
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/verify" element={<AuthVerify />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* Dedicated Onboarding Wizard (Protected) */}
        <Route 
          path="/onboarding" 
          element={
            <ProtectedRoute>
              <OnboardingWizard />
            </ProtectedRoute>
          } 
        />

        {/* =========================================================================
            3. PUBLIC WEBSITE & NORMAL-USER PORTAL (UserShell)
            Preserves BrandWaves styling, Discovery Marketplace & Sky Footer
            ========================================================================= */}
        <Route path="/*" element={
          <UserShell>
            <Routes>
              {/* Public Entry / Marketplace Home */}
              <Route path="/" element={<CommunityHome />} />
              <Route path="/community" element={<CommunityHome />} />

              {/* Public Discovery Marketplace */}
              <Route path="/creators" element={<CreatorsPage />} />
              <Route path="/creators/:creatorId" element={<CreatorDetailPage />} />

              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:productId" element={<ProductDetailPage />} />

              <Route path="/brands" element={<BrandsPage />} />
              <Route path="/brands/:brandId" element={<BrandDetailPage />} />

              <Route path="/campaigns" element={<ExploreCampaigns />} />
              <Route path="/campaigns/:campaignId" element={<CampaignDetails />} />
              <Route path="/campaigns/:id" element={<CampaignDetails />} />

              {/* Dynamic Role-Based Overview Dashboard */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <RoleBasedDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/account" 
                element={
                  <RoleGuard allowedRoles={['customer', 'user']} allowAdminBypass={false}>
                    <CustomerDashboardPage />
                  </RoleGuard>
                } 
              />

              {/* Phase 3: Authenticated Customer Portal Routes */}
              <Route 
                path="/customer" 
                element={
                  <RoleGuard allowedRoles={['customer', 'user']} allowAdminBypass={false}>
                    <CustomerDashboardPage />
                  </RoleGuard>
                } 
              />
              <Route 
                path="/customer/products" 
                element={
                  <RoleGuard allowedRoles={['customer', 'user']} allowAdminBypass={false}>
                    <CustomerProductsPage />
                  </RoleGuard>
                } 
              />
              <Route 
                path="/customer/products/:productId" 
                element={
                  <RoleGuard allowedRoles={['customer', 'user']} allowAdminBypass={false}>
                    <ProductDetailPage />
                  </RoleGuard>
                } 
              />
              <Route 
                path="/customer/creators" 
                element={
                  <RoleGuard allowedRoles={['customer', 'user']} allowAdminBypass={false}>
                    <CustomerCreatorsPage />
                  </RoleGuard>
                } 
              />
              <Route 
                path="/customer/saved" 
                element={
                  <RoleGuard allowedRoles={['customer', 'user']} allowAdminBypass={false}>
                    <SavedProductsPage />
                  </RoleGuard>
                } 
              />
              <Route 
                path="/customer/profile" 
                element={
                  <RoleGuard allowedRoles={['customer', 'user']} allowAdminBypass={false}>
                    <CustomerProfilePage />
                  </RoleGuard>
                } 
              />

              {/* Phase 4: Authenticated Creator Portal Routes */}
              <Route 
                path="/creator" 
                element={
                  <RoleGuard allowedRoles={['creator', 'admin']}>
                    <CreatorDashboardPage />
                  </RoleGuard>
                } 
              />
              <Route 
                path="/creator/profile" 
                element={
                  <RoleGuard allowedRoles={['creator', 'admin']}>
                    <CreatorProfilePage />
                  </RoleGuard>
                } 
              />
              <Route 
                path="/creator/portfolio" 
                element={
                  <RoleGuard allowedRoles={['creator', 'admin']}>
                    <CreatorPortfolioPage />
                  </RoleGuard>
                } 
              />
              <Route 
                path="/creator/campaigns" 
                element={
                  <RoleGuard allowedRoles={['creator', 'admin']}>
                    <CreatorCampaignsPage />
                  </RoleGuard>
                } 
              />
              <Route 
                path="/creator/campaigns/:campaignId" 
                element={
                  <RoleGuard allowedRoles={['creator', 'admin']}>
                    <CampaignDetails />
                  </RoleGuard>
                } 
              />
              <Route 
                path="/creator/applications" 
                element={
                  <RoleGuard allowedRoles={['creator', 'admin']}>
                    <CreatorApplicationsPage />
                  </RoleGuard>
                } 
              />
              <Route 
                path="/creator/submissions" 
                element={
                  <RoleGuard allowedRoles={['creator', 'admin']}>
                    <MySubmissions />
                  </RoleGuard>
                } 
              />

              {/* Community Feed */}
              <Route path="/feed" element={<ContentFeed />} />

              {/* Creator-Restricted Workflows (Creator / Admin Only) */}
              <Route 
                path="/upload" 
                element={
                  <RoleGuard allowedRoles={['creator', 'admin']}>
                    <UploadContent />
                  </RoleGuard>
                } 
              />
              <Route 
                path="/my-posts" 
                element={
                  <RoleGuard allowedRoles={['creator', 'admin']}>
                    <MyPosts />
                  </RoleGuard>
                } 
              />
              <Route 
                path="/submit" 
                element={
                  <RoleGuard allowedRoles={['creator', 'admin']}>
                    <SubmissionPortal />
                  </RoleGuard>
                } 
              />
              <Route 
                path="/submit/:campaignId" 
                element={
                  <RoleGuard allowedRoles={['creator', 'admin']}>
                    <SubmissionPortal />
                  </RoleGuard>
                } 
              />
              <Route 
                path="/submissions" 
                element={
                  <RoleGuard allowedRoles={['creator', 'admin']}>
                    <MySubmissions />
                  </RoleGuard>
                } 
              />
              <Route 
                path="/my-submissions" 
                element={
                  <RoleGuard allowedRoles={['creator', 'admin']}>
                    <MySubmissions />
                  </RoleGuard>
                } 
              />

              {/* Phase 5: Authenticated Brand Owner Portal Routes */}
              <Route 
                path="/brand" 
                element={
                  <RoleGuard allowedRoles={['brand_owner', 'brand_admin', 'admin']}>
                    <BrandDashboardPage />
                  </RoleGuard>
                } 
              />
              <Route 
                path="/brand/profile" 
                element={
                  <RoleGuard allowedRoles={['brand_owner', 'brand_admin', 'admin']}>
                    <BrandProfilePage />
                  </RoleGuard>
                } 
              />
              <Route 
                path="/brand/products" 
                element={
                  <RoleGuard allowedRoles={['brand_owner', 'brand_admin', 'admin']}>
                    <BrandProductsPage />
                  </RoleGuard>
                } 
              />
              <Route 
                path="/brand/products/new" 
                element={
                  <RoleGuard allowedRoles={['brand_owner', 'brand_admin', 'admin']}>
                    <BrandProductFormPage />
                  </RoleGuard>
                } 
              />
              <Route 
                path="/brand/products/:productId/edit" 
                element={
                  <RoleGuard allowedRoles={['brand_owner', 'brand_admin', 'admin']}>
                    <BrandProductFormPage />
                  </RoleGuard>
                } 
              />
              <Route 
                path="/brand/campaigns" 
                element={
                  <RoleGuard allowedRoles={['brand_owner', 'brand_admin', 'admin']}>
                    <BrandCampaignsPage />
                  </RoleGuard>
                } 
              />
              <Route 
                path="/brand/campaigns/new" 
                element={
                  <RoleGuard allowedRoles={['brand_owner', 'brand_admin', 'admin']}>
                    <BrandCampaignCreatePage />
                  </RoleGuard>
                } 
              />
              <Route 
                path="/brand/campaigns/:campaignId" 
                element={
                  <RoleGuard allowedRoles={['brand_owner', 'brand_admin', 'admin']}>
                    <BrandCampaignDetailPage />
                  </RoleGuard>
                } 
              />
              <Route 
                path="/brand/creators" 
                element={
                  <RoleGuard allowedRoles={['brand_owner', 'brand_admin', 'admin']}>
                    <BrandCreatorsPage />
                  </RoleGuard>
                } 
              />
              <Route 
                path="/brand/matchmaker" 
                element={
                  <RoleGuard allowedRoles={['brand_owner', 'brand_admin', 'admin']}>
                    <BrandMatchmakerPage />
                  </RoleGuard>
                } 
              />
              <Route 
                path="/brand/applications" 
                element={
                  <RoleGuard allowedRoles={['brand_owner', 'brand_admin', 'admin']}>
                    <BrandApplicationsPage />
                  </RoleGuard>
                } 
              />
              <Route 
                path="/brand/submissions" 
                element={
                  <RoleGuard allowedRoles={['brand_owner', 'brand_admin', 'admin']}>
                    <BrandSubmissionsPage />
                  </RoleGuard>
                } 
              />

              {/* Brand-Restricted Workflows (Legacy review route redirects / aliases) */}
              <Route 
                path="/reviews" 
                element={
                  <RoleGuard allowedRoles={['brand_owner', 'brand_admin', 'admin']}>
                    <BrandSubmissionsPage />
                  </RoleGuard>
                } 
              />
              <Route 
                path="/review-queue" 
                element={
                  <RoleGuard allowedRoles={['brand_owner', 'brand_admin', 'admin']}>
                    <BrandSubmissionsPage />
                  </RoleGuard>
                } 
              />

              {/* Creator Hall of Fame */}
              <Route path="/leaderboard" element={<Leaderboard />} />

              {/* Protected User Profile & Notifications */}
              <Route 
                path="/notifications" 
                element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfileSettings />
                  </ProtectedRoute>
                } 
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </UserShell>
        } />
      </Routes>
    </Router>
  );
};

export default App;
