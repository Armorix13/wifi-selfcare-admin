import { Routes, Route, Navigate } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/lib/auth";
import { RouteGuard, RoleProtectedRoute } from "@/components/auth/RoleProtectedRoute";
import { Role } from "@/lib/types/auth";

// Import modern themes
import "@/styles/modern-themes.css";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Complaints from "@/pages/complaints";
import Engineers from "@/pages/engineers";
import Users from "@/pages/users";
import { Products } from "@/pages/products";
import Plans from "@/pages/plans";
import Analytics from "@/pages/analytics";
import Notifications from "@/pages/notifications";
import Support from "@/pages/support";
import Settings from "@/pages/settings";
import Profile from "@/pages/profile";
import UserDetail from "@/pages/user-detail";
import EngineerDetail from "@/pages/engineer-detail";
import ComplaintDetail from "@/pages/complaint-detail";
import PlanDetail from "@/pages/plan-detail";
import Installations from "@/pages/installations";
import Leads from "@/pages/leads";
import CompanyLeads from "@/pages/company-leads";
import Advertisements from "@/pages/advertisements";
import InstallationsLeads from "@/pages/installations-leads";
import Admin from "@/pages/Admin";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function Router() {
  const { isAuthenticated } = useAuth();

  return (
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
        <RoleProtectedRoute allowedRoles={[Role.SUPERADMIN, Role.ADMIN]}>
          <Users />
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
        <RoleProtectedRoute allowedRoles={[Role.SUPERADMIN]}>
          <InstallationsLeads />
        </RoleProtectedRoute>
      } />
      
      {/* Detail Routes */}
      <Route path="/users/:id" element={
        <RoleProtectedRoute allowedRoles={[Role.SUPERADMIN, Role.ADMIN]}>
          <UserDetail />
        </RoleProtectedRoute>
      } />
      
      <Route path="/engineers/:id" element={
        <RoleProtectedRoute allowedRoles={[Role.SUPERADMIN, Role.ADMIN]}>
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
      
      {/* Fallback to 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="wificare-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
