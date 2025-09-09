import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useGetFdbsByOltIdQuery, useGetUserByIdQuery, useUpdateUserByAdminMutation } from "@/api";
import { 
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
  Save,
  X,
  Users,
  Edit,
  UserPlus
} from "lucide-react";
import { Step1Data, Step2Data, Step3Data, UserFormData, AreaType, Mode } from "@/lib/types/users";
// Remove FormSteps import - we'll render forms directly

// Validation schemas for each step
const step1Schema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  countryCode: z.string().min(1, "Country code is required"),
  companyPreference: z.string().optional(),
  customCompany: z.string().optional(),
  permanentAddress: z.string().optional(),
  residentialAddress: z.string().optional(),
  landlineNumber: z.string().optional(),
});

const step2Schema = z.object({
  modemName: z.string().optional(),
  ontType: z.string().optional(),
  modelNumber: z.string().optional(),
  serialNumber: z.string().optional(),
  ontMac: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
});

const step3Schema = z.object({
  oltId: z.string().optional(),
  fdbId: z.string().optional(),
  mtceFranchise: z.string().optional(),
  bbUserId: z.string().optional(),
  bbPassword: z.string().optional(),
  ruralUrban: z.string().optional(),
  acquisitionType: z.string().optional(),
  category: z.string().optional(),
  ftthExchangePlan: z.string().optional(),
  llInstallDate: z.string().optional(),
  bbPlan: z.string().optional(),
  workingStatus: z.string().optional(),
});

// Helper function to map API data to form data
const mapApiDataToFormData = (apiData: any) => {
  return {
    // Step 1 Data
    email: apiData.user.email,
    firstName: apiData.user.firstName,
    lastName: apiData.user.lastName,
    phoneNumber: apiData.user.phoneNumber,
    countryCode: '+91', // Default country code
    companyPreference: apiData.user.companyPreference,
    customCompany: '',
    permanentAddress: apiData.user.permanentAddress || '',
    residentialAddress: apiData.user.residentialAddress || '',
    landlineNumber: apiData.user.landlineNumber || '',
    
    // Step 2 Data
    modemName: apiData.modemDetails.modemName,
    ontType: apiData.modemDetails.ontType,
    modelNumber: apiData.modemDetails.modelNumber,
    serialNumber: apiData.modemDetails.serialNumber,
    ontMac: apiData.modemDetails.ontMac,
    username: apiData.modemDetails.username,
    password: apiData.modemDetails.password,
    
    // Step 3 Data
    oltId: apiData.customerDetails.oltId?.oltId || apiData.customerDetails.oltId,
    fdbId: apiData.customerDetails.fdbId?.fdbId || apiData.customerDetails.fdbId,
    mtceFranchise: apiData.user.mtceFranchise,
    bbUserId: apiData.user.bbUserId,
    bbPassword: apiData.user.bbPassword || '',
    ruralUrban: apiData.user.ruralUrban,
    acquisitionType: apiData.user.acquisitionType,
    category: apiData.user.category || 'Residential',
    ftthExchangePlan: apiData.user.ftthExchangePlan,
    llInstallDate: apiData.user.llInstallDate ? new Date(apiData.user.llInstallDate).toISOString().split('T')[0] : '',
    bbPlan: apiData.user.bbPlan,
    workingStatus: apiData.user.workingStatus,
  };
};

interface EditUserProps {
  userData?: any; // The complete user data from API
}

