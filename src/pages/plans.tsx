import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  FibrePlanFormData,
  OttPlanFormData,
  IptvPlanFormData
} from "@/lib/types/plans";
import {
  Tv,
  Wifi,
  Zap,
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  Star,
  PlayCircle,
  Monitor,
  Radio,
  Crown,
  Shield,
  Smartphone,
  Phone,
  Globe,
  Calendar,
  DollarSign,
  TrendingUp,
  Settings,
  Search,
  Filter,
  Upload,
  Image,
  X
} from "lucide-react";
import { generateDummyIptvPlans, generateDummyOttPlans, generateDummyFibrePlans, type IptvPlan, type OttPlan, type FibrePlan } from "@/lib/dummyData";
import {
  useGetplansDashbaordDataQuery,
  useAddFibrePlanMutation,
  useAddOttPlanMutation,
  useAddIptvlanMutation,
  useDeleteFibrePlanMutation,
  useDeleteIptvlanMutation,
  useDeleteOttPlanMutation,
  useEditFibrePlanMutation,
  useEditIptvlanMutation,
  useEditOttPlanMutation,
  BASE_URL
} from "@/api";

export default function PlansPage() {
  const [activeTab, setActiveTab] = useState("iptv");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("all");
  const [selectedPlanType, setSelectedPlanType] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [deletingPlan, setDeletingPlan] = useState<any>(null);
  const [selectedPlanTypeForAdd, setSelectedPlanTypeForAdd] = useState("iptv");
  const [formData, setFormData] = useState<any>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: plansData, isLoading, error } = useGetplansDashbaordDataQuery({});
  const { toast } = useToast();

  // API Mutations
  const [addFibrePlan, { isLoading: isAddingFibre }] = useAddFibrePlanMutation();
  const [addOttPlan, { isLoading: isAddingOtt }] = useAddOttPlanMutation();
  const [addIptvPlan, { isLoading: isAddingIptv }] = useAddIptvlanMutation();

  // Delete Mutations
  const [deleteFibrePlan] = useDeleteFibrePlanMutation();
  const [deleteIptvPlan] = useDeleteIptvlanMutation();
  const [deleteOttPlan] = useDeleteOttPlanMutation();

  // Edit Mutations
  const [editFibrePlan] = useEditFibrePlanMutation();
  const [editIptvPlan] = useEditIptvlanMutation();
  const [editOttPlan] = useEditOttPlanMutation();

  // Extract data from API response
  const summary = plansData?.data?.summary || { totalPlans: 0, iptvPlans: 0, ottPlans: 0, fibrePlans: 0 };
  const allPlans = plansData?.data?.plans || [];
  const iptvPlans = plansData?.data?.planTypes?.iptv || [];
  const ottPlans = plansData?.data?.planTypes?.ott || [];
  const fibrePlans = plansData?.data?.planTypes?.fibre || [];
  const providers = plansData?.data?.filters?.providers || [];
  const planTypes = plansData?.data?.filters?.planTypes || [];

  // Filter functions
  const filterPlans = (plans: any[]) => {
    return plans.filter(plan => {
      const matchesSearch = plan.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.provider.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProvider = selectedProvider === "all" || plan.provider.toLowerCase().includes(selectedProvider.toLowerCase());
      const matchesPlanType = selectedPlanType === "all" || plan.category?.toLowerCase() === selectedPlanType.toLowerCase();
      return matchesSearch && matchesProvider && matchesPlanType;
    });
  };

  // Get unique providers for filter
  const getAllProviders = () => {
    return providers.filter((provider: string) => provider !== "All Providers");
  };

  const handleEdit = (plan: any) => {
    setEditingPlan(plan);
    setFormData(plan);
    setLogoPreview(null);
    setLogoFile(null);
    setShowEditDialog(true);
  };

  const handleDelete = (plan: any) => {
    if (!plan) {
      toast({
        title: "Error",
        description: "Invalid plan data",
        variant: "destructive",
      });
      return;
    }

    setDeletingPlan(plan);
    setShowDeleteDialog(true);
  };

  // Helper function to detect plan type more reliably
  const detectPlanTypeForDeletion = (plan: any): 'iptv' | 'ott' | 'fibre' => {
    // First check explicit category or planType
    if (plan.category === 'iptv' || plan.planType === 'iptv') return 'iptv';
    if (plan.category === 'ott' || plan.planType === 'ott') return 'ott';
    if (plan.category === 'fibre' || plan.planType === 'fibre') return 'fibre';

    // Fallback: check plan structure
    if (plan.totalChannels || plan.channelList || plan.payChannels || plan.freeToAirChannels) {
      return 'iptv';
    }
    if (plan.speedBeforeLimit || plan.dataLimitGB || plan.validity) {
      return 'ott';
    }
    if (plan.speed || plan.dataLimit || plan.benefits) {
      return 'fibre';
    }

    // Default fallback
    return 'iptv';
  };

  const confirmDelete = async () => {
    if (!deletingPlan) {
      toast({
        title: "Error",
        description: "No plan selected for deletion",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      // Use helper function to determine plan type
      const planType = detectPlanTypeForDeletion(deletingPlan);
      let deleteResult;

      // Call appropriate delete API based on plan type
      switch (planType) {
        case 'iptv':
          deleteResult = await deleteIptvPlan(deletingPlan.id || deletingPlan._id);
          break;
        case 'ott':
          deleteResult = await deleteOttPlan(deletingPlan.id || deletingPlan._id);
          break;
        case 'fibre':
          deleteResult = await deleteFibrePlan(deletingPlan.id || deletingPlan._id);
          break;
        default:
          throw new Error("Unable to determine plan type for deletion");
      }

      if (deleteResult?.error) {
        let errorMessage = "Failed to delete plan";
        if ('data' in deleteResult.error && deleteResult.error.data && typeof deleteResult.error.data === 'object' && 'message' in deleteResult.error.data) {
          errorMessage = String(deleteResult.error.data.message);
        }
        throw new Error(errorMessage);
      }

      toast({
        title: "Success",
        description: `${deletingPlan.name || deletingPlan.title || 'Plan'} deleted successfully`,
      });

      setShowDeleteDialog(false);
      setDeletingPlan(null);
    } catch (error: any) {
      console.error("Error deleting plan:", error);
      toast({
        title: "Error",
        description: error?.message || error?.data?.message || "Failed to delete plan",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const validateForm = () => {
    if (!logoFile) {
      toast({
        title: "Logo Required",
        description: "Please upload a provider logo",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.provider || !formData.price || !formData.description) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return false;
    }

    if (selectedPlanTypeForAdd === "iptv") {
      if (!formData.name || !formData.totalChannels || !formData.payChannels || !formData.freeToAirChannels || !formData.planType || !formData.quality || !formData.channelList) {
        toast({
          title: "IPTV Plan Details Missing",
          description: "Please fill in all required IPTV plan fields including plan type, quality, and channel list",
          variant: "destructive",
        });
        return false;
      }

      // Validate that channelList has at least one channel
      const channelList = (formData.channelList || "").split(",").map((c: string) => c.trim()).filter((c: string) => c);
      if (channelList.length === 0) {
        toast({
          title: "Channel List Required",
          description: "Please provide at least one channel for the IPTV plan",
          variant: "destructive",
        });
        return false;
      }
    } else if (selectedPlanTypeForAdd === "ott") {
      if (!formData.title || !formData.price || !formData.speedBeforeLimit || !formData.speedAfterLimit || !formData.dataLimitGB || !formData.validity || !formData.provider || !formData.description) {
        toast({
          title: "OTT Plan Details Missing",
          description: "Please fill in all OTT plan fields including title, price, speeds, data limit, validity, provider, and description",
          variant: "destructive",
        });
        return false;
      }

      // Validate that ottApps array has at least one item
      if (!formData.ottApps || formData.ottApps.length === 0) {
        toast({
          title: "OTT Apps Required",
          description: "Please provide at least one OTT app for the plan",
          variant: "destructive",
        });
        return false;
      }
    } else if (selectedPlanTypeForAdd === "fibre") {
      if (!formData.title || !formData.speed || !formData.validity || !formData.dataLimit || !formData.benefits) {
        toast({
          title: "Fibre Plan Details Missing",
          description: "Please fill in all Fibre plan fields including benefits",
          variant: "destructive",
        });
        return false;
      }

      // Validate that benefits array has at least one item
      const benefitsArray = parseBenefits(formData.benefits);
      if (benefitsArray.length === 0) {
        toast({
          title: "Benefits Required",
          description: "Please provide at least one benefit for the Fibre plan",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const handleAddPlan = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();

      // Add logo file
      if (logoFile) {
        formDataToSend.append("logo", logoFile);
      }

      if (selectedPlanTypeForAdd === "fibre") {
        // Fibre Plan
        formDataToSend.append("title", formData.title || "");
        formDataToSend.append("price", (formData.price || 0).toString());
        formDataToSend.append("validity", formData.validity || "");
        formDataToSend.append("speed", formData.speed || "");
        formDataToSend.append("dataLimit", formData.dataLimit || "");
        formDataToSend.append("provider", formData.provider || "");
        formDataToSend.append("description", formData.description || "");
        formDataToSend.append("planType", formData.planType || "");
        // Convert benefits string to array and append each benefit
        const benefitsArray = parseBenefits(formData.benefits || "");
        benefitsArray.forEach((benefit: string, index: number) => {
          formDataToSend.append(`benefits[${index}]`, benefit);
        });

        await addFibrePlan(formDataToSend).unwrap();
        toast({
          title: "Success",
          description: "Fibre plan added successfully",
        });
      } else if (selectedPlanTypeForAdd === "ott") {
        // OTT Plan
        formDataToSend.append("title", formData.title || "");
        formDataToSend.append("price", (formData.price || 0).toString());
        formDataToSend.append("speedBeforeLimit", formData.speedBeforeLimit || "");
        formDataToSend.append("speedAfterLimit", formData.speedAfterLimit || "");
        formDataToSend.append("dataLimitGB", (formData.dataLimitGB || 0).toString());
        formDataToSend.append("isUnlimited", (formData.isUnlimited || false).toString());
        formDataToSend.append("validity", formData.validity || "");

        // Handle ottApps as array with proper indexing like ottApps[0], ottApps[1], etc.
        const ottAppsArray = formData.ottApps || [];
        ottAppsArray.forEach((app: string, index: number) => {
          formDataToSend.append(`ottApps[${index}]`, app);
        });

        formDataToSend.append("callBenefit", formData.callBenefit || "");
        formDataToSend.append("provider", formData.provider || "");
        formDataToSend.append("description", formData.description || "");
        formDataToSend.append("planType", "ott");

        await addOttPlan(formDataToSend).unwrap();
        toast({
          title: "Success",
          description: "OTT plan added successfully",
        });
      } else if (selectedPlanTypeForAdd === "iptv") {
        // IPTV Plan - Matching your exact FormData structure
        formDataToSend.append("name", formData.name || "");
        formDataToSend.append("payChannels", (formData.payChannels || 0).toString());
        formDataToSend.append("totalChannels", (formData.totalChannels || 0).toString());
        formDataToSend.append("freeToAirChannels", (formData.freeToAirChannels || 0).toString());
        formDataToSend.append("price", (formData.price || 0).toString());
        formDataToSend.append("lcoMarginPercent", (formData.lcoMarginPercent || 10).toString());
        formDataToSend.append("distributorMarginPercent", (formData.distributorMarginPercent || 5).toString());

        // Handle channelList as array with proper indexing
        const channelList = (formData.channelList || "").split(",").map((c: string) => c.trim()).filter((c: string) => c);
        channelList.forEach((channel: string, index: number) => {
          formDataToSend.append(`channelList[]`, channel);
        });

        formDataToSend.append("planType", formData.planType || "lite");
        formDataToSend.append("quality", formData.quality || "HD");
        formDataToSend.append("provider", formData.provider || "");
        formDataToSend.append("description", formData.description || "");

        await addIptvPlan(formDataToSend).unwrap();
        toast({
          title: "Success",
          description: "IPTV plan added successfully",
        });
      }

      setShowAddDialog(false);
      resetForm();
    } catch (error: any) {
      console.error("Error adding plan:", error);
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to add plan",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateEditForm = () => {
    if (!editingPlan) {
      toast({
        title: "Error",
        description: "No plan selected for editing",
        variant: "destructive",
      });
      return false;
    }

    const planType = detectPlanTypeForDeletion(editingPlan);
    
    // Debug logging
    console.log('Validating edit form for plan type:', planType);
    console.log('Form data:', formData);
    console.log('Editing plan:', editingPlan);
    
    if (planType === 'iptv') {
      if (!formData.name || !formData.totalChannels || !formData.payChannels || !formData.freeToAirChannels || !formData.planType || !formData.quality || !formData.channelList) {
        toast({
          title: "IPTV Plan Details Missing",
          description: "Please fill in all required IPTV plan fields including plan type, quality, and channel list",
          variant: "destructive",
        });
        return false;
      }
      
      // Validate that channelList has at least one channel
      const channelList = (formData.channelList || "").split(",").map((c: string) => c.trim()).filter((c: string) => c);
      if (channelList.length === 0) {
        toast({
          title: "Channel List Required",
          description: "Please provide at least one channel for the IPTV plan",
          variant: "destructive",
        });
        return false;
      }
    } else if (planType === 'ott') {
      if (!formData.title || !formData.price || !formData.speedBeforeLimit || !formData.speedAfterLimit || !formData.dataLimitGB || !formData.validity || !formData.provider || !formData.description) {
        toast({
          title: "OTT Plan Details Missing",
          description: "Please fill in all OTT plan fields including title, price, speeds, data limit, validity, provider, and description",
          variant: "destructive",
        });
        return false;
      }
      
      // Validate that ottApps array has at least one item
      if (!formData.ottApps || formData.ottApps.length === 0) {
        toast({
          title: "OTT Apps Required",
          description: "Please provide at least one OTT app for the plan",
          variant: "destructive",
        });
        return false;
      }
    } else if (planType === 'fibre') {
      if (!formData.title || !formData.price || !formData.speed || !formData.validity || !formData.dataLimit || !formData.benefits) {
        toast({
          title: "Fibre Plan Details Missing",
          description: "Please fill in all Fibre plan fields including benefits",
          variant: "destructive",
        });
        return false;
      }
      
      // Validate that benefits array has at least one item
      console.log('Benefits field value:', formData.benefits);
      console.log('Benefits field type:', typeof formData.benefits);
      const benefitsArray = parseBenefits(formData.benefits);
      console.log('Parsed benefits array:', benefitsArray);
      if (benefitsArray.length === 0) {
        toast({
          title: "Benefits Required",
          description: "Please provide at least one benefit for the Fibre plan",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const handleUpdatePlan = async () => {
    if (!validateEditForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();

      // Add logo file if changed
      if (logoFile) {
        formDataToSend.append("logo", logoFile);
      }

      // Determine plan type and call appropriate edit API
      const planType = detectPlanTypeForDeletion(editingPlan);
      
      if (planType === 'iptv') {
        // IPTV Plan Edit
        formDataToSend.append("name", formData.name || "");
        formDataToSend.append("payChannels", (formData.payChannels || 0).toString());
        formDataToSend.append("totalChannels", (formData.totalChannels || 0).toString());
        formDataToSend.append("freeToAirChannels", (formData.freeToAirChannels || 0).toString());
        formDataToSend.append("price", (formData.price || 0).toString());
        formDataToSend.append("lcoMarginPercent", (formData.lcoMarginPercent || 10).toString());
        formDataToSend.append("distributorMarginPercent", (formData.distributorMarginPercent || 5).toString());

        // Handle channelList as array with proper indexing
        const channelList = (formData.channelList || "").split(",").map((c: string) => c.trim()).filter((c: string) => c);
        channelList.forEach((channel: string, index: number) => {
          formDataToSend.append(`channelList[]`, channel);
        });

        formDataToSend.append("planType", formData.planType || "lite");
        formDataToSend.append("quality", formData.quality || "HD");
        formDataToSend.append("provider", formData.provider || "");
        formDataToSend.append("description", formData.description || "");

        await editIptvPlan({ id: editingPlan.id || editingPlan._id, body: formDataToSend }).unwrap();
        toast({
          title: "Success",
          description: "IPTV plan updated successfully",
        });
      } else if (planType === 'ott') {
        // OTT Plan Edit
        formDataToSend.append("title", formData.title || "");
        formDataToSend.append("price", (formData.price || 0).toString());
        formDataToSend.append("speedBeforeLimit", formData.speedBeforeLimit || "");
        formDataToSend.append("speedAfterLimit", formData.speedAfterLimit || "");
        formDataToSend.append("dataLimitGB", (formData.dataLimitGB || 0).toString());
        formDataToSend.append("isUnlimited", (formData.isUnlimited || false).toString());
        formDataToSend.append("validity", formData.validity || "");
        
        // Handle ottApps as array with proper indexing like ottApps[0], ottApps[1], etc.
        const ottAppsArray = formData.ottApps || [];
        ottAppsArray.forEach((app: string, index: number) => {
          formDataToSend.append(`ottApps[${index}]`, app);
        });
        
        formDataToSend.append("callBenefit", formData.callBenefit || "");
        formDataToSend.append("provider", formData.provider || "");
        formDataToSend.append("description", formData.description || "");
        formDataToSend.append("planType", "ott");

        await editOttPlan({ id: editingPlan.id || editingPlan._id, body: formDataToSend }).unwrap();
        toast({
          title: "Success",
          description: "OTT plan updated successfully",
        });
      } else if (planType === 'fibre') {
        // Fibre Plan Edit
        formDataToSend.append("title", formData.title || "");
        formDataToSend.append("price", (formData.price || 0).toString());
        formDataToSend.append("validity", formData.validity || "");
        formDataToSend.append("speed", formData.speed || "");
        formDataToSend.append("dataLimit", formData.dataLimit || "");
        formDataToSend.append("provider", formData.provider || "");
        formDataToSend.append("description", formData.description || "");
        formDataToSend.append("planType", formData.planType || "");
        
        // Convert benefits string to array and append each benefit
        const benefitsArray = parseBenefits(formData.benefits || "");
        benefitsArray.forEach((benefit: string, index: number) => {
          formDataToSend.append(`benefits[${index}]`, benefit);
        });

        await editFibrePlan({ id: editingPlan.id || editingPlan._id, body: formDataToSend }).unwrap();
        toast({
          title: "Success",
          description: "Fibre plan updated successfully",
        });
      }

      setShowEditDialog(false);
      setFormData({});
      setEditingPlan(null);
      setLogoFile(null);
      setLogoPreview(null);
    } catch (error: any) {
      console.error("Error updating plan:", error);
      toast({
        title: "Error",
        description: error?.message || error?.data?.message || "Failed to update plan",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({});
    setSelectedPlanTypeForAdd("iptv");
    setLogoFile(null);
    setLogoPreview(null);
  };

  // Initialize form with default values when switching to IPTV
  const handlePlanTypeChange = (value: string) => {
    setSelectedPlanTypeForAdd(value);
    if (value === "iptv") {
      setFormData({
        lcoMarginPercent: 10,
        distributorMarginPercent: 5,
        quality: "HD",
        planType: "lite"
      });
    } else {
      setFormData({});
    }
  };

  // Helper function to convert comma-separated benefits string to array
  const parseBenefits = (benefitsString: any): string[] => {
    console.log('parseBenefits called with:', benefitsString);
    console.log('Type of benefitsString:', typeof benefitsString);
    
    if (!benefitsString) {
      console.log('benefitsString is falsy, returning empty array');
      return [];
    }
    if (Array.isArray(benefitsString)) {
      console.log('benefitsString is array, returning as is:', benefitsString);
      return benefitsString;
    }
    if (typeof benefitsString === 'string') {
      console.log('benefitsString is string, splitting by comma');
      const result = benefitsString
        .split(",")
        .map((benefit: string) => benefit.trim())
        .filter((benefit: string) => benefit.length > 0);
      console.log('Parsed result:', result);
      return result;
    }
    console.log('benefitsString is neither array nor string, returning empty array');
    return [];
  };

  // Helper function to get plan type icon
  const getPlanTypeIcon = (planType: string) => {
    switch (planType) {
      case 'iptv':
        return <Tv className="h-5 w-5 text-white" />;
      case 'ott':
        return <PlayCircle className="h-5 w-5 text-white" />;
      case 'fibre':
        return <Zap className="h-5 w-5 text-white" />;
      default:
        return <Tv className="h-5 w-5 text-white" />;
    }
  };

  // Helper function to detect plan type from plan object
  const detectPlanType = (plan: any): string => {
    if (!plan) return activeTab; // Return current tab if plan is null/undefined

    if (plan.hasOwnProperty('totalChannels') && plan.hasOwnProperty('payChannels')) {
      return 'iptv';
    } else if (plan.hasOwnProperty('speedBeforeLimit') && plan.hasOwnProperty('speedAfterLimit')) {
      return 'ott';
    } else if (plan.hasOwnProperty('speed') && plan.hasOwnProperty('dataLimit')) {
      return 'fibre';
    }
    return activeTab; // fallback to current tab
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeUploadedFile = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setFormData({ ...formData, logo: "" });
  };

  // Loading state
  if (isLoading) {
    return (
      <MainLayout title="Service Plans Management">
        <div className="space-y-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="dashboard-welcome-text">Loading plans...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <MainLayout title="Service Plans Management">
        <div className="space-y-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <p className="dashboard-welcome-text text-red-600">Error loading plans</p>
              <p className="dashboard-welcome-muted">Please try again later</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Service Plans Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold dashboard-welcome-text">Service Plans Management</h1>
            <p className="dashboard-welcome-muted">Manage IPTV, OTT, and Fibre service plans</p>
          </div>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="dashboard-stats-card hover:scale-105 transition-transform duration-300"
          >
            <Plus className="h-4 w-4 mr-2 dashboard-welcome-icon" />
            <span className="dashboard-welcome-text">Add New Plan</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="dashboard-stats-card shadow-lg hover:scale-105 transition-transform duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm dashboard-welcome-muted">Total Plans</p>
                  <p className="text-2xl font-bold dashboard-welcome-text">
                    {summary.totalPlans}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full dashboard-welcome-icon flex items-center justify-center">
                  <Globe className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-stats-card shadow-lg hover:scale-105 transition-transform duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm dashboard-welcome-muted">IPTV Plans</p>
                  <p className="text-2xl font-bold dashboard-welcome-text">{summary.iptvPlans}</p>
                </div>
                <div className="h-12 w-12 rounded-full dashboard-welcome-icon flex items-center justify-center">
                  <Tv className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-stats-card shadow-lg hover:scale-105 transition-transform duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm dashboard-welcome-muted">OTT Plans</p>
                  <p className="text-2xl font-bold dashboard-welcome-text">{summary.ottPlans}</p>
                </div>
                <div className="h-12 w-12 rounded-full dashboard-welcome-icon flex items-center justify-center">
                  <PlayCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-stats-card shadow-lg hover:scale-105 transition-transform duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm dashboard-welcome-muted">Fibre Plans</p>
                  <p className="text-2xl font-bold dashboard-welcome-text">{summary.fibrePlans}</p>
                </div>
                <div className="h-12 w-12 rounded-full dashboard-welcome-icon flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="dashboard-chart-card shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 dashboard-welcome-muted" />
                  <Input
                    placeholder="Search plans..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 dashboard-welcome-input"
                  />
                </div>
              </div>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger className="w-full lg:w-[200px] dashboard-welcome-input">
                  <SelectValue placeholder="Select Provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  {getAllProviders().map((provider: string) => (
                    <SelectItem key={provider} value={provider.toLowerCase()}>{provider}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedPlanType} onValueChange={setSelectedPlanType}>
                <SelectTrigger className="w-full lg:w-[200px] dashboard-welcome-input">
                  <SelectValue placeholder="Plan Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {planTypes.map((type: any) => (
                    <SelectItem key={type.value} value={type.value.toLowerCase()}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Plans Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 dashboard-chart-card">
            <TabsTrigger value="iptv" className="flex items-center gap-2 dashboard-welcome-text">
              <Tv className="h-4 w-4" />
              IPTV Plans
            </TabsTrigger>
            <TabsTrigger value="ott" className="flex items-center gap-2 dashboard-welcome-text">
              <PlayCircle className="h-4 w-4" />
              OTT Plans
            </TabsTrigger>
            <TabsTrigger value="fibre" className="flex items-center gap-2 dashboard-welcome-text">
              <Zap className="h-4 w-4" />
              Fibre Plans
            </TabsTrigger>
          </TabsList>

          {/* IPTV Plans */}
          <TabsContent value="iptv">
            {iptvPlans.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Tv className="h-8 w-8 text-gray-400" />
                </div>
                <p className="dashboard-welcome-text text-lg">No IPTV Plans Available</p>
                <p className="dashboard-welcome-muted">Create your first IPTV plan to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filterPlans(iptvPlans).map((plan) => (
                  <Card key={plan.id} className="dashboard-chart-card shadow-lg hover:scale-105 transition-transform duration-300">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg overflow-hidden">
                            {plan.logo ? (
                              <>
                                <img
                                  src={`${BASE_URL}${plan.logo}`}
                                  alt={`${plan.provider} logo`}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                                <div className="h-full w-full dashboard-welcome-icon flex items-center justify-center hidden">
                                  <Tv className="h-6 w-6 text-white" />
                                </div>
                              </>
                            ) : (
                              <div className="h-full w-full dashboard-welcome-icon flex items-center justify-center">
                                <Tv className="h-6 w-6 text-white" />
                              </div>
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-lg dashboard-welcome-text">{plan.title}</CardTitle>
                            <p className="text-sm dashboard-welcome-muted">{plan.provider}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(plan)}
                            className="dashboard-welcome-icon"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(plan)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold dashboard-welcome-text">₹{plan.price}</span>
                        <Badge className={`${plan.category === 'premium' ? 'badge-super-admin' :
                          plan.category === 'standard' ? 'badge-admin' : 'badge-manager'
                          }`}>
                          {plan.category} {plan.quality}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {plan.features?.slice(0, 4).map((feature: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2">
                            {feature.icon === 'monitor' && <Monitor className="h-4 w-4 dashboard-welcome-icon" />}
                            {feature.icon === 'crown' && <Crown className="h-4 w-4 dashboard-welcome-icon" />}
                            {feature.icon === 'broadcast' && <Radio className="h-4 w-4 dashboard-welcome-icon" />}
                            {feature.icon === 'chart-line' && <TrendingUp className="h-4 w-4 dashboard-welcome-icon" />}
                            {feature.icon === 'wifi' && <Wifi className="h-4 w-4 dashboard-welcome-icon" />}
                            {feature.icon === 'calendar' && <Calendar className="h-4 w-4 dashboard-welcome-icon" />}
                            {feature.icon === 'globe' && <Globe className="h-4 w-4 dashboard-welcome-icon" />}
                            {feature.icon === 'shield' && <Shield className="h-4 w-4 dashboard-welcome-icon" />}
                            {feature.icon === 'phone' && <Phone className="h-4 w-4 dashboard-welcome-icon" />}
                            <span className="dashboard-welcome-text">{feature.label}</span>
                          </div>
                        ))}
                      </div>

                      <p className="text-sm dashboard-welcome-muted">{plan.description}</p>

                      {plan.popularChannels && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium dashboard-welcome-text">Popular Channels:</p>
                          <div className="flex flex-wrap gap-1">
                            {plan.popularChannels.slice(0, 3).map((channel: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {channel}
                              </Badge>
                            ))}
                            {plan.popularChannels.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{plan.popularChannels.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* OTT Plans */}
          <TabsContent value="ott">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filterPlans(ottPlans).map((plan) => (
                <Card key={plan.id} className="dashboard-chart-card shadow-lg hover:scale-105 transition-transform duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg overflow-hidden">
                          {plan.logo ? (
                            <>
                              <img
                                src={`${BASE_URL}${plan.logo}`}
                                alt={`${plan.provider} logo`}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                              <div className="h-full w-full dashboard-welcome-icon flex items-center justify-center hidden">
                                <PlayCircle className="h-6 w-6 text-white" />
                              </div>
                            </>
                          ) : (
                            <div className="h-full w-full dashboard-welcome-icon flex items-center justify-center">
                              <PlayCircle className="h-6 w-6 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg dashboard-welcome-text">{plan.title}</CardTitle>
                          <p className="text-sm dashboard-welcome-muted">{plan.provider}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(plan)}
                          className="dashboard-welcome-icon"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(plan)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold dashboard-welcome-text">₹{plan.price}</span>
                      <Badge className={`${plan.isUnlimited ? 'badge-super-admin' : 'badge-admin'}`}>
                        {plan.isUnlimited ? 'Unlimited' : `${plan.dataLimitGB}GB`}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {plan.features?.slice(0, 4).map((feature: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          {feature.icon === 'wifi' && <Wifi className="h-4 w-4 dashboard-welcome-icon" />}
                          {feature.icon === 'calendar' && <Calendar className="h-4 w-4 dashboard-welcome-icon" />}
                          {feature.icon === 'shield' && <Shield className="h-4 w-4 dashboard-welcome-icon" />}
                          {feature.icon === 'phone' && <Phone className="h-4 w-4 dashboard-welcome-icon" />}
                          <span className="dashboard-welcome-text">{feature.label}</span>
                        </div>
                      ))}
                    </div>

                    <p className="text-sm dashboard-welcome-muted">{plan.description}</p>

                    {plan.ottApps && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium dashboard-welcome-text">OTT Apps Included:</p>
                        <div className="flex flex-wrap gap-1">
                          {plan.ottApps.slice(0, 3).map((app: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {app}
                            </Badge>
                          ))}
                          {plan.ottApps.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{plan.ottApps.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {plan.callBenefit && (
                      <div className="flex items-center gap-2 text-sm">
                        <Smartphone className="h-4 w-4 dashboard-welcome-icon" />
                        <span className="dashboard-welcome-text">{plan.callBenefit}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Fibre Plans */}
          <TabsContent value="fibre">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filterPlans(fibrePlans).map((plan) => (
                <Card key={plan.id} className="dashboard-chart-card shadow-lg hover:scale-105 transition-transform duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg overflow-hidden">
                          {plan.logo ? (
                            <>
                              <img
                                src={`${BASE_URL}${plan.logo}`}
                                alt={`${plan.provider} logo`}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                              <div className="h-full w-full dashboard-welcome-icon flex items-center justify-center hidden">
                                <Zap className="h-6 w-6 text-white" />
                              </div>
                            </>
                          ) : (
                            <div className="h-full w-full dashboard-welcome-icon flex items-center justify-center">
                              <Zap className="h-6 w-6 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg dashboard-welcome-text">{plan.title}</CardTitle>
                          <p className="text-sm dashboard-welcome-muted">{plan.provider}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(plan)}
                          className="dashboard-welcome-icon"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(plan)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold dashboard-welcome-text">₹{plan.price}</span>
                      <Badge className={`${plan.category === 'Premium' ? 'badge-super-admin' :
                        plan.category === 'Standard' ? 'badge-admin' : 'badge-manager'
                        }`}>
                        {plan.category}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {plan.features?.slice(0, 4).map((feature: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          {feature.icon === 'wifi' && <Zap className="h-4 w-4 dashboard-welcome-icon" />}
                          {feature.icon === 'calendar' && <Calendar className="h-4 w-4 dashboard-welcome-icon" />}
                          {feature.icon === 'globe' && <Globe className="h-4 w-4 dashboard-welcome-icon" />}
                          {feature.icon === 'shield' && <Shield className="h-4 w-4 dashboard-welcome-icon" />}
                          <span className="dashboard-welcome-text">{feature.label}</span>
                        </div>
                      ))}
                    </div>

                    <p className="text-sm dashboard-welcome-muted">{plan.description}</p>

                    {plan.benefits && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium dashboard-welcome-text">Benefits:</p>
                        <Badge variant="secondary" className="text-xs">
                          {plan.benefits}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Plan Dialog */}
        <Dialog open={showAddDialog} onOpenChange={(open) => {
          setShowAddDialog(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto dashboard-chart-card">
            <DialogHeader>
              <DialogTitle className="dashboard-welcome-text flex items-center gap-2">
                <Plus className="h-5 w-5 dashboard-welcome-icon" />
                Add New Service Plan
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Plan Type Selection */}
              <div className="mb-4">
                <p className="text-sm dashboard-welcome-muted mb-2">
                  * Required fields must be filled before submission
                </p>
              </div>
              <div>
                <Label className="dashboard-welcome-text text-lg font-semibold">Plan Type</Label>
                <Tabs value={selectedPlanTypeForAdd} onValueChange={handlePlanTypeChange} className="mt-2">
                  <TabsList className="grid w-full grid-cols-3 dashboard-chart-card">
                    <TabsTrigger value="iptv" className="flex items-center gap-2">
                      <Tv className="h-4 w-4" />
                      IPTV Plan
                    </TabsTrigger>
                    <TabsTrigger value="ott" className="flex items-center gap-2">
                      <PlayCircle className="h-4 w-4" />
                      OTT Plan
                    </TabsTrigger>
                    <TabsTrigger value="fibre" className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Fibre Plan
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Common Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="dashboard-welcome-text">Provider</Label>
                  <Input
                    placeholder="Provider name"
                    className="dashboard-welcome-input"
                    value={formData.provider || ""}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="dashboard-welcome-text">Price (₹)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    className="dashboard-welcome-input"
                    value={formData.price || ""}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              {/* IPTV Specific Fields */}
              {selectedPlanTypeForAdd === "iptv" && (
                <div className="space-y-4 p-4 dashboard-stats-card rounded-lg">
                  <h3 className="dashboard-welcome-text font-semibold flex items-center gap-2">
                    <Tv className="h-4 w-4" />
                    IPTV Plan Details
                  </h3>
                  <div>
                    <Label className="dashboard-welcome-text">Plan Name *</Label>
                    <Input
                      placeholder="e.g., Skypro Lite Play HD"
                      className="dashboard-welcome-input"
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="dashboard-welcome-text">Total Channels *</Label>
                      <Input
                        type="number"
                        placeholder="100"
                        className="dashboard-welcome-input"
                        value={formData.totalChannels || ""}
                        onChange={(e) => setFormData({ ...formData, totalChannels: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                    <div>
                      <Label className="dashboard-welcome-text">Pay Channels *</Label>
                      <Input
                        type="number"
                        placeholder="80"
                        className="dashboard-welcome-input"
                        value={formData.payChannels || ""}
                        onChange={(e) => setFormData({ ...formData, payChannels: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                    <div>
                      <Label className="dashboard-welcome-text">Free to Air *</Label>
                      <Input
                        type="number"
                        placeholder="100"
                        className="dashboard-welcome-input"
                        value={formData.freeToAirChannels || ""}
                        onChange={(e) => setFormData({ ...formData, freeToAirChannels: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="dashboard-welcome-text">LCO Margin % *</Label>
                      <Input
                        type="number"
                        placeholder="10"
                        className="dashboard-welcome-input"
                        value={formData.lcoMarginPercent || ""}
                        onChange={(e) => setFormData({ ...formData, lcoMarginPercent: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                    <div>
                      <Label className="dashboard-welcome-text">Distributor Margin % *</Label>
                      <Input
                        type="number"
                        placeholder="5"
                        className="dashboard-welcome-input"
                        value={formData.distributorMarginPercent || ""}
                        onChange={(e) => setFormData({ ...formData, distributorMarginPercent: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                    <div>
                      <Label className="dashboard-welcome-text">Quality *</Label>
                      <Select value={formData.quality || ""} onValueChange={(value) => setFormData({ ...formData, quality: value })}>
                        <SelectTrigger className="dashboard-welcome-input">
                          <SelectValue placeholder="Select quality" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SD">SD</SelectItem>
                          <SelectItem value="HD">HD</SelectItem>
                          <SelectItem value="Mixed">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="dashboard-welcome-text">Plan Type *</Label>
                    <Select value={formData.planType || ""} onValueChange={(value) => setFormData({ ...formData, planType: value })}>
                      <SelectTrigger className="dashboard-welcome-input">
                        <SelectValue placeholder="Select plan type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="starter">Starter</SelectItem>
                        <SelectItem value="lite">Lite</SelectItem>
                        <SelectItem value="popular">Popular</SelectItem>
                        <SelectItem value="family">Family</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="dashboard-welcome-text">Channel List *</Label>
                    <Textarea
                      placeholder="Enter channel names separated by commas (e.g., Start Plus, Zee Plus, Sony Entertainment)"
                      className="dashboard-welcome-input"
                      value={formData.channelList || ""}
                      onChange={(e) => setFormData({ ...formData, channelList: e.target.value })}
                      required
                    />
                    <p className="text-xs dashboard-welcome-muted mt-1">
                      Separate multiple channels with commas
                    </p>
                  </div>
                </div>
              )}

              {/* OTT Specific Fields */}
              {selectedPlanTypeForAdd === "ott" && (
                <div className="space-y-4 p-4 dashboard-stats-card rounded-lg">
                  <h3 className="dashboard-welcome-text font-semibold flex items-center gap-2">
                    <PlayCircle className="h-4 w-4" />
                    OTT Plan Details
                  </h3>
                  <div>
                    <Label className="dashboard-welcome-text">Plan Title</Label>
                    <Input
                      placeholder="e.g., Fibre Premium Plus OTT 1599"
                      className="dashboard-welcome-input"
                      value={formData.title || ""}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="dashboard-welcome-text">Price</Label>
                    <Input
                      type="number"
                      placeholder="1599"
                      className="dashboard-welcome-input"
                      value={formData.price || ""}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="dashboard-welcome-text">Speed Before Limit</Label>
                      <Input
                        placeholder="1000 Mbps"
                        className="dashboard-welcome-input"
                        value={formData.speedBeforeLimit || ""}
                        onChange={(e) => setFormData({ ...formData, speedBeforeLimit: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="dashboard-welcome-text">Speed After Limit</Label>
                      <Input
                        placeholder="4 Mbps"
                        className="dashboard-welcome-input"
                        value={formData.speedAfterLimit || ""}
                        onChange={(e) => setFormData({ ...formData, speedAfterLimit: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="dashboard-welcome-text">Data Limit (GB)</Label>
                      <Input
                        type="number"
                        placeholder="3000"
                        className="dashboard-welcome-input"
                        value={formData.dataLimitGB || ""}
                        onChange={(e) => setFormData({ ...formData, dataLimitGB: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label className="dashboard-welcome-text">Validity</Label>
                      <Input
                        placeholder="1 Month"
                        className="dashboard-welcome-input"
                        value={formData.validity || ""}
                        onChange={(e) => setFormData({ ...formData, validity: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <Checkbox
                        checked={formData.isUnlimited || false}
                        onCheckedChange={(checked) => setFormData({ ...formData, isUnlimited: checked })}
                      />
                      <Label className="dashboard-welcome-text">Unlimited</Label>
                    </div>
                  </div>
                  <div>
                    <Label className="dashboard-welcome-text">Call Benefits</Label>
                    <Input
                      placeholder="Unlimited calls to any Network"
                      className="dashboard-welcome-input"
                      value={formData.callBenefit || ""}
                      onChange={(e) => setFormData({ ...formData, callBenefit: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="dashboard-welcome-text">OTT Apps (comma separated)</Label>
                    <Textarea
                      placeholder="Hotstar, Hungama, Shemaroo, Lionsgate..."
                      className="dashboard-welcome-input"
                      value={formData.ottApps?.join(", ") || ""}
                      onChange={(e) => setFormData({ ...formData, ottApps: e.target.value.split(", ").filter(a => a.trim()) })}
                    />
                  </div>
                  <div>
                    <Label className="dashboard-welcome-text">Provider</Label>
                    <Input
                      placeholder="e.g., My Internet"
                      className="dashboard-welcome-input"
                      value={formData.provider || ""}
                      onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="dashboard-welcome-text">Description</Label>
                    <Textarea
                      placeholder="e.g., Up to 100 Mbps till 3000 GB, 100 Mbps beyond. Free access to 3 OTT platforms."
                      className="dashboard-welcome-input"
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Fibre Specific Fields */}
              {selectedPlanTypeForAdd === "fibre" && (
                <div className="space-y-4 p-4 dashboard-stats-card rounded-lg">
                  <h3 className="dashboard-welcome-text font-semibold flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Fibre Plan Details
                  </h3>
                  <div>
                    <Label className="dashboard-welcome-text">Plan Title</Label>
                    <Input
                      placeholder="e.g., JioFiber Gold Plan - 1 Year"
                      className="dashboard-welcome-input"
                      value={formData.title || ""}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="dashboard-welcome-text">Speed</Label>
                      <Input
                        placeholder="300 Mbps"
                        className="dashboard-welcome-input"
                        value={formData.speed || ""}
                        onChange={(e) => setFormData({ ...formData, speed: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="dashboard-welcome-text">Validity</Label>
                      <Input
                        placeholder="12 Months"
                        className="dashboard-welcome-input"
                        value={formData.validity || ""}
                        onChange={(e) => setFormData({ ...formData, validity: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="dashboard-welcome-text">Data Limit</Label>
                      <Input
                        placeholder="Unlimited"
                        className="dashboard-welcome-input"
                        value={formData.dataLimit || ""}
                        onChange={(e) => setFormData({ ...formData, dataLimit: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="dashboard-welcome-text">Plan Type</Label>
                    <Select value={formData.planType || ""} onValueChange={(value) => setFormData({ ...formData, planType: value })}>
                      <SelectTrigger className="dashboard-welcome-input">
                        <SelectValue placeholder="Select plan type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Basic">Basic</SelectItem>
                        <SelectItem value="Standard">Standard</SelectItem>
                        <SelectItem value="Premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="dashboard-welcome-text">Benefits *</Label>
                    <Textarea
                      placeholder="Enter benefits separated by commas (e.g., Netflix, Prime, Disney+, Hotstar, Unlimited Calls)"
                      className="dashboard-welcome-input"
                      value={formData.benefits || ""}
                      onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                      required
                    />
                    <p className="text-xs dashboard-welcome-muted mt-1">
                      Separate multiple benefits with commas. Examples: Netflix, Prime, Disney+, Hotstar, Unlimited Calls
                    </p>
                  </div>
                </div>
              )}

              {/* Common Description */}
              <div>
                <Label className="dashboard-welcome-text">Description</Label>
                <Textarea
                  placeholder="Plan description..."
                  className="dashboard-welcome-input"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Logo Upload */}
              <div className="space-y-4">
                <Label className="dashboard-welcome-text text-lg font-semibold">Provider Logo</Label>

                {!logoPreview ? (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-12 w-12 rounded-full dashboard-welcome-icon flex items-center justify-center">
                        <Upload className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="dashboard-welcome-text font-medium">Upload provider logo</p>
                        <p className="text-sm dashboard-welcome-muted">PNG, JPG, GIF up to 10MB</p>
                      </div>
                      <label className="cursor-pointer">
                        <span className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                          <Image className="h-4 w-4 mr-2" />
                          Choose File
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileUpload}
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="relative inline-block">
                    <div className="dashboard-stats-card rounded-lg p-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="h-16 w-16 object-cover rounded-lg border dashboard-welcome-muted"
                        />
                        <div className="flex-1">
                          <p className="dashboard-welcome-text font-medium">
                            {logoFile?.name}
                          </p>
                          <p className="text-sm dashboard-welcome-muted">
                            {logoFile ? (logoFile.size / 1024 / 1024).toFixed(2) : '0'} MB
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={removeUploadedFile}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddPlan}
                  className="dashboard-stats-card"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      <span className="dashboard-welcome-text">Adding Plan...</span>
                    </>
                  ) : (
                    <span className="dashboard-welcome-text">Add Plan</span>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Plan Dialog */}
        <Dialog open={showEditDialog} onOpenChange={(open) => {
          setShowEditDialog(open);
          if (!open) {
            setEditingPlan(null);
            setFormData({});
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto dashboard-chart-card">
            <DialogHeader>
              <DialogTitle className="dashboard-welcome-text flex items-center gap-2">
                <Edit className="h-5 w-5 dashboard-welcome-icon" />
                Edit {editingPlan?.name || editingPlan?.title || 'Plan'}
                {isSubmitting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 ml-2"></div>
                )}
              </DialogTitle>
            </DialogHeader>
            {editingPlan && (
              <div className="space-y-6">
                {/* Common Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="dashboard-welcome-text">Provider</Label>
                    <Input
                      value={formData.provider || ""}
                      className="dashboard-welcome-input"
                      onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="dashboard-welcome-text">Price (₹)</Label>
                    <Input
                      type="number"
                      value={formData.price || ""}
                      className="dashboard-welcome-input"
                      onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                {/* IPTV Fields */}
                {editingPlan.hasOwnProperty('totalChannels') && (
                  <div className="space-y-4 p-4 dashboard-stats-card rounded-lg">
                    <h3 className="dashboard-welcome-text font-semibold flex items-center gap-2">
                      <Tv className="h-4 w-4" />
                      IPTV Plan Details
                    </h3>
                    <div>
                      <Label className="dashboard-welcome-text">Plan Name</Label>
                      <Input
                        value={formData.name || ""}
                        className="dashboard-welcome-input"
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="dashboard-welcome-text">Total Channels</Label>
                        <Input
                          type="number"
                          value={formData.totalChannels || ""}
                          className="dashboard-welcome-input"
                          onChange={(e) => setFormData({ ...formData, totalChannels: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label className="dashboard-welcome-text">Pay Channels</Label>
                        <Input
                          type="number"
                          value={formData.payChannels || ""}
                          className="dashboard-welcome-input"
                          onChange={(e) => setFormData({ ...formData, payChannels: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label className="dashboard-welcome-text">Free to Air</Label>
                        <Input
                          type="number"
                          value={formData.freeToAirChannels || ""}
                          className="dashboard-welcome-input"
                          onChange={(e) => setFormData({ ...formData, freeToAirChannels: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="dashboard-welcome-text">LCO Margin %</Label>
                        <Input
                          type="number"
                          value={formData.lcoMarginPercent || ""}
                          className="dashboard-welcome-input"
                          onChange={(e) => setFormData({ ...formData, lcoMarginPercent: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label className="dashboard-welcome-text">Distributor Margin %</Label>
                        <Input
                          type="number"
                          value={formData.distributorMarginPercent || ""}
                          className="dashboard-welcome-input"
                          onChange={(e) => setFormData({ ...formData, distributorMarginPercent: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label className="dashboard-welcome-text">Quality *</Label>
                        <Select value={formData.quality || ""} onValueChange={(value) => setFormData({ ...formData, quality: value })}>
                          <SelectTrigger className="dashboard-welcome-input">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SD">SD</SelectItem>
                            <SelectItem value="HD">HD</SelectItem>
                            <SelectItem value="Mixed">Mixed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label className="dashboard-welcome-text">Plan Type *</Label>
                      <Select value={formData.planType || ""} onValueChange={(value) => setFormData({ ...formData, planType: value })}>
                        <SelectTrigger className="dashboard-welcome-input">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="starter">Starter</SelectItem>
                          <SelectItem value="lite">Lite</SelectItem>
                          <SelectItem value="popular">Popular</SelectItem>
                          <SelectItem value="family">Family</SelectItem>
                          <SelectItem value="vip">VIP</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="dashboard-welcome-text">Channel List *</Label>
                      <Textarea
                        value={formData.channelList || ""}
                        className="dashboard-welcome-input"
                        onChange={(e) => setFormData({ ...formData, channelList: e.target.value })}
                        placeholder="Enter channel names separated by commas"
                        required
                      />
                      <p className="text-xs dashboard-welcome-muted mt-1">
                        Separate multiple channels with commas
                      </p>
                    </div>
                  </div>
                )}

                {/* OTT Fields */}
                {editingPlan.hasOwnProperty('speedBeforeLimit') && (
                  <div className="space-y-4 p-4 dashboard-stats-card rounded-lg">
                    <h3 className="dashboard-welcome-text font-semibold flex items-center gap-2">
                      <PlayCircle className="h-4 w-4" />
                      OTT Plan Details
                    </h3>
                    <div>
                      <Label className="dashboard-welcome-text">Plan Title</Label>
                      <Input
                        value={formData.title || ""}
                        className="dashboard-welcome-input"
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="dashboard-welcome-text">Price</Label>
                      <Input
                        type="number"
                        value={formData.price || ""}
                        className="dashboard-welcome-input"
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="dashboard-welcome-text">Speed Before Limit</Label>
                        <Input
                          value={formData.speedBeforeLimit || ""}
                          className="dashboard-welcome-input"
                          onChange={(e) => setFormData({ ...formData, speedBeforeLimit: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="dashboard-welcome-text">Speed After Limit</Label>
                        <Input
                          value={formData.speedAfterLimit || ""}
                          className="dashboard-welcome-input"
                          onChange={(e) => setFormData({ ...formData, speedAfterLimit: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="dashboard-welcome-text">Data Limit (GB)</Label>
                        <Input
                          type="number"
                          value={formData.dataLimitGB || ""}
                          className="dashboard-welcome-input"
                          onChange={(e) => setFormData({ ...formData, dataLimitGB: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label className="dashboard-welcome-text">Validity</Label>
                        <Input
                          value={formData.validity || ""}
                          className="dashboard-welcome-input"
                          onChange={(e) => setFormData({ ...formData, validity: e.target.value })}
                        />
                      </div>
                      <div className="flex items-center space-x-2 pt-6">
                        <Checkbox
                          checked={formData.isUnlimited || false}
                          onCheckedChange={(checked) => setFormData({ ...formData, isUnlimited: checked })}
                        />
                        <Label className="dashboard-welcome-text">Unlimited</Label>
                      </div>
                    </div>
                    <div>
                      <Label className="dashboard-welcome-text">Call Benefits</Label>
                      <Input
                        value={formData.callBenefit || ""}
                        className="dashboard-welcome-input"
                        onChange={(e) => setFormData({ ...formData, callBenefit: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="dashboard-welcome-text">OTT Apps (comma separated)</Label>
                      <Textarea
                        value={formData.ottApps?.join(", ") || ""}
                        className="dashboard-welcome-input"
                        onChange={(e) => setFormData({ ...formData, ottApps: e.target.value.split(", ").filter(a => a.trim()) })}
                      />
                    </div>
                    <div>
                      <Label className="dashboard-welcome-text">Provider</Label>
                      <Input
                        value={formData.provider || ""}
                        className="dashboard-welcome-input"
                        onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="dashboard-welcome-text">Description</Label>
                      <Textarea
                        value={formData.description || ""}
                        className="dashboard-welcome-input"
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* Fibre Fields */}
                {editingPlan.hasOwnProperty('speed') && !editingPlan.hasOwnProperty('speedBeforeLimit') && (
                  <div className="space-y-4 p-4 dashboard-stats-card rounded-lg">
                    <h3 className="dashboard-welcome-text font-semibold flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Fibre Plan Details
                    </h3>
                    <div>
                      <Label className="dashboard-welcome-text">Plan Title</Label>
                      <Input
                        value={formData.title || ""}
                        className="dashboard-welcome-input"
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="dashboard-welcome-text">Price</Label>
                      <Input
                        type="number"
                        value={formData.price || ""}
                        className="dashboard-welcome-input"
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="dashboard-welcome-text">Speed</Label>
                        <Input
                          value={formData.speed || ""}
                          className="dashboard-welcome-input"
                          onChange={(e) => setFormData({ ...formData, speed: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="dashboard-welcome-text">Validity</Label>
                        <Input
                          value={formData.validity || ""}
                          className="dashboard-welcome-input"
                          onChange={(e) => setFormData({ ...formData, validity: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="dashboard-welcome-text">Data Limit</Label>
                        <Input
                          value={formData.dataLimit || ""}
                          className="dashboard-welcome-input"
                          onChange={(e) => setFormData({ ...formData, dataLimit: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="dashboard-welcome-text">Plan Type</Label>
                      <Select value={formData.planType || ""} onValueChange={(value) => setFormData({ ...formData, planType: value })}>
                        <SelectTrigger className="dashboard-welcome-input">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Basic">Basic</SelectItem>
                          <SelectItem value="Standard">Standard</SelectItem>
                          <SelectItem value="Premium">Premium</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="dashboard-welcome-text">Benefits *</Label>
                      <Textarea
                        value={formData.benefits || ""}
                        className="dashboard-welcome-input"
                        onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                        placeholder="Enter benefits separated by commas"
                        required
                      />
                      <p className="text-xs dashboard-welcome-muted mt-1">
                        Separate multiple benefits with commas
                      </p>
                    </div>
                  </div>
                )}

                {/* Common Fields */}
                <div>
                  <Label className="dashboard-welcome-text">Description</Label>
                  <Textarea
                    value={formData.description || ""}
                    className="dashboard-welcome-input"
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* Logo Upload for Edit */}
                <div className="space-y-4">
                  <Label className="dashboard-welcome-text text-lg font-semibold">Provider Logo</Label>

                  {!logoPreview && !formData.logo ? (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                      <div className="flex flex-col items-center gap-4">
                        <div className="h-12 w-12 rounded-full dashboard-welcome-icon flex items-center justify-center">
                          <Upload className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="dashboard-welcome-text font-medium">Upload new logo</p>
                          <p className="text-sm dashboard-welcome-muted">PNG, JPG, GIF up to 10MB</p>
                        </div>
                        <label className="cursor-pointer">
                          <span className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                            <Image className="h-4 w-4 mr-2" />
                            Choose File
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileUpload}
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="relative inline-block">
                      <div className="dashboard-stats-card rounded-lg p-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={logoPreview || `${BASE_URL}${formData.logo}`}
                            alt="Logo preview"
                            className="h-16 w-16 object-cover rounded-lg border dashboard-welcome-muted"
                          />
                          <div className="flex-1">
                            <p className="dashboard-welcome-text font-medium">
                              {logoFile?.name || 'Current logo'}
                            </p>
                            <p className="text-sm dashboard-welcome-muted">
                              {logoFile ? (logoFile.size / 1024 / 1024).toFixed(2) + ' MB' : 'Existing file'}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <label className="cursor-pointer">
                              <span className="inline-flex items-center px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm transition-colors">
                                Change
                              </span>
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileUpload}
                              />
                            </label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={removeUploadedFile}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.isActive !== undefined ? formData.isActive : true}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label className="dashboard-welcome-text">Active Plan</Label>
                </div>

                <div className="flex justify-end gap-4">
                  <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdatePlan} className="dashboard-stats-card" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <span className="dashboard-welcome-text">Save Changes</span>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog && !!deletingPlan} onOpenChange={(open) => {
          setShowDeleteDialog(open);
          if (!open) {
            setDeletingPlan(null);
          }
        }}>
          <DialogContent className="max-w-md dashboard-chart-card">
            <DialogHeader>
              <DialogTitle className="dashboard-welcome-text flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-500" />
                Delete Plan
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-950/20 flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold dashboard-welcome-text mb-2">
                  Are you sure you want to delete this plan?
                </h3>
                <p className="dashboard-welcome-muted">
                  This action cannot be undone. The plan "{deletingPlan ? (deletingPlan.name || deletingPlan.title || 'Plan') : 'Plan'}" will be permanently removed.
                </p>
              </div>

              {deletingPlan && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg overflow-hidden">
                      {deletingPlan.logo ? (
                        <img
                          src={`${BASE_URL}${deletingPlan.logo}`}
                          alt="Plan logo"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full dashboard-welcome-icon flex items-center justify-center">
                          {getPlanTypeIcon(detectPlanType(deletingPlan))}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium dashboard-welcome-text">
                        {deletingPlan.name || deletingPlan.title || 'Plan'}
                      </p>
                      <p className="text-sm dashboard-welcome-muted">
                        {deletingPlan.provider || 'Provider'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Plan
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}