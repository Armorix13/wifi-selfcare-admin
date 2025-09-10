import { useState, useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/main-layout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserPlus, MapPin, Phone, Mail, Calendar, Wifi, Search, Filter, Grid, List, Eye, Edit, Trash2, ChevronLeft, ChevronRight, User, Activity, CheckCircle, TrendingUp, WifiOff, AlertTriangle, CreditCard, Download, Upload, X, Shield, ShieldOff, FilterX, BarChart, Settings, Users2, Plus, ImageIcon, MoreHorizontal, Router, Building2, Home, PieChart, Clock, Database, Star, Bell, FileText, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { generateDummyCustomers, type Customer } from "@/lib/dummyData";
import { useGetUserManagementDataQuery, useImportClientFromExcelMutation } from "@/api";


// Define user schema for form validation
const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
  location: z.string().min(1, "Location is required"),
  serviceProvider: z.string().optional(),
  planName: z.string().optional(),
  activationDate: z.string().optional(),
  expirationDate: z.string().optional(),
  balanceDue: z.number().min(0, "Balance due must be non-negative").default(0),
  staticIp: z.string().optional(),
  macAddress: z.string().optional(),
  status: z.enum(["active", "suspended", "pending", "expired"]),
  area: z.enum(["urban", "rural"]),
  mode: z.enum(["online", "offline"]),
  isActive: z.boolean().default(true),
  profileImageUrl: z.any().optional(),
});

type UserData = Customer;

