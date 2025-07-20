import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Wifi, Lock, Eye, EyeOff, Zap, Palette, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/components/theme-provider";
import { z } from "zod";

// Local type definitions
const loginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginData = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@company.com",
      password: "password123",
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const themes = [
    { id: "light", name: "Light", icon: Sun },
    { id: "dark", name: "Dark", icon: Moon },
    { id: "crypto", name: "Crypto", icon: Zap },
    { id: "neon", name: "Neon", icon: Palette },
  ] as const;

  // Dummy user data
  const dummyUsers = {
    "admin@company.com": {
      id: 1,
      email: "admin@company.com",
      username: "admin",
      role: "super-admin" as const,
      password: "password123"
    },
    "manager@company.com": {
      id: 2,
      email: "manager@company.com", 
      username: "manager",
      role: "manager" as const,
      password: "password123"
    },
    "staff@company.com": {
      id: 3,
      email: "staff@company.com",
      username: "staff", 
      role: "admin" as const,
      password: "password123"
    }
  };

  const onSubmit = (data: LoginData) => {
    setIsLoading(true);
    
    // Completely local dummy login - no API calls needed
    setTimeout(() => {
      const user = dummyUsers[data.email as keyof typeof dummyUsers];
      
      if (user && user.password === data.password) {
        const { password, ...userWithoutPassword } = user;
        login(userWithoutPassword, "dummy-token-123");
        toast({
          title: "Success",
          description: "Login successful",
        });
        setLocation("/dashboard");
      } else {
        toast({
          title: "Error", 
          description: "Invalid email or password",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-primary/3 rounded-full blur-2xl animate-float" />
      </div>

      {/* Theme Switcher */}
      <div className="absolute top-6 right-6 z-20">
        <div className="flex gap-2 bg-card/80 backdrop-blur-md border border-border/50 rounded-full p-1 shadow-lg">
          {themes.map(({ id, name, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTheme(id)}
              className={`
                p-2 rounded-full transition-all duration-300 group relative
                ${theme === id 
                  ? 'bg-primary text-primary-foreground shadow-lg neon-glow' 
                  : 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
                }
              `}
              title={name}
            >
              <Icon className="h-4 w-4" />
              {theme === id && (
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Login Card */}
      <Card className="relative w-full max-w-lg backdrop-blur-xl bg-card/80 border border-border/50 shadow-2xl">
        {/* Card Glow Effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 via-transparent to-accent/10 blur-xl" />
        
        <CardContent className="relative p-10">
          {/* Header Section */}
          <div className="text-center mb-10">
            <div className="relative mx-auto mb-6">
              <div className="h-20 w-20 mx-auto bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg neon-glow">
                <Wifi className="h-10 w-10 text-primary-foreground animate-pulse-slow" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full animate-ping" />
            </div>
            
            <h1 className="text-4xl font-bold text-gradient mb-2">
              WiFi Self-Care
            </h1>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Welcome Back
            </h2>
            <p className="text-muted-foreground">
              Access your admin dashboard with secure login
            </p>
          </div>

          {/* Demo Accounts Info */}
          <div className="bg-muted/30 rounded-lg p-4 mb-6 border border-border/50">
            <h4 className="text-sm font-semibold text-foreground mb-2">Demo Accounts:</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>👤 <span className="font-mono">admin@company.com</span> - Super Admin</div>
              <div>👤 <span className="font-mono">manager@company.com</span> - Manager</div>
              <div>👤 <span className="font-mono">staff@company.com</span> - Staff</div>
              <div className="text-accent font-semibold">🔑 Password: password123</div>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <Label 
                  htmlFor="email" 
                  className="text-sm font-medium text-foreground"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...form.register("email")}
                  className="h-12 bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 transition-all duration-300"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <span>⚠️</span> {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label 
                  htmlFor="password" 
                  className="text-sm font-medium text-foreground"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    {...form.register("password")}
                    className="h-12 pr-12 bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <span>⚠️</span> {form.formState.errors.password.message}
                  </p>
                )}
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="remember-me" 
                  className="border-border/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary" 
                />
                <Label 
                  htmlFor="remember-me" 
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  Remember me
                </Label>
              </div>
              <button 
                type="button"
                className="text-sm text-primary hover:text-primary/80 transition-colors duration-200 font-medium"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold text-lg rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 neon-glow"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Signing In...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5" />
                  <span>Sign In to Dashboard</span>
                </div>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              Secure WiFi Management Platform
            </p>
            <div className="flex justify-center items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-muted-foreground">System Online</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
