import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Search
} from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useGetFullEngineerDetailsQuery, BASE_URL } from '@/api';

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

  const { data: engineerDetails, isLoading: isLoadingEngineerDetails, error: engineerDetailsError } = useGetFullEngineerDetailsQuery(engineerId || '');
  
  console.log("engineerDetails",engineerDetails);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
            <Button variant="outline" size="sm">
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
    </MainLayout>
  );
}
