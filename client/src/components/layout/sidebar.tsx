import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard,
  AlertCircle,
  Users,
  UserCheck,
  CreditCard,
  BarChart3,
  Bell,
  Headphones,
  Settings,
  Wifi,
  LogOut,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permission: "view-dashboard" },
  { name: "Complaints", href: "/complaints", icon: AlertCircle, permission: "assign-complaints" },
  { name: "Engineers", href: "/engineers", icon: Users, permission: "manage-engineers" },
  { name: "User Management", href: "/users", icon: UserCheck, permission: "manage-users" },
  { name: "Service Plans", href: "/plans", icon: CreditCard, permission: "manage-plans" },
  { name: "Analytics", href: "/analytics", icon: BarChart3, permission: "view-analytics" },
  { name: "Notifications", href: "/notifications", icon: Bell, permission: "manage-notifications" },
  { name: "Support & Rating", href: "/support", icon: Headphones, permission: "manage-support" },
  { name: "Settings", href: "/settings", icon: Settings, permission: "system-settings" },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout, hasPermission } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 bg-blue-600">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center">
              <Wifi className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-white font-bold text-lg">WiFiCare</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            if (!hasPermission(item.permission)) return null;
            
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <a
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-600 hover:bg-slate-50 hover:text-gray-900"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </a>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="px-4 py-4 border-t border-slate-200">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user?.role === "super-admin" ? "SA" : user?.role === "admin" ? "A" : "M"}
              </span>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">
                {user?.role === "super-admin" ? "Super Admin" : 
                 user?.role === "admin" ? "Admin" : "Manager"}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-auto text-gray-400 hover:text-gray-500"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
