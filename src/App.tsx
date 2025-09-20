import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/lib/auth";
import { RouteGuard, RoleProtectedRoute } from "@/components/auth/RoleProtectedRoute";
import { Role } from "@/lib/types/auth";
import { lazy, Suspense } from "react";

// Import modern themes
import "@/styles/modern-themes.css";

// Lazy load all page components
const NotFound = lazy(() => import("@/pages/not-found"));
const Login = lazy(() => import("@/pages/login"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Complaints = lazy(() => import("@/pages/complaints"));
const Engineers = lazy(() => import("@/pages/engineers"));
const Users = lazy(() => import("@/pages/users"));
const Products = lazy(() => import("@/pages/products").then(module => ({ default: module.Products })));
const Plans = lazy(() => import("@/pages/plans"));
const Analytics = lazy(() => import("@/pages/analytics"));
const Notifications = lazy(() => import("@/pages/notifications"));
const Support = lazy(() => import("@/pages/support"));
const Settings = lazy(() => import("@/pages/settings"));
const Profile = lazy(() => import("@/pages/profile"));
const UserDetail = lazy(() => import("@/pages/userDetails"));
const AddUser = lazy(() => import("@/pages/AddUser"));
const EditUser = lazy(() => import("@/pages/EditUser"));
const EngineerDetail = lazy(() => import("@/pages/EngineerDetails"));
const ComplaintDetail = lazy(() => import("@/pages/complaint-detail"));
const PlanDetail = lazy(() => import("@/pages/plan-detail"));
const Installations = lazy(() => import("@/pages/installations"));
const Leads = lazy(() => import("@/pages/leads"));
const CompanyLeads = lazy(() => import("@/pages/company-leads"));
const Advertisements = lazy(() => import("@/pages/advertisements"));
const InstallationsLeads = lazy(() => import("@/pages/installations-leads"));
const Admin = lazy(() => import("@/pages/Admin"));
const LeaveRequests = lazy(() => import("@/pages/leave-requests"));
const OLTManagement = lazy(() => import("@/pages/olt-management"));
const OLTDetail = lazy(() => import("@/pages/olt-detail"));
const MapPage = lazy(() => import("@/pages/map"));
const MSDetail = lazy(() => import("@/pages/ms-detail"));
const SubMSDetail = lazy(() => import("@/pages/subms-detail"));
const FDBDetail = lazy(() => import("@/pages/fdb-detail"));
const X2Detail = lazy(() => import("@/pages/x2-detail"));

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);


function Router() {
  const { isAuthenticated } = useAuth();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        } />

        <Route path="/" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        } />

        <Route path="/dashboard" element={
          <RouteGuard>
            <Dashboard />
          </RouteGuard>
        } />

        <Route path="/complaints" element={
          <RouteGuard>
            <Complaints />
          </RouteGuard>
        } />

        <Route path="/engineers" element={
          <RoleProtectedRoute allowedRoles={[Role.SUPERADMIN, Role.ADMIN]}>
            <Engineers />
          </RoleProtectedRoute>
        } />

        <Route path="/manage-admin" element={
          <RoleProtectedRoute allowedRoles={[Role.SUPERADMIN]}>
            <Admin />
          </RoleProtectedRoute>
        } />

        <Route path="/users" element={
          <RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
            <Users />
          </RoleProtectedRoute>
        } />

        <Route path="/users/add" element={
          <RoleProtectedRoute allowedRoles={[Role.SUPERADMIN, Role.ADMIN]}>
            <AddUser />
          </RoleProtectedRoute>
        } />

        <Route path="/users/edit/:id" element={
          <RoleProtectedRoute allowedRoles={[Role.SUPERADMIN, Role.ADMIN]}>
            <EditUser />
          </RoleProtectedRoute>
        } />

        <Route path="/products" element={
          <RoleProtectedRoute allowedRoles={[Role.SUPERADMIN]}>
            <Products />
          </RoleProtectedRoute>
        } />

        <Route path="/plans" element={
          <RoleProtectedRoute allowedRoles={[Role.SUPERADMIN, Role.ADMIN]}>
            <Plans />
          </RoleProtectedRoute>
        } />

        <Route path="/analytics" element={
          <RoleProtectedRoute allowedRoles={[Role.SUPERADMIN, Role.ADMIN, Role.MANAGER]}>
            <Analytics />
          </RoleProtectedRoute>
        } />

        <Route path="/notifications" element={
          <RoleProtectedRoute allowedRoles={[Role.SUPERADMIN, Role.ADMIN]}>
            <Notifications />
          </RoleProtectedRoute>
        } />

        <Route path="/support" element={
          <RoleProtectedRoute allowedRoles={[Role.SUPERADMIN, Role.ADMIN, Role.MANAGER]}>
            <Support />
          </RoleProtectedRoute>
        } />

        <Route path="/profile" element={
          <RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
            <Profile />
          </RoleProtectedRoute>
        } />

        <Route path="/settings" element={
          <RoleProtectedRoute allowedRoles={[Role.SUPERADMIN]}>
            <Settings />
          </RoleProtectedRoute>
        } />

        <Route path="/installations" element={
          <RoleProtectedRoute allowedRoles={[Role.SUPERADMIN, Role.ADMIN, Role.MANAGER]}>
            <Installations />
          </RoleProtectedRoute>
        } />

        <Route path="/leads" element={
          <RoleProtectedRoute allowedRoles={[Role.SUPERADMIN]}>
            <Leads />
          </RoleProtectedRoute>
        } />

        <Route path="/company-leads" element={
          <RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
            <CompanyLeads />
          </RoleProtectedRoute>
        } />

        <Route path="/advertisements" element={
          <RoleProtectedRoute allowedRoles={[Role.SUPERADMIN]}>
            <Advertisements />
          </RoleProtectedRoute>
        } />

        <Route path="/installations-leads" element={
          <RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
            <InstallationsLeads />
          </RoleProtectedRoute>
        } />

        <Route path="/leave-requests" element={
          <RoleProtectedRoute allowedRoles={[Role.ADMIN, Role.MANAGER]}>
            <LeaveRequests />
          </RoleProtectedRoute>
        } />

        <Route path="/olt-management" element={
          <RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
            <OLTManagement />
          </RoleProtectedRoute>
        } />

        <Route path="/map" element={
          <RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
            <MapPage />
          </RoleProtectedRoute>
        } />

        {/* Detail Routes */}
        <Route path="/olt-management/:id" element={
          <RoleProtectedRoute allowedRoles={[Role.SUPERADMIN, Role.ADMIN]}>
            <OLTDetail />
          </RoleProtectedRoute>
        } />

        <Route path="/users/:id" element={
          <RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
            <UserDetail />
          </RoleProtectedRoute>
        } />


        <Route path="/engineers/:id" element={
          <RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
            <EngineerDetail />
          </RoleProtectedRoute>
        } />

        <Route path="/complaints/:id" element={
          <RouteGuard>
            <ComplaintDetail />
          </RouteGuard>
        } />

        <Route path="/plans/:id" element={
          <RoleProtectedRoute allowedRoles={[Role.SUPERADMIN, Role.ADMIN]}>
            <PlanDetail />
          </RoleProtectedRoute>
        } />

        {/* Device Detail Routes */}
        <Route path="/ms/:id" element={
          <RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
            <MSDetail />
          </RoleProtectedRoute>
        } />

        <Route path="/subms/:id" element={
          <RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
            <SubMSDetail />
          </RoleProtectedRoute>
        } />

        <Route path="/fdb/:id" element={
          <RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
            <FDBDetail />
          </RoleProtectedRoute>
        } />

        <Route path="/x2/:id" element={
          <RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
            <X2Detail />
          </RoleProtectedRoute>
        } />

        {/* Fallback to 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="wificare-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