export default function EditUser({ userData: propUserData }: EditUserProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { data: oltData, isLoading: isLoadingOlt } = useGetFdbsByOltIdQuery({});
  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserByAdminMutation();

  const { data: userDataToUpdate, isLoading: isLoadingUser } = useGetUserByIdQuery(id);

  console.log("userData", userDataToUpdate);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Step1Data & Step2Data & Step3Data>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isLoadingUser);
  const [userData, setUserData] = useState<any>(null);
  const [isSameAsResidential, setIsSameAsResidential] = useState(false);
  const [showCustomCompany, setShowCustomCompany] = useState(false);

  // Initialize form data when API data is received
  useEffect(() => {
    if (userDataToUpdate?.data) {
      setUserData(userDataToUpdate.data);

      // Use helper function to map API data to form data
      const initialData = mapApiDataToFormData(userDataToUpdate.data);
          setFormData(initialData);
      setIsLoading(false);
    } else if (!isLoadingUser && id) {
      // If API call completed but no data found
          toast({
            title: "Error",
            description: "User not found",
            variant: "destructive",
          });
          navigate("/users");
        }
  }, [userDataToUpdate, isLoadingUser, id, navigate, toast]);

  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      countryCode: "+91",
      companyPreference: "",
      customCompany: "",
      permanentAddress: "",
      residentialAddress: "",
      landlineNumber: "",
    },
  });

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      modemName: "",
      ontType: "",
      modelNumber: "",
      serialNumber: "",
      ontMac: "",
      username: "",
      password: "",
    },
  });

  const step3Form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      oltId: "",
      fdbId: "",
      mtceFranchise: "",
      bbUserId: "",
      bbPassword: "",
      ruralUrban: "Urban",
      acquisitionType: "new",
      category: "Residential",
      ftthExchangePlan: "",
      llInstallDate: "",
      bbPlan: "Basic",
      workingStatus: "active",
    },
  });

  // Update form values when userData is loaded
  useEffect(() => {
    if (userData) {
      const formData = mapApiDataToFormData(userData);

      // Reset each form with the mapped data
      step1Form.reset({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        countryCode: formData.countryCode,
        companyPreference: formData.companyPreference,
        customCompany: formData.customCompany,
        permanentAddress: formData.permanentAddress,
        residentialAddress: formData.residentialAddress,
        landlineNumber: formData.landlineNumber,
      });
      
      step2Form.reset({
        modemName: formData.modemName,
        ontType: formData.ontType,
        modelNumber: formData.modelNumber,
        serialNumber: formData.serialNumber,
        ontMac: formData.ontMac,
        username: formData.username,
        password: formData.password,
      });
      
      step3Form.reset({
        oltId: formData.oltId,
        fdbId: formData.fdbId,
        mtceFranchise: formData.mtceFranchise,
        bbUserId: formData.bbUserId,
        bbPassword: formData.bbPassword,
        ruralUrban: formData.ruralUrban,
        acquisitionType: formData.acquisitionType,
        category: formData.category,
        ftthExchangePlan: formData.ftthExchangePlan,
        llInstallDate: formData.llInstallDate,
        bbPlan: formData.bbPlan,
        workingStatus: formData.workingStatus,
      });
    }
  }, [userData, step1Form, step2Form, step3Form]);

  const steps = [
    {
      id: 1,
      title: "User Details",
      description: "Personal and contact information",
      icon: User,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: 2,
      title: "Modem Details",
      description: "Hardware and device information",
      icon: Wifi,
      color: "from-green-500 to-emerald-500",
    },
    {
      id: 3,
      title: "Soft Details",
      description: "Service and configuration details",
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
      
      // Prepare the data for API
      const updatePayload = {
        userId: id,
        email: finalData.email,
        firstName: finalData.firstName,
        lastName: finalData.lastName,
        phoneNumber: finalData.phoneNumber,
        countryCode: finalData.countryCode,
        companyPreference: finalData.companyPreference,
        permanentAddress: finalData.permanentAddress,
        residentialAddress: finalData.residentialAddress,
        landlineNumber: finalData.landlineNumber,
        modemName: finalData.modemName,
        ontType: finalData.ontType,
        modelNumber: finalData.modelNumber,
        serialNumber: finalData.serialNumber,
        ontMac: finalData.ontMac,
        username: finalData.username,
        password: finalData.password,
        fdbId: finalData.fdbId,
        oltId: finalData.oltId,
        mtceFranchise: finalData.mtceFranchise,
        bbUserId: finalData.bbUserId,
        bbPassword: finalData.bbPassword,
        ruralUrban: finalData.ruralUrban,
        acquisitionType: finalData.acquisitionType,
        category: finalData.category,
        ftthExchangePlan: finalData.ftthExchangePlan,
        llInstallDate: finalData.llInstallDate,
        bbPlan: finalData.bbPlan,
        workingStatus: finalData.workingStatus,
        isInstalled: userData?.customerDetails?.isInstalled || false,
      };
      
      console.log("Sending update payload:", updatePayload);
      
      // Call the update API
      const result = await updateUser(updatePayload).unwrap();
      
      toast({
        title: "Success! 🎉",
        description: `User ${userData?.user?.firstName} ${userData?.user?.lastName} has been updated successfully`,
      });
      
      navigate("/users");
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to update user. Please try again.",
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
          <Label htmlFor="landlineNumber" className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-blue-500" />
            Landline Number
          </Label>
          <Input
            id="landlineNumber"
            placeholder="Enter landline number"
            {...step1Form.register("landlineNumber")}
            className="border-2 focus:border-blue-500"
          />
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
          <Label htmlFor="companyPreference" className="flex items-center gap-2">
            <Building className="h-4 w-4 text-blue-500" />
            Company Preference
          </Label>
          <Select
            value={step1Form.watch("companyPreference")}
            onValueChange={(value) => {
              step1Form.setValue("companyPreference", value);
              setShowCustomCompany(value === "Other");
              if (value !== "Other") {
                step1Form.setValue("customCompany", "");
              }
            }}
          >
            <SelectTrigger className="border-2 focus:border-blue-500">
              <SelectValue placeholder="Select company preference" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BSNL">🏢 BSNL</SelectItem>
              <SelectItem value="Rail wire">🚂 Rail wire</SelectItem>
              <SelectItem value="My internet">🌐 My internet</SelectItem>
              <SelectItem value="Connect Broadband">📡 Connect Broadband</SelectItem>
              <SelectItem value="Other">➕ Other</SelectItem>
            </SelectContent>
          </Select>
          {showCustomCompany && (
            <Input
              id="customCompany"
              placeholder="Enter company name"
              {...step1Form.register("customCompany")}
              className="border-2 focus:border-blue-500 mt-2"
              onChange={(e) => {
                step1Form.setValue("customCompany", e.target.value);
                step1Form.setValue("companyPreference", e.target.value);
              }}
            />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="residentialAddress" className="flex items-center gap-2">
            <Home className="h-4 w-4 text-blue-500" />
            Residential Address
          </Label>
          <Textarea
            id="residentialAddress"
            placeholder="Enter residential address"
            {...step1Form.register("residentialAddress")}
            className="border-2 focus:border-blue-500 min-h-[100px]"
            onChange={(e) => {
              step1Form.setValue("residentialAddress", e.target.value);
              if (isSameAsResidential) {
                step1Form.setValue("permanentAddress", e.target.value);
              }
            }}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2 mb-2">
            <Checkbox
              id="sameAsResidential"
              checked={isSameAsResidential}
              onCheckedChange={(checked) => {
                setIsSameAsResidential(checked as boolean);
                if (checked) {
                  const residentialAddress = step1Form.getValues("residentialAddress");
                  step1Form.setValue("permanentAddress", residentialAddress);
                }
              }}
              className="border-2 border-blue-500"
            />
            <Label htmlFor="sameAsResidential" className="flex items-center gap-2 cursor-pointer text-sm">
              <Home className="h-4 w-4 text-blue-500" />
              Use same as residential address
            </Label>
          </div>
          <Textarea
            id="permanentAddress"
            placeholder={isSameAsResidential ? "Same as residential address" : "Enter permanent address"}
            {...step1Form.register("permanentAddress")}
            className="border-2 focus:border-blue-500 min-h-[100px]"
            disabled={isSameAsResidential}
          />
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
          <Label htmlFor="modemName" className="flex items-center gap-2">
            <Wifi className="h-4 w-4 text-green-500" />
            Modem Name
          </Label>
          <Input
            id="modemName"
            placeholder="Enter modem name"
            {...step2Form.register("modemName")}
            className="border-2 focus:border-green-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ontType" className="flex items-center gap-2">
            <Network className="h-4 w-4 text-green-500" />
            ONT Type
          </Label>
          <Select
            value={step2Form.watch("ontType")}
            onValueChange={(value) => step2Form.setValue("ontType", value)}
          >
            <SelectTrigger className="border-2 focus:border-green-500">
              <SelectValue placeholder="Select ONT type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DUAL_BAND">📡 DUAL_BAND</SelectItem>
              <SelectItem value="SINGLE_BAND">📡 SINGLE_BAND</SelectItem>
              <SelectItem value="OTHERS">📡 OTHERS</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="modelNumber" className="flex items-center gap-2">
            <Server className="h-4 w-4 text-green-500" />
            Model Number
          </Label>
          <Input
            id="modelNumber"
            placeholder="Enter model number"
            {...step2Form.register("modelNumber")}
            className="border-2 focus:border-green-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="serialNumber" className="flex items-center gap-2">
            <Database className="h-4 w-4 text-green-500" />
            Serial Number
          </Label>
          <Input
            id="serialNumber"
            placeholder="Enter serial number"
            {...step2Form.register("serialNumber")}
            className="border-2 focus:border-green-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ontMac" className="flex items-center gap-2">
            <Network className="h-4 w-4 text-green-500" />
            ONT MAC Address
          </Label>
          <Input
            id="ontMac"
            placeholder="00:11:22:33:44:55"
            {...step2Form.register("ontMac")}
            className="border-2 focus:border-green-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="username" className="flex items-center gap-2">
            <User className="h-4 w-4 text-green-500" />
            Username
          </Label>
          <Input
            id="username"
            placeholder="Enter username"
            {...step2Form.register("username")}
            className="border-2 focus:border-green-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-500" />
            Password
          </Label>
          <Input
            id="password"
            type="text"
            placeholder="Enter password"
            {...step2Form.register("password")}
            className="border-2 focus:border-green-500"
          />
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
          <Label htmlFor="oltId" className="flex items-center gap-2">
            <Server className="h-4 w-4 text-purple-500" />
            OLT ID (Read Only)
          </Label>
          <Input
            id="oltId"
            value={step3Form.watch("oltId") || ""}
            className="border-2 bg-gray-100 text-gray-600 cursor-not-allowed"
            readOnly
            disabled
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fdbId" className="flex items-center gap-2">
            <Database className="h-4 w-4 text-purple-500" />
            FDB ID (Read Only)
          </Label>
          <Input
            id="fdbId"
            value={step3Form.watch("fdbId") || ""}
            className="border-2 bg-gray-100 text-gray-600 cursor-not-allowed"
            readOnly
            disabled
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mtceFranchise" className="flex items-center gap-2">
            <Building className="h-4 w-4 text-purple-500" />
            Maintenance Franchise
          </Label>
          <Input
            id="mtceFranchise"
            placeholder="Enter maintenance franchise"
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
          <Label htmlFor="bbPassword" className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-purple-500" />
            Broadband Password
          </Label>
          <Input
            id="bbPassword"
            type="text"
            placeholder="broadband Password"
            {...step3Form.register("bbPassword")}
            className="border-2 focus:border-purple-500"
          />
          
        </div>

        <div className="space-y-2">
          <Label htmlFor="ruralUrban" className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-purple-500" />
            Rural/Urban
          </Label>
          <Select
            value={step3Form.watch("ruralUrban")}
            onValueChange={(value) => step3Form.setValue("ruralUrban", value)}
          >
            <SelectTrigger className="border-2 focus:border-purple-500">
              <SelectValue placeholder="Select Rural/Urban" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Rural">🌾 Rural</SelectItem>
              <SelectItem value="Urban">🏙️ Urban</SelectItem>
            </SelectContent>
          </Select>
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
          <Label htmlFor="category" className="flex items-center gap-2">
            <Building className="h-4 w-4 text-purple-500" />
            Category
          </Label>
          <Select
            value={step3Form.watch("category")}
            onValueChange={(value) => step3Form.setValue("category", value)}
          >
            <SelectTrigger className="border-2 focus:border-purple-500">
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

        <div className="space-y-2">
          <Label htmlFor="bbPlan" className="flex items-center gap-2">
            <Wifi className="h-4 w-4 text-purple-500" />
            Broadband Plan
          </Label>
          <Input
            id="bbPlan"
            placeholder="Enter broadband plan"
            {...step3Form.register("bbPlan")}
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
          disabled={isSubmitting || isUpdatingUser}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting || isUpdatingUser ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Updating User...
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              Update User
            </>
          )}
        </Button>
      </div>
    </form>
  );

  if (isLoadingUser || isLoading) {
    return (
      <MainLayout title="Edit User">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Loading User Data...
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we fetch the user information
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!userData) {
    return (
      <MainLayout title="Edit User">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="h-32 w-32 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="h-16 w-16 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              User Not Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The user you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate("/users")}>
              Back to Users
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`Edit User - ${userData?.user?.firstName} ${userData?.user?.lastName}`}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Edit className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Edit User
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Update user information for {userData?.user?.firstName} {userData?.user?.lastName}
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
                  className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 cursor-pointer ${currentStep >= step.id
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
                  <h3 className={`font-semibold text-sm ${currentStep >= step.id ? "text-gray-900 dark:text-white" : "text-gray-500"
                  }`}>
                    {step.title}
                  </h3>
                  <p className={`text-xs ${currentStep >= step.id ? "text-gray-600 dark:text-gray-400" : "text-gray-400"
                  }`}>
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 transition-all duration-300 ${currentStep > step.id ? "bg-gradient-to-r from-blue-500 to-purple-600" : "bg-gray-300"
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
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${currentStep === 1 ? "bg-gradient-to-r from-blue-500 to-cyan-500" :
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
      </div>
    </MainLayout>
  );
}
