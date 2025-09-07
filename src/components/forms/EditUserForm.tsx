import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
  Users
} from "lucide-react";
import { Step1Data, Step2Data, Step3Data, AreaType, Mode } from "@/lib/types/users";

interface FormStepProps {
  step1Form: any;
  step2Form: any;
  step3Form: any;
  currentStep: number;
  onStep1Submit: (data: Step1Data) => void;
  onStep2Submit: (data: Step2Data) => void;
  onStep3Submit: (data: Step3Data) => void;
  onPreviousStep: () => void;
  isSubmitting: boolean;
}

export const FormSteps: React.FC<FormStepProps> = ({
  step1Form,
  step2Form,
  step3Form,
  currentStep,
  onStep1Submit,
  onStep2Submit,
  onStep3Submit,
  onPreviousStep,
  isSubmitting
}) => {
  const renderStep1 = () => (
    <form onSubmit={step1Form.handleSubmit(onStep1Submit)} className="space-y-6">
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
    <form onSubmit={step2Form.handleSubmit(onStep2Submit)} className="space-y-6">
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
          onClick={onPreviousStep}
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
    <form onSubmit={step3Form.handleSubmit(onStep3Submit)} className="space-y-6">
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
          onClick={onPreviousStep}
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

  return (
    <>
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
    </>
  );
};
