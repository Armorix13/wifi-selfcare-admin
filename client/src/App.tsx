import { Switch, Route, Redirect } from "wouter";
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
    return <Redirect to="/login" />;
  }
  
  return <>{children}</>;
}

function Router() {
  const { isAuthenticated } = useAuth();

  return (
    <Switch>
      <Route path="/login">
        {isAuthenticated ? <Redirect to="/dashboard" /> : <Login />}
      </Route>
      
      <Route path="/">
        {isAuthenticated ? <Redirect to="/dashboard" /> : <Redirect to="/login" />}
      </Route>
      
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/complaints">
        <ProtectedRoute>
          <Complaints />
        </ProtectedRoute>
      </Route>
      
      <Route path="/engineers">
        <ProtectedRoute>
          <Engineers />
        </ProtectedRoute>
      </Route>
      
      <Route path="/users">
        <ProtectedRoute>
          <Users />
        </ProtectedRoute>
      </Route>
      
      <Route path="/products">
        <ProtectedRoute>
          <Products />
        </ProtectedRoute>
      </Route>
      
      <Route path="/plans">
        <ProtectedRoute>
          <Plans />
        </ProtectedRoute>
      </Route>
      
      <Route path="/analytics">
        <ProtectedRoute>
          <Analytics />
        </ProtectedRoute>
      </Route>
      
      <Route path="/notifications">
        <ProtectedRoute>
          <Notifications />
        </ProtectedRoute>
      </Route>
      
      <Route path="/support">
        <ProtectedRoute>
          <Support />
        </ProtectedRoute>
      </Route>
      
      <Route path="/settings">
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      </Route>
      
      <Route path="/installations">
        <ProtectedRoute>
          <Installations />
        </ProtectedRoute>
      </Route>
      
      <Route path="/leads">
        <ProtectedRoute>
          <Leads />
        </ProtectedRoute>
      </Route>
      
      <Route path="/installations-leads">
        <ProtectedRoute>
          <InstallationsLeads />
        </ProtectedRoute>
      </Route>
      
      {/* Detail Pages */}
      <Route path="/users/:id">
        <ProtectedRoute>
          <UserDetail />
        </ProtectedRoute>
      </Route>
      
      <Route path="/engineers/:id">
        <ProtectedRoute>
          <EngineerDetail />
        </ProtectedRoute>
      </Route>
      
      <Route path="/complaints/:id">
        <ProtectedRoute>
          <ComplaintDetail />
        </ProtectedRoute>
      </Route>
      
      <Route path="/plans/:id">
        <ProtectedRoute>
          <PlanDetail />
        </ProtectedRoute>
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
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
