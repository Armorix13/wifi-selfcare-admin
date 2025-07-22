import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/components/theme-provider";
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
  Palette,
  Sun,
  Moon,
  Zap,
  Sparkles,
  X,
  Package,
  HardHat,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permission: "view-dashboard" },
  { name: "Complaints", href: "/complaints", icon: AlertCircle, permission: "assign-complaints" },
  { name: "Engineers", href: "/engineers", icon: Users, permission: "manage-engineers" },
  { name: "User Management", href: "/users", icon: UserCheck, permission: "manage-users" },
  { name: "Products", href: "/products", icon: Package, permission: "manage-products" },
  { name: "Service Plans", href: "/plans", icon: CreditCard, permission: "manage-plans" },
  { name: "New Installation & Leads", href: "/installations-leads", icon: HardHat, permission: "manage-installations" },
  { name: "Analytics", href: "/analytics", icon: BarChart3, permission: "view-analytics" },
  { name: "Notifications", href: "/notifications", icon: Bell, permission: "manage-notifications" },
  { name: "Support & Rating", href: "/support", icon: Headphones, permission: "manage-support" },
  { name: "Settings", href: "/settings", icon: Settings, permission: "system-settings" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { user, logout, hasPermission } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout();
  };

  const handleNavClick = () => {
    // Auto-close sidebar on mobile when navigation item is clicked
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const themeIcons = {
    light: Sun,
    dark: Moon,
    crypto: Zap,
    neon: Sparkles,
  };

  const ThemeIcon = themeIcons[theme];

  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-50 w-64 sidebar-gradient border-r border-[var(--sidebar-border)] shadow-2xl transition-transform duration-300 ease-in-out",
      "lg:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-[var(--sidebar-border)]">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg animate-pulse-slow">
              <Wifi className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-[var(--sidebar-item)] font-bold text-xl tracking-tight">WiFiCare</span>
          </div>
          
          {/* Mobile close button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="lg:hidden h-8 w-8 p-0 text-[var(--sidebar-item)] hover:bg-[var(--sidebar-item-hover)]"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          
          {/* Theme Switcher - Hidden on mobile to save space */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="hidden lg:flex h-8 w-8 p-0 text-[var(--sidebar-item)] hover:bg-[var(--sidebar-item-hover)]"
              >
                <ThemeIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="theme-dropdown w-40">
              <DropdownMenuItem 
                onClick={() => setTheme("light")}
                className="theme-dropdown-item flex items-center"
              >
                <Sun className="mr-2 h-4 w-4" />
                <span className="font-medium">Light</span>
                {theme === "light" && <div className="ml-auto w-2 h-2 bg-primary rounded-full" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setTheme("dark")}
                className="theme-dropdown-item flex items-center"
              >
                <Moon className="mr-2 h-4 w-4" />
                <span className="font-medium">Dark</span>
                {theme === "dark" && <div className="ml-auto w-2 h-2 bg-primary rounded-full" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setTheme("crypto")}
                className="theme-dropdown-item flex items-center"
              >
                <Zap className="mr-2 h-4 w-4" />
                <span className="font-medium">Crypto</span>
                {theme === "crypto" && <div className="ml-auto w-2 h-2 bg-primary rounded-full" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setTheme("neon")}
                className="theme-dropdown-item flex items-center"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                <span className="font-medium">Neon</span>
                {theme === "neon" && <div className="ml-auto w-2 h-2 bg-primary rounded-full" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item, index) => {
            if (!hasPermission(item.permission)) return null;
            
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div
                  onClick={handleNavClick}
                  className={cn(
                    "group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer",
                    isActive
                      ? "bg-[var(--sidebar-item-active-bg)] text-[var(--sidebar-item-active)] shadow-lg transform scale-105"
                      : "text-[var(--sidebar-item)] hover:bg-[var(--sidebar-item-hover)] hover:transform hover:scale-102"
                  )}
                  style={{
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg mr-3 transition-all duration-200",
                    isActive 
                      ? "bg-[var(--sidebar-item-active)] text-[var(--sidebar-item-active-bg)]" 
                      : "group-hover:bg-[var(--sidebar-item-active)] group-hover:text-[var(--sidebar-item-active-bg)]"
                  )}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="tracking-wide">{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-1 h-8 bg-[var(--sidebar-item-active)] rounded-full animate-pulse-slow" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="px-3 py-4 border-t border-[var(--sidebar-border)]">
          <div className="flex items-center p-3 rounded-xl bg-[var(--sidebar-item-hover)] border border-[var(--sidebar-border)]">
            <div className="h-10 w-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-primary-foreground font-semibold text-sm">
                {user?.role === "super-admin" ? "SA" : user?.role === "admin" ? "A" : "M"}
              </span>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--sidebar-item)] truncate">
                {user?.role === "super-admin" ? "Super Admin" : 
                 user?.role === "admin" ? "Admin" : "Manager"}
              </p>
              <p className="text-xs text-[var(--sidebar-item)] opacity-70 truncate">{user?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="h-8 w-8 p-0 text-[var(--sidebar-item)] hover:bg-[var(--sidebar-item-active)] hover:text-[var(--sidebar-item-active-bg)] transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Mobile Theme Switcher */}
          <div className="mt-3 lg:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-between text-[var(--sidebar-item)] border-[var(--sidebar-border)] hover:bg-[var(--sidebar-item-hover)]"
                >
                  <span className="flex items-center">
                    <ThemeIcon className="h-4 w-4 mr-2" />
                    Theme
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="theme-dropdown w-40">
                <DropdownMenuItem 
                  onClick={() => setTheme("light")}
                  className="theme-dropdown-item flex items-center"
                >
                  <Sun className="mr-2 h-4 w-4" />
                  <span className="font-medium">Light</span>
                  {theme === "light" && <div className="ml-auto w-2 h-2 bg-primary rounded-full" />}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setTheme("dark")}
                  className="theme-dropdown-item flex items-center"
                >
                  <Moon className="mr-2 h-4 w-4" />
                  <span className="font-medium">Dark</span>
                  {theme === "dark" && <div className="ml-auto w-2 h-2 bg-primary rounded-full" />}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setTheme("crypto")}
                  className="theme-dropdown-item flex items-center"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  <span className="font-medium">Crypto</span>
                  {theme === "crypto" && <div className="ml-auto w-2 h-2 bg-primary rounded-full" />}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setTheme("neon")}
                  className="theme-dropdown-item flex items-center"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  <span className="font-medium">Neon</span>
                  {theme === "neon" && <div className="ml-auto w-2 h-2 bg-primary rounded-full" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
