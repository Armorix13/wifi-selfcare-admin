import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  ArrowLeft, 
  Wrench, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Star, 
  Briefcase, 
  Clock, 
  Award, 
  MoreHorizontal, 
  Edit, 
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  FileText,
  Download,
  Eye,
  PhoneCall,
  MessageSquare,
  Building,
  Target,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Users,
  Plus,
  Filter,
  Search,
  X
} from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useGetFullEngineerDetailsQuery, useUpdateEngineerDataMutation, BASE_URL } from '@/api';

// Area Type Enum
enum AreaType {
  RURAL = "rural",
  URBAN = "urban"
}

// Indian States List
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir",
  "Ladakh", "Chandigarh", "Puducherry", "Andaman and Nicobar Islands", "Dadra and Nagar Haveli and Daman and Diu"
];

// Form Schema
const insertEngineerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  countryCode: z.string().min(1, "Country code is required"),
  status: z.enum(["active", "inactive", "suspended"]).default("active"),
  group: z.string().optional(),
  zone: z.string().optional(),
  area: z.nativeEnum(AreaType).optional(),
  permanentAddress: z.string().optional(),
  residenceAddress: z.string().optional(),
  country: z.string().optional(),
  language: z.string().optional(),
  userName: z.string().optional(),
  fatherName: z.string().optional(),
  profileImage: z.any().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  areaFromPincode: z.string().optional(),
  aadhaarNumber: z.string().optional(),
  panNumber: z.string().optional(),
  aadhaarFront: z.any().optional(),
  aadhaarBack: z.any().optional(),
  panCard: z.any().optional(),
});

type InsertEngineer = z.infer<typeof insertEngineerSchema>;

// Type definitions
interface Complaint {
  _id: string;
  title: string;
  issueDescription: string;
  status: string;
  priority: string;
  createdAt: string;
  attachments?: string[];
  resolutionAttachments?: string[];
  user?: {
    firstName: string;
    lastName: string;
    countryCode: string;
    phoneNumber: string;
  };
}

interface LeaveRequest {
  _id: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  reason: string;
  description: string;
  totalDays: number;
  status: string;
  createdAt: string;
}

interface Attendance {
  _id: string;
  date: string;
  status: string;
  checkInTime: string;
}

interface Installation {
  _id: string;
  name: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  alternateCountryCode: string;
  alternatePhoneNumber: string;
  status: string;
  approvedDate?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  aadhaarFrontUrl?: string;
  aadhaarBackUrl?: string;
  passportPhotoUrl?: string;
}

