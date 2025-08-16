import { useAuth } from '@/lib/auth';
import { getRoutesForRole, canAccessRoute } from '@/lib/routes';
import { Role } from '@/lib/types/auth';

export function useRoleNavigation() {
  const { user, hasPermission } = useAuth();

  const getUserRoutes = () => {
    return user ? getRoutesForRole(user.role) : [];
  };

  const canAccess = (path: string) => {
    return user ? canAccessRoute(path, user.role) : false;
  };

  const hasRole = (roles: Role | Role[]) => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  const isSuperAdmin = () => hasRole(Role.SUPERADMIN);
  const isAdmin = () => hasRole([Role.SUPERADMIN, Role.ADMIN]);
  const isManager = () => hasRole([Role.SUPERADMIN, Role.ADMIN, Role.MANAGER]);
  const isAgent = () => hasRole([Role.SUPERADMIN, Role.ADMIN, Role.MANAGER, Role.AGENT]);

  return {
    user,
    userRole: user?.role,
    getUserRoutes,
    canAccess,
    hasRole,
    isSuperAdmin,
    isAdmin,
    isManager,
    isAgent,
    hasPermission,
  };
}
