import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Settings as SettingsIcon, 
  Building2, 
  Users, 
  Shield, 
  Bell, 
  Palette, 
  Globe, 
  Mail, 
  Phone, 
  Clock, 
  Database, 
  Wifi, 
  Activity, 
  Security, 
  Check, 
  X, 
  Save, 
  RefreshCw,
  AlertTriangle,
  Info,
  Lock,
  Eye,
  EyeOff,
  Upload,
  Download,
  Trash2,
  Plus,
  Edit3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Schema definitions for form validation
const companySettingsSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  companyLogo: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  country: z.string().min(1, "Country is required"),
  website: z.string().url("Invalid URL").optional(),
  description: z.string().optional(),
});

const contactSettingsSchema = z.object({
  supportEmail: z.string().email("Invalid email"),
  supportPhone: z.string().min(1, "Phone is required"),
  emergencyPhone: z.string().optional(),
  businessHours: z.string().min(1, "Business hours required"),
  timezone: z.string().min(1, "Timezone is required"),
});

const securitySettingsSchema = z.object({
  passwordMinLength: z.number().min(6, "Minimum 6 characters"),
  sessionTimeout: z.number().min(5, "Minimum 5 minutes"),
  maxLoginAttempts: z.number().min(3, "Minimum 3 attempts"),
  twoFactorRequired: z.boolean(),
  passwordExpiry: z.number().min(30, "Minimum 30 days"),
});

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  complaintAlerts: z.boolean(),
  systemAlerts: z.boolean(),
  maintenanceAlerts: z.boolean(),
  reportFrequency: z.enum(["daily", "weekly", "monthly"]),
});

const systemSettingsSchema = z.object({
  maintenanceMode: z.boolean(),
  allowRegistration: z.boolean(),
  requireEmailVerification: z.boolean(),
  defaultUserRole: z.enum(["user", "engineer", "admin"]),
  dataRetentionDays: z.number().min(30, "Minimum 30 days"),
  maxFileSize: z.number().min(1, "Minimum 1 MB"),
  allowedFileTypes: z.string(),
  backupFrequency: z.enum(["daily", "weekly", "monthly"]),
});

type CompanySettings = z.infer<typeof companySettingsSchema>;
type ContactSettings = z.infer<typeof contactSettingsSchema>;
type SecuritySettings = z.infer<typeof securitySettingsSchema>;
type NotificationSettings = z.infer<typeof notificationSettingsSchema>;
type SystemSettings = z.infer<typeof systemSettingsSchema>;

