import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { 
  UserPlus, 
  User, 
  MapPin, 
  Settings, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  Home, 
  Phone, 
  Mail, 
  Globe, 
  Building, 
  Wifi, 
  CreditCard, 
  Calendar,
  Shield,
  Zap,
  Target,
  Network,
  Server,
  Database,
  FileText,
  Star,
  Award,
  Rocket,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Save,
  X,
  Users
} from "lucide-react";
import { Step1Data, Step2Data, Step3Data, UserFormData, AreaType, Mode } from "@/lib/types/users";

// Validation schemas for each step
const step1Schema = z.object({
  email: z.string().email("Invalid email address"),
  userName: z.string().min(3, "Username must be at least 3 characters"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  countryCode: z.string().min(1, "Country code is required"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  mobile: z.string().optional(),
  language: z.string().optional(),
  country: z.string().min(1, "Country is required"),
});

const step2Schema = z.object({
  permanentAddress: z.string().optional(),
  billingAddress: z.string().optional(),
  area: z.nativeEnum(AreaType).optional(),
  zone: z.string().optional(),
  ruralUrban: z.string().optional(),
  category: z.string().optional(),
  customerType: z.string().optional(),
  group: z.string().optional(),
});

const step3Schema = z.object({
  status: z.string().optional(),
  mode: z.nativeEnum(Mode).optional(),
  customerPower: z.string().optional(),
  bandwidth: z.number().min(0).optional(),
  planId: z.string().optional(),
  bbPlan: z.string().optional(),
  ftthExchangePlan: z.string().optional(),
  staticIp: z.string().optional(),
  macIp: z.string().optional(),
  oltIp: z.string().optional(),
  mtceFranchise: z.string().optional(),
  bbUserId: z.string().optional(),
  workingStatus: z.string().optional(),
  assigned: z.string().optional(),
  acquisitionType: z.string().optional(),
  balanceDue: z.number().min(0).optional(),
  activationDate: z.string().optional(),
  expirationDate: z.string().optional(),
  installationDate: z.string().optional(),
  lastBillingDate: z.string().optional(),
  llInstallDate: z.string().optional(),
  isAccountVerified: z.boolean().optional(),
});

export default function AddUser() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      email: "",
      userName: "",
      firstName: "",
      lastName: "",
      countryCode: "+91",
      phoneNumber: "",
      mobile: "",
      language: "English",
      country: "India",
    },
  });

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      permanentAddress: "",
      billingAddress: "",
      area: AreaType.URBAN,
      zone: "",
      ruralUrban: "Urban",
      category: "Residential",
      customerType: "residential",
      group: "Standard",
    },
  });

  const step3Form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      status: "active",
      mode: Mode.ONLINE,
      customerPower: "on",
      bandwidth: 100,
      planId: "",
      bbPlan: "Basic",
      ftthExchangePlan: "Standard",
      staticIp: "",
      macIp: "",
      oltIp: "",
      mtceFranchise: "",
      bbUserId: "",
      workingStatus: "active",
      assigned: "",
      acquisitionType: "new",
      balanceDue: 0,
      activationDate: "",
      expirationDate: "",
      installationDate: "",
      lastBillingDate: "",
      llInstallDate: "",
      isAccountVerified: false,
    },
  });

  const steps = [
    {
      id: 1,
      title: "Basic Information",
      description: "Personal and contact details",
      icon: User,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: 2,
      title: "Location & Category",
      description: "Address and customer classification",
      icon: MapPin,
      color: "from-green-500 to-emerald-500",
    },
    {
      id: 3,
      title: "Service & Network",
      description: "Technical and service details",
      icon: Settings,
      color: "from-purple-500 to-pink-500",
    },
  ];

  const handleStep1Submit = async (data: Step1Data) => {
    setFormData(prev => ({ ...prev, ...data }));
    setCurrentStep(2);
  };

  const handleStep2Submit = async (data: Step2Data) => {
    setFormData(prev => ({ ...prev, ...data }));
    setCurrentStep(3);
  };

  const handleStep3Submit = async (data: Step3Data) => {
    try {
      setIsSubmitting(true);
      const finalData = { ...formData, ...data };
      
      // Generate unique customer ID
      const customerId = `CUS${Date.now().toString().slice(-6)}`;
      finalData.customerId = customerId;
      
      // Here you would typically send the data to your API
      console.log("Final user data:", finalData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success! 🎉",
        description: "User has been added successfully with ID: " + customerId,
      });
      
      // Navigate to users management page
      navigate("/users");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step <= currentStep) {
      setCurrentStep(step);
    }
  };

  const renderStep1 = () => (
    <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-blue-500" />
            Email Address *
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="user@example.com"
            {...step1Form.register("email")}
            className="border-2 focus:border-blue-500"
          />
          {step1Form.formState.errors.email && (
            <p className="text-sm text-red-500">{step1Form.formState.errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="userName" className="flex items-center gap-2">
            <User className="h-4 w-4 text-blue-500" />
            Username *
          </Label>
          <Input
            id="userName"
            placeholder="johndoe123"
            {...step1Form.register("userName")}
            className="border-2 focus:border-blue-500"
          />
          {step1Form.formState.errors.userName && (
            <p className="text-sm text-red-500">{step1Form.formState.errors.userName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="firstName" className="flex items-center gap-2">
            <User className="h-4 w-4 text-blue-500" />
            First Name *
          </Label>
          <Input
            id="firstName"
            placeholder="John"
            {...step1Form.register("firstName")}
            className="border-2 focus:border-blue-500"
          />
          {step1Form.formState.errors.firstName && (
            <p className="text-sm text-red-500">{step1Form.formState.errors.firstName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="flex items-center gap-2">
            <User className="h-4 w-4 text-blue-500" />
            Last Name *
          </Label>
          <Input
            id="lastName"
            placeholder="Doe"
            {...step1Form.register("lastName")}
            className="border-2 focus:border-blue-500"
          />
          {step1Form.formState.errors.lastName && (
            <p className="text-sm text-red-500">{step1Form.formState.errors.lastName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="countryCode" className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-blue-500" />
            Country Code *
          </Label>
          <Select
            value={step1Form.watch("countryCode")}
            onValueChange={(value) => step1Form.setValue("countryCode", value)}
          >
            <SelectTrigger className="border-2 focus:border-blue-500">
              <SelectValue placeholder="Select country code" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="+91">🇮🇳 +91 (India)</SelectItem>
              <SelectItem value="+1">🇺🇸 +1 (USA)</SelectItem>
              <SelectItem value="+44">🇬🇧 +44 (UK)</SelectItem>
              <SelectItem value="+61">🇦🇺 +61 (Australia)</SelectItem>
              <SelectItem value="+86">🇨🇳 +86 (China)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber" className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-blue-500" />
            Phone Number *
          </Label>
          <Input
            id="phoneNumber"
            placeholder="9876543210"
            {...step1Form.register("phoneNumber")}
            className="border-2 focus:border-blue-500"
          />
          {step1Form.formState.errors.phoneNumber && (
            <p className="text-sm text-red-500">{step1Form.formState.errors.phoneNumber.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="mobile" className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-blue-500" />
            Mobile Number
          </Label>
          <Input
            id="mobile"
            placeholder="9876543210"
            {...step1Form.register("mobile")}
            className="border-2 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="language" className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-blue-500" />
            Language
          </Label>
          <Select
            value={step1Form.watch("language")}
            onValueChange={(value) => step1Form.setValue("language", value)}
          >
            <SelectTrigger className="border-2 focus:border-blue-500">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="English">🇺🇸 English</SelectItem>
              <SelectItem value="Hindi">🇮🇳 Hindi</SelectItem>
              <SelectItem value="Spanish">🇪🇸 Spanish</SelectItem>
              <SelectItem value="French">🇫🇷 French</SelectItem>
              <SelectItem value="German">🇩🇪 German</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="country" className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-blue-500" />
            Country *
          </Label>
          <Select
            value={step1Form.watch("country")}
            onValueChange={(value) => step1Form.setValue("country", value)}
          >
            <SelectTrigger className="border-2 focus:border-blue-500">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="India">🇮🇳 India</SelectItem>
              <SelectItem value="USA">🇺🇸 United States</SelectItem>
              <SelectItem value="UK">🇬🇧 United Kingdom</SelectItem>
              <SelectItem value="Australia">🇦🇺 Australia</SelectItem>
              <SelectItem value="Canada">🇨🇦 Canada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          Next Step
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </form>
  );

  const renderStep2 = () => (
    <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="permanentAddress" className="flex items-center gap-2">
            <Home className="h-4 w-4 text-green-500" />
            Permanent Address
          </Label>
          <Textarea
            id="permanentAddress"
            placeholder="Enter permanent address"
            {...step2Form.register("permanentAddress")}
            className="border-2 focus:border-green-500 min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="billingAddress" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-green-500" />
            Billing Address
          </Label>
          <Textarea
            id="billingAddress"
            placeholder="Enter billing address"
            {...step2Form.register("billingAddress")}
            className="border-2 focus:border-green-500 min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="area" className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-green-500" />
            Area Type
          </Label>
          <Select
            value={step2Form.watch("area")}
            onValueChange={(value) => step2Form.setValue("area", value as AreaType)}
          >
            <SelectTrigger className="border-2 focus:border-green-500">
              <SelectValue placeholder="Select area type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={AreaType.URBAN}>🏙️ Urban</SelectItem>
              <SelectItem value={AreaType.RURAL}>🌾 Rural</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="zone" className="flex items-center gap-2">
            <Target className="h-4 w-4 text-green-500" />
            Zone
          </Label>
          <Input
            id="zone"
            placeholder="Enter zone"
            {...step2Form.register("zone")}
            className="border-2 focus:border-green-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ruralUrban" className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-green-500" />
            Rural/Urban Classification
          </Label>
          <Select
            value={step2Form.watch("ruralUrban")}
            onValueChange={(value) => step2Form.setValue("ruralUrban", value)}
          >
            <SelectTrigger className="border-2 focus:border-green-500">
              <SelectValue placeholder="Select classification" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Urban">🏙️ Urban</SelectItem>
              <SelectItem value="Rural">🌾 Rural</SelectItem>
              <SelectItem value="Semi-Urban">🏘️ Semi-Urban</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category" className="flex items-center gap-2">
            <Building className="h-4 w-4 text-green-500" />
            Category
          </Label>
          <Select
            value={step2Form.watch("category")}
            onValueChange={(value) => step2Form.setValue("category", value)}
          >
            <SelectTrigger className="border-2 focus:border-green-500">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Residential">🏠 Residential</SelectItem>
              <SelectItem value="Commercial">🏢 Commercial</SelectItem>
              <SelectItem value="Enterprise">🏭 Enterprise</SelectItem>
              <SelectItem value="Government">🏛️ Government</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerType" className="flex items-center gap-2">
            <User className="h-4 w-4 text-green-500" />
            Customer Type
          </Label>
          <Select
            value={step2Form.watch("customerType")}
            onValueChange={(value) => step2Form.setValue("customerType", value)}
          >
            <SelectTrigger className="border-2 focus:border-green-500">
              <SelectValue placeholder="Select customer type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="residential">🏠 Residential</SelectItem>
              <SelectItem value="commercial">🏢 Commercial</SelectItem>
              <SelectItem value="enterprise">🏭 Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="group" className="flex items-center gap-2">
            <Users className="h-4 w-4 text-green-500" />
            Group
          </Label>
          <Select
            value={step2Form.watch("group")}
            onValueChange={(value) => step2Form.setValue("group", value)}
          >
            <SelectTrigger className="border-2 focus:border-green-500">
              <SelectValue placeholder="Select group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Standard">⭐ Standard</SelectItem>
              <SelectItem value="Premium">💎 Premium</SelectItem>
              <SelectItem value="VIP">👑 VIP</SelectItem>
              <SelectItem value="Enterprise">🚀 Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={goToPreviousStep}
          className="border-2 border-gray-300 hover:border-gray-400 px-8 py-3 rounded-xl transition-all duration-300"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Previous
        </Button>
        <Button
          type="submit"
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          Next Step
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </form>
  );

  const renderStep3 = () => (
    <form onSubmit={step3Form.handleSubmit(handleStep3Submit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="status" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-purple-500" />
            Status
          </Label>
          <Select
            value={step3Form.watch("status")}
            onValueChange={(value) => step3Form.setValue("status", value)}
          >
            <SelectTrigger className="border-2 focus:border-purple-500">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">🟢 Active</SelectItem>
              <SelectItem value="inactive">🔴 Inactive</SelectItem>
              <SelectItem value="pending">🟡 Pending</SelectItem>
              <SelectItem value="suspended">⏸️ Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mode" className="flex items-center gap-2">
            <Wifi className="h-4 w-4 text-purple-500" />
            Mode
          </Label>
          <Select
            value={step3Form.watch("mode")}
            onValueChange={(value) => step3Form.setValue("mode", value as Mode)}
          >
            <SelectTrigger className="border-2 focus:border-purple-500">
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Mode.ONLINE}>🟢 Online</SelectItem>
              <SelectItem value={Mode.OFFLINE}>🔴 Offline</SelectItem>
              <SelectItem value={Mode.STANDBY}>🟡 Standby</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerPower" className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-purple-500" />
            Customer Power
          </Label>
          <Select
            value={step3Form.watch("customerPower")}
            onValueChange={(value) => step3Form.setValue("customerPower", value)}
          >
            <SelectTrigger className="border-2 focus:border-purple-500">
              <SelectValue placeholder="Select power status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="on">🟢 On</SelectItem>
              <SelectItem value="off">🔴 Off</SelectItem>
              <SelectItem value="standby">🟡 Standby</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bandwidth" className="flex items-center gap-2">
            <Network className="h-4 w-4 text-purple-500" />
            Bandwidth (Mbps)
          </Label>
          <Input
            id="bandwidth"
            type="number"
            placeholder="100"
            {...step3Form.register("bandwidth", { valueAsNumber: true })}
            className="border-2 focus:border-purple-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="planId" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-purple-500" />
            Plan ID
          </Label>
          <Input
            id="planId"
            placeholder="Enter plan ID"
            {...step3Form.register("planId")}
            className="border-2 focus:border-purple-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bbPlan" className="flex items-center gap-2">
            <Wifi className="h-4 w-4 text-purple-500" />
            Broadband Plan
          </Label>
          <Select
            value={step3Form.watch("bbPlan")}
            onValueChange={(value) => step3Form.setValue("bbPlan", value)}
          >
            <SelectTrigger className="border-2 focus:border-purple-500">
              <SelectValue placeholder="Select broadband plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Basic">📱 Basic (50 Mbps)</SelectItem>
              <SelectItem value="Standard">🚀 Standard (100 Mbps)</SelectItem>
              <SelectItem value="Premium">💎 Premium (200 Mbps)</SelectItem>
              <SelectItem value="Ultra">⚡ Ultra (500 Mbps)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ftthExchangePlan" className="flex items-center gap-2">
            <Server className="h-4 w-4 text-purple-500" />
            FTTH Exchange Plan
          </Label>
          <Input
            id="ftthExchangePlan"
            placeholder="Enter FTTH plan"
            {...step3Form.register("ftthExchangePlan")}
            className="border-2 focus:border-purple-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="staticIp" className="flex items-center gap-2">
            <Database className="h-4 w-4 text-purple-500" />
            Static IP
          </Label>
          <Input
            id="staticIp"
            placeholder="192.168.1.100"
            {...step3Form.register("staticIp")}
            className="border-2 focus:border-purple-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="macIp" className="flex items-center gap-2">
            <Network className="h-4 w-4 text-purple-500" />
            MAC IP
          </Label>
          <Input
            id="macIp"
            placeholder="Enter MAC IP"
            {...step3Form.register("macIp")}
            className="border-2 focus:border-purple-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="oltIp" className="flex items-center gap-2">
            <Server className="h-4 w-4 text-purple-500" />
            OLT IP
          </Label>
          <Input
            id="oltIp"
            placeholder="Enter OLT IP"
            {...step3Form.register("oltIp")}
            className="border-2 focus:border-purple-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mtceFranchise" className="flex items-center gap-2">
            <Building className="h-4 w-4 text-purple-500" />
            Maintenance Franchise
          </Label>
          <Input
            id="mtceFranchise"
            placeholder="Enter franchise"
            {...step3Form.register("mtceFranchise")}
            className="border-2 focus:border-purple-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bbUserId" className="flex items-center gap-2">
            <User className="h-4 w-4 text-purple-500" />
            Broadband User ID
          </Label>
          <Input
            id="bbUserId"
            placeholder="Enter BB user ID"
            {...step3Form.register("bbUserId")}
            className="border-2 focus:border-purple-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="workingStatus" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-purple-500" />
            Working Status
          </Label>
          <Select
            value={step3Form.watch("workingStatus")}
            onValueChange={(value) => step3Form.setValue("workingStatus", value)}
          >
            <SelectTrigger className="border-2 focus:border-purple-500">
              <SelectValue placeholder="Select working status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">🟢 Active</SelectItem>
              <SelectItem value="inactive">🔴 Inactive</SelectItem>
              <SelectItem value="maintenance">🔧 Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="assigned" className="flex items-center gap-2">
            <User className="h-4 w-4 text-purple-500" />
            Assigned To
          </Label>
          <Input
            id="assigned"
            placeholder="Enter assigned person"
            {...step3Form.register("assigned")}
            className="border-2 focus:border-purple-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="acquisitionType" className="flex items-center gap-2">
            <Target className="h-4 w-4 text-purple-500" />
            Acquisition Type
          </Label>
          <Select
            value={step3Form.watch("acquisitionType")}
            onValueChange={(value) => step3Form.setValue("acquisitionType", value)}
          >
            <SelectTrigger className="border-2 focus:border-purple-500">
              <SelectValue placeholder="Select acquisition type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">🆕 New</SelectItem>
              <SelectItem value="upgrade">⬆️ Upgrade</SelectItem>
              <SelectItem value="migration">🔄 Migration</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="balanceDue" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-purple-500" />
            Balance Due
          </Label>
          <Input
            id="balanceDue"
            type="number"
            placeholder="0.00"
            {...step3Form.register("balanceDue", { valueAsNumber: true })}
            className="border-2 focus:border-purple-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="activationDate" className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-500" />
            Activation Date
          </Label>
          <Input
            id="activationDate"
            type="date"
            {...step3Form.register("activationDate")}
            className="border-2 focus:border-purple-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expirationDate" className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-500" />
            Expiration Date
          </Label>
          <Input
            id="expirationDate"
            type="date"
            {...step3Form.register("expirationDate")}
            className="border-2 focus:border-purple-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="installationDate" className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-500" />
            Installation Date
          </Label>
          <Input
            id="installationDate"
            type="date"
            {...step3Form.register("installationDate")}
            className="border-2 focus:border-purple-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastBillingDate" className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-500" />
            Last Billing Date
          </Label>
          <Input
            id="lastBillingDate"
            type="date"
            {...step3Form.register("lastBillingDate")}
            className="border-2 focus:border-purple-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="llInstallDate" className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-500" />
            Landline Install Date
          </Label>
          <Input
            id="llInstallDate"
            type="date"
            {...step3Form.register("llInstallDate")}
            className="border-2 focus:border-purple-500"
          />
        </div>

        <div className="space-y-2 flex items-center space-x-2">
          <Checkbox
            id="isAccountVerified"
            checked={step3Form.watch("isAccountVerified")}
            onCheckedChange={(checked) => step3Form.setValue("isAccountVerified", checked as boolean)}
            className="border-2 border-purple-500"
          />
          <Label htmlFor="isAccountVerified" className="flex items-center gap-2 cursor-pointer">
            <Shield className="h-4 w-4 text-purple-500" />
            Account Verified
          </Label>
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={goToPreviousStep}
          className="border-2 border-gray-300 hover:border-gray-400 px-8 py-3 rounded-xl transition-all duration-300"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Previous
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Adding User...
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              Add User
            </>
          )}
        </Button>
      </div>
    </form>
  );

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Add New User
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Create a new user account with comprehensive details
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/users")}
              className="border-2 border-gray-300 hover:border-gray-400 px-6 py-2 rounded-xl transition-all duration-300"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 cursor-pointer ${
                    currentStep >= step.id
                      ? `bg-gradient-to-r ${step.color} border-transparent text-white shadow-lg`
                      : "border-gray-300 bg-gray-50 text-gray-400"
                  }`}
                  onClick={() => goToStep(step.id)}
                >
                  {currentStep > step.id ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <step.icon className="h-6 w-6" />
                  )}
                </div>
                <div className="ml-3">
                  <h3 className={`font-semibold text-sm ${
                    currentStep >= step.id ? "text-gray-900 dark:text-white" : "text-gray-500"
                  }`}>
                    {step.title}
                  </h3>
                  <p className={`text-xs ${
                    currentStep >= step.id ? "text-gray-600 dark:text-gray-400" : "text-gray-400"
                  }`}>
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 transition-all duration-300 ${
                    currentStep > step.id ? "bg-gradient-to-r from-blue-500 to-purple-600" : "bg-gray-300"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                currentStep === 1 ? "bg-gradient-to-r from-blue-500 to-cyan-500" :
                currentStep === 2 ? "bg-gradient-to-r from-green-500 to-emerald-500" :
                "bg-gradient-to-r from-purple-500 to-pink-500"
              }`}>
                  {currentStep === 1 ? <User className="h-5 w-5 text-white" /> :
                   currentStep === 2 ? <MapPin className="h-5 w-5 text-white" /> :
                   <Settings className="h-5 w-5 text-white" />}
                </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Step {currentStep} of {steps.length}
                </span>
                <div className="text-gray-900 dark:text-white font-bold">
                  {steps[currentStep - 1].title}
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </CardContent>
        </Card>

        {/* Success Message */}
        {isSubmitting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-2xl">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Adding User...
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Please wait while we process your request
              </p>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
