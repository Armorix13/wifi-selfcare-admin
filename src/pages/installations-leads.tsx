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
  FileText,
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
  dummyEngineers
} from "@/lib/dummyData";
import { cn } from "@/lib/utils";
import { api, BASE_URL, useGetAllSelectNodesQuery } from "@/api/index";

export default function InstallationsLeads() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [dateFilter, setDateFilter] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });



  const [showEngineerAssignmentModal, setShowEngineerAssignmentModal] = useState(false);
  const [showInstallationRequestModal, setShowInstallationRequestModal] = useState(false);
  const [selectedInstallationRequest, setSelectedInstallationRequest] = useState<any>(null);
  const [selectedEngineer, setSelectedEngineer] = useState("");
  const [assignmentRemarks, setAssignmentRemarks] = useState("");
  const [isEngineerSelected, setIsEngineerSelected] = useState(false);
  const [isNodeSelectionOpen, setIsNodeSelectionOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState("");
  const [selectedOlt, setSelectedOlt] = useState<any>(null);
  const [expandedOlt, setExpandedOlt] = useState<string | null>(null);

  const { data: selectNodes, isLoading: selectNodesLoading, error: selectNodesError } = useGetAllSelectNodesQuery({});

  console.log("selectNodes", selectNodes);


  // Persist selectedNode in localStorage
  useEffect(() => {
    const savedNode = localStorage.getItem('selectedNode');
    if (savedNode) {
      setSelectedNode(savedNode);
    }
  }, []);

  // Save selectedNode to localStorage whenever it changes
  useEffect(() => {
    if (selectedNode) {
      localStorage.setItem('selectedNode', selectedNode);
    } else {
      localStorage.removeItem('selectedNode');
    }
  }, [selectedNode]);


  // Use OLT data from API
  const oltData = useMemo(() => {
    if (selectNodes?.success && selectNodes?.data) {
      return selectNodes.data;
    }
    return [];
  }, [selectNodes]);

  // Power loss calculation functions
  const getPowerLoss = (splitRatio: string | number): number => {
    // Handle null, undefined, or empty values
    if (!splitRatio) return 0;

    // Extract numeric value from split ratio (e.g., "1x8" -> 8, "1x4" -> 4)
    let ratio: number;
    if (typeof splitRatio === 'string') {
      const match = splitRatio.match(/(\d+)x(\d+)/);
      if (match) {
        ratio = parseInt(match[2]); // Get the second number (split count)
      } else {
        // Try to parse as direct number
        const parsed = parseInt(splitRatio);
        ratio = isNaN(parsed) ? 0 : parsed;
      }
    } else {
      ratio = typeof splitRatio === 'number' ? splitRatio : 0;
    }

    // Validate ratio is a positive number
    if (ratio <= 0) return 0;

    // Power loss mapping based on split ratio
    const powerLossMap: { [key: number]: number } = {
      128: -40,
      64: -20,
      32: -17,
      16: -13,
      8: -10,
      4: -7,
      2: -3
    };

    return powerLossMap[ratio] || 0;
  };

  // Calculate cumulative power loss for a node path
  const calculateCumulativePowerLoss = (olt: any, targetNodeId: string, targetNodeType: string): number => {
    // Handle invalid inputs
    if (!olt || !targetNodeId || !targetNodeType) return 0;

    let totalLoss = 0;

    // Start from OLT (no loss at OLT level)

    // Check MS devices
    for (const ms of olt.ms_devices || []) {
      if (ms.ms_id === targetNodeId && targetNodeType === 'ms') {
        totalLoss += getPowerLoss(ms.ms_power);
        return totalLoss;
      }

      // If target is in SubMS under this MS
      for (const subms of olt.subms_devices || []) {
        if (subms.input?.id === ms.ms_id) {
          if (subms.subms_id === targetNodeId && targetNodeType === 'subms') {
            totalLoss += getPowerLoss(ms.ms_power); // MS loss
            totalLoss += getPowerLoss(subms.subms_power); // SubMS loss
            return totalLoss;
          }
        }
      }

      // If target is in FDB under this MS
      for (const fdb of olt.fdb_devices || []) {
        if (fdb.input?.id === ms.ms_id && fdb.input?.type === 'ms') {
          if (fdb.fdb_id === targetNodeId && targetNodeType === 'fdb') {
            totalLoss += getPowerLoss(ms.ms_power); // MS loss
            totalLoss += getPowerLoss(fdb.fdb_power); // FDB loss
            return totalLoss;
          }
        }
      }
    }

    // Check FDB devices directly connected to OLT
    for (const fdb of olt.fdb_devices || []) {
      if (fdb.input?.type === 'olt' && fdb.fdb_id === targetNodeId && targetNodeType === 'fdb') {
        totalLoss += getPowerLoss(fdb.fdb_power);
        return totalLoss;
      }
    }

    // Check FDB devices connected to SubMS
    for (const fdb of olt.fdb_devices || []) {
      if (fdb.input?.type === 'subms') {
        const subms = olt.subms_devices?.find((s: any) => s.subms_id === fdb.input.id);
        if (subms && fdb.fdb_id === targetNodeId && targetNodeType === 'fdb') {
          const ms = olt.ms_devices?.find((m: any) => m.ms_id === subms.input?.id);
          if (ms) {
            totalLoss += getPowerLoss(ms.ms_power); // MS loss
            totalLoss += getPowerLoss(subms.subms_power); // SubMS loss
            totalLoss += getPowerLoss(fdb.fdb_power); // FDB loss
            return totalLoss;
          }
        }
      }
    }

    // Check X2 devices
    for (const x2 of olt.x2_devices || []) {
      if (x2.x2_id === targetNodeId && targetNodeType === 'x2') {
        const fdb = olt.fdb_devices?.find((f: any) => f.fdb_id === x2.input?.id);
        if (fdb) {
          if (fdb.input?.type === 'subms') {
            const subms = olt.subms_devices?.find((s: any) => s.subms_id === fdb.input.id);
            if (subms) {
              const ms = olt.ms_devices?.find((m: any) => m.ms_id === subms.input?.id);
              if (ms) {
                totalLoss += getPowerLoss(ms.ms_power); // MS loss
                totalLoss += getPowerLoss(subms.subms_power); // SubMS loss
                totalLoss += getPowerLoss(fdb.fdb_power); // FDB loss
                totalLoss += getPowerLoss(x2.x2_power); // X2 loss
                return totalLoss;
              }
            }
          } else if (fdb.input?.type === 'ms') {
            const ms = olt.ms_devices?.find((m: any) => m.ms_id === fdb.input.id);
            if (ms) {
              totalLoss += getPowerLoss(ms.ms_power); // MS loss
              totalLoss += getPowerLoss(fdb.fdb_power); // FDB loss
              totalLoss += getPowerLoss(x2.x2_power); // X2 loss
              return totalLoss;
            }
          }
        }
      }
    }

    return totalLoss;
  };

  // Check if a node can accept customer connections (power loss <= 20)
  const canAcceptCustomer = (olt: any, nodeId: string, nodeType: string): boolean => {
    // Handle invalid inputs - default to false (cannot accept)
    if (!olt || !nodeId || !nodeType) return false;

    try {
      const totalLoss = Math.abs(calculateCumulativePowerLoss(olt, nodeId, nodeType));

      // Handle edge case where calculation returns NaN or invalid number
      if (isNaN(totalLoss) || !isFinite(totalLoss)) return false;

      return totalLoss <= 20;
    } catch (error) {
      console.error('Error calculating power loss for node:', { olt, nodeId, nodeType }, error);
      return false; // Default to safe side - cannot accept customers
    }
  };

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
  }, [searchTerm, statusFilter, dateFilter, transformedApplications, transformedInstallationRequests]);

  // Analytics calculations
  const analytics = useMemo(() => {
    // Application analytics
    const totalApplications = transformedApplications.length;
    const inReviewApplications = transformedApplications.filter((app: any) => app.status === "inreview").length;
    const acceptedApplications = transformedApplications.filter((app: any) => app.status === "accept").length;
    const rejectedApplications = transformedApplications.filter((app: any) => app.status === "reject").length;

    const applicationSuccessRate = totalApplications > 0 ? (acceptedApplications / totalApplications * 100).toFixed(1) : '0';

    return {
      totalApplications,
      inReviewApplications,
      acceptedApplications,
      rejectedApplications,
      applicationSuccessRate
    };
  }, [transformedApplications]);





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



  return (
    <MainLayout title="New Installation & Applications">
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Top Stats Row - All Data Types */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {/* Application Forms Stats */}
          <Card className="shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-sm sm:text-base lg:text-lg dashboard-card-title flex items-center text-blue-800 dark:text-blue-200">
                <HardHat className="mr-2 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                Application Forms
              </CardTitle>
              <CardDescription className="dashboard-text-muted text-xs lg:text-sm text-blue-600 dark:text-blue-300">
                Applications in review
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-700 dark:text-blue-300">
                {applicationsLoading ? "..." : transformedApplications.filter((app: any) => app.status === 'inreview').length}
              </div>
              <div className="text-xs lg:text-sm text-blue-600 dark:text-blue-400 mt-1">
                {applicationsLoading ? "Loading..." : "In review applications"}
              </div>
              <div className="mt-2 sm:mt-3 space-y-2">
                {transformedApplications.filter((app: any) => app.status === 'inreview').slice(0, 3).map((app: any) => (
                  <div key={app.id} className="p-2 sm:p-3 bg-white/60 dark:bg-blue-900/40 rounded-lg border border-blue-200 dark:border-blue-600">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs lg:text-sm font-medium truncate text-blue-900 dark:text-blue-100">{app.name}</div>
                        <div className="text-xs text-blue-600 dark:text-blue-300">{app.applicationType}</div>
                      </div>
                      <Badge className={`${getStatusColor(app.status)} text-xs ml-2`}>
                        {app.status}
                      </Badge>
                    </div>
                    <div className="flex gap-1 mt-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 h-6 sm:h-8"
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
                        className="text-xs px-2 py-1 h-6 sm:h-8"
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
          <Card className="shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-sm sm:text-base lg:text-lg dashboard-card-title flex items-center text-green-800 dark:text-green-200">
                <Building className="mr-2 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                Installation Requests
              </CardTitle>
              <CardDescription className="dashboard-text-muted text-xs lg:text-sm text-green-600 dark:text-green-300">
                Requests in review
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-700 dark:text-green-300">
                {installationRequestsLoading ? "..." : transformedInstallationRequests.filter((req: any) => req.status === 'approved').length}
              </div>
              <div className="text-xs lg:text-sm text-green-600 dark:text-green-400 mt-1">
                {installationRequestsLoading ? "Loading..." : "Approved requests"}
              </div>
              <div className="mt-2 sm:mt-3 space-y-2">
                {installationRequestsLoading ? (
                  <div className="text-xs text-green-600 dark:text-green-400">Loading installation requests...</div>
                ) : (
                  transformedInstallationRequests.slice(0, 3).map((req: any) => (
                    <div key={req.id} className="p-2 sm:p-3 bg-white/60 dark:bg-green-900/40 rounded-lg border border-green-200 dark:border-green-600">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs lg:text-sm font-medium truncate text-green-900 dark:text-green-100">{req.name}</div>
                          <div className="text-xs text-green-600 dark:text-green-300">{req.displayType}</div>
                        </div>
                        <Badge className={`${getStatusColor(req.status)} text-xs ml-2`}>
                          {req.status}
                        </Badge>
                      </div>
                      <div className="flex gap-1 mt-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 h-6 sm:h-8"
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
                          className={`text-xs px-2 py-1 h-6 sm:h-8 ${req.status === 'approved'
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
        </div>

        {/* Quick Overview and Recent Activity Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Quick Overview */}
          <Card className="dashboard-card shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-sm sm:text-base lg:text-lg dashboard-card-title flex items-center text-purple-800 dark:text-purple-200">
                <BarChart3 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                Quick Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-white/60 dark:bg-purple-900/40 rounded-lg text-center border border-purple-200 dark:border-purple-600">
                  <div className="text-base sm:text-lg lg:text-xl font-bold text-purple-700 dark:text-purple-300">
                    {applicationsLoading ? "..." : transformedApplications.length}
                  </div>
                  <div className="text-xs text-purple-600 dark:text-purple-400">
                    {applicationsLoading ? "Loading..." : "Applications"}
                  </div>
                </div>
                <div className="p-2 sm:p-3 bg-white/60 dark:bg-purple-900/40 rounded-lg text-center border border-purple-200 dark:border-purple-600">
                  <div className="text-base sm:text-lg lg:text-xl font-bold text-purple-700 dark:text-purple-300">
                    {installationRequestsLoading ? "..." : transformedInstallationRequests.length}
                  </div>
                  <div className="text-xs text-purple-600 dark:text-purple-400">
                    {installationRequestsLoading ? "Loading..." : "Requests"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="dashboard-card shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-sm sm:text-base lg:text-lg dashboard-card-title flex items-center text-orange-800 dark:text-orange-200">
                <Clock className="mr-2 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 sm:space-y-3">
                {[...transformedApplications, ...transformedInstallationRequests]
                  .sort((a, b) => new Date(b.createdAt || b.updatedAt).getTime() - new Date(a.createdAt || a.updatedAt).getTime())
                  .slice(0, 5)
                  .map((item: any, index) => (
                    <div key={index} className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-white/60 dark:bg-orange-900/40 rounded-lg border border-orange-200 dark:border-orange-600 hover:bg-white/80 dark:hover:bg-orange-900/60 transition-colors">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs lg:text-sm font-medium truncate text-orange-900 dark:text-orange-100">
                          {item.name || item.customerName || item.applicationId || 'New Entry'}
                        </div>
                        <div className="text-xs text-orange-600 dark:text-orange-400">
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
        <div className="space-y-4 sm:space-y-6">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 p-4 sm:p-6 lg:p-8 text-white shadow-lg">
            <div className="relative z-10">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">New Installation & Applications</h1>
              <p className="text-blue-100 text-sm sm:text-base lg:text-lg">Manage installation requests and application forms with ease</p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-3 sm:mt-4">
                <div className="flex items-center gap-2">
                  <HardHat className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-xs sm:text-sm">{transformedApplications.length} Applications</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-xs sm:text-sm">{transformedInstallationRequests.length} Installation Requests</span>
                </div>
              </div>
            </div>
            <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/10 to-transparent"></div>
            <div className="absolute -right-4 top-4 h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-white/10"></div>
            <div className="absolute -right-8 top-16 h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-white/5"></div>
          </div>

          <Tabs defaultValue="all-forms" className="space-y-4 sm:space-y-6">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 h-auto p-1">
              <TabsTrigger value="all-forms" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm px-2 py-2 lg:px-3 lg:py-2">
                <HardHat className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="hidden sm:inline">All Forms</span>
                <span className="sm:hidden">All</span>
              </TabsTrigger>
              <TabsTrigger value="application-forms" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm px-2 py-2 lg:px-3 lg:py-2">
                <FileText className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="hidden sm:inline">Application Forms</span>
                <span className="sm:hidden">Apps</span>
              </TabsTrigger>
              <TabsTrigger value="installation-requests" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm px-2 py-2 lg:px-3 lg:py-2">
                <Building className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="hidden sm:inline">Installation Requests</span>
                <span className="sm:hidden">Install</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm px-2 py-2 lg:px-3 lg:py-2">
                <BarChart3 className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="hidden sm:inline">Analytics</span>
                <span className="sm:hidden">Stats</span>
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
                                                className={`text-sm ${form.displayStatus === 'approved'
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

            <TabsContent value="application-forms" className="space-y-4 lg:space-y-6">
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <CardTitle className="text-lg lg:text-xl">WiFi Application Forms</CardTitle>
                      <CardDescription className="text-sm">Manage WiFi application forms and their status</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => {
                        console.log("Exporting application forms data:", transformedApplications);
                      }} className="bg-blue-600 hover:bg-blue-700 text-white text-xs lg:text-sm px-3 py-2">
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
                        placeholder="Search applications..."
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
                        <SelectItem value="inreview">In Review</SelectItem>
                        <SelectItem value="accept">Accepted</SelectItem>
                        <SelectItem value="reject">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="text-sm">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateFilter.from ? (
                              dateFilter.to ? (
                                <>
                                  {format(dateFilter.from, "LLL dd, y")} -{" "}
                                  {format(dateFilter.to, "LLL dd, y")}
                                </>
                              ) : (
                                format(dateFilter.from, "LLL dd, y")
                              )
                            ) : (
                              <span>Pick a date range</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                          <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateFilter.from}
                            selected={{ from: dateFilter.from, to: dateFilter.to }}
                            onSelect={(range) => {
                              if (range?.from) {
                                setDateFilter({ from: range.from, to: range.to });
                              }
                            }}
                            numberOfMonths={2}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="rounded-lg border overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50 dark:bg-gray-800">
                            <TableHead className="text-xs lg:text-sm font-medium">Application ID</TableHead>
                            <TableHead className="text-xs lg:text-sm font-medium">Customer</TableHead>
                            <TableHead className="text-xs lg:text-sm font-medium">Contact</TableHead>
                            <TableHead className="text-xs lg:text-sm font-medium">Plan Details</TableHead>
                            <TableHead className="text-xs lg:text-sm font-medium">Status</TableHead>
                            <TableHead className="text-xs lg:text-sm font-medium">Address</TableHead>
                            <TableHead className="text-xs lg:text-sm font-medium">Created</TableHead>
                            <TableHead className="text-xs lg:text-sm font-medium">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {applicationsLoading ? (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-8">
                                <div className="flex items-center justify-center">
                                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                  <span className="ml-2 text-sm text-gray-600">Loading applications...</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : applicationsError ? (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-8">
                                <div className="text-red-600 text-sm">
                                  Error loading applications. Please refresh the page.
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            transformedApplications
                              .filter((app: any) => {
                                const matchesSearch =
                                  app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  app.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  app.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  app.applicationId.toLowerCase().includes(searchTerm.toLowerCase());

                                const matchesStatus = statusFilter === "all" || app.status === statusFilter;

                                let matchesDate = true;
                                if (dateFilter.from && dateFilter.to) {
                                  const appDate = parseISO(app.createdAt);
                                  const fromDate = startOfDay(dateFilter.from);
                                  const toDate = endOfDay(dateFilter.to);
                                  matchesDate = isAfter(appDate, fromDate) && isBefore(appDate, toDate);
                                }

                                return matchesSearch && matchesStatus && matchesDate;
                              })
                              .map((app: any) => (
                                <TableRow key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                  <TableCell className="py-3">
                                    <div className="font-medium text-xs lg:text-sm text-blue-600">{app.applicationId}</div>
                                  </TableCell>
                                  <TableCell className="py-3">
                                    <div>
                                      <div className="font-medium text-xs lg:text-sm">{app.name}</div>
                                      <div className="text-xs text-gray-500 hidden lg:block">{app.village}</div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-3">
                                    <div>
                                      <div className="text-xs lg:text-sm">{app.phoneNumber}</div>
                                      {app.alternatePhoneNumber && (
                                        <div className="text-xs text-gray-500 hidden lg:block">{app.alternatePhoneNumber}</div>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-3">
                                    <div className="max-w-xs">
                                      {app.planDetails ? (
                                        <div className="space-y-1">
                                          <div className="text-xs lg:text-sm font-medium">{app.planDetails.title}</div>
                                          <div className="text-xs text-gray-600">₹{app.planDetails.price} - {app.planDetails.speed} Mbps</div>
                                          <div className="text-xs text-gray-500">{app.planDetails.provider}</div>
                                        </div>
                                      ) : (
                                        <div className="text-xs text-gray-500">No plan selected</div>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-3">
                                    <Badge className={`${getStatusColor(app.status)} text-xs`}>
                                      {app.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="py-3">
                                    <div className="text-xs text-gray-600 max-w-xs truncate">
                                      {app.address}, {app.village} - {app.pincode}
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-3">
                                    <div className="text-xs lg:text-sm">
                                      {format(parseISO(app.createdAt), "MMM dd, yyyy")}
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
                                              WiFi Application Details - {app.name}
                                            </DialogTitle>
                                            <DialogDescription className="text-sm">
                                              Complete application information and plan details
                                            </DialogDescription>
                                          </DialogHeader>
                                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            <div>
                                              <Label className="text-sm font-medium">Application ID</Label>
                                              <p className="text-sm font-mono">{app.applicationId}</p>
                                            </div>
                                            <div>
                                              <Label className="text-sm font-medium">Status</Label>
                                              <Badge className={`${getStatusColor(app.status)} text-sm`}>
                                                {app.status}
                                              </Badge>
                                            </div>
                                            <div>
                                              <Label className="text-sm font-medium">Customer Name</Label>
                                              <p className="text-sm">{app.name}</p>
                                            </div>
                                            <div>
                                              <Label className="text-sm font-medium">Contact Number</Label>
                                              <p className="text-sm">{app.countryCode} {app.phoneNumber}</p>
                                            </div>
                                            {app.alternatePhoneNumber && (
                                              <div>
                                                <Label className="text-sm font-medium">Alternate Phone</Label>
                                                <p className="text-sm">{app.alternateCountryCode} {app.alternatePhoneNumber}</p>
                                              </div>
                                            )}
                                            <div>
                                              <Label className="text-sm font-medium">Email</Label>
                                              <p className="text-sm">{app.userDetails?.email || 'N/A'}</p>
                                            </div>
                                            <div className="lg:col-span-2">
                                              <Label className="text-sm font-medium">Address</Label>
                                              <p className="text-sm">{app.address}, {app.village} - {app.pincode}</p>
                                            </div>
                                            {app.planDetails && (
                                              <>
                                                <div className="lg:col-span-2">
                                                  <Label className="text-sm font-medium">Selected Plan</Label>
                                                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                      {app.planDetails.logo && (
                                                        <img
                                                          src={`${BASE_URL}${app.planDetails.logo}`}
                                                          alt={app.planDetails.provider}
                                                          className="w-12 h-12 object-cover rounded-lg"
                                                        />
                                                      )}
                                                      <div className="flex-1">
                                                        <div className="font-medium">{app.planDetails.title}</div>
                                                        <div className="text-sm text-gray-600">₹{app.planDetails.price} - {app.planDetails.speed} Mbps</div>
                                                        <div className="text-xs text-gray-500">{app.planDetails.provider} • {app.planDetails.validity}</div>
                                                      </div>
                                                    </div>
                                                    {app.planDetails.benefits && app.planDetails.benefits.length > 0 && (
                                                      <div className="mt-2">
                                                        <div className="text-xs font-medium text-gray-600">Benefits:</div>
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                          {app.planDetails.benefits.map((benefit: string, index: number) => (
                                                            <Badge key={index} variant="secondary" className="text-xs">
                                                              {benefit}
                                                            </Badge>
                                                          ))}
                                                        </div>
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              </>
                                            )}
                                            <div>
                                              <Label className="text-sm font-medium">Created Date</Label>
                                              <p className="text-sm">{format(parseISO(app.createdAt), "MMM dd, yyyy HH:mm")}</p>
                                            </div>
                                            <div>
                                              <Label className="text-sm font-medium">Last Updated</Label>
                                              <p className="text-sm">{format(parseISO(app.updatedAt), "MMM dd, yyyy HH:mm")}</p>
                                            </div>
                                          </div>

                                          {/* Action Buttons for In Review Items */}
                                          {app.status === 'inreview' && (
                                            <div className="mt-6 pt-4 border-t">
                                              <h4 className="font-semibold mb-3 text-sm lg:text-base">Actions</h4>
                                              <div className="flex flex-col sm:flex-row gap-2">
                                                <Button
                                                  className="bg-green-600 hover:bg-green-700 text-white text-sm"
                                                  onClick={async () => {
                                                    try {
                                                      await updateApplicationStatus({ id: app.id, status: 'accept' });
                                                      console.log("Application accepted:", app.applicationId);
                                                      alert("Application accepted successfully!");
                                                    } catch (error) {
                                                      console.error("Error accepting application:", error);
                                                      alert("Error accepting application. Please try again.");
                                                    }
                                                  }}
                                                >
                                                  <CheckCircle className="h-4 w-4 mr-2" />
                                                  Accept Application
                                                </Button>
                                                <Button
                                                  variant="destructive"
                                                  className="text-sm"
                                                  onClick={async () => {
                                                    try {
                                                      await updateApplicationStatus({ id: app.id, status: 'reject' });
                                                      console.log("Application rejected:", app.applicationId);
                                                      alert("Application rejected successfully!");
                                                    } catch (error) {
                                                      console.error("Error rejecting application:", error);
                                                    }
                                                  }}
                                                >
                                                  <XCircle className="h-4 w-4 mr-2" />
                                                  Reject Application
                                                </Button>
                                                <Button
                                                  variant="outline"
                                                  className="border-green-500 text-green-600 hover:bg-green-50 text-sm"
                                                  onClick={() => setIsNodeSelectionOpen(true)}
                                                >
                                                  🌐 Select Node
                                                </Button>
                                              </div>
                                            </div>
                                          )}

                                          {/* Action Buttons for Accepted Items */}
                                          {app.status === 'accept' && (
                                            <div className="mt-6 pt-4 border-t">
                                              <h4 className="font-semibold mb-3 text-sm lg:text-base">Actions</h4>
                                              <div className="flex flex-col sm:flex-row gap-2">
                                                <Button
                                                  variant="outline"
                                                  className="border-green-500 text-green-600 hover:bg-green-50 text-sm"
                                                  onClick={() => setIsNodeSelectionOpen(true)}
                                                >
                                                  🌐 Select Node
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

            <TabsContent value="installation-requests" className="space-y-4 lg:space-y-6">
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <CardTitle className="text-lg lg:text-xl">Installation Requests</CardTitle>
                      <CardDescription className="text-sm">Manage installation requests and assign engineers</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => {
                        console.log("Exporting installation requests data:", transformedInstallationRequests);
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
                        placeholder="Search installation requests..."
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
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="text-sm">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateFilter.from ? (
                              dateFilter.to ? (
                                <>
                                  {format(dateFilter.from, "LLL dd, y")} -{" "}
                                  {format(dateFilter.to, "LLL dd, y")}
                                </>
                              ) : (
                                format(dateFilter.from, "LLL dd, y")
                              )
                            ) : (
                              <span>Pick a date range</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                          <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateFilter.from}
                            selected={{ from: dateFilter.from, to: dateFilter.to }}
                            onSelect={(range) => {
                              if (range?.from) {
                                setDateFilter({ from: range.from, to: range.to });
                              }
                            }}
                            numberOfMonths={2}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="rounded-lg border overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50 dark:bg-gray-800">
                            <TableHead className="text-xs lg:text-sm font-medium">Request ID</TableHead>
                            <TableHead className="text-xs lg:text-sm font-medium">Customer</TableHead>
                            <TableHead className="text-xs lg:text-sm font-medium">Contact</TableHead>
                            <TableHead className="text-xs lg:text-sm font-medium">Application</TableHead>
                            <TableHead className="text-xs lg:text-sm font-medium">Status</TableHead>
                            <TableHead className="text-xs lg:text-sm font-medium">Assigned Engineer</TableHead>
                            <TableHead className="text-xs lg:text-sm font-medium">Documents</TableHead>
                            <TableHead className="text-xs lg:text-sm font-medium">Created</TableHead>
                            <TableHead className="text-xs lg:text-sm font-medium">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {installationRequestsLoading ? (
                            <TableRow>
                              <TableCell colSpan={9} className="text-center py-8">
                                <div className="flex items-center justify-center">
                                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                  <span className="ml-2 text-sm text-gray-600">Loading installation requests...</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : installationRequestsError ? (
                            <TableRow>
                              <TableCell colSpan={9} className="text-center py-8">
                                <div className="text-red-600 text-sm">
                                  Error loading installation requests. Please refresh the page.
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            transformedInstallationRequests
                              .filter((req: any) => {
                                const matchesSearch =
                                  req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  req.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  req.displayAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  req.displayId.toLowerCase().includes(searchTerm.toLowerCase());

                                const matchesStatus = statusFilter === "all" || req.status === statusFilter;

                                let matchesDate = true;
                                if (dateFilter.from && dateFilter.to) {
                                  const reqDate = parseISO(req.createdAt);
                                  const fromDate = startOfDay(dateFilter.from);
                                  const toDate = endOfDay(dateFilter.to);
                                  matchesDate = isAfter(reqDate, fromDate) && isBefore(reqDate, toDate);
                                }

                                return matchesSearch && matchesStatus && matchesDate;
                              })
                              .map((req: any) => (
                                <TableRow key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                  <TableCell className="py-3">
                                    <div className="font-medium text-xs lg:text-sm text-green-600">{req.displayId}</div>
                                  </TableCell>
                                  <TableCell className="py-3">
                                    <div>
                                      <div className="font-medium text-xs lg:text-sm">{req.name}</div>
                                      <div className="text-xs text-gray-500 hidden lg:block">{req.displayVillage}</div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-3">
                                    <div>
                                      <div className="text-xs lg:text-sm">{req.phoneNumber}</div>
                                      {req.alternatePhoneNumber && (
                                        <div className="text-xs text-gray-500 hidden lg:block">{req.alternatePhoneNumber}</div>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-3">
                                    <div className="text-xs lg:text-sm text-blue-600">
                                      {req.applicationId?.applicationId || 'N/A'}
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-3">
                                    <Badge className={`${getStatusColor(req.status)} text-xs`}>
                                      {req.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="py-3">
                                    <div className="text-xs lg:text-sm">
                                      {req.assignedEngineer ? (
                                        <div className="flex items-center gap-2">
                                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-medium text-blue-600">
                                              {req.assignedEngineer.firstName?.[0]}{req.assignedEngineer.lastName?.[0]}
                                            </span>
                                          </div>
                                          <span>{req.assignedEngineer.firstName} {req.assignedEngineer.lastName}</span>
                                        </div>
                                      ) : (
                                        <span className="text-gray-500">Not assigned</span>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-3">
                                    <div className="flex gap-1">
                                      {req.aadhaarFrontUrl && (
                                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                          Aadhaar ✓
                                        </Badge>
                                      )}
                                      {req.passportPhotoUrl && (
                                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                          Photo ✓
                                        </Badge>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-3">
                                    <div className="text-xs lg:text-sm">
                                      {format(parseISO(req.createdAt), "MMM dd, yyyy")}
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
                                              Installation Request Details - {req.name}
                                            </DialogTitle>
                                            <DialogDescription className="text-sm">
                                              Complete installation request information and documents
                                            </DialogDescription>
                                          </DialogHeader>
                                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            <div>
                                              <Label className="text-sm font-medium">Request ID</Label>
                                              <p className="text-sm font-mono">{req.displayId}</p>
                                            </div>
                                            <div>
                                              <Label className="text-sm font-medium">Status</Label>
                                              <Badge className={`${getStatusColor(req.status)} text-sm`}>
                                                {req.status}
                                              </Badge>
                                            </div>
                                            <div>
                                              <Label className="text-sm font-medium">Customer Name</Label>
                                              <p className="text-sm">{req.name}</p>
                                            </div>
                                            <div>
                                              <Label className="text-sm font-medium">Email</Label>
                                              <p className="text-sm">{req.email}</p>
                                            </div>
                                            <div>
                                              <Label className="text-sm font-medium">Contact Number</Label>
                                              <p className="text-sm">{req.countryCode} {req.phoneNumber}</p>
                                            </div>
                                            {req.alternatePhoneNumber && (
                                              <div>
                                                <Label className="text-sm font-medium">Alternate Phone</Label>
                                                <p className="text-sm">{req.alternateCountryCode} {req.alternatePhoneNumber}</p>
                                              </div>
                                            )}
                                            <div className="lg:col-span-2">
                                              <Label className="text-sm font-medium">Address</Label>
                                              <p className="text-sm">{req.displayAddress}, {req.displayVillage} - {req.displayPincode}</p>
                                            </div>
                                            <div>
                                              <Label className="text-sm font-medium">Application ID</Label>
                                              <p className="text-sm text-blue-600">{req.applicationId?.applicationId || 'N/A'}</p>
                                            </div>
                                            <div>
                                              <Label className="text-sm font-medium">Created Date</Label>
                                              <p className="text-sm">{format(parseISO(req.createdAt), "MMM dd, yyyy HH:mm")}</p>
                                            </div>
                                            {req.assignedEngineer && (
                                              <div className="lg:col-span-2">
                                                <Label className="text-sm font-medium">Assigned Engineer</Label>
                                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                  <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                      <span className="text-sm font-medium text-blue-600">
                                                        {req.assignedEngineer.firstName?.[0]}{req.assignedEngineer.lastName?.[0]}
                                                      </span>
                                                    </div>
                                                    <div>
                                                      <div className="font-medium">{req.assignedEngineer.firstName} {req.assignedEngineer.lastName}</div>
                                                      <div className="text-sm text-gray-600">{req.assignedEngineer.email}</div>
                                                      <div className="text-sm text-gray-500">{req.assignedEngineer.phoneNumber}</div>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                            {req.remarks && (
                                              <div className="lg:col-span-2">
                                                <Label className="text-sm font-medium">Remarks</Label>
                                                <p className="text-sm">{req.remarks}</p>
                                              </div>
                                            )}
                                          </div>

                                          {/* Documents Section */}
                                          <div className="mt-6">
                                            <h4 className="font-semibold mb-3 text-sm lg:text-base">Documents</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                              {req.aadhaarFrontUrl && (
                                                <div className="text-center">
                                                  <Label className="text-sm font-medium">Aadhaar Front</Label>
                                                  <div className="mt-2 p-3 border rounded-lg bg-green-50 dark:bg-green-900/20">
                                                    <img
                                                      src={`${BASE_URL}${req.aadhaarFrontUrl}`}
                                                      alt="Aadhaar Front"
                                                      className="w-full h-32 object-cover rounded-lg"
                                                    />
                                                    <p className="text-xs mt-1 text-green-600">✓ Uploaded</p>
                                                  </div>
                                                </div>
                                              )}
                                              {req.aadhaarBackUrl && (
                                                <div className="text-center">
                                                  <Label className="text-sm font-medium">Aadhaar Back</Label>
                                                  <div className="mt-2 p-3 border rounded-lg bg-green-50 dark:bg-green-900/20">
                                                    <img
                                                      src={`${BASE_URL}${req.aadhaarBackUrl}`}
                                                      alt="Aadhaar Back"
                                                      className="w-full h-32 object-cover rounded-lg"
                                                    />
                                                    <p className="text-xs mt-1 text-green-600">✓ Uploaded</p>
                                                  </div>
                                                </div>
                                              )}
                                              {req.passportPhotoUrl && (
                                                <div className="text-center">
                                                  <Label className="text-sm font-medium">Passport Photo</Label>
                                                  <div className="mt-2 p-3 border rounded-lg bg-green-50 dark:bg-green-900/20">
                                                    <img
                                                      src={`${BASE_URL}${req.passportPhotoUrl}`}
                                                      alt="Passport Photo"
                                                      className="w-full h-32 object-cover rounded-lg"
                                                    />
                                                    <p className="text-xs mt-1 text-green-600">✓ Uploaded</p>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </div>

                                          {/* Action Buttons for Installation Requests */}
                                          <div className="mt-6 pt-4 border-t">
                                            <h4 className="font-semibold mb-3 text-sm lg:text-base">Actions</h4>
                                            <div className="flex flex-col sm:flex-row gap-2">
                                              <Button
                                                className={`text-sm ${req.status === 'approved'
                                                  ? 'bg-gray-400 cursor-not-allowed'
                                                  : 'bg-green-600 hover:bg-green-700'
                                                  } text-white`}
                                                onClick={() => {
                                                  if (req.status !== 'approved') {
                                                    setSelectedInstallationRequest(req);
                                                    setShowInstallationRequestModal(true);
                                                  }
                                                }}
                                                disabled={req.status === 'approved'}
                                              >
                                                <HardHat className="h-4 w-4 mr-2" />
                                                Assign Engineer
                                              </Button>
                                              <Button
                                                variant="outline"
                                                className="text-sm"
                                                onClick={() => {
                                                  setSelectedInstallationRequest(req);
                                                  setShowInstallationRequestModal(true);
                                                }}
                                              >
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Details
                                              </Button>
                                              <Button
                                                variant="outline"
                                                className="border-green-500 text-green-600 hover:bg-green-50 text-sm"
                                                onClick={() => setIsNodeSelectionOpen(true)}
                                              >
                                                🌐 Select Node
                                              </Button>
                                            </div>
                                          </div>
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
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm lg:text-base font-medium">In Review Applications</CardTitle>
                    <Clock className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl lg:text-2xl font-bold text-blue-600">{analytics.inReviewApplications}</div>
                    <p className="text-xs lg:text-sm text-muted-foreground">
                      Applications under review
                    </p>
                  </CardContent>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm lg:text-base font-medium">Accepted Applications</CardTitle>
                    <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl lg:text-2xl font-bold text-green-600">{analytics.acceptedApplications}</div>
                    <p className="text-xs lg:text-sm text-muted-foreground">
                      {analytics.applicationSuccessRate}% success rate
                    </p>
                  </CardContent>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm lg:text-base font-medium">Total Applications</CardTitle>
                    <FileText className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl lg:text-2xl font-bold text-purple-600">{transformedApplications.length}</div>
                    <p className="text-xs lg:text-sm text-muted-foreground">
                      Application forms submitted
                    </p>
                  </CardContent>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm lg:text-base font-medium">Installation Requests</CardTitle>
                    <Building className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl lg:text-2xl font-bold text-orange-600">{transformedInstallationRequests.length}</div>
                    <p className="text-xs lg:text-sm text-muted-foreground">
                      Requests in review
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base lg:text-lg">Installation Request Status Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm lg:text-base">In Review</span>
                        <span className="text-sm lg:text-base font-medium">{transformedInstallationRequests.filter((req: any) => req.status === 'inreview').length}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-yellow-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(transformedInstallationRequests.filter((req: any) => req.status === 'inreview').length / transformedInstallationRequests.length) * 100}%` }}></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm lg:text-base">Approved</span>
                        <span className="text-sm lg:text-base font-medium">{transformedInstallationRequests.filter((req: any) => req.status === 'approved').length}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(transformedInstallationRequests.filter((req: any) => req.status === 'approved').length / transformedInstallationRequests.length) * 100}%` }}></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm lg:text-base">Rejected</span>
                        <span className="text-sm lg:text-base font-medium">{transformedInstallationRequests.filter((req: any) => req.status === 'rejected').length}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-red-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(transformedInstallationRequests.filter((req: any) => req.status === 'rejected').length / transformedInstallationRequests.length) * 100}%` }}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base lg:text-lg">Application Status Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm lg:text-base">In Review</span>
                        <span className="text-sm lg:text-base font-medium">{transformedApplications.filter((app: any) => app.status === 'inreview').length}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-yellow-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(transformedApplications.filter((app: any) => app.status === 'inreview').length / transformedApplications.length) * 100}%` }}></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm lg:text-base">Accepted</span>
                        <span className="text-sm lg:text-base font-medium">{transformedApplications.filter((app: any) => app.status === 'accept').length}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(transformedApplications.filter((app: any) => app.status === 'accept').length / transformedApplications.length) * 100}%` }}></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm lg:text-base">Rejected</span>
                        <span className="text-sm lg:text-base font-medium">{transformedApplications.filter((app: any) => app.status === 'reject').length}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-red-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(transformedApplications.filter((app: any) => app.status === 'reject').length / transformedApplications.length) * 100}%` }}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>




          </Tabs>
        </div>
      </div>

      {/* Installation Request Details Modal */}
      <Dialog open={showInstallationRequestModal} onOpenChange={setShowInstallationRequestModal}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sticky top-0 bg-background z-10 pb-4 border-b">
            <DialogTitle className="text-base sm:text-lg lg:text-xl">Installation Request Details</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Review and manage installation request
            </DialogDescription>
          </DialogHeader>

          {selectedInstallationRequest && (
            <div className="space-y-4 pt-4">
              {/* Status Banner */}
              <div className={`p-3 sm:p-4 rounded-lg border ${selectedInstallationRequest.status === 'approved'
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-600'
                  : selectedInstallationRequest.status === 'rejected'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-600'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-600'
                }`}>
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedInstallationRequest.status === 'approved' ? (
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                  ) : selectedInstallationRequest.status === 'rejected' ? (
                    <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0" />
                  ) : (
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 flex-shrink-0" />
                  )}
                  <span className={`font-medium text-xs sm:text-sm ${selectedInstallationRequest.status === 'approved'
                      ? 'text-green-700 dark:text-green-300'
                      : selectedInstallationRequest.status === 'rejected'
                        ? 'text-red-700 dark:text-red-300'
                        : 'text-yellow-700 dark:text-yellow-300'
                    }`}>
                    Status: {selectedInstallationRequest.status.charAt(0).toUpperCase() + selectedInstallationRequest.status.slice(1)}
                  </span>
                </div>
                {selectedInstallationRequest.status === 'approved' && (
                  <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 mt-2">
                    This installation request has been approved and an engineer has been assigned.
                  </p>
                )}
              </div>

              {/* Customer Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <Label className="text-xs sm:text-sm font-medium text-muted-foreground">Customer Name</Label>
                  <p className="text-xs sm:text-sm font-medium">{selectedInstallationRequest.name}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs sm:text-sm font-medium text-muted-foreground">Request ID</Label>
                  <p className="text-xs sm:text-sm font-mono">{selectedInstallationRequest.displayId}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs sm:text-sm font-medium text-muted-foreground">Phone Number</Label>
                  <p className="text-xs sm:text-sm">{selectedInstallationRequest.phoneNumber}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs sm:text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="text-xs sm:text-sm break-all">{selectedInstallationRequest.email}</p>
                </div>
                <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                  <Label className="text-xs sm:text-sm font-medium text-muted-foreground">Address</Label>
                  <p className="text-xs sm:text-sm">{selectedInstallationRequest.displayAddress}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs sm:text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge className={`${getStatusColor(selectedInstallationRequest.status)} text-xs`}>
                    {selectedInstallationRequest.status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs sm:text-sm font-medium text-muted-foreground">Created Date</Label>
                  <p className="text-xs sm:text-sm">{format(parseISO(selectedInstallationRequest.createdAt), "MMM dd, yyyy")}</p>
                </div>
              </div>

              {/* Documents Section */}
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium text-muted-foreground">Documents</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                  {selectedInstallationRequest.displayAadhaarFront && (
                    <div className="text-center p-2 sm:p-3 border rounded-lg bg-green-50 dark:bg-green-900/20">
                      <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6 mx-auto text-green-600" />
                      <p className="text-xs mt-1">Aadhaar Front</p>
                    </div>
                  )}
                  {selectedInstallationRequest.displayAadhaarBack && (
                    <div className="text-center p-2 sm:p-3 border rounded-lg bg-green-50 dark:bg-green-900/20">
                      <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6 mx-auto text-green-600" />
                      <p className="text-xs mt-1">Aadhaar Back</p>
                    </div>
                  )}
                  {selectedInstallationRequest.displayPassportPhoto && (
                    <div className="text-center p-2 sm:p-3 border rounded-lg bg-green-50 dark:bg-green-900/20">
                      <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6 mx-auto text-green-600" />
                      <p className="text-xs mt-1">Passport Photo</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Engineer Assignment Section - Only show if not already approved */}
              {!selectedInstallationRequest?.status || selectedInstallationRequest?.status !== 'approved' ? (
                <div className="space-y-3">
                  {isEngineerSelected && (
                    <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Label className="text-xs sm:text-sm font-medium text-muted-foreground">Selected Engineer</Label>
                      {engineers?.data?.engineers && (
                        <p className="text-xs sm:text-sm mt-1">
                          {engineers.data.engineers.find((e: any) => e._id === selectedEngineer)?.firstName} {" "}
                          {engineers.data.engineers.find((e: any) => e._id === selectedEngineer)?.lastName} - {" "}
                          {engineers.data.engineers.find((e: any) => e._id === selectedEngineer)?.phoneNumber}
                        </p>
                      )}
                    </div>
                  )}

                  {selectedNode && (
                    <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <Label className="text-xs sm:text-sm font-medium text-muted-foreground">Selected Node</Label>
                      <p className="text-xs sm:text-sm mt-1 font-mono text-green-700 dark:text-green-300 break-all">
                        {selectedNode}
                      </p>
                    </div>
                  )}

                  {/* Remarks Section - Only show if not already approved */}
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-medium text-muted-foreground">Remarks (Optional)</Label>
                    <Input
                      placeholder="Enter remarks for the assignment"
                      value={assignmentRemarks}
                      onChange={(e) => setAssignmentRemarks(e.target.value)}
                      className="text-xs sm:text-sm"
                    />
                  </div>
                </div>
              ) : (
                /* Show current engineer info if already approved */
                <div className="space-y-3">
                  {selectedInstallationRequest?.assignedEngineer && (
                    <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <Label className="text-xs sm:text-sm font-medium text-muted-foreground">Currently Assigned Engineer</Label>
                      <div className="mt-2 space-y-1">
                        <p className="text-xs sm:text-sm font-medium">
                          {selectedInstallationRequest.assignedEngineer.firstName} {selectedInstallationRequest.assignedEngineer.lastName}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 break-all">{selectedInstallationRequest.assignedEngineer.email}</p>
                        <p className="text-xs sm:text-sm text-gray-500">{selectedInstallationRequest.assignedEngineer.phoneNumber}</p>
                      </div>
                    </div>
                  )}

                  {selectedNode && (
                    <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Label className="text-xs sm:text-sm font-medium text-muted-foreground">Selected Node</Label>
                      <p className="text-xs sm:text-sm mt-1 font-mono text-blue-700 dark:text-blue-300 break-all">
                        {selectedNode}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="sticky bottom-0 bg-background pt-4 border-t mt-6">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowInstallationRequestModal(false);
                  setSelectedInstallationRequest(null);
                  setSelectedEngineer("");
                  setAssignmentRemarks("");
                  setIsEngineerSelected(false);
                  // Don't clear selectedNode here - keep it for next use
                }}
                className="text-xs sm:text-sm order-last sm:order-none"
              >
                Cancel
              </Button>

              {/* Only show Reject button if not already approved */}
              {(!selectedInstallationRequest?.status || selectedInstallationRequest?.status !== 'approved') && (
                <Button
                  variant="destructive"
                  onClick={handleRejectInstallationRequest}
                  className="text-xs sm:text-sm"
                >
                  <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Reject
                </Button>
              )}

              {/* Only show Engineer selection buttons if not already approved */}
              {(!selectedInstallationRequest?.status || selectedInstallationRequest?.status !== 'approved') ? (
                <>
                  <Button
                    onClick={() => setShowEngineerAssignmentModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm"
                  >
                    <HardHat className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Select Engineer
                  </Button>
                  {isEngineerSelected && (
                    <Button
                      onClick={handleEngineerAssignment}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm"
                    >
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Submit Assignment
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="border-green-500 text-green-600 hover:bg-green-50 text-xs sm:text-sm"
                    onClick={() => setIsNodeSelectionOpen(true)}
                  >
                    🌐 Select Node
                  </Button>
                </>
              ) : (
                /* Show info message for approved requests */
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-600">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-green-700 dark:text-green-300">
                    Installation request already approved and engineer assigned
                  </span>
                </div>
              )}

              {/* Always show Select Node button for approved requests */}
              {selectedInstallationRequest?.status === 'approved' && (
                <Button
                  variant="outline"
                  className="border-green-500 text-green-600 hover:bg-green-50 text-xs sm:text-sm"
                  onClick={() => setIsNodeSelectionOpen(true)}
                >
                  🌐 Select Node
                </Button>
              )}

              {/* Add a button to clear selected node if needed */}
              {selectedNode && (
                <Button
                  variant="outline"
                  className="border-red-500 text-red-600 hover:bg-red-50 text-xs sm:text-sm"
                  onClick={() => {
                    setSelectedNode("");
                    localStorage.removeItem('selectedNode');
                  }}
                >
                  🗑️ Clear Node
                </Button>
              )}
            </div>
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
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedEngineer === engineer._id
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

      {/* Node Selection Modal */}
      <Dialog open={isNodeSelectionOpen} onOpenChange={setIsNodeSelectionOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-lg sm:text-xl lg:text-2xl">Select OLT & Node</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Choose an OLT and navigate through its network hierarchy to select a node
            </DialogDescription>
          </DialogHeader>

          {/* Power Loss Information */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 text-sm">Power Loss Information</h4>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Nodes show power loss in dB. Only nodes with ≤20dB total loss (✅) can accept customers for good WiFi connection.
                  Red nodes (❌) have &gt;20dB loss and cannot accept new customers.
                </p>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="text-blue-600 dark:text-blue-400">Split 2: -3dB</div>
                  <div className="text-blue-600 dark:text-blue-400">Split 4: -7dB</div>
                  <div className="text-blue-600 dark:text-blue-400">Split 8: -10dB</div>
                  <div className="text-blue-600 dark:text-blue-400">Split 16: -13dB</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {/* Search and Filter Section */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Search OLTs..."
                  className="text-sm sm:text-base h-10 sm:h-12"
                />
              </div>
              <Select>
                <SelectTrigger className="w-full sm:w-[180px] text-sm sm:text-base h-10 sm:h-12">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* OLT Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {oltData.map((olt: any) => (
                <div
                  key={olt._id}
                  className={`p-3 sm:p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${selectedOlt?._id === olt._id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300'
                    }`}
                  onClick={() => {
                    setSelectedOlt(olt);
                    setExpandedOlt(expandedOlt === olt._id ? null : olt._id);
                  }}
                >
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full"></div>
                      <h3 className="font-semibold text-xs sm:text-sm lg:text-base text-blue-700 dark:text-blue-300">{olt.name}</h3>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${olt.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : olt.status === 'maintenance'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                    >
                      {olt.status}
                    </Badge>
                  </div>

                  <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>IP:</span>
                      <span className="font-mono text-xs">{olt.oltIp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="uppercase text-xs">{olt.oltType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Power:</span>
                      <span className="text-xs">{olt.oltPower}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>MS Devices:</span>
                      <span className="text-xs">{olt.ms_devices?.length || 0}</span>
                    </div>
                  </div>

                  {/* Expand/Collapse Indicator */}
                  <div className="flex justify-center mt-2 sm:mt-3">
                    <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-transform duration-200 ${expandedOlt === olt._id
                        ? 'bg-blue-100 dark:bg-blue-800 rotate-180'
                        : 'bg-gray-100 dark:bg-gray-700'
                      }`}>
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tree Structure for Selected OLT */}
            {selectedOlt && expandedOlt === selectedOlt._id && (
              <div className="border-t pt-4 sm:pt-6">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-blue-700 dark:text-blue-300">
                    Network Hierarchy - {selectedOlt.name}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {selectedOlt.ms_devices?.length || 0} MS Devices
                  </Badge>
                </div>

                {/* Tree Structure */}
                <div className="space-y-3 sm:space-y-4">
                  {/* OLT Level */}
                  <div className="relative">
                    <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg border border-blue-200 dark:border-blue-600">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm sm:text-base text-blue-800 dark:text-blue-200">{selectedOlt.name}</h4>
                        <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">{selectedOlt.oltIp} • {selectedOlt.oltType.toUpperCase()}</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">
                        OLT
                      </Badge>
                    </div>

                    {/* Connection Line */}
                    {selectedOlt.ms_devices && selectedOlt.ms_devices.length > 0 && (
                      <div className="absolute left-3 sm:left-7 top-10 sm:top-12 w-0.5 h-6 sm:h-8 bg-blue-300 dark:bg-blue-600"></div>
                    )}
                  </div>

                  {/* MS Devices Level */}
                  {selectedOlt.ms_devices && selectedOlt.ms_devices.map((ms: any, msIndex: number) => (
                    <div key={ms.ms_id} className="relative ml-4 sm:ml-8">
                      <div className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border transition-colors ${canAcceptCustomer(selectedOlt, ms.ms_id, 'ms')
                          ? 'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border-green-200 dark:border-green-600 hover:bg-green-100 dark:hover:bg-green-800/40 cursor-pointer'
                          : 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border-red-200 dark:border-red-600 opacity-60 cursor-not-allowed'
                        }`}
                        onClick={() => {
                          if (canAcceptCustomer(selectedOlt, ms.ms_id, 'ms')) {
                            setSelectedNode(`${selectedOlt.name} > ${ms.ms_name} (${ms.ms_id})`);
                          } else {
                            alert('This node cannot accept customers due to high power loss (>20dB). Please select a different node.');
                          }
                        }}>
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-xs sm:text-sm text-green-800 dark:text-green-200">{ms.ms_name}</h5>
                          <p className="text-xs text-green-600 dark:text-green-400">
                            ID: {ms.ms_id} • Power: {ms.ms_power} • Loss: {Math.abs(calculateCumulativePowerLoss(selectedOlt, ms.ms_id, 'ms'))}dB
                            {canAcceptCustomer(selectedOlt, ms.ms_id, 'ms') ? ' ✅' : ' ❌'}
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                          MS
                        </Badge>
                      </div>

                      {/* Connection Line */}
                      {ms.outputs && ms.outputs.length > 0 && (
                        <div className="absolute left-2 sm:left-3 top-7 sm:top-9 w-0.5 h-4 sm:h-6 bg-green-300 dark:bg-green-600"></div>
                      )}

                      {/* SUBMS Devices */}
                      {ms.outputs && ms.outputs.filter((output: any) => output.type === 'subms').map((submsOutput: any) => {
                        const subms = selectedOlt.subms_devices?.find((s: any) => s.subms_id === submsOutput.id);
                        if (!subms) return null;

                        return (
                          <div key={subms.subms_id} className="relative ml-3 sm:ml-6 mt-1 sm:mt-2">
                            <div className={`flex items-center gap-2 sm:gap-3 p-2 rounded-lg border transition-colors ${canAcceptCustomer(selectedOlt, subms.subms_id, 'subms')
                                ? 'bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border-purple-200 dark:border-purple-600 hover:bg-purple-100 dark:hover:bg-purple-800/40 cursor-pointer'
                                : 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border-red-200 dark:border-red-600 opacity-60 cursor-not-allowed'
                              }`}
                              onClick={() => {
                                if (canAcceptCustomer(selectedOlt, subms.subms_id, 'subms')) {
                                  setSelectedNode(`${selectedOlt.name} > ${ms.ms_name} > ${subms.subms_name} (${subms.subms_id})`);
                                } else {
                                  alert('This node cannot accept customers due to high power loss (>20dB). Please select a different node.');
                                }
                              }}>
                              <div className="w-4 h-4 sm:w-5 sm:h-5 bg-purple-500 rounded-full flex items-center justify-center">
                                <svg className="w-2 h-2 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h6 className="font-medium text-xs sm:text-sm text-purple-800 dark:text-purple-200">{subms.subms_name}</h6>
                                <p className="text-xs text-purple-600 dark:text-purple-400">
                                  ID: {subms.subms_id} • Power: {subms.subms_power} • Loss: {Math.abs(calculateCumulativePowerLoss(selectedOlt, subms.subms_id, 'subms'))}dB
                                  {canAcceptCustomer(selectedOlt, subms.subms_id, 'subms') ? ' ✅' : ' ❌'}
                                </p>
                              </div>
                              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs">
                                SUBMS
                              </Badge>
                            </div>

                            {/* Connection Line */}
                            {subms.outputs && subms.outputs.length > 0 && (
                              <div className="absolute left-2 sm:left-2.5 top-6 sm:top-7 w-0.5 h-3 sm:h-4 bg-purple-300 dark:bg-purple-600"></div>
                            )}

                            {/* FDB Devices */}
                            {subms.outputs && subms.outputs.filter((output: any) => output.type === 'fdb').map((fdbOutput: any) => {
                              const fdb = selectedOlt.fdb_devices?.find((f: any) => f.fdb_id === fdbOutput.id);
                              if (!fdb) return null;

                              return (
                                <div key={fdb.fdb_id} className="relative ml-2 sm:ml-4 mt-1">
                                  <div className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${canAcceptCustomer(selectedOlt, fdb.fdb_id, 'fdb')
                                      ? 'bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 border-orange-200 dark:border-orange-600 hover:bg-orange-100 dark:hover:bg-orange-800/40 cursor-pointer'
                                      : 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border-red-200 dark:border-red-600 opacity-60 cursor-not-allowed'
                                    }`}
                                    onClick={() => {
                                      if (canAcceptCustomer(selectedOlt, fdb.fdb_id, 'fdb')) {
                                        setSelectedNode(`${selectedOlt.name} > ${ms.ms_name} > ${subms.subms_name} > ${fdb.fdb_name} (${fdb.fdb_id})`);
                                      } else {
                                        alert('This node cannot accept customers due to high power loss (>20dB). Please select a different node.');
                                      }
                                    }}>
                                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-orange-500 rounded-full flex items-center justify-center">
                                      <svg className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                      </svg>
                                    </div>
                                    <div className="flex-1">
                                      <h6 className="font-medium text-xs text-orange-800 dark:text-orange-200">{fdb.fdb_name}</h6>
                                      <p className="text-xs text-orange-600 dark:text-orange-400">
                                        ID: {fdb.fdb_id} • Power: {fdb.fdb_power} • Loss: {Math.abs(calculateCumulativePowerLoss(selectedOlt, fdb.fdb_id, 'fdb'))}dB
                                        {canAcceptCustomer(selectedOlt, fdb.fdb_id, 'fdb') ? ' ✅' : ' ❌'}
                                      </p>
                                    </div>
                                    <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 text-xs">
                                      FDB
                                    </Badge>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}

                      {/* Direct FDB connections from MS */}
                      {ms.outputs && ms.outputs.filter((output: any) => output.type === 'fdb').map((fdbOutput: any) => {
                        const fdb = selectedOlt.fdb_devices?.find((f: any) => f.fdb_id === fdbOutput.id);
                        if (!fdb) return null;

                        return (
                          <div key={fdb.fdb_id} className="relative ml-3 sm:ml-6 mt-1 sm:mt-2">
                            <div className={`flex items-center gap-2 sm:gap-3 p-2 rounded-lg border transition-colors ${canAcceptCustomer(selectedOlt, fdb.fdb_id, 'fdb')
                                ? 'bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 border-orange-200 dark:border-orange-600 hover:bg-orange-100 dark:hover:bg-orange-800/40 cursor-pointer'
                                : 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border-red-200 dark:border-red-600 opacity-60 cursor-not-allowed'
                              }`}
                              onClick={() => {
                                if (canAcceptCustomer(selectedOlt, fdb.fdb_id, 'fdb')) {
                                  setSelectedNode(`${selectedOlt.name} > ${ms.ms_name} > ${fdb.fdb_name} (${fdb.fdb_id})`);
                                } else {
                                  alert('This node cannot accept customers due to high power loss (>20dB). Please select a different node.');
                                }
                              }}>
                              <div className="w-4 h-4 sm:w-5 sm:h-5 bg-orange-500 rounded-full flex items-center justify-center">
                                <svg className="w-2 h-2 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h6 className="font-medium text-xs sm:text-sm text-orange-800 dark:text-orange-200">{fdb.fdb_name}</h6>
                                <p className="text-xs text-orange-600 dark:text-orange-400">
                                  ID: {fdb.fdb_id} • Power: {fdb.fdb_power} • Loss: {Math.abs(calculateCumulativePowerLoss(selectedOlt, fdb.fdb_id, 'fdb'))}dB
                                  {canAcceptCustomer(selectedOlt, fdb.fdb_id, 'fdb') ? ' ✅' : ' ❌'}
                                </p>
                              </div>
                              <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 text-xs">
                                FDB
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Node Display */}
            {selectedNode && (
              <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg border border-blue-200 dark:border-blue-600">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  <h4 className="font-semibold text-sm sm:text-base text-green-800 dark:text-green-200">Selected Node Path</h4>
                </div>
                <p className="text-xs sm:text-sm font-mono text-green-700 dark:text-green-300 break-all">{selectedNode}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsNodeSelectionOpen(false);
                // Don't clear selectedNode when just closing the modal
                setSelectedOlt(null);
                setExpandedOlt(null);
              }}
              className="text-sm sm:text-base h-10 sm:h-12"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Handle node selection logic here
                console.log("Node selected:", selectedNode);
                alert(`Node selected: ${selectedNode}`);
                setIsNodeSelectionOpen(false);
                // Keep the selectedNode for use in the installation request
                setSelectedOlt(null);
                setExpandedOlt(null);
              }}
              disabled={!selectedNode}
              className="bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base h-10 sm:h-12"
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