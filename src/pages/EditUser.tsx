import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
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
  Edit
} from "lucide-react";
import { Step1Data, Step2Data, Step3Data, UserFormData, AreaType, Mode } from "@/lib/types/users";
import { generateDummyCustomers } from "@/lib/dummyData";
import { FormSteps } from "@/components/forms/EditUserForm";

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

export default function EditUser() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        // Simulate API call to fetch user data
        const users = generateDummyCustomers();
        const user = users.find(u => u.id === parseInt(id || '0'));
        
        if (user) {
          setUserData(user);
          // Pre-populate form data
          const initialData = {
            email: user.email,
            userName: user.userName || '',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            countryCode: user.countryCode || '+91',
            phoneNumber: user.phoneNumber || user.phone,
            mobile: user.mobile || '',
            language: 'English',
            country: user.country || 'India',
            permanentAddress: user.permanentAddress || user.address,
            billingAddress: user.billingAddress || user.address,
            area: user.area === 'urban' ? AreaType.URBAN : AreaType.RURAL,
            zone: '',
            ruralUrban: user.ruralUrban || (user.area === 'urban' ? 'Urban' : 'Rural'),
            category: user.category || 'Residential',
            customerType: 'residential',
            group: 'Standard',
            status: user.status,
            mode: user.mode === 'online' ? Mode.ONLINE : Mode.OFFLINE,
            customerPower: 'on',
            bandwidth: 100,
            planId: '',
            bbPlan: user.bbPlan || 'Basic',
            ftthExchangePlan: user.ftthExchangePlan || 'Standard',
            staticIp: user.staticIp || '',
            macIp: user.macIp || user.macAddress || '',
            oltIp: user.oltIp || '',
            mtceFranchise: user.mtceFranchise || '',
            bbUserId: user.bbUserId || '',
            workingStatus: user.workingStatus || 'active',
            assigned: '',
            acquisitionType: user.acquisitionType || 'new',
            balanceDue: user.balanceDue || 0,
            activationDate: user.activationDate || '',
            expirationDate: user.expirationDate || '',
            installationDate: user.installationDate || '',
            lastBillingDate: user.lastBillingDate || '',
            llInstallDate: user.llInstallDate || '',
            isAccountVerified: false,
          };
          setFormData(initialData);
        } else {
          toast({
            title: "Error",
            description: "User not found",
            variant: "destructive",
          });
          navigate("/users");
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive",
        });
        navigate("/users");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadUserData();
    }
  }, [id, navigate, toast]);

  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: formData,
  });

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: formData,
  });

  const step3Form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: formData,
  });

  // Update form values when userData is loaded
  useEffect(() => {
    if (userData) {
      step1Form.reset({
        email: userData.email,
        userName: userData.userName || '',
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        countryCode: userData.countryCode || '+91',
        phoneNumber: userData.phoneNumber || userData.phone,
        mobile: userData.mobile || '',
        language: 'English',
        country: userData.country || 'India',
      });
      
      step2Form.reset({
        permanentAddress: userData.permanentAddress || userData.address,
        billingAddress: userData.billingAddress || userData.address,
        area: userData.area === 'urban' ? AreaType.URBAN : AreaType.RURAL,
        zone: '',
        ruralUrban: userData.ruralUrban || (userData.area === 'urban' ? 'Urban' : 'Rural'),
        category: userData.category || 'Residential',
        customerType: 'residential',
        group: 'Standard',
      });
      
      step3Form.reset({
        status: userData.status,
        mode: userData.mode === 'online' ? Mode.ONLINE : Mode.OFFLINE,
        customerPower: 'on',
        bandwidth: 100,
        planId: '',
        bbPlan: userData.bbPlan || 'Basic',
        ftthExchangePlan: userData.ftthExchangePlan || 'Standard',
        staticIp: userData.staticIp || '',
        macIp: userData.macIp || userData.macAddress || '',
        oltIp: userData.oltIp || '',
        mtceFranchise: userData.mtceFranchise || '',
        bbUserId: userData.bbUserId || '',
        workingStatus: userData.workingStatus || 'active',
        assigned: '',
        acquisitionType: userData.acquisitionType || 'new',
        balanceDue: userData.balanceDue || 0,
        activationDate: userData.activationDate || '',
        expirationDate: userData.expirationDate || '',
        installationDate: userData.installationDate || '',
        lastBillingDate: userData.lastBillingDate || '',
        llInstallDate: userData.llInstallDate || '',
        isAccountVerified: false,
      });
    }
  }, [userData, step1Form, step2Form, step3Form]);

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
      
      // Here you would typically send the data to your API
      console.log("Updated user data:", finalData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success! 🎉",
        description: `User ${userData?.name} has been updated successfully`,
      });
      
      // Navigate to users management page
      navigate("/users");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
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

  if (isLoading) {
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
    <MainLayout title={`Edit User - ${userData.name}`}>
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
                  Update user information for {userData.name}
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
            <FormSteps
              step1Form={step1Form}
              step2Form={step2Form}
              step3Form={step3Form}
              currentStep={currentStep}
              onStep1Submit={handleStep1Submit}
              onStep2Submit={handleStep2Submit}
              onStep3Submit={handleStep3Submit}
              onPreviousStep={goToPreviousStep}
              isSubmitting={isSubmitting}
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
