import { Bell, ChevronDown, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { user } = useAuth();

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

  return (
    <header className="glass-effect backdrop-blur-md border-b border-border/50 sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="lg:hidden mr-4">
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold text-gradient tracking-tight">{title}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative hover:bg-primary/10">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 block h-2 w-2 bg-primary rounded-full animate-pulse-slow" />
          </Button>
          <div className="relative">
            <Button variant="outline" className="flex items-center space-x-2 glass-effect">
              <span className="font-medium">{user ? getRoleDisplayName(user.role) : "User"}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