export default function EngineerDetails() {
  const params = useParams();
  const navigate = useNavigate();
  const engineerId = params?.id as string;

  const { data: engineerDetails, isLoading: isLoadingEngineerDetails, error: engineerDetailsError, refetch } = useGetFullEngineerDetailsQuery(engineerId || '');
  const [updateEngineer, { isLoading: isUpdatingEngineer }] = useUpdateEngineerDataMutation();
  const { toast } = useToast();
  
  console.log("engineerDetails",engineerDetails);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [pincodeAreas, setPincodeAreas] = useState<string[]>([]);
  const [isLoadingPincode, setIsLoadingPincode] = useState(false);

  // Helper function to safely create object URLs
  const createSafeObjectURL = (file: any): string | null => {
    try {
      if (file && file instanceof File) {
        return URL.createObjectURL(file);
      }
      return null;
    } catch (error) {
      console.error("Error creating object URL:", error);
      return null;
    }
  };

  // Function to fetch areas from pincode
  const fetchAreasFromPincode = async (pincode: string) => {
    if (!pincode || pincode.length !== 6) {
      setPincodeAreas([]);
      return;
    }
    
    setIsLoadingPincode(true);
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();
      
      if (data[0]?.Status === "Success" && data[0]?.PostOffice) {
        const areas = data[0].PostOffice.map((office: any) => office.Name);
        setPincodeAreas(areas);
      } else {
        setPincodeAreas([]);
        toast({
          title: "Warning",
          description: "No areas found for this pincode",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching pincode data:", error);
      setPincodeAreas([]);
      toast({
        title: "Error",
        description: "Failed to fetch pincode data",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPincode(false);
    }
  };

  const editForm = useForm<InsertEngineer>({
    resolver: zodResolver(insertEngineerSchema),
  });

  const handleEditEngineer = async (data: InsertEngineer) => {
    if (!engineer) return;
    
    try {
      // Create FormData for multipart submission
      const formData = new FormData();
      formData.append('engineerId', engineer._id);
      
      // Add all form fields to FormData
      formData.append('firstName', data.firstName);
      formData.append('lastName', data.lastName);
      formData.append('email', data.email);
      formData.append('phoneNumber', data.phoneNumber);
      formData.append('countryCode', data.countryCode);
      formData.append('status', data.status);
      
      // Add optional fields if they exist
      if (data.group) formData.append('group', data.group);
      if (data.zone) formData.append('zone', data.zone);
      if (data.area) formData.append('area', data.area);
      if (data.permanentAddress) formData.append('permanentAddress', data.permanentAddress);
      if (data.residenceAddress) formData.append('residenceAddress', data.residenceAddress);
      if (data.country) formData.append('country', data.country);
      if (data.language) formData.append('language', data.language);
      if (data.userName) formData.append('userName', data.userName);
      if (data.fatherName) formData.append('fatherName', data.fatherName);
      if (data.state) formData.append('state', data.state);
      if (data.pincode) formData.append('pincode', data.pincode);
      if (data.areaFromPincode) formData.append('areaFromPincode', data.areaFromPincode);
      if (data.aadhaarNumber) formData.append('aadhaarNumber', data.aadhaarNumber);
      if (data.panNumber) formData.append('panNumber', data.panNumber);
      
      // Add profile image if selected
      if (data.profileImage) {
        formData.append('profileImage', data.profileImage);
      }
      
      // Add document images if selected (or explicitly set to null to remove)
      if (data.aadhaarFront) {
        formData.append('aadhaarFront', data.aadhaarFront);
      } else if (data.aadhaarFront === null) {
        formData.append('aadhaarFront', '');
      }
      if (data.aadhaarBack) {
        formData.append('aadhaarBack', data.aadhaarBack);
      } else if (data.aadhaarBack === null) {
        formData.append('aadhaarBack', '');
      }
      if (data.panCard) {
        formData.append('panCard', data.panCard);
      } else if (data.panCard === null) {
        formData.append('panCard', '');
      }
      
      // Call API to update engineer
      await updateEngineer(formData).unwrap();
      
      toast({
        title: "Success",
        description: "Engineer updated successfully",
      });
      
      setIsEditDialogOpen(false);
      refetch(); // Refresh data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update engineer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = () => {
    if (!engineer) return;
    
    try {
      const formData: InsertEngineer = {
        firstName: engineer.firstName || "",
        lastName: engineer.lastName || "",
        email: engineer.email || "",
        phoneNumber: engineer.phoneNumber || "",
        countryCode: engineer.countryCode || "+91",
        status: (engineer.status || (engineer.isActive ? "active" : "inactive")) as "active" | "inactive" | "suspended",
        group: engineer.group || "",
        zone: engineer.zone || "",
        area: engineer.area as AreaType | undefined,
        permanentAddress: engineer.permanentAddress || "",
        residenceAddress: engineer.residenceAddress || "",
        country: engineer.country || "India",
        language: engineer.language || "",
        userName: engineer.userName || "",
        fatherName: engineer.fatherName || "",
        profileImage: engineer.profileImage || null,
        state: engineer.state || "",
        pincode: engineer.pincode || "",
        areaFromPincode: engineer.areaFromPincode || "",
        aadhaarNumber: engineer.aadhaarNumber || "",
        panNumber: engineer.panNumber || "",
        aadhaarFront: engineer.aadhaarFront || null,
        aadhaarBack: engineer.aadhaarBack || null,
        panCard: engineer.panCard || null,
      };
      console.log("Setting edit form data:", formData);
      editForm.reset(formData);
      // Reset pincode areas for the edit form and add existing area if available
      if (engineer.areaFromPincode) {
        setPincodeAreas([engineer.areaFromPincode]);
      } else {
        setPincodeAreas([]);
      }
      setIsEditDialogOpen(true);
    } catch (error) {
      console.error("Error setting edit form data:", error);
      toast({
        title: "Error",
        description: "Failed to load engineer data for editing",
        variant: "destructive",
      });
    }
  };

  // Extract data from API response
  const engineer = engineerDetails?.data?.engineer;
  const analytics = engineerDetails?.data?.analytics;
  const records = engineerDetails?.data?.records;
  
  const assignedComplaints = records?.complaints || [];
  const leaveRequests = records?.leaveRequests || [];
  const attendance = records?.attendance || [];
  const installations = records?.installations || [];

  // Loading state
  if (isLoadingEngineerDetails) {
    return (
      <MainLayout title="Loading Engineer Details">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Loading Engineer Details...</h3>
          <p className="text-gray-600 dark:text-gray-400">Please wait while we fetch the engineer information.</p>
        </div>
      </MainLayout>
    );
  }

  // Error state
  if (engineerDetailsError) {
    return (
      <MainLayout title="Error Loading Engineer">
        <div className="p-8 text-center">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Engineer</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">There was an error loading the engineer details.</p>
          <Button onClick={() => navigate('/engineers')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Engineers
          </Button>
        </div>
      </MainLayout>
    );
  }

  // Not found state
  if (!engineer) {
    return (
      <MainLayout title="Engineer Not Found">
        <div className="p-8 text-center">
          <Wrench className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Engineer Not Found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The engineer you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/engineers')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Engineers
          </Button>
        </div>
      </MainLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'assigned':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getLeaveStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getAttendanceStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'absent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'late':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'weekend':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const filteredComplaints = assignedComplaints.filter((complaint: Complaint) => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (complaint.user?.firstName + ' ' + complaint.user?.lastName).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || complaint.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const completionRate = (analytics?.complaints?.total || 0) > 0 ? (analytics.complaints.resolved / analytics.complaints.total) * 100 : 0;

  return (
    <MainLayout title={`${engineer.firstName} ${engineer.lastName} - Engineer Details`}>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/engineers')}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Engineers
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{engineer.firstName} {engineer.lastName}</h1>
              <p className="text-gray-600 dark:text-gray-400">{engineer.group} • {engineer.userName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={openEditDialog}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Engineer
            </Button>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Profile Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Engineer Profile */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">
                  {engineer.profileImage ? (
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={`${BASE_URL}${engineer.profileImage}`} alt={`${engineer.firstName} ${engineer.lastName}`} />
                      <AvatarFallback className="text-3xl">
                        {engineer.firstName.charAt(0)}{engineer.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    engineer.firstName.charAt(0) + engineer.lastName.charAt(0)
                  )}
                </div>
                <CardTitle className="text-xl">{engineer.firstName} {engineer.lastName}</CardTitle>
                <p className="text-gray-600 dark:text-gray-400">{engineer.group}</p>
                <div className="flex justify-center">
                  <Badge className={cn(
                    "capitalize",
                    engineer.isActive 
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                  )}>
                    {engineer.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Email:</span>
                  <span className="font-medium">{engineer.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                  <span className="font-medium">{engineer.countryCode} {engineer.phoneNumber}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Address:</span>
                  <span className="font-medium">{engineer.permanentAddress}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Joined:</span>
                  <span className="font-medium">{new Date(engineer.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Building className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Group:</span>
                  <span className="font-medium">{engineer.group}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Target className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Zone:</span>
                  <span className="font-medium">{engineer.zone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">State:</span>
                  <span className="font-medium">{engineer.state}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Area:</span>
                  <span className="font-medium">{engineer.areaFromPincode}</span>
                </div>
              </CardContent>
            </Card>

            {/* Document Attachments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Document Attachments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Aadhaar Front */}
                {engineer.aadhaarFront && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Aadhaar Front</Label>
                    <div className="relative">
                      <img 
                        src={`${BASE_URL}${engineer.aadhaarFront}`} 
                        alt="Aadhaar Front" 
                        className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="w-full h-32 flex items-center justify-center hidden bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="text-center">
                          <FileText className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-500">Image not available</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Aadhaar Back */}
                {engineer.aadhaarBack && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Aadhaar Back</Label>
                    <div className="relative">
                      <img 
                        src={`${BASE_URL}${engineer.aadhaarBack}`} 
                        alt="Aadhaar Back" 
                        className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="w-full h-32 flex items-center justify-center hidden bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="text-center">
                          <FileText className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-500">Image not available</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* PAN Card */}
                {engineer.panCard && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">PAN Card</Label>
                    <div className="relative">
                      <img 
                        src={`${BASE_URL}${engineer.panCard}`} 
                        alt="PAN Card" 
                        className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="w-full h-32 flex items-center justify-center hidden bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="text-center">
                          <FileText className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-500">Image not available</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Show message if no documents */}
                {!engineer.aadhaarFront && !engineer.aadhaarBack && !engineer.panCard && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Documents</h3>
                    <p className="text-gray-600 dark:text-gray-400">No document attachments available.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Complaints Resolution Rate */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Resolution Rate</span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {analytics?.complaints?.total > 0 ? Math.round((analytics.complaints.resolved / analytics.complaints.total) * 100) : 0}%
                    </span>
                  </div>
                  <Progress value={analytics?.complaints?.total > 0 ? (analytics.complaints.resolved / analytics.complaints.total) * 100 : 0} className="h-2" />
                </div>

                {/* Installation Approval Rate */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Installation Approval Rate</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {analytics?.installations?.approvalRate || 0}%
                    </span>
                  </div>
                  <Progress value={analytics?.installations?.approvalRate || 0} className="h-2" />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg mx-auto mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.complaints?.resolved || 0}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Resolved</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg mx-auto mb-2">
                      <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.complaints?.inProgress || 0}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">In Progress</p>
                  </div>
                </div>

                {/* Additional Metrics */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Total Complaints:</span>
                    <span className="font-medium">{analytics?.complaints?.total || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Total Installations:</span>
                    <span className="font-medium">{analytics?.installations?.total || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Attendance Rate:</span>
                    <span className="font-medium">{analytics?.attendance?.attendancePercentage || 0}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Content Tabs */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="complaints">Complaints</TabsTrigger>
                <TabsTrigger value="leaves">Leave Requests</TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
                <TabsTrigger value="installations">Installations</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{analytics?.complaints?.total || 0}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Total Complaints</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{analytics?.complaints?.resolved || 0}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Resolved</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{analytics?.leaveRequests?.total || 0}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Leave Requests</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                          <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{analytics?.installations?.total || 0}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Installations</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {assignedComplaints.slice(0, 3).map((complaint: Complaint) => (
                        <div key={complaint._id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{complaint.title}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {complaint.user?.firstName} {complaint.user?.lastName} • {new Date(complaint.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={cn("text-xs", getStatusColor(complaint.status))}>
                            {complaint.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Complaints Tab */}
              <TabsContent value="complaints" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Assigned Complaints ({analytics?.complaints?.total || 0})
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Search complaints..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-64"
                        />
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="assigned">Assigned</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {filteredComplaints.length > 0 ? (
                      <div className="space-y-4">
                        {filteredComplaints.map((complaint: Complaint) => (
                          <div
                            key={complaint._id}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                            onClick={() => navigate(`/complaints/${complaint._id}`)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-gray-900 dark:text-white">{complaint.title}</h4>
                              <div className="flex gap-2">
                                <Badge className={cn("text-xs", getPriorityColor(complaint.priority))}>
                                  {complaint.priority}
                                </Badge>
                                <Badge className={cn("text-xs", getStatusColor(complaint.status))}>
                                  {complaint.status}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                              {complaint.issueDescription}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                              <div className="flex items-center gap-4">
                                <span>Customer: {complaint.user?.firstName} {complaint.user?.lastName}</span>
                                <span>Phone: {complaint.user?.countryCode} {complaint.user?.phoneNumber}</span>
                              </div>
                              <span>Created: {new Date(complaint.createdAt).toLocaleDateString()}</span>
                            </div>
                            
                            {/* Complaint Attachments */}
                            {(complaint.attachments && complaint.attachments.length > 0) && (
                              <div className="mt-3">
                                <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">Attachments:</Label>
                                <div className="flex gap-2 mt-1">
                                  {complaint.attachments.map((attachment, index) => (
                                    <div key={index} className="relative">
                                      <img 
                                        src={`${BASE_URL}${attachment}`} 
                                        alt={`Attachment ${index + 1}`} 
                                        className="w-16 h-16 object-cover rounded border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-80"
                                        onClick={() => window.open(`${BASE_URL}${attachment}`, '_blank')}
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Resolution Attachments */}
                            {(complaint.resolutionAttachments && complaint.resolutionAttachments.length > 0) && (
                              <div className="mt-3">
                                <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">Resolution Attachments:</Label>
                                <div className="flex gap-2 mt-1">
                                  {complaint.resolutionAttachments.map((attachment, index) => (
                                    <div key={index} className="relative">
                                      <img 
                                        src={`${BASE_URL}${attachment}`} 
                                        alt={`Resolution ${index + 1}`} 
                                        className="w-16 h-16 object-cover rounded border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-80"
                                        onClick={() => window.open(`${BASE_URL}${attachment}`, '_blank')}
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Complaints Found</h3>
                        <p className="text-gray-600 dark:text-gray-400">No complaints match your search criteria.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Leave Requests Tab */}
              <TabsContent value="leaves" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Leave Requests ({analytics?.leaveRequests?.total || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {leaveRequests.length > 0 ? (
                      <div className="space-y-4">
                        {leaveRequests.map((leave: LeaveRequest) => (
                          <div key={leave._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                                  {leave.leaveType.replace('_', ' ')} Leave
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{leave.reason}</p>
                              </div>
                              <Badge className={cn("text-xs", getLeaveStatusColor(leave.status))}>
                                {leave.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">From:</span>
                                <p className="font-medium">{new Date(leave.fromDate).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">To:</span>
                                <p className="font-medium">{new Date(leave.toDate).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Days:</span>
                                <p className="font-medium">{leave.totalDays}</p>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                <p className="font-medium capitalize">{leave.status}</p>
                              </div>
                            </div>
                            {leave.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                                {leave.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Leave Requests</h3>
                        <p className="text-gray-600 dark:text-gray-400">This engineer has no leave requests.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Attendance Tab */}
              <TabsContent value="attendance" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarDays className="h-5 w-5" />
                      Attendance Calendar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-2">
                      {/* Calendar Headers */}
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 p-2">
                          {day}
                        </div>
                      ))}
                      
                      {/* Calendar Days */}
                      {attendance.map((day: Attendance) => (
                        <div key={day._id} className="text-center p-2">
                          <div className={cn(
                            "w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-medium",
                            day.status === 'present' && "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
                            day.status === 'absent' && "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
                            day.status === 'late' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
                            day.status === 'weekend' && "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                          )}>
                            {new Date(day.date).getDate()}
                          </div>
                          {day.status !== 'weekend' && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {new Date(day.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Attendance Summary */}
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {analytics?.attendance?.present || 0}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Present Days</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                          {analytics?.attendance?.absent || 0}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Absent Days</div>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                          {analytics?.attendance?.late || 0}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Late Days</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {analytics?.attendance?.attendancePercentage || 0}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Attendance Rate</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Installations Tab */}
              <TabsContent value="installations" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Installations ({analytics?.installations?.total || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {installations.length > 0 ? (
                      <div className="space-y-4">
                        {installations.map((installation: Installation) => (
                          <div key={installation._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">{installation.name}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{installation.email}</p>
                              </div>
                              <Badge className={cn(
                                "text-xs",
                                installation.status === 'approved' ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" :
                                installation.status === 'in_review' ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300" :
                                installation.status === 'rejected' ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300" :
                                "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
                              )}>
                                {installation.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                                <p className="font-medium">{installation.countryCode} {installation.phoneNumber}</p>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Alt Phone:</span>
                                <p className="font-medium">{installation.alternateCountryCode} {installation.alternatePhoneNumber}</p>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                <p className="font-medium capitalize">{installation.status}</p>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Approved Date:</span>
                                <p className="font-medium">{installation.approvedDate ? new Date(installation.approvedDate).toLocaleDateString() : 'N/A'}</p>
                              </div>
                            </div>
                            {installation.remarks && (
                              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Remarks:</span>
                                <p className="text-sm font-medium mt-1">{installation.remarks}</p>
                              </div>
                            )}
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-3">
                              <span>Created: {new Date(installation.createdAt).toLocaleDateString()}</span>
                              <span>Updated: {new Date(installation.updatedAt).toLocaleDateString()}</span>
                            </div>

                            {/* Installation Document Attachments */}
                            {(installation.aadhaarFrontUrl || installation.aadhaarBackUrl || installation.passportPhotoUrl) && (
                              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">Document Attachments:</Label>
                                <div className="grid grid-cols-3 gap-3">
                                  {installation.aadhaarFrontUrl && (
                                    <div className="space-y-1">
                                      <Label className="text-xs text-gray-500">Aadhaar Front</Label>
                                      <img 
                                        src={`${BASE_URL}${installation.aadhaarFrontUrl}`} 
                                        alt="Aadhaar Front" 
                                        className="w-full h-20 object-cover rounded border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-80"
                                        onClick={() => window.open(`${BASE_URL}${installation.aadhaarFrontUrl}`, '_blank')}
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                    </div>
                                  )}
                                  {installation.aadhaarBackUrl && (
                                    <div className="space-y-1">
                                      <Label className="text-xs text-gray-500">Aadhaar Back</Label>
                                      <img 
                                        src={`${BASE_URL}${installation.aadhaarBackUrl}`} 
                                        alt="Aadhaar Back" 
                                        className="w-full h-20 object-cover rounded border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-80"
                                        onClick={() => window.open(`${BASE_URL}${installation.aadhaarBackUrl}`, '_blank')}
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                    </div>
                                  )}
                                  {installation.passportPhotoUrl && (
                                    <div className="space-y-1">
                                      <Label className="text-xs text-gray-500">Passport Photo</Label>
                                      <img 
                                        src={`${BASE_URL}${installation.passportPhotoUrl}`} 
                                        alt="Passport Photo" 
                                        className="w-full h-20 object-cover rounded border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-80"
                                        onClick={() => window.open(`${BASE_URL}${installation.passportPhotoUrl}`, '_blank')}
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Installations</h3>
                        <p className="text-gray-600 dark:text-gray-400">This engineer has no installations yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Edit Engineer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              ✏️ Edit Engineer
            </DialogTitle>
            <p className="text-muted-foreground">Update the engineer profile information</p>
          </DialogHeader>
          
          <form onSubmit={editForm.handleSubmit(handleEditEngineer)} className="space-y-6">
            {/* Profile Image Upload */}
            <div className="flex justify-center">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-blue-100 border-2 border-dashed border-green-300 flex items-center justify-center cursor-pointer hover:border-green-400 transition-all duration-200 overflow-hidden">
                  {editForm.watch("profileImage") && editForm.watch("profileImage") instanceof File ? (
                    <img 
                      src={createSafeObjectURL(editForm.watch("profileImage")) || ''} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (editForm.watch("profileImage") || engineer?.profileImage) ? (
                    <>
                    <img 
                        src={`${BASE_URL}${editForm.watch("profileImage") || engineer?.profileImage}`} 
                      alt="Current Profile" 
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                      <div className="w-full h-full flex items-center justify-center hidden">
                    <div className="text-center">
                      <User className="w-8 h-8 text-green-500 mx-auto mb-1" />
                          <p className="text-xs text-green-600">Image not available</p>
                    </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <User className="w-8 h-8 text-green-500 mx-auto mb-1" />
                      <p className="text-xs text-green-600">Update Photo</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) editForm.setValue("profileImage", file);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">👤 Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-firstName" className="text-sm font-medium">First Name *</Label>
                  <Input 
                    id="edit-firstName"
                    {...editForm.register("firstName")} 
                    className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lastName" className="text-sm font-medium">Last Name *</Label>
                  <Input 
                    id="edit-lastName"
                    {...editForm.register("lastName")} 
                    className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter last name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-userName" className="text-sm font-medium">Username</Label>
                  <Input 
                    id="edit-userName"
                    {...editForm.register("userName")} 
                    className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-fatherName" className="text-sm font-medium">Father's Name</Label>
                  <Input 
                    id="edit-fatherName"
                    {...editForm.register("fatherName")} 
                    className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter father's name"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">📞 Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-email" className="text-sm font-medium">Email *</Label>
                  <Input 
                    id="edit-email"
                    {...editForm.register("email")} 
                    type="email"
                    className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phoneNumber" className="text-sm font-medium">Phone Number *</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="edit-countryCode"
                      {...editForm.register("countryCode")} 
                      className="w-20 h-10 border-gray-300 bg-gray-50 text-center text-gray-600"
                      placeholder="+91"
                      disabled
                      readOnly
                    />
                    <Input 
                      id="edit-phoneNumber"
                      {...editForm.register("phoneNumber")} 
                      className="flex-1 h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Location & Assignment */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">📍 Location & Assignment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-country" className="text-sm font-medium">Country</Label>
                  <Input 
                    id="edit-country"
                    {...editForm.register("country")} 
                    className="h-10 border-gray-300 bg-gray-50 text-gray-600"
                    placeholder="India"
                    disabled
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-state" className="text-sm font-medium">State</Label>
                  <Select 
                    value={editForm.watch("state") || ""} 
                    onValueChange={(value) => editForm.setValue("state", value)}
                  >
                    <SelectTrigger className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {INDIAN_STATES.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-pincode" className="text-sm font-medium">Pincode</Label>
                  <Input 
                    id="edit-pincode"
                    {...editForm.register("pincode")} 
                    className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter 6-digit pincode"
                    maxLength={6}
                    onChange={(e) => {
                      editForm.setValue("pincode", e.target.value);
                      if (e.target.value.length === 6) {
                        fetchAreasFromPincode(e.target.value);
                      } else {
                        setPincodeAreas([]);
                        editForm.setValue("areaFromPincode", "");
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-areaFromPincode" className="text-sm font-medium">Area (from Pincode)</Label>
                  <Select 
                    value={editForm.watch("areaFromPincode") || ""} 
                    onValueChange={(value) => editForm.setValue("areaFromPincode", value)}
                    disabled={pincodeAreas.length === 0 || isLoadingPincode}
                  >
                    <SelectTrigger className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder={isLoadingPincode ? "Loading areas..." : editForm.watch("areaFromPincode") ? editForm.watch("areaFromPincode") : "Select area"} />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {pincodeAreas.map((area) => (
                        <SelectItem key={area} value={area}>{area}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {editForm.watch("areaFromPincode") && pincodeAreas.length === 1 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Current area: {editForm.watch("areaFromPincode")}. Update pincode above to see more areas.
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-zone" className="text-sm font-medium">Zone</Label>
                  <Input 
                    id="edit-zone"
                    {...editForm.register("zone")} 
                    className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter zone"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-area" className="text-sm font-medium">Area Type</Label>
                  <Select 
                    value={editForm.watch("area") || ""} 
                    onValueChange={(value) => editForm.setValue("area", value === "" ? undefined : value as AreaType)}
                  >
                    <SelectTrigger className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select area type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rural">🏘️ Rural</SelectItem>
                      <SelectItem value="urban">🏙️ Urban</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-group" className="text-sm font-medium">Group</Label>
                  <Input 
                    id="edit-group"
                    {...editForm.register("group")} 
                    className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter group"
                  />
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">🏠 Addresses</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-permanentAddress" className="text-sm font-medium">Permanent Address</Label>
                  <textarea 
                    id="edit-permanentAddress"
                    {...editForm.register("permanentAddress")} 
                    className="w-full h-20 px-3 py-2 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-blue-500 resize-none"
                    placeholder="Enter permanent address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-residenceAddress" className="text-sm font-medium">Residence Address</Label>
                  <textarea 
                    id="edit-residenceAddress"
                    {...editForm.register("residenceAddress")} 
                    className="w-full h-20 px-3 py-2 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-blue-500 resize-none"
                    placeholder="Enter residence address"
                  />
                </div>
              </div>
            </div>

            {/* Preferences & Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">⚙️ Preferences & Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-language" className="text-sm font-medium">Language</Label>
                  <Input 
                    id="edit-language"
                    {...editForm.register("language")} 
                    className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter preferred language"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status" className="text-sm font-medium">Status *</Label>
                  <Select 
                    value={editForm.watch("status")} 
                    onValueChange={(value) => editForm.setValue("status", value as "active" | "inactive" | "suspended")}
                  >
                    <SelectTrigger className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active" className="text-green-600">🟢 Active</SelectItem>
                      <SelectItem value="inactive" className="text-gray-600">⚫ Inactive</SelectItem>
                      <SelectItem value="suspended" className="text-red-600">🔴 Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Document Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">📄 Document Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-aadhaarNumber" className="text-sm font-medium">Aadhaar Number</Label>
                  <Input 
                    id="edit-aadhaarNumber"
                    {...editForm.register("aadhaarNumber")} 
                    className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter 12-digit Aadhaar number"
                    maxLength={12}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-panNumber" className="text-sm font-medium">PAN Number</Label>
                  <Input 
                    id="edit-panNumber"
                    {...editForm.register("panNumber")} 
                    className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter PAN number"
                    maxLength={10}
                  />
                </div>
              </div>
            </div>

            {/* Document Uploads */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">📎 Document Uploads</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Aadhaar Front */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Aadhaar Front</Label>
                  <div className="relative group">
                    <div className="w-full h-32 rounded-lg bg-gradient-to-br from-green-100 to-blue-100 border-2 border-dashed border-green-300 flex items-center justify-center cursor-pointer hover:border-green-400 transition-all duration-200 overflow-hidden">
                      {editForm.watch("aadhaarFront") && editForm.watch("aadhaarFront") instanceof File ? (
                        <>
                          <img 
                            src={createSafeObjectURL(editForm.watch("aadhaarFront")) || ''} 
                            alt="Aadhaar Front" 
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              editForm.setValue("aadhaarFront", null);
                              // Clear the file input
                              const fileInput = e.currentTarget.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
                              if (fileInput) {
                                fileInput.value = '';
                              }
                            }}
                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors z-10"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (editForm.watch("aadhaarFront") || engineer?.aadhaarFront) ? (
                        <>
                          {(() => {
                            const imagePath = editForm.watch("aadhaarFront") || (engineer?.aadhaarFront ?? '');
                            return (
                              <img 
                                src={`${BASE_URL}${imagePath}`} 
                                alt="Current Aadhaar Front" 
                                className="w-full h-full object-cover rounded-lg"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            );
                          })()}
                          <div className="w-full h-full flex items-center justify-center hidden">
                            <div className="text-center">
                              <User className="w-8 h-8 text-green-500 mx-auto mb-1" />
                              <p className="text-xs text-green-600">Image not available</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              editForm.setValue("aadhaarFront", null);
                              // Clear the file input
                              const fileInput = e.currentTarget.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
                              if (fileInput) {
                                fileInput.value = '';
                              }
                            }}
                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors z-10"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <div className="text-center">
                          <User className="w-8 h-8 text-green-500 mx-auto mb-1" />
                          <p className="text-xs text-green-600">Update Aadhaar Front</p>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) editForm.setValue("aadhaarFront", file);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Aadhaar Back */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Aadhaar Back</Label>
                  <div className="relative group">
                    <div className="w-full h-32 rounded-lg bg-gradient-to-br from-green-100 to-blue-100 border-2 border-dashed border-green-300 flex items-center justify-center cursor-pointer hover:border-green-400 transition-all duration-200 overflow-hidden">
                      {editForm.watch("aadhaarBack") && editForm.watch("aadhaarBack") instanceof File ? (
                        <>
                          <img 
                            src={createSafeObjectURL(editForm.watch("aadhaarBack")) || ''} 
                            alt="Aadhaar Back" 
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              editForm.setValue("aadhaarBack", null);
                              // Clear the file input
                              const fileInput = e.currentTarget.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
                              if (fileInput) {
                                fileInput.value = '';
                              }
                            }}
                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors z-10"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (editForm.watch("aadhaarBack") || engineer?.aadhaarBack) ? (
                        <>
                          <img 
                            src={`${BASE_URL}${editForm.watch("aadhaarBack") || engineer?.aadhaarBack}`} 
                            alt="Current Aadhaar Back" 
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <div className="w-full h-full flex items-center justify-center hidden">
                            <div className="text-center">
                              <User className="w-8 h-8 text-green-500 mx-auto mb-1" />
                              <p className="text-xs text-green-600">Image not available</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              editForm.setValue("aadhaarBack", null);
                              // Clear the file input
                              const fileInput = e.currentTarget.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
                              if (fileInput) {
                                fileInput.value = '';
                              }
                            }}
                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors z-10"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <div className="text-center">
                          <User className="w-8 h-8 text-green-500 mx-auto mb-1" />
                          <p className="text-xs text-green-600">Update Aadhaar Back</p>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) editForm.setValue("aadhaarBack", file);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                {/* PAN Card */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">PAN Card</Label>
                  <div className="relative group">
                    <div className="w-full h-32 rounded-lg bg-gradient-to-br from-green-100 to-blue-100 border-2 border-dashed border-green-300 flex items-center justify-center cursor-pointer hover:border-green-400 transition-all duration-200 overflow-hidden">
                      {editForm.watch("panCard") && editForm.watch("panCard") instanceof File ? (
                        <>
                          <img 
                            src={createSafeObjectURL(editForm.watch("panCard")) || ''} 
                            alt="PAN Card" 
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              editForm.setValue("panCard", null);
                              // Clear the file input
                              const fileInput = e.currentTarget.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
                              if (fileInput) {
                                fileInput.value = '';
                              }
                            }}
                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors z-10"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (editForm.watch("panCard") || engineer?.panCard) ? (
                        <>
                          <img 
                            src={`${BASE_URL}${editForm.watch("panCard") || engineer?.panCard}`} 
                            alt="Current PAN Card" 
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <div className="w-full h-full flex items-center justify-center hidden">
                            <div className="text-center">
                              <User className="w-8 h-8 text-green-500 mx-auto mb-1" />
                              <p className="text-xs text-green-600">Image not available</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              editForm.setValue("panCard", null);
                              // Clear the file input
                              const fileInput = e.currentTarget.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
                              if (fileInput) {
                                fileInput.value = '';
                              }
                            }}
                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors z-10"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <div className="text-center">
                          <User className="w-8 h-8 text-green-500 mx-auto mb-1" />
                          <p className="text-xs text-green-600">Update PAN Card</p>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) editForm.setValue("panCard", file);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
                className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isUpdatingEngineer}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdatingEngineer ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  "✏️ Update Engineer"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
