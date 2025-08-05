import { Routes, Route, Navigate } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/lib/auth";

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
import UserDetail from "@/pages/user-detail";
import EngineerDetail from "@/pages/engineer-detail";
import ComplaintDetail from "@/pages/complaint-detail";
import PlanDetail from "@/pages/plan-detail";
import Installations from "@/pages/installations";
import Leads from "@/pages/leads";
import InstallationsLeads from "@/pages/installations-leads";

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
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/complaints" element={
        <ProtectedRoute>
          <Complaints />
        </ProtectedRoute>
      } />
      
      <Route path="/engineers" element={
        <ProtectedRoute>
          <Engineers />
        </ProtectedRoute>
      } />
      
      <Route path="/users" element={
        <ProtectedRoute>
          <Users />
        </ProtectedRoute>
      } />
      
      <Route path="/products" element={
        <ProtectedRoute>
          <Products />
        </ProtectedRoute>
      } />
      
      <Route path="/plans" element={
        <ProtectedRoute>
          <Plans />
        </ProtectedRoute>
      } />
      
      <Route path="/analytics" element={
        <ProtectedRoute>
          <Analytics />
        </ProtectedRoute>
      } />
      
      <Route path="/notifications" element={
        <ProtectedRoute>
          <Notifications />
        </ProtectedRoute>
      } />
      
      <Route path="/support" element={
        <ProtectedRoute>
          <Support />
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      
      <Route path="/installations" element={
        <ProtectedRoute>
          <Installations />
        </ProtectedRoute>
      } />
      
      <Route path="/leads" element={
        <ProtectedRoute>
          <Leads />
        </ProtectedRoute>
      } />
      
      <Route path="/installations-leads" element={
        <ProtectedRoute>
          <InstallationsLeads />
        </ProtectedRoute>
      } />
      
      {/* Detail Pages */}
      <Route path="/users/:id" element={
        <ProtectedRoute>
          <UserDetail />
        </ProtectedRoute>
      } />
      
      <Route path="/engineers/:id" element={
        <ProtectedRoute>
          <EngineerDetail />
        </ProtectedRoute>
      } />
      
      <Route path="/complaints/:id" element={
        <ProtectedRoute>
          <ComplaintDetail />
        </ProtectedRoute>
      } />
      
      <Route path="/plans/:id" element={
        <ProtectedRoute>
          <PlanDetail />
        </ProtectedRoute>
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
