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
import { Link } from "wouter";

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
    <header className="glass-effect backdrop-blur-md border-b border-border/50 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        {/* Left Section */}
        <div className="flex items-center flex-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden mr-2 sm:mr-4 hover:bg-primary/10 transition-colors"
            onClick={onMenuClick}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gradient tracking-tight mr-4">{title}</h1>
          
          {/* Search Bar - Hidden on small screens */}
          <div className="hidden md:flex items-center flex-1 max-w-md ml-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search complaints, users, engineers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50 border-border/50 focus:bg-background"
              />
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Search Button - Mobile Only */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden hover:bg-primary/10 transition-colors"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 transition-colors">
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
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Notifications</h3>
                  <Badge variant="secondary">{unreadCount} new</Badge>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors ${
                      notification.unread ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-lg">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground truncate">
                            {notification.title}
                          </p>
                          {notification.unread && (
                            <div className="h-2 w-2 bg-blue-600 rounded-full ml-2" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 truncate">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t">
                <Button variant="outline" className="w-full" size="sm">
                  <Link href="/notifications">View All Notifications</Link>
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 hover:bg-primary/10 transition-colors p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt="User" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {user ? getUserInitials(user.email) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-medium text-foreground">
                    {user ? getRoleDisplayName(user.role) : "User"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {user?.email || "user@example.com"}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user ? getRoleDisplayName(user.role) : "User"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || "user@example.com"}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              
              {user?.role === "super-admin" && (
                <DropdownMenuItem className="cursor-pointer">
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Admin Panel</span>
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem className="cursor-pointer">
                <Mail className="mr-2 h-4 w-4" />
                <span>Support</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem className="cursor-pointer">
                <Phone className="mr-2 h-4 w-4" />
                <span>Contact</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={logout}
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
