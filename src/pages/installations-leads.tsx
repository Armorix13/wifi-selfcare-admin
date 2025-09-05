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
  Router,
  Network,
  Shield,
  User,
  Smartphone,
  Wifi,
  Calendar as CalendarDays,
  Building,
  Globe,
  Settings,
  Target,
  Star,
  Zap,
  FileText,
  Download as DownloadIcon,
  Archive,
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
import { api, BASE_URL } from "@/api/index";

export default function InstallationsLeads() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [dateFilter, setDateFilter] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });



  const [showEngineerAssignmentModal, setShowEngineerAssignmentModal] = useState(false);
  const [showInstallationRequestModal, setShowInstallationRequestModal] = useState(false);
  const [selectedInstallationRequest, setSelectedInstallationRequest] = useState<any>(null);

  // New fields state management
  const [editableFields, setEditableFields] = useState({
    oltId: '',
    fdbId: '',
    modemName: '',
    ontType: '',
    modelNumber: '',
    serialNumber: '',
    ontMac: '',
    username: '',
    password: ''
  });
  // Remove manual edit mode - now based on status
  const [selectedEngineer, setSelectedEngineer] = useState("");
  const [assignmentRemarks, setAssignmentRemarks] = useState("");
  const [isEngineerSelected, setIsEngineerSelected] = useState(false);

  // API Hooks - Declare these first before any functions that use them
  const { data: applications, isLoading: applicationsLoading, error: applicationsError } = api.useGetAllApplicationsQuery({});
  const { data: installationRequestsData, isLoading: installationRequestsLoading, error: installationRequestsError } = api.useGetAllInstallationRequestsQuery({});
  const { data: engineers, isLoading: engineersLoading, error: engineersError } = api.useGetEngineersQuery({});
  const { data: oltData, isLoading: oltLoading, error: oltError } = api.useGetAllSelectNodesQuery({});
  const [updateApplicationStatus] = api.useUpdateApplicationStatusMutation();
  const [updateInstallationRequestStatus] = api.useUpdateInstallationRequestStatusMutation();
  
  // State for selected OLT to handle FDB cascade
  const [selectedOltId, setSelectedOltId] = useState<string>('');
  const [availableFdbs, setAvailableFdbs] = useState<any[]>([]);

  // Check if fields should be editable based on status
  const isFieldsEditable = selectedInstallationRequest?.status === 'inreview';

  // Helper function to update editable fields
  const handleFieldChange = (fieldName: string, value: string) => {
    setEditableFields(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Auto-save when in inreview status (debounced)
    if (isFieldsEditable) {
      // You can add debounced auto-save here if needed
      console.log(`Field ${fieldName} updated to: ${value}`);
    }
  };

  // Handle OLT selection and populate FDBs
  const handleOltSelection = (oltId: string) => {
    setSelectedOltId(oltId);
    handleFieldChange('oltId', oltId);
    
    // Find the selected OLT and get its FDBs
    if (oltData?.data) {
      const selectedOlt = oltData.data.find((olt: any) => olt._id === oltId);
      if (selectedOlt && selectedOlt.fdb_devices) {
        setAvailableFdbs(selectedOlt.fdb_devices);
      } else {
        setAvailableFdbs([]);
      }
    }
    
    // Reset FDB selection when OLT changes
    handleFieldChange('fdbId', '');
  };

  // Effect to populate editable fields when request is selected
  useEffect(() => {
    if (selectedInstallationRequest) {
      setEditableFields({
        oltId: selectedInstallationRequest.oltId || '',
        fdbId: selectedInstallationRequest.fdbId || '',
        modemName: selectedInstallationRequest.modemName || '',
        ontType: selectedInstallationRequest.ontType || '',
        modelNumber: selectedInstallationRequest.modelNumber || '',
        serialNumber: selectedInstallationRequest.serialNumber || '',
        ontMac: selectedInstallationRequest.ontMac || '',
        username: selectedInstallationRequest.username || '',
        password: selectedInstallationRequest.password || ''
      });

      // Initialize OLT selection and FDBs if OLT is already selected
      if (selectedInstallationRequest.oltId && oltData?.data) {
        const selectedOlt = oltData.data.find((olt: any) => olt._id === selectedInstallationRequest.oltId);
        if (selectedOlt && selectedOlt.fdb_devices) {
          setAvailableFdbs(selectedOlt.fdb_devices);
          setSelectedOltId(selectedInstallationRequest.oltId);
        }
      }
    }
  }, [selectedInstallationRequest, oltData]);

  // Function to save the updated fields (auto-save when status is inreview)
  const handleSaveFields = async () => {
    try {
      // Here you would call your API to update the installation request
      // await updateInstallationRequest(selectedInstallationRequest.id, editableFields);

      console.log('Auto-saving fields for inreview status:', editableFields);
      showToastMessage('Installation details updated successfully!', 'success');
    } catch (error) {
      console.error('Error saving fields:', error);
      showToastMessage('Failed to update installation details', 'error');
    }
  };

  // Function to download a file from URL
  const downloadFileFromUrl = async (url: string, filename: string): Promise<Blob> => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${filename}`);
      }
      return await response.blob();
    } catch (error) {
      console.error(`Error downloading ${filename}:`, error);
      throw error;
    }
  };

  // Function to download individual file
  const downloadIndividualFile = async (url: string, filename: string) => {
    setDownloadingFile(filename);

    try {
      const blob = await downloadFileFromUrl(url, filename);

      // Create download link
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(downloadUrl);

      showToastMessage(`${filename} downloaded successfully!`, 'success');
    } catch (error) {
      console.error('Error downloading file:', error);
      showToastMessage(`Failed to download ${filename}`, 'error');
    } finally {
      setDownloadingFile(null);
    }
  };

  // Function to download all documents as zip or individually
  const handleDownloadAllDocuments = async () => {
    if (!selectedInstallationRequest) return;

    setIsDownloading(true);

    try {
      // Try to use JSZip for ZIP download
      try {
        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();

        const documents = [
          {
            url: selectedInstallationRequest.aadhaarFrontUrl ? `${BASE_URL}${selectedInstallationRequest.aadhaarFrontUrl}` : null,
            filename: `${selectedInstallationRequest.name}_Aadhaar_Front.jpg`,
            label: 'Aadhaar Front'
          },
          {
            url: selectedInstallationRequest.aadhaarBackUrl ? `${BASE_URL}${selectedInstallationRequest.aadhaarBackUrl}` : null,
            filename: `${selectedInstallationRequest.name}_Aadhaar_Back.jpg`,
            label: 'Aadhaar Back'
          },
          {
            url: selectedInstallationRequest.passportPhotoUrl ? `${BASE_URL}${selectedInstallationRequest.passportPhotoUrl}` : null,
            filename: `${selectedInstallationRequest.name}_Passport_Photo.jpg`,
            label: 'Passport Photo'
          }
        ];

        const downloadPromises: Promise<void>[] = [];

        for (const doc of documents) {
          if (doc.url) {
            const downloadPromise = downloadFileFromUrl(doc.url, doc.filename)
              .then(blob => {
                zip.file(doc.filename, blob);
              })
              .catch(error => {
                console.warn(`Failed to download ${doc.label}:`, error);
                // Add a text file indicating the missing document
                zip.file(`${doc.label}_NOT_AVAILABLE.txt`, `${doc.label} was not available for download.`);
              });
            downloadPromises.push(downloadPromise);
          } else {
            // Add a text file for missing documents
            zip.file(`${doc.label}_MISSING.txt`, `${doc.label} was not provided.`);
          }
        }

        // Wait for all downloads to complete
        await Promise.all(downloadPromises);

        // Generate zip file
        const zipBlob = await zip.generateAsync({ type: 'blob' });

        // Create download link
        const downloadUrl = URL.createObjectURL(zipBlob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${selectedInstallationRequest.name}_Documents_${selectedInstallationRequest.displayId}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up
        URL.revokeObjectURL(downloadUrl);

        showToastMessage('Documents downloaded as ZIP successfully!', 'success');
      } catch (zipError) {
        console.warn('JSZip not available, downloading files individually:', zipError);

        // Fallback: Download files individually
        const documents = [
          {
            url: selectedInstallationRequest.aadhaarFrontUrl ? `${BASE_URL}${selectedInstallationRequest.aadhaarFrontUrl}` : null,
            filename: `${selectedInstallationRequest.name}_Aadhaar_Front.jpg`,
            label: 'Aadhaar Front'
          },
          {
            url: selectedInstallationRequest.aadhaarBackUrl ? `${BASE_URL}${selectedInstallationRequest.aadhaarBackUrl}` : null,
            filename: `${selectedInstallationRequest.name}_Aadhaar_Back.jpg`,
            label: 'Aadhaar Back'
          },
          {
            url: selectedInstallationRequest.passportPhotoUrl ? `${BASE_URL}${selectedInstallationRequest.passportPhotoUrl}` : null,
            filename: `${selectedInstallationRequest.name}_Passport_Photo.jpg`,
            label: 'Passport Photo'
          }
        ];

        let downloadCount = 0;
        for (const doc of documents) {
          if (doc.url) {
            try {
              const link = document.createElement('a');
              link.href = doc.url;
              link.download = doc.filename;
              link.target = '_blank';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              downloadCount++;

              // Add delay between downloads
              await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
              console.warn(`Failed to download ${doc.label}:`, error);
            }
          }
        }

        showToastMessage(`${downloadCount} documents downloaded individually!`, 'success');
      }
    } catch (error) {
      console.error('Error downloading documents:', error);
      showToastMessage('Failed to download documents', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  const [selectedOlt, setSelectedOlt] = useState<any>(null);
  const [expandedOlt, setExpandedOlt] = useState<string | null>(null);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning">("success");
  const [showToast, setShowToast] = useState<boolean>(false);

  // Download state
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);



  // Toast helper function
  const showToastMessage = (message: string, type: "success" | "error" | "warning" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Auto-dismiss toast after 4 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);


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
      showToastMessage("Please select an engineer and provide remarks", 'warning');
      return;
    }

    try {
      await updateInstallationRequestStatus({
        id: selectedInstallationRequest.id,
        status: "approved",
        remarks: assignmentRemarks || "Engineer assigned for installation",
        assignedEngineer: selectedEngineer,
        // Include all new technical fields from the form
        oltId: editableFields.oltId,
        fdbId: editableFields.fdbId,
        modemName: editableFields.modemName,
        ontType: editableFields.ontType,
        modelNumber: editableFields.modelNumber,
        serialNumber: editableFields.serialNumber,
        ontMac: editableFields.ontMac,
        username: editableFields.username,
        password: editableFields.password
      });

      console.log("Installation request approved and engineer assigned:", selectedInstallationRequest.id);
      showToastMessage("Engineer assigned successfully!", 'success');

      // Reset modal state
      setShowEngineerAssignmentModal(false);
      setShowInstallationRequestModal(false);
      setSelectedInstallationRequest(null);
      setSelectedEngineer("");
      setAssignmentRemarks("");
      setIsEngineerSelected(false);
    } catch (error) {
      console.error("Error assigning engineer:", error);
      showToastMessage("Error assigning engineer. Please try again.", 'error');
    }
  };

  // Reject installation request handler
  const handleRejectInstallationRequest = async () => {
    if (!selectedInstallationRequest) {
      showToastMessage("No installation request selected", 'warning');
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
      showToastMessage("Installation request rejected successfully!", 'success');

      // Reset modal state
      setShowInstallationRequestModal(false);
      setSelectedInstallationRequest(null);
      setSelectedEngineer("");
      setAssignmentRemarks("");
      setIsEngineerSelected(false);
    } catch (error) {
      console.error("Error rejecting installation request:", error);
      showToastMessage("Error rejecting installation request. Please try again.", 'error');
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 -m-6 p-6">
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 lg:p-12 text-white shadow-2xl">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <HardHat className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold mb-2">Installation Management</h1>
                  <p className="text-blue-100 text-lg">Streamlined workflow for applications and installations</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-6 mt-6">
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                  <FileText className="h-5 w-5" />
                  <span className="text-sm font-medium">{transformedApplications.length} Applications</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                  <Building className="h-5 w-5" />
                  <span className="text-sm font-medium">{transformedInstallationRequests.length} Installation Requests</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-sm font-medium">{analytics.applicationSuccessRate}% Success Rate</span>
                </div>
              </div>
            </div>
            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute -right-32 -bottom-20 h-32 w-32 rounded-full bg-white/5 blur-2xl"></div>
            <div className="absolute right-10 top-10 h-24 w-24 rounded-full bg-gradient-to-r from-yellow-300/20 to-orange-300/20 blur-xl"></div>
          </div>

        {/* Top Stats Row - All Data Types */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {/* Application Forms Stats */}
            <Card className="group relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-indigo-500/10"></div>
              <CardHeader className="relative pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white shadow-lg">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                Application Forms
              </CardTitle>
                      <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
                        Pending review applications
              </CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {applicationsLoading ? "..." : transformedApplications.filter((app: any) => app.status === 'inreview').length}
              </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {applicationsLoading ? "Loading..." : "Awaiting action"}
              </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative pt-0">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Recent Applications</div>
                  <div className="space-y-3">
                    {transformedApplications.filter((app: any) => app.status === 'inreview').slice(0, 2).map((app: any, index: number) => (
                      <div key={app.id} className="flex items-center justify-between p-3 bg-white/70 dark:bg-slate-700/50 rounded-lg border border-white/50 dark:border-slate-600/50 backdrop-blur-sm">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {app.name?.charAt(0)?.toUpperCase()}
                          </div>
                      <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{app.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{app.applicationType}</div>
                      </div>
                    </div>
                        <div className="flex gap-1 ml-2">
                      <Button
                        size="sm"
                            className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-2 py-1 h-7 rounded-md shadow-sm"
                        onClick={async () => {
                          try {
                            await updateApplicationStatus({ id: app.id, status: 'accept' });
                            console.log("Application accepted:", app.id);
                          } catch (error) {
                            console.error("Error accepting application:", error);
                          }
                        }}
                      >
                            <CheckCircle className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                            className="text-xs px-2 py-1 h-7 rounded-md shadow-sm"
                        onClick={async () => {
                          try {
                            await updateApplicationStatus({ id: app.id, status: 'reject' });
                            console.log("Application rejected:", app.id);
                          } catch (error) {
                            console.error("Error rejecting application:", error);
                          }
                        }}
                      >
                            <XCircle className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                    {transformedApplications.filter((app: any) => app.status === 'inreview').length === 0 && (
                      <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                        No applications pending review
                      </div>
                    )}
                  </div>
              </div>
            </CardContent>
          </Card>

          {/* Installation Requests Stats */}
            <Card className="group relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-teal-500/10"></div>
              <CardHeader className="relative pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl text-white shadow-lg">
                      <Building className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                Installation Requests
              </CardTitle>
                      <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
                        Approved installations ready
              </CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {installationRequestsLoading ? "..." : transformedInstallationRequests.filter((req: any) => req.status === 'approved').length}
              </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {installationRequestsLoading ? "Loading..." : "Ready for deployment"}
              </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative pt-0">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Recent Requests</div>
                  <div className="space-y-3">
                {installationRequestsLoading ? (
                      <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                        Loading installation requests...
                      </div>
                    ) : (
                      transformedInstallationRequests.slice(0, 2).map((req: any) => (
                        <div key={req.id} className="flex items-center justify-between p-3 bg-white/70 dark:bg-slate-700/50 rounded-lg border border-white/50 dark:border-slate-600/50 backdrop-blur-sm">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {req.name?.charAt(0)?.toUpperCase()}
                        </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{req.name}</div>
                              <div className="flex items-center gap-2">
                                <div className="text-xs text-gray-500 dark:text-gray-400">{req.displayType}</div>
                                <Badge className={`${getStatusColor(req.status)} text-xs`}>
                          {req.status}
                        </Badge>
                      </div>
                            </div>
                          </div>
                          <div className="flex gap-1 ml-2">
                        <Button
                          size="sm"
                              className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 h-7 rounded-md shadow-sm"
                          onClick={() => {
                            setSelectedInstallationRequest(req);
                            setShowInstallationRequestModal(true);
                          }}
                        >
                              <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                              className={`text-xs px-2 py-1 h-7 rounded-md shadow-sm ${req.status === 'approved'
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:bg-emerald-50 hover:border-emerald-300'
                            }`}
                          onClick={() => {
                            if (req.status !== 'approved') {
                              setSelectedInstallationRequest(req);
                              setShowInstallationRequestModal(true);
                            }
                          }}
                          disabled={req.status === 'approved'}
                        >
                              <HardHat className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
                    {!installationRequestsLoading && transformedInstallationRequests.length === 0 && (
                      <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                        No installation requests available
                      </div>
                    )}
                  </div>
              </div>
            </CardContent>
          </Card>
        </div>

          {/* Analytics and Activity Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Overview */}
            <Card className="group relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-indigo-500/10"></div>
              <CardHeader className="relative pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white shadow-lg">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                Quick Overview
              </CardTitle>
                    <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
                      System statistics
                    </CardDescription>
                  </div>
                </div>
            </CardHeader>
              <CardContent className="relative pt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {applicationsLoading ? "..." : transformedApplications.length}
                  </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Applications
                  </div>
                </div>
                  <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {installationRequestsLoading ? "..." : transformedInstallationRequests.length}
                  </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Requests
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
            <Card className="lg:col-span-2 group relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-red-500/10"></div>
              <CardHeader className="relative pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl text-white shadow-lg">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                Recent Activity
              </CardTitle>
                    <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
                      Latest system updates
                    </CardDescription>
                  </div>
                </div>
            </CardHeader>
              <CardContent className="relative pt-0">
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-amber-100 dark:border-amber-800">
                  <div className="space-y-3">
                {[...transformedApplications, ...transformedInstallationRequests]
                  .sort((a, b) => new Date(b.createdAt || b.updatedAt).getTime() - new Date(a.createdAt || a.updatedAt).getTime())
                      .slice(0, 4)
                  .map((item: any, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-white/70 dark:bg-slate-700/50 rounded-lg border border-white/50 dark:border-slate-600/50 backdrop-blur-sm">
                          <div className="w-2 h-2 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full animate-pulse"></div>
                      <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {item.name || item.customerName || item.applicationId || 'New Entry'}
                        </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(item.createdAt || item.updatedAt), "MMM dd, HH:mm")}
                        </div>
                      </div>
                          <div className="text-xs text-gray-400">
                            {item.type === 'wifi_application' ? 'App' : 'Install'}
                          </div>
                    </div>
                  ))}
                  </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Tabs */}
          <div className="space-y-6">
            <Tabs defaultValue="all-forms" className="space-y-6">
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border-0 shadow-lg p-6">
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 border-0 h-auto p-2 rounded-xl shadow-inner">
                  <TabsTrigger value="all-forms" className="flex items-center gap-2 text-sm px-4 py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-lg dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-white transition-all duration-200 font-medium">
                    <HardHat className="h-4 w-4" />
                <span className="hidden sm:inline">All Forms</span>
                <span className="sm:hidden">All</span>
              </TabsTrigger>
                  <TabsTrigger value="application-forms" className="flex items-center gap-2 text-sm px-4 py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-lg dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-white transition-all duration-200 font-medium">
                    <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Application Forms</span>
                <span className="sm:hidden">Apps</span>
              </TabsTrigger>
                  <TabsTrigger value="installation-requests" className="flex items-center gap-2 text-sm px-4 py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-lg dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-white transition-all duration-200 font-medium">
                    <Building className="h-4 w-4" />
                <span className="hidden sm:inline">Installation Requests</span>
                <span className="sm:hidden">Install</span>
              </TabsTrigger>
                  <TabsTrigger value="analytics" className="flex items-center gap-2 text-sm px-4 py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-lg dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-white transition-all duration-200 font-medium">
                    <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
                <span className="sm:hidden">Stats</span>
              </TabsTrigger>
            </TabsList>
              </div>

              <TabsContent value="all-forms" className="space-y-6">
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 pb-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white shadow-lg">
                          <FileText className="h-6 w-6" />
                        </div>
                    <div>
                          <CardTitle className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">All Installation Forms</CardTitle>
                          <CardDescription className="text-sm text-gray-600 dark:text-gray-300">Complete overview of all installation forms and requests</CardDescription>
                    </div>
                      </div>
                      <div className="flex gap-3">
                      <Button onClick={() => {
                        console.log("Exporting all installation forms data:", filteredAllInstallationForms);
                        // Export functionality can be added here
                        }} className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-sm px-4 py-2 rounded-lg shadow-lg transition-all duration-200">
                          <Download className="mr-2 h-4 w-4" />
                        Export Data
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search all forms..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 text-sm bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border-gray-200 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                      <div className="flex gap-3">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-[180px] text-sm bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border-gray-200 dark:border-slate-600 rounded-lg shadow-sm">
                            <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                          <SelectContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-gray-200 dark:border-slate-600">
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
                  </div>

                    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-slate-600/50 overflow-hidden shadow-lg">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                            <TableRow className="bg-gradient-to-r from-slate-100/80 to-slate-200/80 dark:from-slate-700/80 dark:to-slate-600/80 border-b border-gray-200/50 dark:border-slate-600/50">
                              <TableHead className="text-sm font-semibold text-gray-700 dark:text-gray-200 py-4">Form Type</TableHead>
                              <TableHead className="text-sm font-semibold text-gray-700 dark:text-gray-200 py-4">ID</TableHead>
                              <TableHead className="text-sm font-semibold text-gray-700 dark:text-gray-200 py-4">Customer</TableHead>
                              <TableHead className="text-sm font-semibold text-gray-700 dark:text-gray-200 py-4">Contact</TableHead>
                              <TableHead className="text-sm font-semibold text-gray-700 dark:text-gray-200 py-4">Type</TableHead>
                              <TableHead className="text-sm font-semibold text-gray-700 dark:text-gray-200 py-4">Status</TableHead>
                              <TableHead className="text-sm font-semibold text-gray-700 dark:text-gray-200 py-4">Address</TableHead>
                              <TableHead className="text-sm font-semibold text-gray-700 dark:text-gray-200 py-4">Created</TableHead>
                              <TableHead className="text-sm font-semibold text-gray-700 dark:text-gray-200 py-4">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {applicationsLoading || installationRequestsLoading ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-12">
                                  <div className="flex flex-col items-center justify-center space-y-4">
                                    <div className="relative">
                                      <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 dark:border-blue-800"></div>
                                      <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
                                    </div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Loading data...</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : applicationsError || installationRequestsError ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-12">
                                  <div className="flex flex-col items-center justify-center space-y-3">
                                    <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                                      <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div className="text-red-600 dark:text-red-400 text-sm font-medium">
                                  Error loading data. Please refresh the page.
                                    </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredAllInstallationForms.map((form) => (
                                <TableRow key={`${form.type}-${form.id}`} className="hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors duration-200 border-b border-gray-100/50 dark:border-slate-600/30">
                                  <TableCell className="py-4 px-6">
                                    <Badge variant="outline" className="capitalize text-xs font-medium bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 border-slate-300 dark:border-slate-500">
                                    {form.type.replace('_', ' ')}
                                  </Badge>
                                </TableCell>
                                  <TableCell className="py-4 px-6">
                                    <div className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400">{form.displayId}</div>
                                </TableCell>
                                  <TableCell className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                        {form.displayName?.charAt(0)?.toUpperCase()}
                                      </div>
                                  <div>
                                        <div className="font-medium text-sm text-gray-900 dark:text-white">{form.displayName}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 hidden lg:block">{form.displayVillage || form.displayAddress}</div>
                                      </div>
                                  </div>
                                </TableCell>
                                  <TableCell className="py-4 px-6">
                                  <div>
                                      <div className="text-sm font-medium text-gray-900 dark:text-white">{form.displayContact}</div>
                                    {form.displayAlternatePhone && (
                                        <div className="text-xs text-gray-500 dark:text-gray-400 hidden lg:block">{form.displayAlternatePhone}</div>
                                    )}
                                  </div>
                                </TableCell>
                                  <TableCell className="py-4 px-6">
                                    <Badge className={`${getTypeColor(form.displayType)} text-xs font-medium px-2 py-1 rounded-full`}>
                                    {form.displayType}
                                  </Badge>
                                </TableCell>
                                  <TableCell className="py-4 px-6">
                                    <Badge className={`${getStatusColor(form.displayStatus)} text-xs font-medium px-2 py-1 rounded-full`}>
                                    {form.displayStatus}
                                  </Badge>
                                </TableCell>
                                  <TableCell className="py-4 px-6">
                                    <div className="text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                                    {form.displayAddress}
                                  </div>
                                </TableCell>
                                  <TableCell className="py-4 px-6">
                                    <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                                    {format(parseISO(form.displayDate), "MMM dd, yyyy")}
                                  </div>
                                </TableCell>
                                  <TableCell className="py-4 px-6">
                                    <div className="flex gap-2">
                                    <Dialog>
                                      <DialogTrigger asChild>
                                          <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-lg border-gray-200 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200">
                                            <Eye className="h-4 w-4" />
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
                                                    showToastMessage("Application accepted successfully!", 'success');
                                                  } catch (error) {
                                                    console.error("Error accepting application:", error);
                                                    showToastMessage("Error accepting application. Please try again.", 'error');
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
                                                      showToastMessage("Application accepted successfully!", 'success');
                                                    } catch (error) {
                                                      console.error("Error accepting application:", error);
                                                      showToastMessage("Error accepting application. Please try again.", 'error');
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
                                                      showToastMessage("Application rejected successfully!", 'success');
                                                    } catch (error) {
                                                      console.error("Error rejecting application:", error);
                                                    }
                                                  }}
                                                >
                                                  <XCircle className="h-4 w-4 mr-2" />
                                                  Reject Application
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
      </div>

      {/* Installation Request Details Modal */}
      <Dialog open={showInstallationRequestModal} onOpenChange={setShowInstallationRequestModal}>
        <DialogContent className="max-w-7xl w-[98vw] max-h-[95vh] overflow-y-auto">
          <DialogHeader className="sticky top-0 bg-background z-10 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-base sm:text-lg lg:text-xl">Installation Request Details</DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">
                  Review and manage installation request
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedInstallationRequest && (
            <div className="space-y-6 pt-6 px-2">
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
                  <div className="mt-2 space-y-2">
                    <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">
                      This installation request has been approved and an engineer has been assigned.
                    </p>

                  </div>
                )}
              </div>

              {/* Customer Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <User className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Customer Information</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  <div className="space-y-1">
                    <Label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Customer Name
                    </Label>
                    <p className="text-xs sm:text-sm font-medium">{selectedInstallationRequest.name}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      Request ID
                    </Label>
                    <p className="text-xs sm:text-sm font-mono">{selectedInstallationRequest.displayId}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      Phone Number
                    </Label>
                    <p className="text-xs sm:text-sm">{selectedInstallationRequest.phoneNumber}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      Email
                    </Label>
                    <p className="text-xs sm:text-sm break-all">{selectedInstallationRequest.email}</p>
                  </div>
                  <div className="space-y-1 sm:col-span-2 lg:col-span-2">
                    <Label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Address
                    </Label>
                    <p className="text-xs sm:text-sm">{selectedInstallationRequest.displayAddress}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Status
                    </Label>
                    <Badge className={`${getStatusColor(selectedInstallationRequest.status)} text-xs`}>
                      {selectedInstallationRequest.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      Created Date
                    </Label>
                    <p className="text-xs sm:text-sm">{format(parseISO(selectedInstallationRequest.createdAt), "MMM dd, yyyy")}</p>
                  </div>
                </div>
              </div>

              {/* Network Configuration Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Network className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Network Configuration</h3>
                  {isFieldsEditable && (
                    <Badge variant="secondary" className="text-xs">
                      <Settings className="h-3 w-3 mr-1" />
                      Editable
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-1">
                    <Label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Router className="h-3 w-3" />
                      OLT Selection
                    </Label>
                    {isFieldsEditable ? (
                      <Select 
                        value={editableFields.oltId} 
                        onValueChange={handleOltSelection}
                        disabled={oltLoading}
                      >
                        <SelectTrigger className="text-xs sm:text-sm">
                          <SelectValue placeholder={oltLoading ? "Loading OLTs..." : "Select OLT"} />
                        </SelectTrigger>
                        <SelectContent>
                          {oltData?.data?.map((olt: any) => (
                            <SelectItem key={olt._id} value={olt._id}>
                              {olt.name} - {olt.oltId}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-xs sm:text-sm bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
                        {editableFields.oltId ? 
                          oltData?.data?.find((olt: any) => olt._id === editableFields.oltId)?.name || 'Selected OLT' 
                          : 'Not assigned'}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Building className="h-3 w-3" />
                      FDB Selection
                    </Label>
                    {isFieldsEditable ? (
                      <Select 
                        value={editableFields.fdbId} 
                        onValueChange={(value) => handleFieldChange('fdbId', value)}
                        disabled={!editableFields.oltId || availableFdbs.length === 0}
                      >
                        <SelectTrigger className="text-xs sm:text-sm">
                          <SelectValue placeholder={!editableFields.oltId ? "Select OLT first" : availableFdbs.length === 0 ? "No FDBs available" : "Select FDB"} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableFdbs.map((fdb: any) => (
                            <SelectItem key={fdb.fdb_id} value={fdb.fdb_id}>
                              {fdb.fdb_name} - {fdb.fdb_id}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-xs sm:text-sm bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
                        {editableFields.fdbId ? 
                          availableFdbs.find((fdb: any) => fdb.fdb_id === editableFields.fdbId)?.fdb_name || 'Selected FDB'
                          : 'Not assigned'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Device & Equipment Details Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Router className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Device & Equipment Details</h3>
                  {isFieldsEditable && (
                    <Badge variant="secondary" className="text-xs">
                      <Settings className="h-3 w-3 mr-1" />
                      Editable
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  <div className="space-y-1">
                    <Label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Router className="h-3 w-3" />
                      Modem Name
                    </Label>
                    {isFieldsEditable ? (
                      <Input
                        type="text"
                        value={editableFields.modemName}
                        onChange={(e) => handleFieldChange('modemName', e.target.value)}
                        placeholder="Enter Modem Name"
                        className="text-xs sm:text-sm"
                      />
                    ) : (
                      <p className="text-xs sm:text-sm bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
                        {editableFields.modemName || 'Not specified'}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Settings className="h-3 w-3" />
                      ONT Type
                    </Label>
                    {isFieldsEditable ? (
                      <Select value={editableFields.ontType} onValueChange={(value) => handleFieldChange('ontType', value)}>
                        <SelectTrigger className="text-xs sm:text-sm">
                          <SelectValue placeholder="Select ONT Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DUAL_BAND">DUAL_BAND</SelectItem>
                          <SelectItem value="SINGLE_BAND">SINGLE_BAND</SelectItem>
                          <SelectItem value="OTHERS">OTHERS</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-xs sm:text-sm bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                        {editableFields.ontType || 'Not selected'}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      Model Number
                    </Label>
                    {isFieldsEditable ? (
                      <Input
                        type="text"
                        value={editableFields.modelNumber}
                        onChange={(e) => handleFieldChange('modelNumber', e.target.value)}
                        placeholder="Enter Model Number"
                        className="text-xs sm:text-sm font-mono"
                      />
                    ) : (
                      <p className="text-xs sm:text-sm font-mono bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
                        {editableFields.modelNumber || 'Not specified'}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      Serial Number
                    </Label>
                    {isFieldsEditable ? (
                      <Input
                        type="text"
                        value={editableFields.serialNumber}
                        onChange={(e) => handleFieldChange('serialNumber', e.target.value)}
                        placeholder="Enter Serial Number"
                        className="text-xs sm:text-sm font-mono"
                      />
                    ) : (
                      <p className="text-xs sm:text-sm font-mono bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
                        {editableFields.serialNumber || 'Not specified'}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Network className="h-3 w-3" />
                      ONT MAC Address
                    </Label>
                    {isFieldsEditable ? (
                      <Input
                        type="text"
                        value={editableFields.ontMac}
                        onChange={(e) => handleFieldChange('ontMac', e.target.value)}
                        placeholder="Enter ONT MAC Address"
                        className="text-xs sm:text-sm font-mono"
                      />
                    ) : (
                      <p className="text-xs sm:text-sm font-mono bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
                        {editableFields.ontMac || 'Not specified'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* User Credentials Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Shield className="h-5 w-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">User Credentials</h3>
                  {isFieldsEditable && (
                    <Badge variant="secondary" className="text-xs">
                      <Settings className="h-3 w-3 mr-1" />
                      Editable
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-1">
                    <Label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Username
                    </Label>
                    {isFieldsEditable ? (
                      <Input
                        type="text"
                        value={editableFields.username}
                        onChange={(e) => handleFieldChange('username', e.target.value)}
                        placeholder="Enter Username"
                        className="text-xs sm:text-sm font-mono"
                      />
                    ) : (
                      <p className="text-xs sm:text-sm font-mono bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                        {editableFields.username || 'Not configured'}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Password
                    </Label>
                    {isFieldsEditable ? (
                      <Input
                        type="password"
                        value={editableFields.password}
                        onChange={(e) => handleFieldChange('password', e.target.value)}
                        placeholder="Enter Password"
                        className="text-xs sm:text-sm font-mono"
                      />
                    ) : (
                      <p className="text-xs sm:text-sm font-mono bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
                        {editableFields.password ? '••••••••' : 'Not configured'}
                      </p>
                    )}
                  </div>
                </div>
              </div>


              {/* Documents Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Required Documents</h3>
                  </div>
                  {/* Download All Documents Button - Always visible */}
                  <Button
                    onClick={handleDownloadAllDocuments}
                    disabled={isDownloading || (!selectedInstallationRequest.aadhaarFrontUrl &&
                      !selectedInstallationRequest.aadhaarBackUrl &&
                      !selectedInstallationRequest.passportPhotoUrl)}
                    variant="default"
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm shadow-md"
                  >
                    {isDownloading ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-1 sm:mr-2"></div>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Archive className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Download All Docs
                      </>
                    )}
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
                  {selectedInstallationRequest.aadhaarFrontUrl && (
                    <div className="text-center p-3 sm:p-4 border rounded-lg bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-600 relative group">
                      <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-green-600" />
                      <p className="text-xs sm:text-sm mt-2 font-medium text-green-700 dark:text-green-300">Aadhaar Front</p>
                      <p className="text-xs text-green-600 dark:text-green-400">Verified ✓</p>
                      {/* Individual Download Button */}
                      <Button
                        onClick={() => {
                          const filename = `${selectedInstallationRequest.name}_Aadhaar_Front.jpg`;
                          const url = `${BASE_URL}${selectedInstallationRequest.aadhaarFrontUrl}`;
                          downloadIndividualFile(url, filename);
                        }}
                        disabled={downloadingFile === `${selectedInstallationRequest.name}_Aadhaar_Front.jpg`}
                        variant="default"
                        size="sm"
                        className="absolute top-2 right-2 h-7 w-7 p-0 bg-green-600 hover:bg-green-700 text-white shadow-md opacity-90 hover:opacity-100 transition-all disabled:opacity-50"
                      >
                        {downloadingFile === `${selectedInstallationRequest.name}_Aadhaar_Front.jpg` ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        ) : (
                          <DownloadIcon className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  )}
                  {selectedInstallationRequest.aadhaarBackUrl && (
                    <div className="text-center p-3 sm:p-4 border rounded-lg bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-600 relative group">
                      <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-green-600" />
                      <p className="text-xs sm:text-sm mt-2 font-medium text-green-700 dark:text-green-300">Aadhaar Back</p>
                      <p className="text-xs text-green-600 dark:text-green-400">Verified ✓</p>
                      {/* Individual Download Button */}
                      <Button
                        onClick={() => {
                          const filename = `${selectedInstallationRequest.name}_Aadhaar_Back.jpg`;
                          const url = `${BASE_URL}${selectedInstallationRequest.aadhaarBackUrl}`;
                          downloadIndividualFile(url, filename);
                        }}
                        disabled={downloadingFile === `${selectedInstallationRequest.name}_Aadhaar_Back.jpg`}
                        variant="default"
                        size="sm"
                        className="absolute top-2 right-2 h-7 w-7 p-0 bg-green-600 hover:bg-green-700 text-white shadow-md opacity-90 hover:opacity-100 transition-all disabled:opacity-50"
                      >
                        {downloadingFile === `${selectedInstallationRequest.name}_Aadhaar_Back.jpg` ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        ) : (
                          <DownloadIcon className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  )}
                  {selectedInstallationRequest.passportPhotoUrl && (
                    <div className="text-center p-3 sm:p-4 border rounded-lg bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-600 relative group">
                      <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-green-600" />
                      <p className="text-xs sm:text-sm mt-2 font-medium text-green-700 dark:text-green-300">Passport Photo</p>
                      <p className="text-xs text-green-600 dark:text-green-400">Verified ✓</p>
                      {/* Individual Download Button */}
                      <Button
                        onClick={() => {
                          const filename = `${selectedInstallationRequest.name}_Passport_Photo.jpg`;
                          const url = `${BASE_URL}${selectedInstallationRequest.passportPhotoUrl}`;
                          downloadIndividualFile(url, filename);
                        }}
                        disabled={downloadingFile === `${selectedInstallationRequest.name}_Passport_Photo.jpg`}
                        variant="default"
                        size="sm"
                        className="absolute top-2 right-2 h-7 w-7 p-0 bg-green-600 hover:bg-green-700 text-white shadow-md opacity-90 hover:opacity-100 transition-all disabled:opacity-50"
                      >
                        {downloadingFile === `${selectedInstallationRequest.name}_Passport_Photo.jpg` ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        ) : (
                          <DownloadIcon className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  )}
                  {/* Show missing documents */}
                  {!selectedInstallationRequest.aadhaarFrontUrl && (
                    <div className="text-center p-3 sm:p-4 border rounded-lg bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-600">
                      <XCircle className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-red-600" />
                      <p className="text-xs sm:text-sm mt-2 font-medium text-red-700 dark:text-red-300">Aadhaar Front</p>
                      <p className="text-xs text-red-600 dark:text-red-400">Missing ✗</p>
                    </div>
                  )}
                  {!selectedInstallationRequest.aadhaarBackUrl && (
                    <div className="text-center p-3 sm:p-4 border rounded-lg bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-600">
                      <XCircle className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-red-600" />
                      <p className="text-xs sm:text-sm mt-2 font-medium text-red-700 dark:text-red-300">Aadhaar Back</p>
                      <p className="text-xs text-red-600 dark:text-red-400">Missing ✗</p>
                    </div>
                  )}
                  {!selectedInstallationRequest.passportPhotoUrl && (
                    <div className="text-center p-3 sm:p-4 border rounded-lg bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-600">
                      <XCircle className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-red-600" />
                      <p className="text-xs sm:text-sm mt-2 font-medium text-red-700 dark:text-red-300">Passport Photo</p>
                      <p className="text-xs text-red-600 dark:text-red-400">Missing ✗</p>
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


                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="sticky bottom-0 bg-background pt-6 border-t mt-8 px-2">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowInstallationRequestModal(false);
                  setSelectedInstallationRequest(null);
                  setSelectedEngineer("");
                  setAssignmentRemarks("");
                  setIsEngineerSelected(false);
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


      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border max-w-sm ${toastType === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200'
            : toastType === 'error'
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200'
              : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200'
            }`}>
            {/* Icon */}
            <div className="flex-shrink-0">
              {toastType === 'success' ? (
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : toastType === 'error' ? (
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              )}
            </div>

            {/* Message */}
            <div className="flex-1">
              <p className="text-sm font-medium">{toastMessage}</p>
            </div>

            {/* Close button */}
            <button
              onClick={() => setShowToast(false)}
              className={`flex-shrink-0 p-1 rounded-full hover:bg-opacity-20 transition-colors ${toastType === 'success'
                ? 'hover:bg-green-600'
                : toastType === 'error'
                  ? 'hover:bg-red-600'
                  : 'hover:bg-yellow-600'
                }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </MainLayout>
  );
}