export default function Users() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [providerFilter, setProviderFilter] = useState("all");
  const [areaFilter, setAreaFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"card" | "table">("table");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const itemsPerPage = 6;

  // Debounce search query to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      // Reset to first page when search changes
      if (searchQuery !== debouncedSearchQuery) {
        setCurrentPage(1);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearchQuery]);

  // API hook for user management data with search
  const { data: userManagementData, isLoading: isLoadingUserData, error: userDataError } = useGetUserManagementDataQuery({ 
    page: currentPage,
    ...(debouncedSearchQuery && { search: debouncedSearchQuery })
  });

  // Excel import mutation hook
  const [importClientFromExcel, { isLoading: isImporting, error: importError }] = useImportClientFromExcelMutation();

  // Image handling states for user profile
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);

  // Excel import states
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importedData, setImportedData] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [isProcessingImport, setIsProcessingImport] = useState(false);
  const [importSummary, setImportSummary] = useState<{
    totalRecords: number;
    validRecords: number;
    errorRecords: number;
  } | null>(null);

  const { toast } = useToast();
  
  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user data from API
  const users = useMemo(() => {
    return userManagementData?.data?.users?.map((item: any) => ({
      id: item.user?._id || 'N/A',
      name: `${item.user?.firstName || ''} ${item.user?.lastName || ''}`.trim() || 'N/A',
      email: item.user?.email || 'N/A',
      phone: item.user?.phoneNumber || 'N/A',
      address: item.user?.residentialAddress || item.user?.permanentAddress || "N/A",
      location: item.user?.ruralUrban || "N/A",
      serviceProvider: item.user?.companyPreference || "N/A",
      planName: item.user?.bbPlan || "N/A",
      activationDate: item.user?.createdAt ? new Date(item.user.createdAt).toLocaleDateString() : "N/A",
      expirationDate: "N/A",
      balanceDue: 0,
      staticIp: "N/A",
      macAddress: item.modem?.ontMac || "N/A",
      status: item.user?.workingStatus === "active" ? "active" : "pending",
      area: item.user?.ruralUrban?.toLowerCase() === "urban" ? "urban" : "rural",
      mode: "online",
      isActive: item.user?.workingStatus === "active",
      profileImageUrl: null,
      // Additional fields from API - with proper null checks
      oltId: item.customer?.oltId?.oltId || item.customer?.oltId || "N/A",
      fdbId: item.customer?.fdbId?.fdbId || item.customer?.fdbId || "N/A",
      isInstalled: item.customer?.isInstalled || false,
      modemName: item.modem?.modemName || "N/A",
      ontType: item.modem?.ontType || "N/A",
      bbUserId: item.user?.bbUserId || "N/A",
      acquisitionType: item.user?.acquisitionType || "N/A",
      category: item.user?.category || "N/A",
      ftthExchangePlan: item.user?.ftthExchangePlan || "N/A",
      llInstallDate: item.user?.llInstallDate ? new Date(item.user.llInstallDate).toLocaleDateString() : "N/A",
      mtceFranchise: item.user?.mtceFranchise || "N/A",
    })) || [];
  }, [userManagementData]);

  // Image handling functions for user profile
  const handleUserImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeUserImage = () => {
    setProfileImageFile(null);
    setProfileImagePreview(null);
    form.setValue("profileImageUrl", undefined);
  };

  // Excel import functions with real API integration
  const handleExcelFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File upload handler called!', event);
    const file = event.target.files?.[0];
    console.log('Selected file:', file);
    
    if (!file) {
      console.log('No file selected');
      return;
    }

    // Show immediate feedback that file was selected
    toast({
      title: "File Selected",
      description: `Selected file: ${file.name} (${file.type || 'unknown type'})`,
    });

    // Reset the input value to allow re-uploading the same file
    event.target.value = '';

    // Validate file type - check both MIME type and file extension
    const validMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/excel', // .xls (alternative MIME type)
      'application/x-excel', // .xls (alternative MIME type)
      'application/x-msexcel', // .xls (alternative MIME type)
      'text/csv', // .csv
      'text/comma-separated-values', // .csv (alternative MIME type)
      'application/csv', // .csv (alternative MIME type)
    ];

    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    // Check both MIME type and file extension
    const isValidMimeType = validMimeTypes.includes(file.type);
    const isValidExtension = validExtensions.includes(fileExtension);
    
    // Some browsers might not set the correct MIME type, so we also check the extension
    // Also allow empty MIME type (some browsers don't set it) if extension is valid
    // Additional check: if MIME type is empty but extension is valid, allow it
    // Also allow if MIME type is generic (application/octet-stream) but extension is valid
    const hasValidExtension = isValidExtension;
    const hasValidMimeType = isValidMimeType || 
                            (file.type === '' && isValidExtension) ||
                            (file.type === 'application/octet-stream' && isValidExtension);
    
    if (!hasValidMimeType && !hasValidExtension) {
      toast({
        title: "Invalid File Type",
        description: `Please upload an Excel file (.xlsx, .xls) or CSV file. Detected: MIME type "${file.type || 'empty'}", extension "${fileExtension}"`,
        variant: "destructive",
      });
      return;
    }

    // Log file info for debugging
    console.log('File validation:', {
      name: file.name,
      type: file.type,
      extension: fileExtension,
      isValidMimeType,
      isValidExtension,
      hasValidMimeType,
      hasValidExtension,
      size: file.size
    });

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingImport(true);
    setImportErrors([]);

    try {
      // Create FormData for multipart file upload
      const formData = new FormData();
      formData.append("files", file, file.name);

      console.log('Uploading file:', {
        name: file.name,
        size: file.size,
        type: file.type,
        extension: fileExtension
      });

      // Call the API to process the Excel file
      const result = await importClientFromExcel(formData).unwrap();
      
      // Handle successful response
      if (result.success) {
        const validData = result.data?.validRecords || [];
        const errors = result.data?.errors || [];
        const totalRecords = result.data?.totalRecords || validData.length + errors.length;
        
        setImportedData(validData);
        setImportErrors(errors);
        setImportSummary({
          totalRecords,
          validRecords: validData.length,
          errorRecords: errors.length,
        });
        
        if (validData.length > 0) {
          setIsImportDialogOpen(true);
          toast({
            title: "File Processed Successfully",
            description: `Found ${validData.length} valid records and ${errors.length} errors`,
          });
        } else {
          toast({
            title: "No Valid Data Found",
            description: "The Excel file doesn't contain valid user data. Please check the format.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Import Failed",
          description: result.message || "Failed to process the Excel file",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error processing file:', error);
      
      // Handle different types of errors
      let errorMessage = "There was an error processing the file. Please try again.";
      let errorTitle = "Error Processing File";
      
      // Check for network/connection errors
      if (error?.status === 'FETCH_ERROR' || error?.status === 'TIMEOUT_ERROR' || error?.name === 'TypeError') {
        errorTitle = "Connection Error";
        errorMessage = "Unable to connect to the server. Please check your internet connection and try again.";
      } else if (error?.status === 413) {
        errorTitle = "File Too Large";
        errorMessage = "The file is too large for processing. Please try with a smaller file.";
      } else if (error?.status === 415) {
        errorTitle = "Unsupported File Type";
        errorMessage = "The file format is not supported. Please upload an Excel (.xlsx, .xls) or CSV file.";
      } else if (error?.status === 400) {
        errorTitle = "Invalid File";
        errorMessage = "The file appears to be corrupted or invalid. Please try with a different file.";
      } else if (error?.status === 500) {
        errorTitle = "Server Error";
        errorMessage = "There was an error processing the file on the server. Please try again later.";
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessingImport(false);
    }
  };

  const validateAndProcessExcelData = (data: any[]) => {
    // This function is kept for future API integration
    // Currently returns dummy data
    return { validData: [], errors: [] };
  };

  const handleBulkImport = async () => {
    if (importedData.length === 0) return;

    try {
      // The API has already processed the file and returned valid data
      // We just need to confirm the import
      toast({
        title: "Import Successful",
        description: `Successfully imported ${importedData.length} users from Excel file`,
      });

      setIsImportDialogOpen(false);
      setImportedData([]);
      setImportErrors([]);
      setImportSummary(null);
      
      // The API automatically invalidates the USERMANAGEMENT tag,
      // so the user list will refresh automatically
    } catch (error: any) {
      console.error('Error during bulk import:', error);
      
      let errorMessage = "Failed to import users. Please try again.";
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Import Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };


  const form = useForm<UserData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      location: "",
      serviceProvider: "",
      planName: "",
      status: "active",
      area: "urban",
      mode: "online",
      isActive: true,
      balanceDue: 0,
    },
  });

  // Apply local filters only (search is handled by API)
  const filteredUsers = useMemo(() => {
    return users.filter((user: any) => {
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      const matchesProvider = providerFilter === "all" || user.serviceProvider === providerFilter;
      const matchesArea = areaFilter === "all" || user.area === areaFilter;

      return matchesStatus && matchesProvider && matchesArea;
    });
  }, [users, statusFilter, providerFilter, areaFilter]);

  // Pagination - use API pagination data if available, otherwise calculate locally
  const totalPages = userManagementData?.data?.pagination?.totalPages || Math.ceil(filteredUsers.length / itemsPerPage);
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreateUser = (data: UserData) => {
    const newUser: UserData = {
      ...data,
      id: Math.max(...users.map((u: any) => u.id)) + 1,
      createdAt: new Date().toISOString(),
      profileImageUrl: profileImagePreview ? profileImagePreview : undefined, // Properly handle null to undefined
    };
    // Note: User creation is disabled when using API data
    // setUsers([...users, newUser]);
    toast({
      title: "Create Disabled",
      description: "User creation is not available with API data. Please use the Add User form instead.",
    });
    setIsCreateDialogOpen(false);
    form.reset();
    // Reset image states
    setProfileImageFile(null);
    setProfileImagePreview(null);
  };


  const handleDeleteUser = (userId: number) => {
    // Note: User deletion is disabled when using API data
    // setUsers(users.filter(user => user.id !== userId));
    toast({
      title: "Delete Disabled",
      description: "User deletion is not available with API data. Please contact administrator.",
    });
  };

  const handleSuspendUser = (userId: number) => {
    // Note: User suspension is disabled when using API data
    // setUsers(users.map(user => 
    //   user.id === userId 
    //     ? { ...user, status: user.status === 'suspended' ? 'active' : 'suspended' }
    //     : user
    // ));
    toast({
      title: "Suspend Disabled",
      description: "User suspension is not available with API data. Please contact administrator.",
    });
  };

  const handleEditUser = (userId: number) => {
    navigate(`/users/edit/${userId}`);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
      pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: AlertTriangle },
      suspended: { color: "bg-red-100 text-red-800 border-red-200", icon: ShieldOff },
      expired: { color: "bg-gray-100 text-gray-800 border-gray-200", icon: WifiOff },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config?.icon || CheckCircle;
    
    return (
      <Badge className={`${config?.color} border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const stats = useMemo(() => {
    const total = userManagementData?.data?.summary?.totalUsers || 0;
    const active = userManagementData?.data?.summary?.installedUsers || 0;
    const pending = userManagementData?.data?.summary?.pendingInstallation || 0;
    const suspended = users.filter((u: any) => u.status === 'suspended').length;

    return {
      total,
      active,
      pending,
      suspended,
    };
  }, [userManagementData, users]);

  return (
    <MainLayout title="User Management">
      <div className="space-y-6">
        {/* Enhanced Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-fit lg:grid-cols-3 gap-2 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users2 className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            {/* <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger> */}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Loading State */}
            {isLoadingUserData && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-2 text-gray-600">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Loading user data...</span>
                </div>
              </div>
            )}

            {/* Error State */}
            {userDataError && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load data</h3>
                  <p className="text-gray-600">Please try refreshing the page</p>
                </div>
              </div>
            )}

            {/* Enhanced Stats Cards */}
            {!isLoadingUserData && !userDataError && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Users</p>
                      <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{stats.total}</p>
                      <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">+12% from last month</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">Active Users</p>
                      <p className="text-3xl font-bold text-green-700 dark:text-green-300">{stats.active}</p>
                      <p className="text-xs text-green-500 dark:text-green-400 mt-1">{Math.round((stats.active / stats.total) * 100)}% of total</p>
                    </div>
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Pending</p>
                      <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">{stats.pending}</p>
                      <p className="text-xs text-yellow-500 dark:text-yellow-400 mt-1">Awaiting activation</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600 dark:text-red-400">Suspended</p>
                      <p className="text-3xl font-bold text-red-700 dark:text-red-300">{stats.suspended}</p>
                      <p className="text-xs text-red-500 dark:text-red-400 mt-1">Requires attention</p>
                    </div>
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                      <ShieldOff className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            )}

            {/* Enhanced Overview Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Distribution Chart */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="w-5 h-5 text-blue-600" />
                    User Distribution
                  </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">Active Users</span>
                  </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-green-600">{stats.active}</span>
                        <p className="text-xs text-gray-500">{Math.round((stats.active / stats.total) * 100)}%</p>
                    </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: `${(stats.active / stats.total) * 100}%`}}></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm font-medium">Pending</span>
                    </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-yellow-600">{stats.pending}</span>
                        <p className="text-xs text-gray-500">{Math.round((stats.pending / stats.total) * 100)}%</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{width: `${(stats.pending / stats.total) * 100}%`}}></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-medium">Suspended</span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-red-600">{stats.suspended}</span>
                        <p className="text-xs text-gray-500">{Math.round((stats.suspended / stats.total) * 100)}%</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{width: `${(stats.suspended / stats.total) * 100}%`}}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

              {/* Quick Actions */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-purple-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      onClick={() => navigate("/users/add")}
                      className="h-20 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="text-center">
                        <UserPlus className="w-6 h-6 mx-auto mb-2" />
                        <span className="text-sm font-medium">Add User</span>
                      </div>
                    </Button>
                    
                    {/* <Button 
                      variant="outline"
                      className="h-20 border-2 border-green-200 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
                    >
                      <div className="text-center">
                        <Download className="w-6 h-6 mx-auto mb-2 text-green-600" />
                        <span className="text-sm font-medium text-green-600">Export Data</span>
                      </div>
                    </Button> */}
                    
                    <Button 
                      variant="outline"
                      className="h-20 border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                      onClick={() => {
                        console.log('Import button clicked');
                        if (fileInputRef.current) {
                          console.log('File input ref found, clicking...');
                          fileInputRef.current.click();
                        } else {
                          console.error('File input ref not found!');
                        }
                      }}
                      disabled={isProcessingImport || isImporting}
                    >
                      <div className="text-center">
                        {isProcessingImport || isImporting ? (
                          <RefreshCw className="w-6 h-6 mx-auto mb-2 text-purple-600 animate-spin" />
                        ) : (
                          <Upload className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                        )}
                        <span className="text-sm font-medium text-purple-600">
                          {isProcessingImport || isImporting ? 'Processing...' : 'Import Users'}
                        </span>
                      </div>
                    </Button>
                    
                    {/* <Button 
                      variant="outline"
                      className="h-20 border-2 border-orange-200 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    >
                      <div className="text-center">
                        <Activity className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                        <span className="text-sm font-medium text-orange-600">View Reports</span>
                      </div>
                    </Button> */}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Area Coverage & Online Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{users.filter((u: any) => u.area === "urban").length}</h3>
                  <p className="text-sm text-indigo-600 dark:text-indigo-400">Urban Users</p>
                  <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-1">{Math.round((users.filter((u: any) => u.area === "urban").length / stats.total) * 100)}% of total</p>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Home className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-purple-700 dark:text-purple-300">{users.filter((u: any) => u.area === "rural").length}</h3>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Rural Users</p>
                  <p className="text-xs text-purple-500 dark:text-purple-400 mt-1">{Math.round((users.filter((u: any) => u.area === "rural").length / stats.total) * 100)}% of total</p>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wifi className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-700 dark:text-green-300">{users.filter((u: any) => u.mode === "online").length}</h3>
                  <p className="text-sm text-green-600 dark:text-green-400">Online Now</p>
                  <p className="text-xs text-green-500 dark:text-green-400 mt-1">{Math.round((users.filter((u: any) => u.mode === "online").length / stats.total) * 100)}% active</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            {/* Loading State */}
            {isLoadingUserData && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-2 text-gray-600">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Loading users...</span>
                </div>
              </div>
            )}

            {/* Error State */}
            {userDataError && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load users</h3>
                  <p className="text-gray-600">Please try refreshing the page</p>
                </div>
              </div>
            )}

            {/* Users Content */}
            {!isLoadingUserData && !userDataError && (
              <>
            <Card className="border-0 shadow-lg bg-gradient-to-r from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                  {/* Search and Filter Section */}
                  <div className="flex-1 flex flex-col sm:flex-row gap-4 w-full">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search users by name, email, phone, address..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-10 h-11 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                        disabled={isLoadingUserData}
                      />
                      {isLoadingUserData && searchQuery && (
                        <RefreshCw className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500 animate-spin" />
                      )}
                      {searchQuery && !isLoadingUserData && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSearchQuery("")}
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <X className="h-4 w-4 text-gray-400" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex gap-3">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-36 h-11 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                        <SelectValue placeholder="Status" />
                          </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                      
                    <Select value={areaFilter} onValueChange={setAreaFilter}>
                        <SelectTrigger className="w-32 h-11 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                        <SelectValue placeholder="Area" />
                          </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Areas</SelectItem>
                        <SelectItem value="urban">Urban</SelectItem>
                        <SelectItem value="rural">Rural</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  </div>
                  
                  {/* View Controls and Actions */}
                  <div className="flex gap-3 items-center">
                    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                    <Button
                        variant={viewMode === "card" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("card")}
                        className={`h-8 px-3 ${viewMode === "card" ? "bg-white dark:bg-gray-700 shadow-sm" : ""}`}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === "table" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("table")}
                        className={`h-8 px-3 ${viewMode === "table" ? "bg-white dark:bg-gray-700 shadow-sm" : ""}`}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    </div>
                    
                    <Button
                      onClick={() => navigate("/users/add")}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 h-11 px-6"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add New User
                    </Button>
                  </div>
                </div>
                
                {/* Results Summary */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-2">
                        <Users2 className="w-4 h-4" />
                        {debouncedSearchQuery ? `${users.length} users found for "${debouncedSearchQuery}"` : `${users.length} users found`}
                      </span>
                      <span className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {stats.active} active
                      </span>
                      <span className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        {stats.pending} pending
                      </span>
                    </div>
                    <div className="text-xs">
                      Showing page {currentPage} of {totalPages}
                      {debouncedSearchQuery && (
                        <span className="ml-2 text-blue-500">
                          • Search active
                        </span>
                      )}
                      {isLoadingUserData && (
                        <span className="ml-2 text-blue-500 flex items-center gap-1">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          Loading...
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Users Grid/Table */}
            {viewMode === "card" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentUsers.map((user: any) => (
                  <Card key={user.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
                    <CardContent className="p-6">
                      {/* Header with Profile and Status */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                          {user.profileImageUrl ? (
                            <img 
                              src={user.profileImageUrl} 
                              alt={user.name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                            <div className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg ${user.profileImageUrl ? 'hidden' : ''}`}>
                              <User className="w-6 h-6 text-white" />
                            </div>
                            {/* Online Status Indicator */}
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${user.mode === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">{user.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[150px]" title={user.email}>{user.email}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(user.status)}
                        </div>
                      </div>
                      
                      {/* Contact Information */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-3 text-sm bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg">
                          <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <Phone className="w-3 h-3 text-green-600 dark:text-green-400" />
                        </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">{user.phone}</p>
                        </div>
                        </div>
                        
                        <div className="flex items-center gap-3 text-sm bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg">
                          <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                            <MapPin className="w-3 h-3 text-red-600 dark:text-red-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm truncate" title={user.location}>{user.location}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Modem Details */}
                      <div className="mb-4">
                        <div className="flex items-center gap-3 text-sm bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg">
                          <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                            <Router className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">{user.macAddress || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/users/${user.id}`)}
                          className="flex-1 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:border-blue-700 dark:hover:text-blue-300"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="hover:bg-gray-50 dark:hover:bg-gray-800">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleEditUser(user.id)} className="cursor-pointer">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSuspendUser(user.id)} className="cursor-pointer">
                              {user.status === 'suspended' ? (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Activate User
                                </>
                              ) : (
                                <>
                                  <ShieldOff className="w-4 h-4 mr-2" />
                                  Suspend User
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 focus:text-red-600 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-900 dark:to-gray-800/30">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <tr>
                          <th className="text-left p-6 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              Profile
                            </div>
                          </th>
                          <th className="text-left p-6 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              Contact Info
                            </div>
                          </th>
                          <th className="text-left p-6 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                            <div className="flex items-center gap-2">
                              <Router className="w-4 h-4" />
                              Modem Details
                            </div>
                          </th>
                          <th className="text-left p-6 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              Address
                            </div>
                          </th>
                          <th className="text-left p-6 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                            <div className="flex items-center gap-2">
                              <Activity className="w-4 h-4" />
                              Status
                            </div>
                          </th>
                          <th className="text-left p-6 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                            <div className="flex items-center gap-2">
                              <Settings className="w-4 h-4" />
                              Actions
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentUsers.map((user: any, index: number) => (
                          <tr key={user.id} className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-900/10 dark:hover:to-purple-900/10 transition-all duration-200 ${index % 2 === 0 ? 'bg-white/50 dark:bg-gray-900/50' : 'bg-gray-50/30 dark:bg-gray-800/30'}`}>
                            {/* Profile Column */}
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  {user.profileImageUrl ? (
                                    <img 
                                      src={user.profileImageUrl} 
                                      alt={user.name}
                                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        target.nextElementSibling?.classList.remove('hidden');
                                      }}
                                    />
                                  ) : null}
                                  <div className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg ${user.profileImageUrl ? 'hidden' : ''}`}>
                                    <User className="w-6 h-6 text-white" />
                                  </div>
                                  {/* Online Status Indicator */}
                                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${user.mode === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                </div>
                                <div>
                                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">{user.name}</h3>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                                </div>
                              </div>
                            </td>

                            {/* Contact Info Column */}
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                  <Phone className="w-4 h-4 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white text-sm">{user.phone}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                                </div>
                              </div>
                            </td>

                            {/* Modem Details Column */}
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                                  <Router className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white text-sm">{user.macAddress || 'N/A'}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">MAC Address</p>
                                </div>
                              </div>
                            </td>

                            {/* Address Column */}
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                                  <MapPin className="w-4 h-4 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white text-sm truncate max-w-[150px]" title={user.location}>{user.location}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                                </div>
                              </div>
                            </td>

                            {/* Status Column */}
                            <td className="p-4">
                              <div className="space-y-2">
                                {getStatusBadge(user.status)}
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${user.mode === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                  <span className="text-xs text-gray-600 dark:text-gray-300 capitalize">{user.mode}</span>
                                </div>
                              </div>
                            </td>

                            {/* Actions Column */}
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/users/${user.id}`)}
                                  title="View Details"
                                  className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:border-blue-700 dark:hover:text-blue-300"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                                
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                      <MoreHorizontal className="w-4 h-4" />
                                </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem onClick={() => handleEditUser(user.id)} className="cursor-pointer">
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit User
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleSuspendUser(user.id)} className="cursor-pointer">
                                      {user.status === 'suspended' ? (
                                        <>
                                          <CheckCircle className="w-4 h-4 mr-2" />
                                          Activate User
                                        </>
                                      ) : (
                                        <>
                                          <ShieldOff className="w-4 h-4 mr-2" />
                                          Suspend User
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleDeleteUser(user.id)}
                                      className="text-red-600 focus:text-red-600 cursor-pointer"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete User
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                          </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                          </div>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <Card className="border-0 shadow-lg bg-gradient-to-r from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Users2 className="w-4 h-4" />
                        <span>
                          Showing <span className="font-semibold text-gray-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                          <span className="font-semibold text-gray-900 dark:text-white">{Math.min(currentPage * itemsPerPage, currentUsers.length)}</span> of{' '}
                          <span className="font-semibold text-gray-900 dark:text-white">{currentUsers.length}</span> users
                          {debouncedSearchQuery && (
                            <span className="text-blue-500"> (filtered by search)</span>
                          )}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                        className="h-9 px-4 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                  >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNumber = i + 1;
                          const isCurrentPage = currentPage === pageNumber;
                          return (
                            <Button
                              key={pageNumber}
                              variant={isCurrentPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNumber)}
                              className={`w-9 h-9 ${isCurrentPage ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                            >
                              {pageNumber}
                            </Button>
                          );
                        })}
                        {totalPages > 5 && (
                          <>
                            <span className="text-gray-400 px-2">...</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(totalPages)}
                              className={`w-9 h-9 ${currentPage === totalPages ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                            >
                              {totalPages}
                            </Button>
                          </>
                        )}
                      </div>
                      
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                        className="h-9 px-4 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                  >
                    Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
                </CardContent>
              </Card>
            )}
              </>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Growth Rate</p>
                      <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">+15.2%</p>
                      <p className="text-xs text-emerald-500 dark:text-emerald-400 mt-1">vs last month</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Avg. Session</p>
                      <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">2.4h</p>
                      <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">per user daily</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Data Usage</p>
                      <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">847GB</p>
                      <p className="text-xs text-purple-500 dark:text-purple-400 mt-1">this month</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Satisfaction</p>
                      <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">4.8/5</p>
                      <p className="text-xs text-orange-500 dark:text-orange-400 mt-1">user rating</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Status Distribution */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="w-5 h-5 text-blue-600" />
                    User Status Distribution
                  </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">Active Users</span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-green-600">{stats.active}</span>
                        <p className="text-xs text-gray-500">{Math.round((stats.active / stats.total) * 100)}%</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-green-500 h-3 rounded-full" style={{width: `${(stats.active / stats.total) * 100}%`}}></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm font-medium">Pending Users</span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-yellow-600">{stats.pending}</span>
                        <p className="text-xs text-gray-500">{Math.round((stats.pending / stats.total) * 100)}%</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-yellow-500 h-3 rounded-full" style={{width: `${(stats.pending / stats.total) * 100}%`}}></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-medium">Suspended Users</span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-red-600">{stats.suspended}</span>
                        <p className="text-xs text-gray-500">{Math.round((stats.suspended / stats.total) * 100)}%</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-red-500 h-3 rounded-full" style={{width: `${(stats.suspended / stats.total) * 100}%`}}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Area Coverage Analysis */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-600" />
                    Area Coverage Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-indigo-500 rounded-full"></div>
                        <span className="text-sm font-medium">Urban Coverage</span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-indigo-600">{users.filter((u: any) => u.area === "urban").length}</span>
                        <p className="text-xs text-gray-500">{Math.round((users.filter((u: any) => u.area === "urban").length / stats.total) * 100)}%</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-indigo-500 h-3 rounded-full" style={{width: `${(users.filter((u: any) => u.area === "urban").length / stats.total) * 100}%`}}></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                        <span className="text-sm font-medium">Rural Coverage</span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-purple-600">{users.filter((u: any) => u.area === "rural").length}</span>
                        <p className="text-xs text-gray-500">{Math.round((users.filter((u: any) => u.area === "rural").length / stats.total) * 100)}%</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-purple-500 h-3 rounded-full" style={{width: `${(users.filter((u: any) => u.area === "rural").length / stats.total) * 100}%`}}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Connection Status & Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Wifi className="w-5 h-5 text-green-600" />
                    Connection Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">Online</span>
                      </div>
                      <span className="text-lg font-bold text-green-600">{users.filter((u: any) => u.mode === "online").length}</span>
                      </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        <span className="text-sm font-medium">Offline</span>
                      </div>
                      <span className="text-lg font-bold text-gray-600">{users.filter((u: any) => u.mode === "offline").length}</span> {/* Fixed type annotation */}
                    </div>
                    <div className="pt-2 border-t">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{Math.round((users.filter((u: any) => u.mode === "online").length / stats.total) * 100)}%</p>
                        <p className="text-xs text-gray-500">Uptime Rate</p>
                  </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Monthly Growth
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">This Month</span>
                      <span className="text-lg font-bold text-blue-600">+{Math.floor(Math.random() * 20) + 10}</span>
                      </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Last Month</span>
                      <span className="text-lg font-bold text-gray-600">+{Math.floor(Math.random() * 15) + 5}</span>
                      </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Growth Rate</span>
                      <span className="text-lg font-bold text-green-600">+{Math.floor(Math.random() * 10) + 5}%</span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">↗</p>
                        <p className="text-xs text-gray-500">Positive Trend</p>
                  </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-600" />
                    Service Quality
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg. Speed</span>
                      <span className="text-lg font-bold text-blue-600">45 Mbps</span>
                      </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Latency</span>
                      <span className="text-lg font-bold text-green-600">12ms</span>
                      </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Packet Loss</span>
                      <span className="text-lg font-bold text-green-600">0.1%</span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">A+</p>
                        <p className="text-xs text-gray-500">Quality Grade</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
          </TabsContent>

        </Tabs>

        {/* Hidden file input for Excel import */}
        <input
          ref={fileInputRef}
          id="excel-file-input"
          type="file"
          accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,application/excel,application/x-excel,application/x-msexcel,text/csv,text/comma-separated-values,application/csv"
          onChange={handleExcelFileUpload}
          style={{ display: 'none' }}
        />


        {/* Import Preview Dialog */}
        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-purple-600" />
                Import Users Preview
              </DialogTitle>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                <p>Review the processed data below. The file has been analyzed by the server and only valid records are shown.</p>
                <p className="mt-1">
                  <strong>Required fields:</strong> Name, Email, Phone, Location
                </p>
                <p className="mt-1">
                  <strong>Supported formats:</strong> .xlsx, .xls, .csv
                </p>
                <p className="mt-1">
                  <strong>Maximum file size:</strong> 10MB
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  <strong>Note:</strong> If your .xls file is not being accepted, try saving it as .xlsx format
                </p>
                <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                  <p className="text-green-700 dark:text-green-300 text-xs">
                    <strong>✓ API Integration:</strong> File processing is handled by the backend API with real-time validation.
                  </p>
                </div>
              </div>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-600">Valid Records</p>
                        <p className="text-2xl font-bold text-green-700">{importedData.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="text-sm font-medium text-red-600">Errors</p>
                        <p className="text-2xl font-bold text-red-700">{importErrors.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Users2 className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-600">Total Records</p>
                        <p className="text-2xl font-bold text-blue-700">
                          {importSummary?.totalRecords || importedData.length + importErrors.length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Errors Display */}
              {importErrors.length > 0 && (
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-600 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Import Errors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {importErrors.map((error, index) => (
                        <div key={index} className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                          {error}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Preview Table */}
              {importedData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-blue-600" />
                      Preview Valid Records
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="text-left p-2 font-semibold">Name</th>
                            <th className="text-left p-2 font-semibold">Email</th>
                            <th className="text-left p-2 font-semibold">Phone</th>
                            <th className="text-left p-2 font-semibold">Location</th>
                            <th className="text-left p-2 font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {importedData.slice(0, 10).map((user, index) => (
                            <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                              <td className="p-2">{user.name || user.firstName + ' ' + user.lastName || 'N/A'}</td>
                              <td className="p-2">{user.email || 'N/A'}</td>
                              <td className="p-2">{user.phone || user.phoneNumber || 'N/A'}</td>
                              <td className="p-2">{user.location || user.ruralUrban || 'N/A'}</td>
                              <td className="p-2">
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  {user.status || user.workingStatus || 'active'}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {importedData.length > 10 && (
                        <p className="text-sm text-gray-500 mt-2 text-center">
                          Showing first 10 records of {importedData.length} valid records
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsImportDialogOpen(false);
                    setImportedData([]);
                    setImportErrors([]);
                    setImportSummary(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkImport}
                  disabled={importedData.length === 0 || isImporting}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                >
                  {isImporting ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  {isImporting ? 'Importing...' : `Import ${importedData.length} Users`}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </MainLayout>
  );
}