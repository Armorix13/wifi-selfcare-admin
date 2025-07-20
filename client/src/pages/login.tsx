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
    <div className="w-screen h-screen relative overflow-hidden bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large Background Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/8 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/8 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-primary/5 rounded-full blur-2xl animate-float" />
        
        {/* Additional Mobile-Optimized Orbs */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-primary/6 rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-accent/6 rounded-full blur-2xl animate-pulse-slow" />
        
        {/* Floating Particles */}
        <div className="absolute top-1/3 right-1/3 w-4 h-4 bg-primary/20 rounded-full animate-ping" />
        <div 
          className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-accent/20 rounded-full animate-ping" 
          style={{ animationDelay: '1s' }} 
        />
        <div 
          className="absolute top-2/3 left-2/3 w-2 h-2 bg-primary/30 rounded-full animate-ping" 
          style={{ animationDelay: '2s' }} 
        />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      {/* Theme Switcher - Responsive */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <div className="flex gap-1 sm:gap-2 bg-card/90 backdrop-blur-md border border-border/50 rounded-full p-1 shadow-xl neon-glow">
          {themes.map(({ id, name, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTheme(id)}
              className={`
                p-2 sm:p-2.5 rounded-full transition-all duration-300 group relative
                ${theme === id 
                  ? 'bg-primary text-primary-foreground shadow-lg scale-110' 
                  : 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-105'
                }
              `}
              title={name}
            >
              <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
              {theme === id && (
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Container - Responsive Layout */}
      <div className="w-full h-full flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 p-4 sm:p-6 lg:p-8">
        
        {/* Left Side - Brand & Info (Hidden on Mobile) */}
        <div className="hidden lg:flex flex-col items-center justify-center flex-1 max-w-lg text-center space-y-8">
          <div className="relative">
            <div className="h-32 w-32 mx-auto bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center shadow-2xl neon-glow animate-float">
              <Wifi className="h-16 w-16 text-primary-foreground" />
            </div>
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-accent rounded-full animate-ping" />
            <div 
              className="absolute -bottom-4 -left-4 w-6 h-6 bg-primary rounded-full animate-ping" 
              style={{ animationDelay: '1s' }} 
            />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-6xl font-bold text-gradient">
              WiFi Self-Care
            </h1>
            <p className="text-xl text-muted-foreground">
              Advanced Network Management Platform
            </p>
            <div className="flex justify-center items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-muted-foreground">System Online</span>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:flex-1 max-w-lg lg:max-w-md xl:max-w-lg">
          <Card className="relative backdrop-blur-2xl bg-card/90 border border-border/50 shadow-2xl rounded-2xl lg:rounded-3xl neon-glow">
            {/* Enhanced Card Glow */}
            <div className="absolute inset-0 rounded-2xl lg:rounded-3xl bg-gradient-to-r from-primary/15 via-transparent to-accent/15 blur-2xl" />
            
            <CardContent className="relative p-6 sm:p-8 lg:p-10">
              {/* Mobile Header - Visible only on mobile */}
              <div className="lg:hidden text-center mb-8">
                <div className="relative mx-auto mb-4">
                  <div className="h-16 w-16 mx-auto bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg neon-glow">
                    <Wifi className="h-8 w-8 text-primary-foreground animate-pulse-slow" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full animate-ping" />
                </div>
                
                <h1 className="text-3xl font-bold text-gradient mb-1">
                  WiFi Self-Care
                </h1>
                <p className="text-sm text-muted-foreground">
                  Admin Dashboard Access
                </p>
              </div>

              {/* Welcome Section */}
              <div className="text-center mb-6 lg:mb-8">
                <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                  Welcome Back
                </h2>
                <p className="text-muted-foreground text-sm lg:text-base">
                  Sign in to access your dashboard
                </p>
              </div>

              {/* Demo Accounts Info - Collapsible on mobile */}
              <div className="bg-muted/40 backdrop-blur-sm rounded-xl p-4 mb-6 border border-border/50 shadow-lg">
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span>🔐</span> Demo Accounts
                </h4>
                <div className="text-xs text-muted-foreground space-y-2">
                  <div className="flex items-center justify-between">
                    <span>👤 <span className="font-mono text-primary">admin@company.com</span></span>
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Super Admin</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>👤 <span className="font-mono text-primary">manager@company.com</span></span>
                    <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">Manager</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>👤 <span className="font-mono text-primary">staff@company.com</span></span>
                    <span className="text-xs bg-muted-foreground/20 text-muted-foreground px-2 py-0.5 rounded-full">Staff</span>
                  </div>
                  <div className="pt-2 border-t border-border/30">
                    <span className="text-accent font-semibold">🔑 Password: password123</span>
                  </div>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-5">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label 
                      htmlFor="email" 
                      className="text-sm font-medium text-foreground flex items-center gap-2"
                    >
                      📧 Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      {...form.register("email")}
                      className="h-12 sm:h-14 bg-background/60 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 transition-all duration-300 rounded-xl text-sm sm:text-base backdrop-blur-sm"
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
                      className="text-sm font-medium text-foreground flex items-center gap-2"
                    >
                      🔒 Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        {...form.register("password")}
                        className="h-12 sm:h-14 pr-12 bg-background/60 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 transition-all duration-300 rounded-xl text-sm sm:text-base backdrop-blur-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110"
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
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
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
                  className="w-full h-14 sm:h-16 bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:via-primary/95 hover:to-accent/90 text-primary-foreground font-bold text-base sm:text-lg rounded-xl shadow-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-3xl disabled:scale-100 neon-glow"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Lock className="h-5 w-5 sm:h-6 sm:w-6" />
                      <span>Sign In to Dashboard</span>
                    </div>
                  )}
                </Button>
              </form>

              {/* Footer */}
              <div className="mt-6 lg:mt-8 text-center space-y-3">
                <div className="flex justify-center items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-muted-foreground">System Online & Secure</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Protected by enterprise-grade security
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
