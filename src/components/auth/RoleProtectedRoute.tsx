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
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect to fallback path if user doesn't have required role
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}

export function RouteGuard({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user can access the current route
  if (!canAccessRoute(location.pathname, user.role)) {
    // Redirect to dashboard if user doesn't have access to current route
            return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
}
