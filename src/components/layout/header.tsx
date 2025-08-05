import { Bell, ChevronDown, Menu, User, Settings, LogOut, Shield, Mail, Phone, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { Link } from "react-router-dom";
import { GlobalSearch } from "@/components/search/GlobalSearch";

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock notifications data
  const notifications = [
    {
      id: 1,
      title: "New Complaint Assigned",
      message: "Complaint #C001 has been assigned to you",
      time: "2 min ago",
      unread: true,
      type: "complaint"
    },
    {
      id: 2,
      title: "System Maintenance",
      message: "Scheduled maintenance tonight at 2 AM",
      time: "1 hour ago",
      unread: true,
      type: "system"
    },
    {
      id: 3,
      title: "Engineer Update",
      message: "John completed installation at Location A",
      time: "3 hours ago",
      unread: false,
      type: "update"
    },
    {
      id: 4,
      title: "Payment Received",
      message: "Customer #12345 payment processed successfully",
      time: "5 hours ago",
      unread: false,
      type: "payment"
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "super-admin":
        return "Super Admin";
      case "admin":
        return "Admin";
      case "manager":
        return "Manager";
      default:
        return role;
    }
  };

  const getUserInitials = (email: string) => {
    return email.split('@')[0].substring(0, 2).toUpperCase();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "complaint":
        return "🎫";
      case "system":
        return "⚙️";
      case "update":
        return "📋";
      case "payment":
        return "💳";
      default:
        return "📢";
    }
  };

  return (
    <header 
      className="backdrop-blur-md border-b sticky top-0 z-50 transition-all duration-300"
      style={{
        background: "var(--header-bg)",
        borderColor: "var(--header-border)"
      }}
    >
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        {/* Left Section */}
        <div className="flex items-center flex-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden mr-2 sm:mr-4 transition-all duration-200"
            style={{
              color: "var(--header-icon)",
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--header-icon-hover)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--header-icon)"}
            onClick={onMenuClick}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 
            className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight mr-4 transition-colors duration-200"
            style={{ color: "var(--header-text)" }}
          >
            {title}
          </h1>
          
          {/* Global Search - Hidden on small screens */}
          <div className="hidden md:flex items-center flex-1 max-w-md ml-4">
            <GlobalSearch />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Search Button - Mobile Only */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden transition-all duration-200"
            style={{ color: "var(--header-icon)" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--header-icon-hover)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--header-icon)"}
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative transition-all duration-200"
                style={{ color: "var(--header-icon)" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "var(--header-icon-hover)"}
                onMouseLeave={(e) => e.currentTarget.style.color = "var(--header-icon)"}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs animate-pulse"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-80 p-0 shadow-xl border-0" 
              align="end"
              style={{
                background: "var(--dropdown-bg)",
                border: "1px solid var(--dropdown-border)"
              }}
            >
              <div className="p-4 border-b" style={{ borderColor: "var(--dropdown-border)" }}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold" style={{ color: "var(--dropdown-item)" }}>Notifications</h3>
                  <Badge variant="secondary">{unreadCount} new</Badge>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className="p-4 border-b cursor-pointer transition-all duration-200"
                    style={{ 
                      borderColor: "var(--dropdown-border)",
                      background: notification.unread ? "var(--dropdown-item-hover)" : "transparent"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--dropdown-item-hover)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = notification.unread ? "var(--dropdown-item-hover)" : "transparent"}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-lg">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate" style={{ color: "var(--dropdown-item)" }}>
                            {notification.title}
                          </p>
                          {notification.unread && (
                            <div className="h-2 w-2 bg-primary rounded-full ml-2" />
                          )}
                        </div>
                        <p className="text-sm mt-1 truncate opacity-80" style={{ color: "var(--dropdown-item)" }}>
                          {notification.message}
                        </p>
                        <p className="text-xs mt-1 opacity-60" style={{ color: "var(--dropdown-item)" }}>
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t" style={{ borderColor: "var(--dropdown-border)" }}>
                <Button variant="outline" className="w-full" size="sm">
                  <Link to="/notifications">View All Notifications</Link>
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center space-x-2 p-2 transition-all duration-200"
                style={{ color: "var(--header-text)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--dropdown-item-hover)";
                  e.currentTarget.style.color = "var(--header-icon-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--header-text)";
                }}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt="User" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {user ? getUserInitials(user.email) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-medium" style={{ color: "var(--header-text)" }}>
                    {user ? getRoleDisplayName(user.role) : "User"}
                  </span>
                  <span className="text-xs opacity-70" style={{ color: "var(--header-text)" }}>
                    {user?.email || "user@example.com"}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 opacity-70" style={{ color: "var(--header-icon)" }} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-56 shadow-xl border-0" 
              align="end"
              style={{
                background: "var(--dropdown-bg)",
                border: "1px solid var(--dropdown-border)"
              }}
            >
              <DropdownMenuLabel style={{ borderColor: "var(--dropdown-border)" }}>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium" style={{ color: "var(--dropdown-item)" }}>
                    {user ? getRoleDisplayName(user.role) : "User"}
                  </p>
                  <p className="text-xs opacity-70" style={{ color: "var(--dropdown-item)" }}>
                    {user?.email || "user@example.com"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator style={{ backgroundColor: "var(--dropdown-border)" }} />
              
              <DropdownMenuItem 
                className="cursor-pointer transition-all duration-200"
                style={{ color: "var(--dropdown-item)" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--dropdown-item-hover)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <User className="mr-2 h-4 w-4" />
                <Link to="/profile">Profile</Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                className="cursor-pointer transition-all duration-200"
                style={{ color: "var(--dropdown-item)" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--dropdown-item-hover)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <Settings className="mr-2 h-4 w-4" />
                <Link to="/settings">Settings</Link>
              </DropdownMenuItem>
              
              {user?.role === "super-admin" && (
                <DropdownMenuItem 
                  className="cursor-pointer transition-all duration-200"
                  style={{ color: "var(--dropdown-item)" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--dropdown-item-hover)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Admin Panel</span>
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator style={{ backgroundColor: "var(--dropdown-border)" }} />
              
              <DropdownMenuItem 
                className="cursor-pointer transition-all duration-200"
                style={{ color: "var(--dropdown-item)" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--dropdown-item-hover)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <Mail className="mr-2 h-4 w-4" />
                <span>Support</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                className="cursor-pointer transition-all duration-200"
                style={{ color: "var(--dropdown-item)" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--dropdown-item-hover)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <Phone className="mr-2 h-4 w-4" />
                <span>Contact</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator style={{ backgroundColor: "var(--dropdown-border)" }} />
              
              <DropdownMenuItem 
                className="cursor-pointer transition-all duration-200 text-red-600 focus:text-red-600"
                onClick={logout}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--dropdown-item-hover)";
                  e.currentTarget.style.color = "#dc2626";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#dc2626";
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
