import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Wifi, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { loginSchema, type LoginData } from "@shared/schema";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@company.com",
      password: "password123",
      role: "super-admin",
    },
  });

  const [isLoading, setIsLoading] = useState(false);

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
    
    // Simulate network delay
    setTimeout(() => {
      const user = dummyUsers[data.email as keyof typeof dummyUsers];
      
      if (user && user.password === data.password && user.role === data.role) {
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
          description: "Invalid credentials",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
              <Wifi className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="mt-2 text-sm text-gray-600">Sign in to your admin account</p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@company.com"
                  {...form.register("email")}
                  className="w-full"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...form.register("password")}
                  className="w-full"
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.password.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </Label>
                <Select
                  value={form.watch("role")}
                  onValueChange={(value) => form.setValue("role", value as any)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super-admin">Super Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.role && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.role.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Checkbox id="remember-me" className="h-4 w-4" />
                <Label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </Label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot password?
                </a>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors duration-150"
            >
              <Lock className="h-5 w-5 mr-2" />
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
