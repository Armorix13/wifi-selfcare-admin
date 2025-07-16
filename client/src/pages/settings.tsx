import { useState } from "react";
import { useForm } from "react-hook-form";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

interface SystemSettings {
  companyName: string;
  supportEmail: string;
  supportPhone: string;
  timezone: string;
}

export default function Settings() {
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    companyName: "WiFi Self-Care Platform",
    supportEmail: "support@wificare.com",
    supportPhone: "+91 1800 123 4567",
    timezone: "Asia/Kolkata",
  });

  const form = useForm<SystemSettings>({
    defaultValues: systemSettings,
  });

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = (data: SystemSettings) => {
    setIsLoading(true);
    // Simulate saving
    setTimeout(() => {
      setSystemSettings(data);
      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
      setIsLoading(false);
    }, 1000);
  };

  // Role permissions matrix
  const permissions = [
    { name: "View Dashboard", permission: "view-dashboard" },
    { name: "Manage Engineers", permission: "manage-engineers" },
    { name: "Assign Complaints", permission: "assign-complaints" },
    { name: "Manage Users", permission: "manage-users" },
    { name: "Manage Plans", permission: "manage-plans" },
    { name: "Manage Notifications", permission: "manage-notifications" },
    { name: "View Analytics", permission: "view-analytics" },
    { name: "System Settings", permission: "system-settings" },
    { name: "Manage Support", permission: "manage-support" },
  ];

  const rolePermissions = {
    "super-admin": [
      "view-dashboard",
      "manage-engineers",
      "assign-complaints",
      "manage-users",
      "manage-plans",
      "manage-notifications",
      "view-analytics",
      "system-settings",
      "manage-support",
    ],
    "admin": [
      "view-dashboard",
      "manage-engineers",
      "assign-complaints",
      "manage-users",
      "manage-plans",
      "manage-notifications",
      "view-analytics",
      "manage-support",
    ],
    "manager": [
      "view-dashboard",
      "assign-complaints",
      "view-analytics",
    ],
  };

  const hasRolePermission = (role: keyof typeof rolePermissions, permission: string) => {
    return rolePermissions[role]?.includes(permission);
  };

  return (
    <MainLayout title="Settings">
      <div className="space-y-6">
        {/* System Settings */}
        {hasPermission("system-settings") && (
          <Card className="border border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                System Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      {...form.register("companyName")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="supportEmail">Support Email</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      {...form.register("supportEmail")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="supportPhone">Support Phone</Label>
                    <Input
                      id="supportPhone"
                      type="tel"
                      {...form.register("supportPhone")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={form.watch("timezone")}
                      onValueChange={(value) => form.setValue("timezone", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                        <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                        <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={saveSettingsMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {saveSettingsMutation.isPending ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* User Permissions */}
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Role Permissions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Permission
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Super Admin
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Manager
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {permissions.map((perm, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {perm.name}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {hasRolePermission("super-admin", perm.permission) ? (
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-red-600 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {hasRolePermission("admin", perm.permission) ? (
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-red-600 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {hasRolePermission("manager", perm.permission) ? (
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-red-600 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Additional Settings */}
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Application Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-slate-200">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                  <p className="text-sm text-gray-500">Send email notifications for important updates</p>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-slate-200">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">SMS Notifications</h4>
                  <p className="text-sm text-gray-500">Send SMS notifications for urgent complaints</p>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-slate-200">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Auto Assignment</h4>
                  <p className="text-sm text-gray-500">Automatically assign complaints to engineers</p>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Data Export</h4>
                  <p className="text-sm text-gray-500">Export application data for backup</p>
                </div>
                <Button variant="outline" size="sm">
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
