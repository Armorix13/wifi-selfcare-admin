import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Role, User } from './types/auth';
import { canAccessRoute } from './routes';
import { TokenManager } from './tokenManager';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  canAccessRoute: (path: string) => boolean;
  getAccessToken: () => string | null;
  setAccessToken: (token: string) => void;
  refreshUserRole: () => void;
}

// Helper function to normalize role string to enum value
const normalizeRole = (roleString: string): Role => {
  const normalizedRole = roleString.toLowerCase();
  switch (normalizedRole) {
    case 'superadmin':
      return Role.SUPERADMIN;
    case 'admin':
      return Role.ADMIN;
    case 'manager':
      return Role.MANAGER;
    case 'agent':
      return Role.AGENT;
    default:
      return Role.AGENT; // fallback to lowest role
  }
};

const permissions = {
  [Role.SUPERADMIN]: [
    // 'view-dashboard',
    'view-dashboard-analytics',
    'manage-engineers',
    'assign-complaints',
    'manage-users',
    'manage-products',
    'manage-plans',
    // 'manage-installations',
    // 'manage-leads',
    'manage-notifications',
    'view-analytics',
    'system-settings',
    'manage-support',
    'manage-admin',
    'manage-advertisements',
    'manage-all',
    'view-leads'  // Only SUPERADMIN can see the "Leads" section
  ],
  [Role.ADMIN]: [
    'view-dashboard-analytics',
    'manage-engineers',
    'assign-complaints',
    'manage-users',
    'manage-plans',
    'manage-installations',
    'manage-leads',  // ADMIN can see "Company Leads" section
    'manage-notifications',
    'view-analytics',
    'manage-support',
    'manage-leave-requests',
    // Note: ADMIN does NOT have 'view-leads' permission
  ],
  [Role.MANAGER]: [
    'view-dashboard',
    'assign-complaints',
    'manage-installations',
    'view-analytics',
    'manage-support',
    'manage-leave-requests',
    // Note: MANAGER does NOT have 'view-leads' permission
  ],
  [Role.AGENT]: [
    'view-dashboard',
    'view-complaints',
    'update-complaints',
  ],
};

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      login: (user) => {
        // Normalize the role to ensure proper enum matching
        const normalizedUser = {
          ...user,
          role: normalizeRole(user.role)
        };
        
        // Debug logging
        console.log('Login - Original role:', user.role);
        console.log('Login - Normalized role:', normalizedUser.role);
        console.log('Login - Role enum values:', Object.values(Role));
        
        // Store tokens using TokenManager
        if (normalizedUser.accessToken) {
          TokenManager.setAccessToken(normalizedUser.accessToken);
        }
        if (normalizedUser.refreshToken) {
          TokenManager.setRefreshToken(normalizedUser.refreshToken);
        }
        
        set({
          user: normalizedUser,
          accessToken: normalizedUser.accessToken,
          isAuthenticated: true,
        });
      },
      logout: () => {
        // Remove tokens using TokenManager
        TokenManager.clearTokens();
        
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        });
      },
      hasPermission: (permission) => {
        const { user } = get();
        if (!user) return false;
        
        // Ensure role is normalized
        const normalizedRole = normalizeRole(user.role);
        
        // Debug logging
        console.log('hasPermission check:', {
          permission,
          userRole: user.role,
          normalizedRole,
          availablePermissions: permissions[normalizedRole],
          hasPermission: permissions[normalizedRole]?.includes(permission)
        });
        
        return permissions[normalizedRole]?.includes(permission) || false;
      },
      canAccessRoute: (path) => {
        const { user } = get();
        if (!user) return false;
        
        // Ensure role is normalized
        const normalizedRole = normalizeRole(user.role);
        return canAccessRoute(path, normalizedRole);
      },
      getAccessToken: () => {
        // First try to get from state, then from TokenManager
        const { accessToken } = get();
        if (accessToken) return accessToken;
        
        const localToken = TokenManager.getAccessToken();
        if (localToken) {
          // Update state with token from TokenManager
          set({ accessToken: localToken });
          return localToken;
        }
        
        return null;
      },
      setAccessToken: (token: string) => {
        TokenManager.setAccessToken(token);
        set({ accessToken: token });
      },
      refreshUserRole: () => {
        const { user } = get();
        if (user) {
          const normalizedRole = normalizeRole(user.role);
          console.log('Refreshing user role:', {
            originalRole: user.role,
            normalizedRole,
            availablePermissions: permissions[normalizedRole],
          });
          
          // Update the user with normalized role
          const updatedUser = {
            ...user,
            role: normalizedRole
          };
          
          set({ user: updatedUser });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
