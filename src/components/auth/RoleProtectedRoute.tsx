import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Role } from '@/lib/types/auth';
import { canAccessRoute } from '@/lib/routes';

interface RoleProtectedRouteProps {
  children: ReactNode;
  allowedRoles: Role[];
  fallbackPath?: string;
}

export function RoleProtectedRoute({ 
  children, 
  allowedRoles, 
  fallbackPath = '/dashboard' 
}: RoleProtectedRouteProps) {
  const { user, isAuthenticated, hasPermission } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has any of the required roles by checking permissions
  const hasRequiredRole = allowedRoles.some(role => {
    // For each role, check if user has the corresponding permission
    switch (role) {
      case Role.SUPERADMIN:
        return hasPermission('manage-all') || hasPermission('system-settings');
      case Role.ADMIN:
        return hasPermission('manage-users') || hasPermission('manage-engineers');
      case Role.MANAGER:
        return hasPermission('manage-installations') || hasPermission('view-analytics');
      case Role.AGENT:
        return hasPermission('view-complaints') || hasPermission('update-complaints');
      default:
        return false;
    }
  });

  if (!hasRequiredRole) {
    // Redirect to fallback path if user doesn't have required role
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}

export function RouteGuard({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, canAccessRoute: userCanAccessRoute } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user can access the current route using the auth hook
  if (!userCanAccessRoute(location.pathname)) {
    // Redirect to dashboard if user doesn't have access to current route
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
