import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  email: string;
  username: string;
  role: 'super-admin' | 'admin' | 'manager';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const permissions = {
  'super-admin': [
    'view-dashboard',
    'manage-engineers',
    'assign-complaints',
    'manage-users',
    'manage-products',
    'manage-plans',
    'manage-notifications',
    'view-analytics',
    'system-settings',
    'manage-support',
  ],
  'admin': [
    'view-dashboard',
    'manage-engineers',
    'assign-complaints',
    'manage-users',
    'manage-products',
    'manage-plans',
    'manage-notifications',
    'view-analytics',
    'manage-support',
  ],
  'manager': [
    'view-dashboard',
    'assign-complaints',
    'view-analytics',
  ],
};

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
      hasPermission: (permission) => {
        const { user } = get();
        if (!user) return false;
        return permissions[user.role]?.includes(permission) || false;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
