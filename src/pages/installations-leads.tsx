import { useState, useMemo, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parseISO, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";
import {
  HardHat,
  Phone,
  MessageCircle,
  Mail,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  BarChart3,
  Users,
  TrendingUp,
  CalendarIcon,
  MapPin,
  Building,
  Target,
  Star,
  Zap,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  dummyNewInstallations, 
  dummyLeads, 
  dummyApplicationForms, 
  dummyWifiInstallationRequests, 
  dummyEngineers,
  type NewInstallation, 
  type Lead,
  type ApplicationForm,
  type WifiInstallationRequest 
} from "@/lib/dummyData";
import { cn } from "@/lib/utils";
import { api } from "@/api/index";

export default function InstallationsLeads() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<{ from?: Date; to?: Date }>({});
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [installations, setInstallations] = useState(dummyNewInstallations);
  const [leads, setLeads] = useState(dummyLeads);
  const [applicationForms] = useState(dummyApplicationForms);
  const [installationRequests] = useState(dummyWifiInstallationRequests);
  const [showNewInstallationForm, setShowNewInstallationForm] = useState(false);
  const [showNewLeadForm, setShowNewLeadForm] = useState(false);
  const [showEngineerAssignmentModal, setShowEngineerAssignmentModal] = useState(false);
  const [showInstallationRequestModal, setShowInstallationRequestModal] = useState(false);
  const [selectedInstallationRequest, setSelectedInstallationRequest] = useState<any>(null);
  const [selectedEngineer, setSelectedEngineer] = useState("");
  const [assignmentRemarks, setAssignmentRemarks] = useState("");
  const [isEngineerSelected, setIsEngineerSelected] = useState(false);
  const { data: applications, isLoading: applicationsLoading, error: applicationsError } = api.useGetAllApplicationsQuery({});
  const { data: installationRequestsData, isLoading: installationRequestsLoading, error: installationRequestsError } = api.useGetAllInstallationRequestsQuery({});
  const { data: engineers, isLoading: engineersLoading, error: engineersError } = api.useGetEngineersQuery({});
  const [updateApplicationStatus] = api.useUpdateApplicationStatusMutation();
  const [updateInstallationRequestStatus] = api.useUpdateInstallationRequestStatusMutation();

  console.log("applications", applications);
  console.log("installation requests", installationRequestsData);
  console.log("engineers", engineers);
  

  // Transform API applications data to match our structure
  const transformedApplications = useMemo(() => {
    if (!applications?.data) return [];
    
    return applications.data.map((app: any) => ({
      id: app._id,
      applicationId: app.applicationId,
      name: app.name,
      applicationType: 'WiFi',
      status: app.status,
      phoneNumber: app.phoneNumber,
      countryCode: app.countryCode,
      alternatePhoneNumber: app.alternatePhoneNumber,
      alternateCountryCode: app.alternateCountryCode,
      address: app.address,
      village: app.village,
      pincode: app.pincode,
      remarks: `Plan: ${app.planId?.title || 'N/A'}, Price: ₹${app.planId?.price || 'N/A'}`,
      planId: app.planId?._id,
      userId: app.userId?._id,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      acceptedAt: app.status === 'accept' ? app.updatedAt : undefined,
      rejectedAt: app.rejectedAt,
      // Additional fields for future OTT and IPTV
      applicationCategory: 'wifi', // wifi, ott, iptv
      provider: app.planId?.provider || 'Unknown',
      planDetails: app.planId,
      userDetails: app.userId
    }));
  }, [applications]);

  // Transform API installation requests data to match our structure
  const transformedInstallationRequests = useMemo(() => {
    if (!installationRequestsData?.data?.requests) return [];
    
    return installationRequestsData.data.requests.map((req: any) => ({
      id: req._id,
      name: req.name,
      email: req.email,
      phoneNumber: req.phoneNumber,
      countryCode: req.countryCode,
      alternatePhoneNumber: req.alternatePhoneNumber,
      alternateCountryCode: req.alternateCountryCode,
      status: req.status,
      createdAt: req.createdAt,
      updatedAt: req.updatedAt,
      approvedDate: req.approvedDate,
      assignedEngineer: req.assignedEngineer,
      remarks: req.remarks,
      aadhaarFrontUrl: req.aadhaarFrontUrl,
      aadhaarBackUrl: req.aadhaarBackUrl,
      passportPhotoUrl: req.passportPhotoUrl,
      applicationId: req.applicationId,
      userId: req.userId,
      // Additional display properties
      displayId: `INST-REQ-${req._id.slice(-6)}`,
      displayType: 'WiFi Installation',
      displayContact: req.phoneNumber,
      displayAddress: req.applicationId?.address || 'N/A',
      displayVillage: req.applicationId?.village || 'N/A',
      displayPincode: req.applicationId?.pincode || 'N/A',
      displayRemarks: req.remarks || 'No remarks',
      displayAcceptedAt: req.approvedDate,
      displayRejectedAt: undefined,
      displayPlanId: req.applicationId?._id,
      displayUserId: req.userId?._id,
      displayCountryCode: req.countryCode,
      displayAlternatePhone: req.alternatePhoneNumber,
      displayAlternateCountryCode: req.alternateCountryCode,
      displayEngineer: req.assignedEngineer?._id,
      displayInstallationDate: undefined,
      displayCompletedDate: undefined,
      displayAadhaarFront: req.aadhaarFrontUrl,
      displayAadhaarBack: req.aadhaarBackUrl,
      displayPassportPhoto: req.passportPhotoUrl,
      displayPriority: undefined,
      displayEstimatedCost: undefined,
      displayPreferredPlan: undefined,
      displayScheduledDate: undefined,
    }));
  }, [installationRequestsData]);





  // Action handlers for installations
  const updateInstallationStatus = (id: number, status: 'pending' | 'confirmed' | 'rejected') => {
    setInstallations(prev => prev.map(installation => 
      installation.id === id 
        ? { ...installation, status, updatedAt: new Date().toISOString() }
        : installation
    ));
  };

  // Action handlers for leads
  const updateLeadStatus = (id: number, status: 'new' | 'contacted' | 'qualified' | 'converted' | 'closed') => {
    setLeads(prev => prev.map(lead => 
      lead.id === id 
        ? { ...lead, status, updatedAt: new Date().toISOString() }
        : lead
    ));
  };

  // Engineer assignment handler
  const handleEngineerAssignment = async () => {
    if (!selectedInstallationRequest || !selectedEngineer) {
      alert("Please select an engineer and provide remarks");
      return;
    }

    try {
      await updateInstallationRequestStatus({
        id: selectedInstallationRequest.id,
        status: "approved",
        remarks: assignmentRemarks || "Engineer assigned for installation",
        assignedEngineer: selectedEngineer
      });
      
      console.log("Installation request approved and engineer assigned:", selectedInstallationRequest.id);
      alert("Engineer assigned successfully!");
      
      // Reset modal state
      setShowEngineerAssignmentModal(false);
      setShowInstallationRequestModal(false);
      setSelectedInstallationRequest(null);
      setSelectedEngineer("");
      setAssignmentRemarks("");
      setIsEngineerSelected(false);
    } catch (error) {
      console.error("Error assigning engineer:", error);
      alert("Error assigning engineer. Please try again.");
    }
  };

  // Reject installation request handler
  const handleRejectInstallationRequest = async () => {
    if (!selectedInstallationRequest) {
      alert("No installation request selected");
      return;
    }

    try {
      await updateInstallationRequestStatus({
        id: selectedInstallationRequest.id,
        status: "rejected",
        remarks: "Installation request rejected",
        assignedEngineer: null
      });
      
      console.log("Installation request rejected:", selectedInstallationRequest.id);
      alert("Installation request rejected successfully!");
      
      // Reset modal state
      setShowInstallationRequestModal(false);
      setSelectedInstallationRequest(null);
      setSelectedEngineer("");
      setAssignmentRemarks("");
      setIsEngineerSelected(false);
    } catch (error) {
      console.error("Error rejecting installation request:", error);
      alert("Error rejecting installation request. Please try again.");
    }
  };

  // Handle engineer selection
  const handleEngineerSelection = (engineerId: string) => {
    setSelectedEngineer(engineerId);
    setIsEngineerSelected(true);
    setShowEngineerAssignmentModal(false);
  };

  // Helper functions for application forms and installation requests
  const getStatusColor = (status: string) => {
    switch (status) {
      case "inreview": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "accept": case "approved": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "reject": case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "new": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "contacted": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "converted": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "fibre": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "ott": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "iptv": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getEngineerName = (engineerId: number) => {
    const engineer = dummyEngineers.find(e => e.id === engineerId);
    return engineer ? engineer.name : "Unassigned";
  };

  // Filter installations
  const filteredInstallations = useMemo(() => {
    return installations.filter((installation) => {
      const matchesSearch = 
        installation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        installation.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        installation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        installation.phone.includes(searchTerm);

      const matchesStatus = statusFilter === "all" || installation.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || installation.priority === priorityFilter;
      
      let matchesDate = true;
      if (dateFilter.from && dateFilter.to) {
        const installationDate = parseISO(installation.createdAt);
        const fromDate = startOfDay(dateFilter.from);
        const toDate = endOfDay(dateFilter.to);
        matchesDate = isAfter(installationDate, fromDate) && isBefore(installationDate, toDate);
      }

      return matchesSearch && matchesStatus && matchesPriority && matchesDate;
    });
  }, [searchTerm, statusFilter, priorityFilter, dateFilter]);

  // Filter leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch = 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm) ||
        (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      const matchesSource = sourceFilter === "all" || lead.source === sourceFilter;
      const matchesPriority = priorityFilter === "all" || lead.priority === priorityFilter;
      
      let matchesDate = true;
      if (dateFilter.from && dateFilter.to) {
        const leadDate = parseISO(lead.createdAt);
        const fromDate = startOfDay(dateFilter.from);
        const toDate = endOfDay(dateFilter.to);
        matchesDate = isAfter(leadDate, fromDate) && isBefore(leadDate, toDate);
      }

      return matchesSearch && matchesStatus && matchesSource && matchesPriority && matchesDate;
    });
  }, [searchTerm, statusFilter, sourceFilter, priorityFilter, dateFilter]);

  // Filter all installation forms
  const filteredAllInstallationForms = useMemo(() => {
    const allForms = [
      // WiFi Applications from API
      ...transformedApplications.map((form: any) => ({
        ...form,
        type: 'wifi_application',
        displayName: form.name,
        displayId: form.applicationId,
        displayType: 'WiFi',
        displayStatus: form.status,
        displayDate: form.createdAt,
        displayContact: form.phoneNumber,
        displayAddress: form.address,
        displayVillage: form.village,
        displayPincode: form.pincode,
        displayRemarks: form.remarks,
        displayAcceptedAt: form.acceptedAt,
        displayRejectedAt: form.rejectedAt,
        displayPlanId: form.planId,
        displayUserId: form.userId,
        displayCountryCode: form.countryCode,
        displayAlternatePhone: form.alternatePhoneNumber,
        displayAlternateCountryCode: form.alternateCountryCode,
        displayEngineer: undefined,
        displayInstallationDate: undefined,
        displayCompletedDate: undefined,
        displayPriority: undefined,
        displayEstimatedCost: undefined,
        displayPreferredPlan: undefined,
        displayScheduledDate: undefined,
        displayAadhaarFront: undefined,
        displayAadhaarBack: undefined,
        displayPassportPhoto: undefined,
      })),
      // Installation Requests from API
      ...transformedInstallationRequests.map((req: any) => ({
        ...req,
        type: 'installation_request',
        displayName: req.name,
        displayId: req.displayId,
        displayType: req.displayType,
        displayStatus: req.status,
        displayDate: req.createdAt,
        displayContact: req.phoneNumber,
        displayAddress: req.displayAddress,
        displayVillage: req.displayVillage,
        displayPincode: req.displayPincode,
        displayRemarks: req.displayRemarks,
        displayAcceptedAt: req.displayAcceptedAt,
        displayRejectedAt: req.displayRejectedAt,
        displayPlanId: req.displayPlanId,
        displayUserId: req.displayUserId,
        displayCountryCode: req.displayCountryCode,
        displayAlternatePhone: req.displayAlternatePhone,
        displayAlternateCountryCode: req.displayAlternateCountryCode,
        displayEngineer: req.displayEngineer,
        displayInstallationDate: req.displayInstallationDate,
        displayCompletedDate: req.displayCompletedDate,
        displayAadhaarFront: req.displayAadhaarFront,
        displayAadhaarBack: req.displayAadhaarBack,
        displayPassportPhoto: req.displayPassportPhoto,
        displayPriority: req.displayPriority,
        displayEstimatedCost: req.displayEstimatedCost,
        displayPreferredPlan: req.displayPreferredPlan,
        displayScheduledDate: req.displayScheduledDate,
      })),
      // Dummy installation requests (fallback)
      ...installationRequests.map(req => ({
        ...req,
        type: 'installation_request_dummy',
        displayName: req.name,
        displayId: `REQ-${req.id}`,
        displayType: req.installationType,
        displayStatus: req.status,
        displayDate: req.createdAt,
        displayContact: req.phoneNumber,
        displayAddress: req.email, // Using email as address for requests
        displayVillage: '',
        displayPincode: '',
        displayRemarks: req.remarks,
        displayAcceptedAt: req.approvedDate,
        displayRejectedAt: '',
        displayPlanId: req.applicationId,
        displayUserId: req.userId,
        displayCountryCode: req.countryCode,
        displayAlternatePhone: req.alternatePhoneNumber,
        displayAlternateCountryCode: req.alternateCountryCode,
        displayEngineer: req.assignedEngineer,
        displayInstallationDate: req.installationDate,
        displayCompletedDate: req.completedDate,
        displayAadhaarFront: req.aadhaarFrontUrl,
        displayAadhaarBack: req.aadhaarBackUrl,
        displayPassportPhoto: req.passportPhotoUrl,
        displayPriority: undefined,
        displayEstimatedCost: undefined,
        displayPreferredPlan: undefined,
        displayScheduledDate: undefined,
      })),
      ...installations.map(inst => ({
        ...inst,
        type: 'new_installation',
        displayName: inst.customerName,
        displayId: `INST-${inst.id}`,
        displayType: inst.requestType,
        displayStatus: inst.status,
        displayDate: inst.createdAt,
        displayContact: inst.phone,
        displayAddress: inst.address,
        displayVillage: inst.location,
        displayPincode: '',
        displayRemarks: inst.notes,
        displayAcceptedAt: inst.installationDate,
        displayRejectedAt: inst.rejectionReason,
        displayPlanId: null,
        displayUserId: null,
        displayCountryCode: '',
        displayAlternatePhone: inst.alternatePhone,
        displayAlternateCountryCode: '',
        displayEngineer: inst.assignedEngineerId,
        displayInstallationDate: inst.installationDate,
        displayCompletedDate: inst.updatedAt,
        displayAadhaarFront: inst.aadharFront,
        displayAadhaarBack: inst.aadharBack,
        displayPassportPhoto: inst.passportPhoto,
        displayPriority: inst.priority,
        displayEstimatedCost: inst.estimatedCost,
        displayPreferredPlan: inst.preferredPlan,
        displayScheduledDate: inst.scheduledDate,
      }))
    ];

    return allForms.filter((form) => {
      const matchesSearch = 
        form.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.displayContact.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.displayAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.displayId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || form.displayStatus === statusFilter;
      
      let matchesDate = true;
      if (dateFilter.from && dateFilter.to) {
        const formDate = parseISO(form.displayDate);
        const fromDate = startOfDay(dateFilter.from);
        const toDate = endOfDay(dateFilter.to);
        matchesDate = isAfter(formDate, fromDate) && isBefore(formDate, toDate);
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [searchTerm, statusFilter, dateFilter, transformedApplications, transformedInstallationRequests, installationRequests, installations]);

  // Analytics calculations
  const analytics = useMemo(() => {
    // Installation analytics
    const totalInstallations = dummyNewInstallations.length;
    const pendingInstallations = dummyNewInstallations.filter(i => i.status === "pending").length;
    const confirmedInstallations = dummyNewInstallations.filter(i => i.status === "confirmed").length;
    const rejectedInstallations = dummyNewInstallations.filter(i => i.status === "rejected").length;

    // Lead analytics
    const totalLeads = dummyLeads.length;
    const newLeads = dummyLeads.filter(l => l.status === "new").length;
    const contactedLeads = dummyLeads.filter(l => l.isContactedByManager).length;
    const convertedLeads = dummyLeads.filter(l => l.status === "converted").length;

    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads * 100).toFixed(1) : '0';
    const contactRate = totalLeads > 0 ? (contactedLeads / totalLeads * 100).toFixed(1) : '0';
    const installationSuccessRate = totalInstallations > 0 ? (confirmedInstallations / totalInstallations * 100).toFixed(1) : '0';

    return {
      totalInstallations,
      pendingInstallations,
      confirmedInstallations,
      rejectedInstallations,
      totalLeads,
      newLeads,
      contactedLeads,
      convertedLeads,
      conversionRate,
      contactRate,
      installationSuccessRate
    };
  }, []);

  const exportInstallationsToExcel = () => {
    const headers = ["ID", "Customer Name", "Email", "Phone", "Location", "Preferred Plan", "Request Type", "Status", "Priority", "Estimated Cost", "Created Date"];
    const csvContent = [
      headers.join(","),
      ...filteredInstallations.map(installation => [
        installation.id,
        `"${installation.customerName}"`,
        installation.email,
        installation.phone,
        `"${installation.location}"`,
        installation.preferredPlan || "N/A",
        installation.requestType,
        installation.status,
        installation.priority,
        installation.estimatedCost || "N/A",
        installation.createdAt
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `installations_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportLeadsToExcel = () => {
    const headers = ["ID", "Name", "Phone", "Email", "Address", "Location", "Source", "Status", "Priority", "Inquiry Type", "Contacted by Manager", "Created Date"];
    const csvContent = [
      headers.join(","),
      ...filteredLeads.map(lead => [
        lead.id,
        `"${lead.name}"`,
        lead.phone,
        lead.email || "N/A",
        `"${lead.address}"`,
        lead.location || "N/A",
        lead.source,
        lead.status,
        lead.priority,
        lead.inquiryType,
        lead.isContactedByManager ? "Yes" : "No",
        lead.createdAt
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string, type: "installation" | "lead") => {
    if (type === "installation") {
      switch (status) {
        case "pending":
          return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
        case "confirmed":
          return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>;
        case "rejected":
          return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
        default:
          return <Badge variant="outline">{status}</Badge>;
      }
    } else {
      const colors = {
        new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        contacted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        qualified: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        converted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        closed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      };
      return <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive">Urgent</Badge>;
      case "high":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">High</Badge>;
      case "medium":
        return <Badge variant="outline">Medium</Badge>;
      case "low":
        return <Badge variant="secondary" className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'ivr': return <Phone className="h-4 w-4" />;
      case 'whatsapp': return <MessageCircle className="h-4 w-4" />;
      case 'website': return <Mail className="h-4 w-4" />;
      case 'referral': return <Users className="h-4 w-4" />;
      case 'social_media': return <Target className="h-4 w-4" />;
      default: return <Phone className="h-4 w-4" />;
    }
  };

  return (
    <MainLayout title="New Installation & Leads">
      <div className="space-y-6">
        {/* Top Stats Row - All Data Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Application Forms Stats */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base lg:text-lg dashboard-card-title flex items-center">
                <HardHat className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                Application Forms
              </CardTitle>
              <CardDescription className="dashboard-text-muted text-xs lg:text-sm">
                Applications in review
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl lg:text-3xl font-bold text-blue-600">
                {applicationsLoading ? "..." : transformedApplications.filter((app: any) => app.status === 'inreview').length}
              </div>
              <div className="text-xs lg:text-sm text-gray-600 mt-1">
                {applicationsLoading ? "Loading..." : "In review applications"}
              </div>
              <div className="mt-3 space-y-2">
                                {transformedApplications.filter((app: any) => app.status === 'inreview').slice(0, 3).map((app: any) => (
                  <div key={app.id} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs lg:text-sm font-medium truncate">{app.name}</div>
                        <div className="text-xs text-gray-500">{app.applicationType}</div>
                      </div>
                      <Badge className={`${getStatusColor(app.status)} text-xs ml-2`}>
                      {app.status}
                    </Badge>
                  </div>
                    <div className="flex gap-1 mt-2">
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 h-6"
                        onClick={async () => {
                          try {
                            await updateApplicationStatus({ id: app.id, status: 'accept' });
                            console.log("Application accepted:", app.id);
                          } catch (error) {
                            console.error("Error accepting application:", error);
                          }
                        }}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Accept
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        className="text-xs px-2 py-1 h-6"
                        onClick={async () => {
                          try {
                            await updateApplicationStatus({ id: app.id, status: 'reject' });
                            console.log("Application rejected:", app.id);
                          } catch (error) {
                            console.error("Error rejecting application:", error);
                          }
                        }}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                  </div>
                </div>
              ))}
              </div>
            </CardContent>
          </Card>

                    {/* Installation Requests Stats */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base lg:text-lg dashboard-card-title flex items-center">
                <Building className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                Installation Requests
              </CardTitle>
              <CardDescription className="dashboard-text-muted text-xs lg:text-sm">
                Requests in review
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl lg:text-3xl font-bold text-green-600">
                {installationRequestsLoading ? "..." : transformedInstallationRequests.filter((req:any)=> req.status === 'approved').length}
              </div>
              <div className="text-xs lg:text-sm text-gray-600 mt-1">
                {installationRequestsLoading ? "Loading..." : "Approved requests"}
              </div>
              <div className="mt-3 space-y-2">
                {installationRequestsLoading ? (
                  <div className="text-xs text-gray-500">Loading installation requests...</div>
                ) : (
                  transformedInstallationRequests.slice(0, 3).map((req: any) => (
                    <div key={req.id} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs lg:text-sm font-medium truncate">{req.name}</div>
                          <div className="text-xs text-gray-500">{req.displayType}</div>
                        </div>
                        <Badge className={`${getStatusColor(req.status)} text-xs ml-2`}>
                          {req.status}
                        </Badge>
                      </div>
                      <div className="flex gap-1 mt-2">
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 h-6"
                          onClick={() => {
                            setSelectedInstallationRequest(req);
                            setShowInstallationRequestModal(true);
                          }}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className={`text-xs px-2 py-1 h-6 ${
                            req.status === 'approved' 
                              ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-500' 
                              : 'hover:bg-blue-50'
                          }`}
                          onClick={() => {
                            if (req.status !== 'approved') {
                              setSelectedInstallationRequest(req);
                              setShowInstallationRequestModal(true);
                            }
                          }}
                          disabled={req.status === 'approved'}
                        >
                          <HardHat className="h-3 w-3 mr-1" />
                          Assign
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* New Installations Stats */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base lg:text-lg dashboard-card-title flex items-center">
                <Zap className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                New Installations
              </CardTitle>
              <CardDescription className="dashboard-text-muted text-xs lg:text-sm">
                Customer installation requests
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl lg:text-3xl font-bold text-purple-600">{installations.length}</div>
              <div className="text-xs lg:text-sm text-gray-600 mt-1">
                {installations.filter(inst => inst.status === 'confirmed').length} confirmed
              </div>
              <div className="mt-3 space-y-2">
                {installations.slice(0, 3).map((inst) => (
                  <div key={inst.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs lg:text-sm font-medium truncate">{inst.customerName}</div>
                      <div className="text-xs text-gray-500">{inst.requestType}</div>
                    </div>
                    <Badge className={`${getStatusColor(inst.status)} text-xs ml-2`}>
                      {inst.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Leads Stats */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base lg:text-lg dashboard-card-title flex items-center">
                <Phone className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                Customer Leads
              </CardTitle>
              <CardDescription className="dashboard-text-muted text-xs lg:text-sm">
                Active leads and inquiries
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl lg:text-3xl font-bold text-orange-600">{leads.length}</div>
              <div className="text-xs lg:text-sm text-gray-600 mt-1">
                {leads.filter(lead => lead.isContactedByManager).length} contacted
              </div>
              <div className="mt-3 space-y-2">
                {leads.slice(0, 3).map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs lg:text-sm font-medium truncate">{lead.name}</div>
                      <div className="text-xs text-gray-500">{lead.source}</div>
                    </div>
                    <Badge className={`${getStatusColor(lead.status)} text-xs ml-2`}>
                      {lead.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Overview and Recent Activity Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Overview */}
          <Card className="dashboard-card shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base lg:text-lg dashboard-card-title flex items-center">
                <BarChart3 className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                Quick Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                  <div className="text-lg lg:text-xl font-bold dashboard-text">
                    {applicationsLoading ? "..." : transformedApplications.length}
                  </div>
                  <div className="text-xs dashboard-text-muted">
                    {applicationsLoading ? "Loading..." : "Applications"}
                  </div>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                  <div className="text-lg lg:text-xl font-bold dashboard-text">
                    {installationRequestsLoading ? "..." : transformedInstallationRequests.length}
                  </div>
                  <div className="text-xs dashboard-text-muted">
                    {installationRequestsLoading ? "Loading..." : "Requests"}
                  </div>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                  <div className="text-lg lg:text-xl font-bold dashboard-text">{installations.length}</div>
                  <div className="text-xs dashboard-text-muted">Installations</div>
                </div>
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
                  <div className="text-lg lg:text-xl font-bold dashboard-text">{leads.length}</div>
                  <div className="text-xs dashboard-text-muted">Leads</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="dashboard-card shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base lg:text-lg dashboard-card-title flex items-center">
                <Clock className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                                  {[...transformedApplications, ...transformedInstallationRequests, ...installationRequests, ...installations, ...leads]
                    .sort((a, b) => new Date(b.createdAt || b.updatedAt).getTime() - new Date(a.createdAt || a.updatedAt).getTime())
                    .slice(0, 5)
                    .map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs lg:text-sm font-medium truncate">
                            {'name' in item ? item.name : 'customerName' in item ? item.customerName : 'applicationId' in item ? (item as ApplicationForm).applicationId : 'New Entry'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {format(new Date(item.createdAt || item.updatedAt), "MMM dd, HH:mm")}
                          </div>
                        </div>
                      </div>
                    ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Tabs */}
        <div className="space-y-4 lg:space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">New Installation & Leads</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm lg:text-base">Manage installation requests and customer inquiries</p>
            </div>
          </div>

          <Tabs defaultValue="all-forms" className="space-y-4 lg:space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 h-auto p-1">
              <TabsTrigger value="all-forms" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm px-2 py-2 lg:px-3 lg:py-2">
                <HardHat className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="hidden sm:inline">All Forms</span>
                <span className="sm:hidden">Forms</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm px-2 py-2 lg:px-3 lg:py-2">
                <BarChart3 className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="hidden sm:inline">Analytics</span>
                <span className="sm:hidden">Stats</span>
              </TabsTrigger>
              <TabsTrigger value="installations" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm px-2 py-2 lg:px-3 lg:py-2">
                <Zap className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="hidden sm:inline">Installations</span>
                <span className="sm:hidden">Installs</span>
              </TabsTrigger>
              <TabsTrigger value="leads" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm px-2 py-2 lg:px-3 lg:py-2">
                <Phone className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="hidden sm:inline">Leads</span>
                <span className="sm:hidden">Leads</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all-forms" className="space-y-4 lg:space-y-6">
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <CardTitle className="text-lg lg:text-xl">All Installation Forms</CardTitle>
                      <CardDescription className="text-sm">Complete overview of all installation forms and requests</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => {
                        console.log("Exporting all installation forms data:", filteredAllInstallationForms);
                        // Export functionality can be added here
                      }} className="bg-green-600 hover:bg-green-700 text-white text-xs lg:text-sm px-3 py-2">
                        <Download className="mr-1 lg:mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                        Export Data
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <Input
                        placeholder="Search all forms..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm text-sm"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-[180px] text-sm">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="inreview">In Review</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="accept">Accepted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="reject">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="rounded-lg border overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50 dark:bg-gray-800">
                            <TableHead className="text-xs lg:text-sm font-medium">Form Type</TableHead>
                            <TableHead className="text-xs lg:text-sm font-medium">ID</TableHead>
                            <TableHead className="text-xs lg:text-sm font-medium">Customer</TableHead>
                            <TableHead className="text-xs lg:text-sm font-medium">Contact</TableHead>
                            <TableHead className="text-xs lg:text-sm font-medium">Type</TableHead>
                            <TableHead className="text-xs lg:text-sm font-medium">Status</TableHead>
                            <TableHead className="text-xs lg:text-sm font-medium">Address</TableHead>
                            <TableHead className="text-xs lg:text-sm font-medium">Created</TableHead>
                            <TableHead className="text-xs lg:text-sm font-medium">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {applicationsLoading || installationRequestsLoading ? (
                            <TableRow>
                              <TableCell colSpan={9} className="text-center py-8">
                                <div className="flex items-center justify-center">
                                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                  <span className="ml-2 text-sm text-gray-600">Loading data...</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : applicationsError || installationRequestsError ? (
                            <TableRow>
                              <TableCell colSpan={9} className="text-center py-8">
                                <div className="text-red-600 text-sm">
                                  Error loading data. Please refresh the page.
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredAllInstallationForms.map((form) => (
                            <TableRow key={`${form.type}-${form.id}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                              <TableCell className="py-3">
                                <Badge variant="outline" className="capitalize text-xs">
                                  {form.type.replace('_', ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-3">
                                <div className="font-medium text-xs lg:text-sm">{form.displayId}</div>
                              </TableCell>
                              <TableCell className="py-3">
                                <div>
                                  <div className="font-medium text-xs lg:text-sm">{form.displayName}</div>
                                  <div className="text-xs text-gray-500 hidden lg:block">{form.displayVillage || form.displayAddress}</div>
                                </div>
                              </TableCell>
                              <TableCell className="py-3">
                                <div>
                                  <div className="text-xs lg:text-sm">{form.displayContact}</div>
                                  {form.displayAlternatePhone && (
                                    <div className="text-xs text-gray-500 hidden lg:block">{form.displayAlternatePhone}</div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="py-3">
                                <Badge className={`${getTypeColor(form.displayType)} text-xs`}>
                                  {form.displayType}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-3">
                                <Badge className={`${getStatusColor(form.displayStatus)} text-xs`}>
                                  {form.displayStatus}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-3">
                                <div className="text-xs text-gray-600 max-w-xs truncate">
                                  {form.displayAddress}
                                </div>
                              </TableCell>
                              <TableCell className="py-3">
                                <div className="text-xs lg:text-sm">
                                  {format(parseISO(form.displayDate), "MMM dd, yyyy")}
                                </div>
                              </TableCell>
                              <TableCell className="py-3">
                                <div className="flex gap-1">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                        <Eye className="h-3 w-3 lg:h-4 lg:w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                      <DialogHeader>
                                        <DialogTitle className="text-lg lg:text-xl">
                                          {form.type.replace('_', ' ').toUpperCase()} Details - {form.displayName}
                                        </DialogTitle>
                                        <DialogDescription className="text-sm">
                                          Complete form information and documents
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <div>
                                          <Label className="text-sm font-medium">Form Type</Label>
                                          <p className="text-sm capitalize">{form.type.replace('_', ' ')}</p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">ID</Label>
                                          <p className="text-sm">{form.displayId}</p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">Customer Name</Label>
                                          <p className="text-sm">{form.displayName}</p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">Contact Number</Label>
                                          <p className="text-sm">{form.displayContact}</p>
                                        </div>
                                        {form.displayAlternatePhone && (
                                          <div>
                                            <Label className="text-sm font-medium">Alternate Phone</Label>
                                            <p className="text-sm">{form.displayAlternatePhone}</p>
                                          </div>
                                        )}
                                        <div>
                                          <Label className="text-sm font-medium">Type</Label>
                                          <p className="text-sm capitalize">{form.displayType}</p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">Status</Label>
                                          <div className="text-sm">{getStatusBadge(form.displayStatus, "installation")}</div>
                                        </div>
                                        <div className="lg:col-span-2">
                                          <Label className="text-sm font-medium">Address</Label>
                                          <p className="text-sm">{form.displayAddress}</p>
                                        </div>
                                        {form.displayVillage && (
                                          <div>
                                            <Label className="text-sm font-medium">Village/Area</Label>
                                            <p className="text-sm">{form.displayVillage}</p>
                                          </div>
                                        )}
                                        {form.displayPincode && (
                                          <div>
                                            <Label className="text-sm font-medium">Pincode</Label>
                                            <p className="text-sm">{form.displayPincode}</p>
                                          </div>
                                        )}
                                        {form.displayRemarks && (
                                          <div className="lg:col-span-2">
                                            <Label className="text-sm font-medium">Remarks</Label>
                                            <p className="text-sm">{form.displayRemarks}</p>
                                          </div>
                                        )}
                                        {form.displayAcceptedAt && (
                                          <div>
                                            <Label className="text-sm font-medium">Accepted/Approved Date</Label>
                                            <p className="text-sm">{format(parseISO(form.displayAcceptedAt), "MMM dd, yyyy")}</p>
                                          </div>
                                        )}
                                        {form.displayRejectedAt && (
                                          <div>
                                            <Label className="text-sm font-medium">Rejected Date</Label>
                                            <p className="text-sm">{form.displayRejectedAt}</p>
                                          </div>
                                        )}
                                        {form.displayEngineer && (
                                          <div>
                                            <Label className="text-sm font-medium">Assigned Engineer</Label>
                                            <p className="text-sm">{getEngineerName(form.displayEngineer as number)}</p>
                                          </div>
                                        )}
                                        {form.displayInstallationDate && (
                                          <div>
                                            <Label className="text-sm font-medium">Installation Date</Label>
                                            <p className="text-sm">{format(parseISO(form.displayInstallationDate as string), "MMM dd, yyyy")}</p>
                                          </div>
                                        )}
                                        {form.displayCompletedDate && (
                                          <div>
                                            <Label className="text-sm font-medium">Completed Date</Label>
                                            <p className="text-sm">{format(parseISO(form.displayCompletedDate as string), "MMM dd, yyyy")}</p>
                                          </div>
                                        )}
                                        {form.displayPriority && (
                                          <div>
                                            <Label className="text-sm font-medium">Priority</Label>
                                            <p className="text-sm">{getPriorityBadge(form.displayPriority as string)}</p>
                                          </div>
                                        )}
                                        {form.displayEstimatedCost && (
                                          <div>
                                            <Label className="text-sm font-medium">Estimated Cost</Label>
                                            <p className="text-sm">₹{form.displayEstimatedCost}</p>
                                          </div>
                                        )}
                                        {form.displayPreferredPlan && (
                                          <div>
                                            <Label className="text-sm font-medium">Preferred Plan</Label>
                                            <p className="text-sm">{form.displayPreferredPlan}</p>
                                          </div>
                                        )}
                                        {form.displayScheduledDate && (
                                          <div>
                                            <Label className="text-sm font-medium">Scheduled Date</Label>
                                            <p className="text-sm">{format(parseISO(form.displayScheduledDate), "MMM dd, yyyy")}</p>
                                          </div>
                                        )}
                                      </div>
                                      
                                      {/* Document Section */}
                                      <div className="mt-6">
                                        <h4 className="font-semibold mb-3 text-sm lg:text-base">Documents</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                          {form.displayAadhaarFront && (
                                            <div className="text-center">
                                              <Label className="text-sm font-medium">Aadhaar Front</Label>
                                              <div className="mt-2 p-3 border rounded-lg bg-green-50 dark:bg-green-900/20">
                                                <CheckCircle className="h-6 w-6 mx-auto text-green-600" />
                                                <p className="text-xs mt-1">Uploaded</p>
                                              </div>
                                            </div>
                                          )}
                                          {form.displayAadhaarBack && (
                                            <div className="text-center">
                                              <Label className="text-sm font-medium">Aadhaar Back</Label>
                                              <div className="mt-2 p-3 border rounded-lg bg-green-50 dark:bg-green-900/20">
                                                <CheckCircle className="h-6 w-6 mx-auto text-green-600" />
                                                <p className="text-xs mt-1">Uploaded</p>
                                              </div>
                                            </div>
                                          )}
                                          {form.displayPassportPhoto && (
                                            <div className="text-center">
                                              <Label className="text-sm font-medium">Passport Photo</Label>
                                              <div className="mt-2 p-3 border rounded-lg bg-green-50 dark:bg-green-900/20">
                                                <CheckCircle className="h-6 w-6 mx-auto text-green-600" />
                                                <p className="text-xs mt-1">Uploaded</p>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Action Buttons for In Review Items */}
                                      {(form.displayStatus === 'inreview' || form.displayStatus === 'pending') && form.type === 'wifi_application' && (
                                        <div className="mt-6 pt-4 border-t">
                                          <h4 className="font-semibold mb-3 text-sm lg:text-base">Actions</h4>
                                          <div className="flex flex-col sm:flex-row gap-2">
                                            <Button 
                                              className="bg-green-600 hover:bg-green-700 text-white text-sm"
                                              onClick={async () => {
                                                try {
                                                  await updateApplicationStatus({ id: form.id, status: 'accept' });
                                                  console.log("Application accepted:", form.displayId);
                                                  alert("Application accepted successfully!");
                                                } catch (error) {
                                                  console.error("Error accepting application:", error);
                                                  alert("Error accepting application. Please try again.");
                                                }
                                              }}
                                            >
                                              <CheckCircle className="h-4 w-4 mr-2" />
                                              Accept WiFi Application
                                            </Button>
                                            <Button 
                                              variant="destructive"
                                              className="text-sm"
                                              onClick={async () => {
                                                try {
                                                  await updateApplicationStatus({ id: form.id, status: 'reject' });
                                                  console.log("Application rejected:", form.displayId);
                                                } catch (error) {
                                                  console.error("Error rejecting application:", error);
                                                }
                                              }}
                                            >
                                              <XCircle className="h-4 w-4 mr-2" />
                                              Reject WiFi Application
                                            </Button>
                                          </div>
                                        </div>
                                      )}

                                      {/* Action Buttons for Installation Requests */}
                                      {form.type === 'installation_request' && (
                                        <div className="mt-6 pt-4 border-t">
                                          <h4 className="font-semibold mb-3 text-sm lg:text-base">Actions</h4>
                                          <div className="flex flex-col sm:flex-row gap-2">
                                            <Button 
                                              className={`text-sm ${
                                                form.displayStatus === 'approved' 
                                                  ? 'bg-gray-400 cursor-not-allowed' 
                                                  : 'bg-green-600 hover:bg-green-700'
                                              } text-white`}
                                              onClick={() => {
                                                if (form.displayStatus !== 'approved') {
                                                  setSelectedInstallationRequest(form);
                                                  setShowInstallationRequestModal(true);
                                                }
                                              }}
                                              disabled={form.displayStatus === 'approved'}
                                            >
                                              <HardHat className="h-4 w-4 mr-2" />
                                              Assign Engineer
                                            </Button>
                                            <Button 
                                              variant="outline"
                                              className="text-sm"
                                              onClick={() => {
                                                setSelectedInstallationRequest(form);
                                                setShowInstallationRequestModal(true);
                                              }}
                                            >
                                              <Eye className="h-4 w-4 mr-2" />
                                              View Details
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4 lg:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <Card className="shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm lg:text-base font-medium">Total Installations</CardTitle>
                    <HardHat className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                        <div className="text-xl lg:text-2xl font-bold">{analytics.totalInstallations}</div>
                        <p className="text-xs lg:text-sm text-muted-foreground">
                      {analytics.installationSuccessRate}% success rate
                    </p>
                  </CardContent>
                </Card>
                
                    <Card className="shadow-sm">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm lg:text-base font-medium">Pending Installations</CardTitle>
                        <Clock className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                        <div className="text-xl lg:text-2xl font-bold">{analytics.pendingInstallations}</div>
                        <p className="text-xs lg:text-sm text-muted-foreground">
                      Awaiting confirmation
                    </p>
                  </CardContent>
                </Card>

                    <Card className="shadow-sm">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm lg:text-base font-medium">Total Leads</CardTitle>
                        <Users className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                        <div className="text-xl lg:text-2xl font-bold">{analytics.totalLeads}</div>
                        <p className="text-xs lg:text-sm text-muted-foreground">
                      {analytics.conversionRate}% conversion rate
                    </p>
                  </CardContent>
                </Card>

                    <Card className="shadow-sm">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm lg:text-base font-medium">Manager Contact Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                        <div className="text-xl lg:text-2xl font-bold">{analytics.contactRate}%</div>
                        <p className="text-xs lg:text-sm text-muted-foreground">
                      {analytics.contactedLeads} leads contacted
                    </p>
                  </CardContent>
                </Card>
              </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    <Card className="shadow-sm">
                  <CardHeader>
                        <CardTitle className="text-base lg:text-lg">Installation Status Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm lg:text-base">Pending</span>
                            <span className="text-sm lg:text-base font-medium">{analytics.pendingInstallations}</span>
                      </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-yellow-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(analytics.pendingInstallations / analytics.totalInstallations) * 100}%` }}></div>
                      </div>
                    </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm lg:text-base">Confirmed</span>
                            <span className="text-sm lg:text-base font-medium">{analytics.confirmedInstallations}</span>
                      </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-green-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(analytics.confirmedInstallations / analytics.totalInstallations) * 100}%` }}></div>
                      </div>
                    </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm lg:text-base">Rejected</span>
                            <span className="text-sm lg:text-base font-medium">{analytics.rejectedInstallations}</span>
                      </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-red-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(analytics.rejectedInstallations / analytics.totalInstallations) * 100}%` }}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                    <Card className="shadow-sm">
                  <CardHeader>
                        <CardTitle className="text-base lg:text-lg">Lead Status Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm lg:text-base">New Leads</span>
                            <span className="text-sm lg:text-base font-medium">{analytics.newLeads}</span>
                      </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(analytics.newLeads / analytics.totalLeads) * 100}%` }}></div>
                      </div>
                    </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm lg:text-base">Contacted</span>
                            <span className="text-sm lg:text-base font-medium">{analytics.contactedLeads}</span>
                      </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-yellow-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(analytics.contactedLeads / analytics.totalLeads) * 100}%` }}></div>
                      </div>
                    </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm lg:text-base">Converted</span>
                            <span className="text-sm lg:text-base font-medium">{analytics.convertedLeads}</span>
                      </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-green-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(analytics.convertedLeads / analytics.totalLeads) * 100}%` }}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="installations" className="space-y-4 lg:space-y-6">
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                      <CardTitle className="text-lg lg:text-xl">New Installation Requests</CardTitle>
                      <CardDescription className="text-sm">Manage customer installation applications</CardDescription>
                </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                          <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xs lg:text-sm px-3 py-2">
                            <HardHat className="mr-1 lg:mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                        New Installation
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                            <DialogTitle className="text-lg lg:text-xl">New Installation Request</DialogTitle>
                            <DialogDescription className="text-sm">
                          Fill in customer details and upload required documents
                        </DialogDescription>
                      </DialogHeader>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                              <Label className="text-sm font-medium">Customer Name</Label>
                              <Input placeholder="Enter full name" className="text-sm" />
                        </div>
                        <div>
                              <Label className="text-sm font-medium">Email</Label>
                              <Input type="email" placeholder="customer@email.com" className="text-sm" />
                        </div>
                        <div>
                              <Label className="text-sm font-medium">Phone Number (with country code)</Label>
                              <Input placeholder="+91 98765 43210" className="text-sm" />
                        </div>
                        <div>
                              <Label className="text-sm font-medium">Alternate Phone Number</Label>
                              <Input placeholder="+91 98765 43211" className="text-sm" />
                        </div>
                            <div className="sm:col-span-2">
                              <Label className="text-sm font-medium">Address</Label>
                              <Input placeholder="Complete address with area and city" className="text-sm" />
                        </div>
                        <div>
                              <Label className="text-sm font-medium">Aadhar Card - Front Side</Label>
                              <Input type="file" accept="image/*" className="text-sm" />
                        </div>
                        <div>
                              <Label className="text-sm font-medium">Aadhar Card - Back Side</Label>
                              <Input type="file" accept="image/*" className="text-sm" />
                        </div>
                            <div className="sm:col-span-2">
                              <Label className="text-sm font-medium">Passport Size Photo</Label>
                              <Input type="file" accept="image/*" className="text-sm" />
                        </div>
                        <div>
                              <Label className="text-sm font-medium">Request Type</Label>
                          <Select>
                                <SelectTrigger className="text-sm">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="residential">Residential</SelectItem>
                              <SelectItem value="commercial">Commercial</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                              <Label className="text-sm font-medium">Priority</Label>
                          <Select>
                                <SelectTrigger className="text-sm">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" className="text-sm">Cancel</Button>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm">Submit Request</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                      <Button onClick={exportInstallationsToExcel} className="bg-green-600 hover:bg-green-700 text-white text-xs lg:text-sm px-3 py-2">
                        <Download className="mr-1 lg:mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                    Export Excel
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Search installations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm text-sm"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-[180px] text-sm">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="w-full sm:w-[180px] text-sm">
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

                  <div className="rounded-lg border overflow-hidden">
                    <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                          <TableRow className="bg-gray-50 dark:bg-gray-800">
                            <TableHead className="text-xs lg:text-sm font-medium">Customer</TableHead>
                            <TableHead className="text-xs lg:text-sm font-medium">Contact</TableHead>
                            <TableHead className="text-xs lg:text-sm font-medium hidden lg:table-cell">Location</TableHead>
                            <TableHead className="text-xs lg:text-sm font-medium">Type</TableHead>
                            <TableHead className="text-xs lg:text-sm font-medium">Status</TableHead>
                            <TableHead className="text-xs lg:text-sm font-medium hidden sm:table-cell">Priority</TableHead>
                            <TableHead className="text-xs lg:text-sm font-medium">Created</TableHead>
                            <TableHead className="text-xs lg:text-sm font-medium">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInstallations.map((installation) => (
                            <TableRow key={installation.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                              <TableCell className="py-3">
                          <div>
                                  <div className="font-medium text-xs lg:text-sm">{installation.customerName}</div>
                                  <div className="text-xs text-gray-500 hidden lg:block">{installation.email}</div>
                          </div>
                        </TableCell>
                              <TableCell className="py-3">
                                <div className="text-xs lg:text-sm">{installation.phone}</div>
                        </TableCell>
                              <TableCell className="py-3 hidden lg:table-cell">
                          <div className="flex items-center">
                                  <MapPin className="h-3 w-3 mr-1 text-gray-500" />
                                  <span className="text-xs lg:text-sm">{installation.location}</span>
                          </div>
                        </TableCell>
                              <TableCell className="py-3">
                                <Badge variant={installation.requestType === 'commercial' ? 'default' : 'secondary'} className="text-xs">
                            {installation.requestType}
                          </Badge>
                        </TableCell>
                              <TableCell className="py-3">
                          {getStatusBadge(installation.status, "installation")}
                        </TableCell>
                              <TableCell className="py-3 hidden sm:table-cell">
                          {getPriorityBadge(installation.priority)}
                        </TableCell>
                              <TableCell className="py-3">
                                <div className="text-xs lg:text-sm">
                          {format(parseISO(installation.createdAt), "MMM dd, yyyy")}
                                </div>
                        </TableCell>
                              <TableCell className="py-3">
                                <div className="flex gap-1">
                              <Dialog>
                                <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                          <Eye className="h-3 w-3 lg:h-4 lg:w-4" />
                                  </Button>
                                </DialogTrigger>
                                      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                          <DialogTitle className="text-lg lg:text-xl">Installation Details - {installation.customerName}</DialogTitle>
                                          <DialogDescription className="text-sm">
                                      View installation request details and update status
                                    </DialogDescription>
                                  </DialogHeader>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                            <Label className="text-sm font-medium">Customer Name</Label>
                                      <p className="text-sm">{installation.customerName}</p>
                                    </div>
                                    <div>
                                            <Label className="text-sm font-medium">Email</Label>
                                      <p className="text-sm">{installation.email}</p>
                                    </div>
                                    <div>
                                            <Label className="text-sm font-medium">Phone</Label>
                                      <p className="text-sm">{installation.phone}</p>
                                    </div>
                                    <div>
                                            <Label className="text-sm font-medium">Alternate Phone</Label>
                                      <p className="text-sm">{installation.alternatePhone || "Not provided"}</p>
                                    </div>
                                          <div className="sm:col-span-2">
                                            <Label className="text-sm font-medium">Address</Label>
                                      <p className="text-sm">{installation.address}</p>
                                    </div>
                                    <div>
                                            <Label className="text-sm font-medium">Request Type</Label>
                                      <p className="text-sm capitalize">{installation.requestType}</p>
                                    </div>
                                    <div>
                                            <Label className="text-sm font-medium">Current Status</Label>
                                      <div className="text-sm">{getStatusBadge(installation.status, "installation")}</div>
                                    </div>
                                    {installation.aadharFront && (
                                      <div>
                                              <Label className="text-sm font-medium">Aadhar Front</Label>
                                        <p className="text-sm text-blue-600">Document uploaded</p>
                                      </div>
                                    )}
                                    {installation.aadharBack && (
                                      <div>
                                              <Label className="text-sm font-medium">Aadhar Back</Label>
                                        <p className="text-sm text-blue-600">Document uploaded</p>
                                      </div>
                                    )}
                                    {installation.passportPhoto && (
                                      <div>
                                              <Label className="text-sm font-medium">Passport Photo</Label>
                                        <p className="text-sm text-blue-600">Photo uploaded</p>
                                      </div>
                                    )}
                                  </div>
                                        <div className="flex flex-col sm:flex-row gap-2 pt-4">
                                    <Button 
                                      onClick={() => updateInstallationStatus(installation.id, 'confirmed')}
                                      variant={installation.status === 'confirmed' ? 'default' : 'outline'}
                                            className="bg-green-600 hover:bg-green-700 text-white text-sm"
                                    >
                                            <CheckCircle className="h-3 w-3 mr-1 lg:h-4 lg:w-4 lg:mr-2" />
                                      Confirm
                                    </Button>
                                    <Button 
                                      onClick={() => updateInstallationStatus(installation.id, 'rejected')}
                                      variant={installation.status === 'rejected' ? 'destructive' : 'outline'}
                                            className="bg-red-600 hover:bg-red-700 text-white text-sm"
                                    >
                                            <XCircle className="h-3 w-3 mr-1 lg:h-4 lg:w-4 lg:mr-2" />
                                      Reject
                                    </Button>
                                    <Button 
                                      onClick={() => updateInstallationStatus(installation.id, 'pending')}
                                      variant={installation.status === 'pending' ? 'default' : 'outline'}
                                            className="text-sm"
                                    >
                                            <Clock className="h-3 w-3 mr-1 lg:h-4 lg:w-4 lg:mr-2" />
                                      Set Pending
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                      </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

            <TabsContent value="leads" className="space-y-4 lg:space-y-6">
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                      <CardTitle className="text-lg lg:text-xl">Lead Management</CardTitle>
                      <CardDescription className="text-sm">Track customer inquiries from various sources</CardDescription>
                </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                          <Button className="bg-purple-600 hover:bg-purple-700 text-white text-xs lg:text-sm px-3 py-2">
                            <Users className="mr-1 lg:mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                        New Lead
                      </Button>
                    </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                            <DialogTitle className="text-lg lg:text-xl">Add New Lead</DialogTitle>
                            <DialogDescription className="text-sm">
                          Register a new customer inquiry
                        </DialogDescription>
                      </DialogHeader>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                              <Label className="text-sm font-medium">Full Name</Label>
                              <Input placeholder="Enter customer name" className="text-sm" />
                        </div>
                        <div>
                              <Label className="text-sm font-medium">Phone Number</Label>
                              <Input placeholder="+91 98765 43210" className="text-sm" />
                        </div>
                        <div>
                              <Label className="text-sm font-medium">Email (Optional)</Label>
                              <Input type="email" placeholder="customer@email.com" className="text-sm" />
                        </div>
                        <div>
                              <Label className="text-sm font-medium">Source</Label>
                          <Select>
                                <SelectTrigger className="text-sm">
                              <SelectValue placeholder="Select source" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="website">Website</SelectItem>
                              <SelectItem value="ivr">IVR Call</SelectItem>
                              <SelectItem value="whatsapp">WhatsApp</SelectItem>
                              <SelectItem value="referral">Referral</SelectItem>
                              <SelectItem value="social_media">Social Media</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                            <div className="sm:col-span-2">
                              <Label className="text-sm font-medium">Address</Label>
                              <Input placeholder="Complete address" className="text-sm" />
                        </div>
                        <div>
                              <Label className="text-sm font-medium">Inquiry Type</Label>
                          <Select>
                                <SelectTrigger className="text-sm">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">General</SelectItem>
                              <SelectItem value="pricing">Pricing</SelectItem>
                              <SelectItem value="technical">Technical</SelectItem>
                              <SelectItem value="support">Support</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                              <Label className="text-sm font-medium">Priority</Label>
                          <Select>
                                <SelectTrigger className="text-sm">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                            <div className="sm:col-span-2">
                              <Label className="text-sm font-medium">Message (Optional)</Label>
                              <Input placeholder="Customer inquiry or message" className="text-sm" />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" className="text-sm">Cancel</Button>
                            <Button className="bg-purple-600 hover:bg-purple-700 text-white text-sm">Add Lead</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                      <Button onClick={exportLeadsToExcel} className="bg-green-600 hover:bg-green-700 text-white text-xs lg:text-sm px-3 py-2">
                        <Download className="mr-1 lg:mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                    Export Excel
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Search leads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm text-sm"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-[180px] text-sm">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                      <SelectTrigger className="w-full sm:w-[180px] text-sm">
                    <SelectValue placeholder="Filter by source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="ivr">IVR Call</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="social_media">Social Media</SelectItem>
                  </SelectContent>
                </Select>
              </div>

                  <div className="rounded-lg border overflow-hidden">
                    <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                          <TableRow className="bg-gray-50 dark:bg-gray-800">
                            <TableHead className="text-xs lg:text-sm font-medium">Lead</TableHead>
                            <TableHead className="text-xs lg:text-sm font-medium">Contact</TableHead>
                            <TableHead className="text-xs lg:text-sm font-medium hidden lg:table-cell">Source</TableHead>
                            <TableHead className="text-xs lg:text-sm font-medium">Status</TableHead>
                            <TableHead className="text-xs lg:text-sm font-medium hidden sm:table-cell">Priority</TableHead>
                            <TableHead className="text-xs lg:text-sm font-medium hidden lg:table-cell">Manager Contact</TableHead>
                            <TableHead className="text-xs lg:text-sm font-medium hidden xl:table-cell">Address</TableHead>
                            <TableHead className="text-xs lg:text-sm font-medium">Created</TableHead>
                            <TableHead className="text-xs lg:text-sm font-medium">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map((lead) => (
                            <TableRow key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                              <TableCell className="py-3">
                          <div>
                                  <div className="font-medium text-xs lg:text-sm">{lead.name}</div>
                                  <div className="text-xs text-gray-500 hidden lg:block">{lead.inquiryType}</div>
                          </div>
                        </TableCell>
                              <TableCell className="py-3">
                          <div>
                                  <div className="text-xs lg:text-sm">{lead.phone}</div>
                                  <div className="text-xs text-gray-500 hidden lg:block">{lead.email || "No email"}</div>
                          </div>
                        </TableCell>
                              <TableCell className="py-3 hidden lg:table-cell">
                          <div className="flex items-center">
                            {getSourceIcon(lead.source)}
                                  <span className="ml-2 capitalize text-xs lg:text-sm">{lead.source.replace('_', ' ')}</span>
                          </div>
                        </TableCell>
                              <TableCell className="py-3">
                          {getStatusBadge(lead.status, "lead")}
                        </TableCell>
                              <TableCell className="py-3 hidden sm:table-cell">
                          {getPriorityBadge(lead.priority)}
                        </TableCell>
                              <TableCell className="py-3 hidden lg:table-cell">
                                <Badge variant={lead.isContactedByManager ? "default" : "secondary"} className="text-xs">
                            {lead.isContactedByManager ? "Yes" : "No"}
                          </Badge>
                        </TableCell>
                              <TableCell className="py-3 hidden xl:table-cell">
                                <div className="text-xs text-gray-600 max-w-xs truncate">
                            {lead.address}
                          </div>
                        </TableCell>
                              <TableCell className="py-3">
                                <div className="text-xs lg:text-sm">
                          {format(parseISO(lead.createdAt), "MMM dd, yyyy")}
                        </div>
                              </TableCell>
                              <TableCell className="py-3">
                                <div className="flex gap-1">
                              <Dialog>
                                <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                          <Eye className="h-3 w-3 lg:h-4 lg:w-4" />
                                  </Button>
                                </DialogTrigger>
                                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                          <DialogTitle className="text-lg lg:text-xl">Lead Details - {lead.name}</DialogTitle>
                                          <DialogDescription className="text-sm">
                                      View and manage lead information
                                    </DialogDescription>
                                  </DialogHeader>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                            <Label className="text-sm font-medium">Name</Label>
                                      <p className="text-sm">{lead.name}</p>
                                    </div>
                                    <div>
                                            <Label className="text-sm font-medium">Phone</Label>
                                      <p className="text-sm">{lead.phone}</p>
                                    </div>
                                    <div>
                                            <Label className="text-sm font-medium">Email</Label>
                                      <p className="text-sm">{lead.email || "Not provided"}</p>
                                    </div>
                                    <div>
                                            <Label className="text-sm font-medium">Source</Label>
                                      <p className="text-sm capitalize">{lead.source.replace('_', ' ')}</p>
                                    </div>
                                    <div>
                                            <Label className="text-sm font-medium">Status</Label>
                                      <p className="text-sm">{lead.status}</p>
                                    </div>
                                          <div>
                                            <Label className="text-sm font-medium">Priority</Label>
                                            <p className="text-sm">{getPriorityBadge(lead.priority)}</p>
                                          </div>
                                          <div className="sm:col-span-2">
                                            <Label className="text-sm font-medium">Address</Label>
                                            <p className="text-sm">{lead.address}</p>
                                          </div>
                                          <div className="sm:col-span-2">
                                            <Label className="text-sm font-medium">Message</Label>
                                      <p className="text-sm">{lead.message || "No message provided"}</p>
                                    </div>
                                  </div>
                                        <div className="flex flex-col sm:flex-row gap-2 pt-4">
                                    <Button 
                                      onClick={() => updateLeadStatus(lead.id, 'contacted')}
                                      variant={lead.status === 'contacted' ? 'default' : 'outline'}
                                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                                    >
                                            <Phone className="h-3 w-3 mr-1 lg:h-4 lg:w-4 lg:mr-2" />
                                      Mark Contacted
                                    </Button>
                                    <Button 
                                      onClick={() => updateLeadStatus(lead.id, 'qualified')}
                                      variant={lead.status === 'qualified' ? 'default' : 'outline'}
                                            className="bg-purple-600 hover:bg-purple-700 text-white text-sm"
                                    >
                                            <CheckCircle className="h-3 w-3 mr-1 lg:h-4 lg:w-4 lg:mr-2" />
                                      Mark Qualified
                                    </Button>
                                    <Button 
                                      onClick={() => updateLeadStatus(lead.id, 'converted')}
                                      variant={lead.status === 'converted' ? 'default' : 'outline'}
                                            className="bg-green-600 hover:bg-green-700 text-white text-sm"
                                    >
                                            <Star className="h-3 w-3 mr-1 lg:h-4 lg:w-4 lg:mr-2" />
                                      Convert
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                      </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
                </Tabs>
        </div>
      </div>

      {/* Installation Request Details Modal */}
      <Dialog open={showInstallationRequestModal} onOpenChange={setShowInstallationRequestModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg lg:text-xl">Installation Request Details</DialogTitle>
            <DialogDescription className="text-sm">
              Review and manage installation request
            </DialogDescription>
          </DialogHeader>
          
          {selectedInstallationRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Customer Name</Label>
                  <p className="text-sm">{selectedInstallationRequest.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Request ID</Label>
                  <p className="text-sm">{selectedInstallationRequest.displayId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone Number</Label>
                  <p className="text-sm">{selectedInstallationRequest.phoneNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm">{selectedInstallationRequest.email}</p>
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-sm font-medium">Address</Label>
                  <p className="text-sm">{selectedInstallationRequest.displayAddress}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={`${getStatusColor(selectedInstallationRequest.status)} text-xs`}>
                    {selectedInstallationRequest.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created Date</Label>
                  <p className="text-sm">{format(parseISO(selectedInstallationRequest.createdAt), "MMM dd, yyyy")}</p>
                </div>
              </div>

              {/* Documents Section */}
              <div>
                <Label className="text-sm font-medium">Documents</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                  {selectedInstallationRequest.displayAadhaarFront && (
                    <div className="text-center p-3 border rounded-lg bg-green-50 dark:bg-green-900/20">
                      <CheckCircle className="h-6 w-6 mx-auto text-green-600" />
                      <p className="text-xs mt-1">Aadhaar Front</p>
                    </div>
                  )}
                  {selectedInstallationRequest.displayAadhaarBack && (
                    <div className="text-center p-3 border rounded-lg bg-green-50 dark:bg-green-900/20">
                      <CheckCircle className="h-6 w-6 mx-auto text-green-600" />
                      <p className="text-xs mt-1">Aadhaar Back</p>
                    </div>
                  )}
                  {selectedInstallationRequest.displayPassportPhoto && (
                    <div className="text-center p-3 border rounded-lg bg-green-50 dark:bg-green-900/20">
                      <CheckCircle className="h-6 w-6 mx-auto text-green-600" />
                      <p className="text-xs mt-1">Passport Photo</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Engineer Assignment Section */}
              {isEngineerSelected && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Label className="text-sm font-medium">Selected Engineer</Label>
                  {engineers?.data?.engineers && (
                    <p className="text-sm mt-1">
                      {engineers.data.engineers.find((e: any) => e._id === selectedEngineer)?.firstName} {" "}
                      {engineers.data.engineers.find((e: any) => e._id === selectedEngineer)?.lastName} - {" "}
                      {engineers.data.engineers.find((e: any) => e._id === selectedEngineer)?.phoneNumber}
                    </p>
                  )}
                </div>
              )}

              {/* Remarks Section */}
              <div>
                <Label className="text-sm font-medium">Remarks (Optional)</Label>
                <Input
                  placeholder="Enter remarks for the assignment"
                  value={assignmentRemarks}
                  onChange={(e) => setAssignmentRemarks(e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowInstallationRequestModal(false);
                setSelectedInstallationRequest(null);
                setSelectedEngineer("");
                setAssignmentRemarks("");
                setIsEngineerSelected(false);
              }}
              className="text-sm"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleRejectInstallationRequest}
              className="text-sm"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button 
              onClick={() => setShowEngineerAssignmentModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
            >
              <HardHat className="h-4 w-4 mr-2" />
              Select Engineer
            </Button>
            {isEngineerSelected && (
              <Button 
                onClick={handleEngineerAssignment}
                className="bg-green-600 hover:bg-green-700 text-white text-sm"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Submit Assignment
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Engineer Selection Modal */}
      <Dialog open={showEngineerAssignmentModal} onOpenChange={setShowEngineerAssignmentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg lg:text-xl">Select Engineer</DialogTitle>
            <DialogDescription className="text-sm">
              Choose an engineer to assign to this installation request
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Available Engineers</Label>
              <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                {engineersLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">Loading engineers...</p>
                  </div>
                ) : engineersError ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-red-600">Error loading engineers</p>
                  </div>
                ) : engineers?.data?.engineers ? (
                  engineers.data.engineers.map((engineer: any) => (
                    <div
                      key={engineer._id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedEngineer === engineer._id
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => handleEngineerSelection(engineer._id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">
                            {engineer.firstName} {engineer.lastName}
                          </p>
                          <p className="text-xs text-gray-600">{engineer.phoneNumber}</p>
                          <p className="text-xs text-gray-500">{engineer.email}</p>
                        </div>
                        {selectedEngineer === engineer._id && (
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600">No engineers available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowEngineerAssignmentModal(false)}
              className="text-sm"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => setShowEngineerAssignmentModal(false)}
              disabled={!selectedEngineer}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm Selection
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}