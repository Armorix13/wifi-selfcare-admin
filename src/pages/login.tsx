import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { useLoginMutation } from "@/api";
import { Role, User } from "@/lib/types/auth";
import { getRoutesForRole } from "@/lib/routes";
import { TokenManager } from "@/lib/tokenManager";

// Local type definitions
const loginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginData = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [loginMutation] = useLoginMutation();

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Load saved credentials on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword');
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
    
    if (savedRememberMe && savedEmail && savedPassword) {
      form.setValue('email', savedEmail);
      form.setValue('password', savedPassword);
      setRememberMe(true);
    }
  }, [form]);

  const themes = [
    { id: "light", name: "Light", icon: Sun },
    { id: "dark", name: "Dark", icon: Moon },
    { id: "crypto", name: "Crypto", icon: Zap },
    { id: "neon", name: "Neon", icon: Palette },
  ] as const;

  const getDefaultRouteForRole = (role: Role): string => {
    const routes = getRoutesForRole(role);
    return routes.length > 0 ? routes[0].path : '/dashboard';
  };

  const handleSuccessfulLogin = (user: User) => {
    // Store tokens using TokenManager
    if (user.accessToken) {
      TokenManager.setAccessToken(user.accessToken);
    }
    if (user.refreshToken) {
      TokenManager.setRefreshToken(user.refreshToken);
    }

    // Handle remember me functionality
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', form.getValues('email'));
      localStorage.setItem('rememberedPassword', form.getValues('password'));
      localStorage.setItem('rememberMe', 'true');
    } else {
      // Clear saved credentials if remember me is unchecked
      localStorage.removeItem('rememberedEmail');
      localStorage.removeItem('rememberedPassword');
      localStorage.removeItem('rememberMe');
    }

    // Login to auth context
    login(user);

    // Show success message
    toast({
      title: "Success",
      description: `Welcome back, ${user.firstName}!`,
    });

    // Redirect based on role
    const defaultRoute = getDefaultRouteForRole(user.role);
    const from = location.state?.from?.pathname;
    navigate(from || defaultRoute, { replace: true });
  };

  const handleRememberMeChange = (checked: boolean) => {
    setRememberMe(checked);
    
    // If unchecking, clear saved credentials immediately
    if (!checked) {
      localStorage.removeItem('rememberedEmail');
      localStorage.removeItem('rememberedPassword');
      localStorage.removeItem('rememberMe');
    }
  };

  const onSubmit = async (data: LoginData) => {
    setIsLoading(true);
    
    try {
      const response = await loginMutation(data).unwrap();
      
      if (response.success) {
        // Handle successful API login
        handleSuccessfulLogin(response.data);
      } else {
        toast({
          title: "Error", 
          description: response.message || "Login failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error", 
        description: "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large Background Orbs - Responsive sizes */}
        <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-primary/8 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 sm:w-56 sm:h-56 md:w-72 md:h-72 lg:w-80 lg:h-80 bg-accent/8 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-3/4 left-1/2 w-32 h-32 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 bg-primary/5 rounded-full blur-2xl animate-float" />
        
        {/* Additional Mobile-Optimized Orbs */}
        <div className="absolute top-10 right-10 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-primary/6 rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-10 left-10 w-20 h-20 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-accent/6 rounded-full blur-2xl animate-pulse-slow" />
        
        {/* Floating Particles - Responsive sizes */}
        <div className="absolute top-1/3 right-1/3 w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-primary/20 rounded-full animate-ping" />
        <div 
          className="absolute bottom-1/3 left-1/3 w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-accent/20 rounded-full animate-ping" 
          style={{ animationDelay: '1s' }} 
        />
        <div 
          className="absolute top-2/3 left-2/3 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary/30 rounded-full animate-ping" 
          style={{ animationDelay: '2s' }} 
        />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      {/* Theme Switcher - Responsive */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 z-20">
        <div className="flex gap-0.5 sm:gap-1 md:gap-2 bg-card/90 backdrop-blur-md border border-border/50 rounded-full p-0.5 sm:p-1 shadow-xl neon-glow">
          {themes.map(({ id, name, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTheme(id)}
              className={`
                p-1.5 sm:p-2 md:p-2.5 rounded-full transition-all duration-300 group relative
                ${theme === id 
                  ? 'bg-primary text-primary-foreground shadow-lg scale-110' 
                  : 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-105'
                }
              `}
              title={name}
            >
              <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
              {theme === id && (
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Container - Responsive Layout */}
      <div className="w-full h-full flex flex-col xl:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-8 xl:gap-16 p-3 sm:p-4 md:p-6 lg:p-8">
        
        {/* Left Side - Brand & Info (Hidden on smaller screens) */}
        <div className="hidden xl:flex flex-col items-center justify-center flex-1 max-w-lg text-center space-y-8">
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
        <div className="w-full xl:flex-1 max-w-sm sm:max-w-md md:max-w-lg xl:max-w-md 2xl:max-w-lg px-2 sm:px-0">
          <Card className="relative backdrop-blur-2xl bg-card/90 border border-border/50 shadow-2xl rounded-xl sm:rounded-2xl lg:rounded-3xl neon-glow">
            {/* Enhanced Card Glow */}
            <div className="absolute inset-0 rounded-xl sm:rounded-2xl lg:rounded-3xl bg-gradient-to-r from-primary/15 via-transparent to-accent/15 blur-2xl" />
            
            <CardContent className="relative p-4 sm:p-6 md:p-8 lg:p-10">
              {/* Mobile Header - Visible only on mobile */}
              <div className="xl:hidden text-center mb-6 sm:mb-8">
                <div className="relative mx-auto mb-4">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 mx-auto bg-gradient-to-br from-primary to-accent rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg neon-glow">
                    <Wifi className="h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground animate-pulse-slow" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-accent rounded-full animate-ping" />
                </div>
                
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gradient mb-1">
                  WiFi Self-Care
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Admin Dashboard Access
                </p>
              </div>

              {/* Welcome Section */}
              <div className="text-center mb-4 sm:mb-6 lg:mb-8">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2">
                  Welcome Back
                </h2>
                <p className="text-muted-foreground text-xs sm:text-sm lg:text-base">
                  Sign in to access your dashboard
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                <div className="space-y-3 sm:space-y-5">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label 
                      htmlFor="email" 
                      className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-2"
                    >
                      📧 Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      {...form.register("email")}
                      className="h-10 sm:h-12 md:h-14 bg-background/60 border-border/50 text-black placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 transition-all duration-300 rounded-lg sm:rounded-xl text-sm sm:text-base backdrop-blur-sm"
                    />
                    {form.formState.errors.email && (
                      <p className="text-xs sm:text-sm text-destructive flex items-center gap-1">
                        <span>⚠️</span> {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label 
                      htmlFor="password" 
                      className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-2"
                    >
                      🔒 Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        {...form.register("password")}
                        className="h-10 sm:h-12 md:h-14 pr-10 sm:pr-12 bg-background/60 border-border/50 text-black placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 transition-all duration-300 rounded-lg sm:rounded-xl text-sm sm:text-base backdrop-blur-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                        ) : (
                          <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                        )}
                      </button>
                    </div>
                    {form.formState.errors.password && (
                      <p className="text-xs sm:text-sm text-destructive flex items-center gap-1">
                        <span>⚠️</span> {form.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="remember-me" 
                      className="border-border/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary" 
                      checked={rememberMe}
                      onCheckedChange={handleRememberMeChange}
                    />
                    <Label 
                      htmlFor="remember-me" 
                      className="text-xs sm:text-sm text-muted-foreground cursor-pointer"
                    >
                      Remember me
                    </Label>
                  </div>
                  <button 
                    type="button"
                    className="text-xs sm:text-sm text-primary hover:text-primary/80 transition-colors duration-200 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 sm:h-14 md:h-16 bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:via-primary/95 hover:to-accent/90 text-primary-foreground font-bold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl shadow-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-3xl disabled:scale-100 neon-glow"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-4 h-4 sm:w-6 sm:h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Lock className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                      <span>Sign In to Dashboard</span>
                    </div>
                  )}
                </Button>
              </form>

              {/* Footer */}
              <div className="mt-4 sm:mt-6 lg:mt-8 text-center space-y-3">
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