export default function Settings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("company");

  // Default settings data
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    companyName: "WiFi Self-Care Platform",
    companyLogo: "",
    address: "123 Tech Park, Electronic City",
    city: "Bangalore",
    state: "Karnataka",
    zipCode: "560100",
    country: "India",
    website: "https://wificare.com",
    description: "Leading WiFi service provider offering reliable internet solutions for homes and businesses.",
  });

  const [contactSettings, setContactSettings] = useState<ContactSettings>({
    supportEmail: "support@wificare.com",
    supportPhone: "+91 1800 123 4567",
    emergencyPhone: "+91 1800 987 6543",
    businessHours: "9:00 AM - 6:00 PM (Mon-Sat)",
    timezone: "Asia/Kolkata",
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    passwordMinLength: 8,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    twoFactorRequired: false,
    passwordExpiry: 90,
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: false,
    complaintAlerts: true,
    systemAlerts: true,
    maintenanceAlerts: true,
    reportFrequency: "weekly",
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    defaultUserRole: "user",
    dataRetentionDays: 365,
    maxFileSize: 10,
    allowedFileTypes: "jpg,jpeg,png,pdf,doc,docx",
    backupFrequency: "daily",
  });

  // Form instances
  const companyForm = useForm<CompanySettings>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues: companySettings,
  });

  const contactForm = useForm<ContactSettings>({
    resolver: zodResolver(contactSettingsSchema),
    defaultValues: contactSettings,
  });

  const securityForm = useForm<SecuritySettings>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: securitySettings,
  });

  const notificationForm = useForm<NotificationSettings>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: notificationSettings,
  });

  const systemForm = useForm<SystemSettings>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: systemSettings,
  });

  // Submit handlers for each settings section
  const onCompanySubmit = (data: CompanySettings) => {
    setIsLoading(true);
    setTimeout(() => {
      setCompanySettings(data);
      toast({
        title: "Success",
        description: "Company settings saved successfully",
      });
      setIsLoading(false);
    }, 1000);
  };

  const onContactSubmit = (data: ContactSettings) => {
    setIsLoading(true);
    setTimeout(() => {
      setContactSettings(data);
      toast({
        title: "Success",
        description: "Contact settings saved successfully",
      });
      setIsLoading(false);
    }, 1000);
  };

  const onSecuritySubmit = (data: SecuritySettings) => {
    setIsLoading(true);
    setTimeout(() => {
      setSecuritySettings(data);
      toast({
        title: "Success",
        description: "Security settings saved successfully",
      });
      setIsLoading(false);
    }, 1000);
  };

  const onNotificationSubmit = (data: NotificationSettings) => {
    setIsLoading(true);
    setTimeout(() => {
      setNotificationSettings(data);
      toast({
        title: "Success",
        description: "Notification settings saved successfully",
      });
      setIsLoading(false);
    }, 1000);
  };

  const onSystemSubmit = (data: SystemSettings) => {
    setIsLoading(true);
    setTimeout(() => {
      setSystemSettings(data);
      toast({
        title: "Success",
        description: "System settings saved successfully",
      });
      setIsLoading(false);
    }, 1000);
  };

  const handleBackup = () => {
    setIsLoading(true);
    setTimeout(() => {
      toast({
        title: "Success",
        description: "Backup created successfully",
      });
      setIsLoading(false);
    }, 2000);
  };

  const handleRestore = () => {
    setIsLoading(true);
    setTimeout(() => {
      toast({
        title: "Success",
        description: "System restored successfully",
      });
      setIsLoading(false);
    }, 2000);
  };

  return (
    <MainLayout title="System Settings">
      <div className="space-y-6">
        {/* Settings Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">Manage your system configuration and preferences</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleBackup} disabled={isLoading}>
              <Download className="h-4 w-4 mr-2" />
              Backup
            </Button>
            <Button variant="outline" onClick={handleRestore} disabled={isLoading}>
              <Upload className="h-4 w-4 mr-2" />
              Restore
            </Button>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Company
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contact
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              System
            </TabsTrigger>
          </TabsList>

          {/* Company Settings */}
          <TabsContent value="company" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input {...companyForm.register("companyName")} />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input {...companyForm.register("website")} placeholder="https://..." />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input {...companyForm.register("address")} />
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input {...companyForm.register("city")} />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input {...companyForm.register("state")} />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input {...companyForm.register("zipCode")} />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input {...companyForm.register("country")} />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea {...companyForm.register("description")} rows={3} />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Company Info
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Settings */}
          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={contactForm.handleSubmit(onContactSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="supportEmail">Support Email</Label>
                      <Input {...contactForm.register("supportEmail")} type="email" />
                    </div>
                    <div>
                      <Label htmlFor="supportPhone">Support Phone</Label>
                      <Input {...contactForm.register("supportPhone")} />
                    </div>
                    <div>
                      <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                      <Input {...contactForm.register("emergencyPhone")} />
                    </div>
                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select
                        value={contactForm.watch("timezone")}
                        onValueChange={(value) => contactForm.setValue("timezone", value)}
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
                    <div className="col-span-2">
                      <Label htmlFor="businessHours">Business Hours</Label>
                      <Input {...contactForm.register("businessHours")} />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Contact Info
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-6">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Changes to security settings will affect all users and take effect immediately.
                    </AlertDescription>
                  </Alert>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                      <Input 
                        {...securityForm.register("passwordMinLength", { valueAsNumber: true })} 
                        type="number" 
                        min="6" 
                        max="50" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Input 
                        {...securityForm.register("sessionTimeout", { valueAsNumber: true })} 
                        type="number" 
                        min="5" 
                        max="1440" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                      <Input 
                        {...securityForm.register("maxLoginAttempts", { valueAsNumber: true })} 
                        type="number" 
                        min="3" 
                        max="20" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                      <Input 
                        {...securityForm.register("passwordExpiry", { valueAsNumber: true })} 
                        type="number" 
                        min="30" 
                        max="365" 
                      />
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="twoFactorRequired">Require Two-Factor Authentication</Label>
                          <p className="text-sm text-muted-foreground">Force all users to enable 2FA</p>
                        </div>
                        <Switch 
                          checked={securityForm.watch("twoFactorRequired")}
                          onCheckedChange={(checked) => securityForm.setValue("twoFactorRequired", checked)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Security Settings
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                      </div>
                      <Switch 
                        checked={notificationForm.watch("emailNotifications")}
                        onCheckedChange={(checked) => notificationForm.setValue("emailNotifications", checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>SMS Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                      </div>
                      <Switch 
                        checked={notificationForm.watch("smsNotifications")}
                        onCheckedChange={(checked) => notificationForm.setValue("smsNotifications", checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                      </div>
                      <Switch 
                        checked={notificationForm.watch("pushNotifications")}
                        onCheckedChange={(checked) => notificationForm.setValue("pushNotifications", checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Complaint Alerts</Label>
                        <p className="text-sm text-muted-foreground">Get notified of new complaints</p>
                      </div>
                      <Switch 
                        checked={notificationForm.watch("complaintAlerts")}
                        onCheckedChange={(checked) => notificationForm.setValue("complaintAlerts", checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>System Alerts</Label>
                        <p className="text-sm text-muted-foreground">Get notified of system issues</p>
                      </div>
                      <Switch 
                        checked={notificationForm.watch("systemAlerts")}
                        onCheckedChange={(checked) => notificationForm.setValue("systemAlerts", checked)}
                      />
                    </div>
                    <Separator />
                    <div>
                      <Label htmlFor="reportFrequency">Report Frequency</Label>
                      <Select
                        value={notificationForm.watch("reportFrequency")}
                        onValueChange={(value: "daily" | "weekly" | "monthly") => 
                          notificationForm.setValue("reportFrequency", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Notification Settings
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={systemForm.handleSubmit(onSystemSubmit)} className="space-y-6">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      System settings control core functionality and may affect performance.
                    </AlertDescription>
                  </Alert>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Maintenance Mode</Label>
                        <p className="text-sm text-muted-foreground">Enable to prevent user access during updates</p>
                      </div>
                      <Switch 
                        checked={systemForm.watch("maintenanceMode")}
                        onCheckedChange={(checked) => systemForm.setValue("maintenanceMode", checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Allow Registration</Label>
                        <p className="text-sm text-muted-foreground">Allow new users to register</p>
                      </div>
                      <Switch 
                        checked={systemForm.watch("allowRegistration")}
                        onCheckedChange={(checked) => systemForm.setValue("allowRegistration", checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Require Email Verification</Label>
                        <p className="text-sm text-muted-foreground">New users must verify their email</p>
                      </div>
                      <Switch 
                        checked={systemForm.watch("requireEmailVerification")}
                        onCheckedChange={(checked) => systemForm.setValue("requireEmailVerification", checked)}
                      />
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="defaultUserRole">Default User Role</Label>
                        <Select
                          value={systemForm.watch("defaultUserRole")}
                          onValueChange={(value: "user" | "engineer" | "admin") => 
                            systemForm.setValue("defaultUserRole", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="engineer">Engineer</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="backupFrequency">Backup Frequency</Label>
                        <Select
                          value={systemForm.watch("backupFrequency")}
                          onValueChange={(value: "daily" | "weekly" | "monthly") => 
                            systemForm.setValue("backupFrequency", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="dataRetentionDays">Data Retention (days)</Label>
                        <Input 
                          {...systemForm.register("dataRetentionDays", { valueAsNumber: true })} 
                          type="number" 
                          min="30" 
                          max="3650" 
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                        <Input 
                          {...systemForm.register("maxFileSize", { valueAsNumber: true })} 
                          type="number" 
                          min="1" 
                          max="100" 
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
                        <Input 
                          {...systemForm.register("allowedFileTypes")} 
                          placeholder="jpg,png,pdf,doc,docx"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                      <Save className="h-4 w-4 mr-2" />
                      Save System Settings
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
