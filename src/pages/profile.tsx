import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Shield, 
  Settings, 
  Camera, 
  Save, 
  Edit3,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { useGetCompanyProfileQuery, useUpdateCompanyProfileMutation, BASE_URL } from "@/api/index";
import React from "react";

// Profile schema for form validation - updated to match API structure
const profileSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  contactPerson: z.string().min(1, "Contact person is required"),
  companyEmail: z.string().email("Valid email is required"),
  companyPhone: z.string().min(1, "Phone number is required"),
  companyAddress: z.string().min(1, "Address is required"),
  companyCity: z.string().min(1, "City is required"),
  companyState: z.string().min(1, "State is required"),
  companyCountry: z.string().min(1, "Country is required"),
  companyWebsite: z.string().url("Valid URL is required").optional().or(z.literal("")),
  industry: z.string().min(1, "Industry is required"),
  companySize: z.string().min(1, "Company size is required"),
  companyDescription: z.string().min(10, "Description must be at least 10 characters"),
});

type ProfileData = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Check if user has permission to access profile (only ADMIN role)
  if (!hasPermission('manage-leads')) {
    return (
      <MainLayout title="Access Denied">
        <div className="container mx-auto p-6">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-12 text-center">
              <div className="text-red-500 mb-4">
                <Shield className="h-16 w-16 mx-auto" />
              </div>
              <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
              <p className="text-gray-600 mb-6">
                You don't have permission to access the Profile section. 
                This feature is only available to Admin users.
              </p>
              <div className="text-sm text-gray-500">
                <p><strong>Your Role:</strong> {user?.role || 'Unknown'}</p>
                <p><strong>Required Role:</strong> ADMIN</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  // RTK Query hooks
  const { data: companyProfileData, isLoading: isLoadingProfile, error: profileError, refetch } = useGetCompanyProfileQuery({});
  const [updateCompanyProfile, { isLoading: isUpdatingProfile }] = useUpdateCompanyProfileMutation();

  // Transform API data to local state
  const [companyProfile, setCompanyProfile] = useState<ProfileData>({
    companyName: "",
    contactPerson: "",
    companyEmail: "",
    companyPhone: "",
    companyAddress: "",
    companyCity: "",
    companyState: "",
    companyCountry: "",
    companyWebsite: "",
    industry: "",
    companySize: "",
    companyDescription: ""
  });

  // Update local state when API data is received
  React.useEffect(() => {
    if (companyProfileData?.data?.companyProfile) {
      const apiData = companyProfileData.data.companyProfile;
      setCompanyProfile({
        companyName: apiData.companyName || "",
        contactPerson: apiData.contactPerson || "",
        companyEmail: apiData.companyEmail || "",
        companyPhone: apiData.companyPhone || "",
        companyAddress: apiData.companyAddress || "",
        companyCity: apiData.companyCity || "",
        companyState: apiData.companyState || "",
        companyCountry: apiData.companyCountry || "",
        companyWebsite: apiData.companyWebsite || "",
        industry: apiData.industry || "",
        companySize: apiData.companySize || "",
        companyDescription: apiData.companyDescription || ""
      });

      // Set company logo preview if available
      if (apiData.companyLogo) {
        setImagePreview(`${BASE_URL}${apiData.companyLogo}`);
      }
    }
  }, [companyProfileData]);

  const [companyStats] = useState({
    totalLeads: 156,
    convertedLeads: 89,
    activeProjects: 23,
    totalRevenue: 1250000,
    customerSatisfaction: 4.8,
    responseTime: "2.3 hours"
  });

  const form = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: companyProfile,
  });

  // Update form when companyProfile changes
  React.useEffect(() => {
    form.reset(companyProfile);
  }, [companyProfile, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (data: ProfileData) => {
    try {
      const formData = new FormData();
      
      // Add all form fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value) {
          formData.append(key, value);
        }
      });

      // Add company logo if selected
      if (imageFile) {
        formData.append('companyLogo', imageFile);
      }

      await updateCompanyProfile(formData).unwrap();
      
      setIsEditing(false);
      setImageFile(null);
      setImagePreview(null);
      
      toast({
        title: "Success",
        description: "Company profile updated successfully!",
      });
      
      // Refresh the data
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    form.reset(companyProfile);
    setIsEditing(false);
    setImageFile(null);
    setImagePreview(null);
  };

  // Show loading state
  if (isLoadingProfile) {
    return (
      <MainLayout title="Company Profile">
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading company profile...</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  // Show error state
  if (profileError) {
    return (
      <MainLayout title="Company Profile">
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-red-500 mb-4">
                <AlertCircle className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Profile</h3>
              <p className="text-gray-600 mb-4">Failed to load company profile. Please try again.</p>
              <Button onClick={() => refetch()} variant="outline">
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Company Profile">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Company Profile</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your company information and settings</p>
          </div>
          {activeTab === "profile" && (
            <Button 
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "default"}
            >
              {isEditing ? (
                <>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Cancel Edit
                </>
              ) : (
                <>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit Profile
                </>
              )}
            </Button>
          )}
        </div>

        {/* Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4 gap-2 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Performance</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Company Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border-blue-200 dark:border-blue-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-200">Total Leads</p>
                      <p className="text-2xl font-bold text-blue-800 dark:text-blue-100">{companyStats.totalLeads}</p>
                    </div>
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border-green-200 dark:border-green-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-700 dark:text-green-200">Converted</p>
                      <p className="text-2xl font-bold text-green-800 dark:text-green-100">{companyStats.convertedLeads}</p>
                    </div>
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-300" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 border-purple-200 dark:border-purple-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-700 dark:text-purple-200">Active Projects</p>
                      <p className="text-2xl font-bold text-purple-800 dark:text-purple-100">{companyStats.activeProjects}</p>
                    </div>
                    <Activity className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 border-orange-200 dark:border-orange-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-700 dark:text-orange-200">Revenue</p>
                      <p className="text-2xl font-bold text-orange-800 dark:text-orange-100">₹{companyStats.totalRevenue.toLocaleString()}</p>
                    </div>
                    <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-300" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Company Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{companyProfile.companyName}</p>
                      <p className="text-sm text-gray-500">{companyProfile.industry} • {companyProfile.companySize} employees</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{companyProfile.contactPerson}</p>
                      <p className="text-sm text-gray-500">Primary Contact</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <p className="text-sm">{companyProfile.companyEmail}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <p className="text-sm">{companyProfile.companyPhone}</p>
                  </div>

                  {companyProfile.companyWebsite && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <a href={companyProfile.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                        {companyProfile.companyWebsite}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm">{companyProfile.companyAddress}</p>
                    <p className="text-sm">{companyProfile.companyCity}, {companyProfile.companyState}</p>
                    <p className="text-sm">{companyProfile.companyCountry}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Company Description */}
            <Card>
              <CardHeader>
                <CardTitle>About Company</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {companyProfile.companyDescription}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Edit Company Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(handleSaveProfile)} className="space-y-6">
                  {/* Company Logo */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                        {imagePreview ? (
                          <img src={imagePreview} alt="Company Logo" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Camera className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      {isEditing && (
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">Company Logo</p>
                      <p className="text-sm text-gray-500">
                        {imagePreview ? "Click to change logo" : "Upload a high-quality logo (PNG, JPG)"}
                      </p>
                      {companyProfileData?.data?.companyProfile?.companyLogo && (
                        <p className="text-xs text-gray-400 mt-1">
                          Current: {companyProfileData.data.companyProfile.companyLogo}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        {...form.register("companyName")}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                      {form.formState.errors.companyName && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.companyName.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="contactPerson">Contact Person *</Label>
                      <Input
                        id="contactPerson"
                        {...form.register("contactPerson")}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                      {form.formState.errors.contactPerson && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.contactPerson.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="companyEmail">Email *</Label>
                      <Input
                        id="companyEmail"
                        type="email"
                        {...form.register("companyEmail")}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                      {form.formState.errors.companyEmail && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.companyEmail.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="companyPhone">Phone *</Label>
                      <Input
                        id="companyPhone"
                        {...form.register("companyPhone")}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                      {form.formState.errors.companyPhone && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.companyPhone.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="industry">Industry *</Label>
                      <Input
                        id="industry"
                        {...form.register("industry")}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                      {form.formState.errors.industry && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.industry.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="companySize">Company Size *</Label>
                      <Select
                        value={form.watch("companySize")}
                        onValueChange={(value) => form.setValue("companySize", value as any)}
                        disabled={!isEditing}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select company size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 employees</SelectItem>
                          <SelectItem value="11-50">11-50 employees</SelectItem>
                          <SelectItem value="51-200">51-200 employees</SelectItem>
                          <SelectItem value="201-500">201-500 employees</SelectItem>
                          <SelectItem value="500+">500+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="companyWebsite">Website</Label>
                      <Input
                        id="companyWebsite"
                        type="url"
                        {...form.register("companyWebsite")}
                        disabled={!isEditing}
                        placeholder="https://example.com"
                        className="mt-1"
                      />
                      {form.formState.errors.companyWebsite && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.companyWebsite.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="companyAddress">Address *</Label>
                    <Input
                      id="companyAddress"
                      {...form.register("companyAddress")}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                    {form.formState.errors.companyAddress && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.companyAddress.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="companyCity">City *</Label>
                      <Input
                        id="companyCity"
                        {...form.register("companyCity")}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                      {form.formState.errors.companyCity && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.companyCity.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="companyState">State *</Label>
                      <Input
                        id="companyState"
                        {...form.register("companyState")}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                      {form.formState.errors.companyState && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.companyState.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="companyCountry">Country *</Label>
                      <Input
                        id="companyCountry"
                        {...form.register("companyCountry")}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                      {form.formState.errors.companyCountry && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.companyCountry.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="companyDescription">Company Description *</Label>
                    <textarea
                      id="companyDescription"
                      {...form.register("companyDescription")}
                      disabled={!isEditing}
                      rows={4}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    {form.formState.errors.companyDescription && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.companyDescription.message}</p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {isEditing && (
                    <div className="flex justify-end gap-3">
                      <Button type="button" variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isUpdatingProfile}>
                        <Save className="mr-2 h-4 w-4" />
                        {isUpdatingProfile ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Customer Satisfaction</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        {companyStats.customerSatisfaction}/5.0
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(companyStats.customerSatisfaction / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Average Response Time</span>
                      <Badge variant="default" className="bg-blue-100 text-blue-800">
                        {companyStats.responseTime}
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "85%" }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enable 2FA
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Password Change</h4>
                      <p className="text-sm text-gray-500">Update your account password regularly</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Change Password
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Login History</h4>
                      <p className="text-sm text-gray-500">View recent login attempts and locations</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View History
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
