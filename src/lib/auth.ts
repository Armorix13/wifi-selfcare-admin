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
}

const permissions = {
  [Role.SUPERADMIN]: [
    'view-dashboard',
    'manage-engineers',
    'assign-complaints',
    'manage-users',
    'manage-products',
    'manage-plans',
    'manage-installations',
    'manage-leads',
    'manage-notifications',
    'view-analytics',
    'system-settings',
    'manage-support',
    'manage-all',
  ],
  [Role.ADMIN]: [
    'view-dashboard',
    'manage-engineers',
    'assign-complaints',
    'manage-users',
    'manage-products',
    'manage-plans',
    'manage-installations',
    'manage-leads',
    'manage-notifications',
    'view-analytics',
    'manage-support',
  ],
  [Role.MANAGER]: [
    'view-dashboard',
    'assign-complaints',
    'manage-installations',
    'manage-leads',
    'view-analytics',
    'manage-support',
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
        // Store tokens using TokenManager
        if (user.accessToken) {
          TokenManager.setAccessToken(user.accessToken);
        }
        if (user.refreshToken) {
          TokenManager.setRefreshToken(user.refreshToken);
        }
        
        set({
          user,
          accessToken: user.accessToken,
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
        return permissions[user.role]?.includes(permission) || false;
      },
      canAccessRoute: (path) => {
        const { user } = get();
        if (!user) return false;
        
        return canAccessRoute(path, user.role);
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
