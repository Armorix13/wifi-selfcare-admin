import { Role } from './types/auth';

export interface RouteConfig {
  path: string;
  title: string;
  icon?: string;
  roles: Role[];
  children?: RouteConfig[];
}

export const ROUTES: RouteConfig[] = [
  {
    path: '/dashboard',
    roles: [Role.SUPERADMIN, Role.ADMIN, Role.MANAGER, Role.AGENT],
    title: 'Dashboard',
    icon: 'dashboard'
  },
  {
    path: '/complaints',
    roles: [Role.SUPERADMIN, Role.ADMIN, Role.MANAGER, Role.AGENT],
    title: 'Complaints',
    icon: 'complaints'
  },
  {
    path: '/engineers',
    roles: [Role.SUPERADMIN, Role.ADMIN],
    title: 'Engineers',
    icon: 'engineers'
  },
  {
    path: '/users',
    roles: [Role.SUPERADMIN, Role.ADMIN],
    title: 'Users',
    icon: 'users'
  },
  {
    path: '/products',
    roles: [Role.SUPERADMIN, Role.ADMIN],
    title: 'Products',
    icon: 'products'
  },
  {
    path: '/plans',
    roles: [Role.SUPERADMIN, Role.ADMIN],
    title: 'Plans',
    icon: 'plans'
  },
  {
    path: '/analytics',
    roles: [Role.SUPERADMIN, Role.ADMIN, Role.MANAGER],
    title: 'Analytics',
    icon: 'analytics'
  },
  {
    path: '/notifications',
    roles: [Role.SUPERADMIN, Role.ADMIN],
    title: 'Notifications',
    icon: 'notifications'
  },
  {
    path: '/support',
    roles: [Role.SUPERADMIN, Role.ADMIN, Role.MANAGER],
    title: 'Support',
    icon: 'support'
  },
  {
    path: '/settings',
    roles: [Role.SUPERADMIN],
    title: 'Settings',
    icon: 'settings'
  },
  {
    path: '/installations',
    roles: [Role.SUPERADMIN, Role.ADMIN, Role.MANAGER],
    title: 'Installations',
    icon: 'installations'
  },
  {
    path: '/leads',
    roles: [Role.SUPERADMIN, Role.ADMIN, Role.MANAGER],
    title: 'Leads',
    icon: 'leads'
  },
  {
    path: '/installations-leads',
    roles: [Role.SUPERADMIN, Role.ADMIN, Role.MANAGER],
    title: 'Installation Leads',
    icon: 'installation-leads'
  }
];

export const DETAIL_ROUTES: RouteConfig[] = [
  {
    path: '/users/:id',
    roles: [Role.SUPERADMIN, Role.ADMIN],
    title: 'User Detail'
  },
  {
    path: '/engineers/:id',
    roles: [Role.SUPERADMIN, Role.ADMIN],
    title: 'Engineer Detail'
  },
  {
    path: '/complaints/:id',
    roles: [Role.SUPERADMIN, Role.ADMIN, Role.MANAGER, Role.AGENT],
    title: 'Complaint Detail'
  },
  {
    path: '/plans/:id',
    roles: [Role.SUPERADMIN, Role.ADMIN],
    title: 'Plan Detail'
  }
];

export function getRoutesForRole(role: Role): RouteConfig[] {
  return ROUTES.filter(route => route.roles.includes(role));
}

export function canAccessRoute(path: string, role: Role): boolean {
  const allRoutes = [...ROUTES, ...DETAIL_ROUTES];
  const route = allRoutes.find(r => r.path === path);
  return route ? route.roles.includes(role) : false;
}
