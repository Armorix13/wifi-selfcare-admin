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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

// Mock data - Replace with actual API calls
const mockEngineerData = {
  _id: "68aad97ed681a3f5e4c17646",
  firstName: "Sarah",
  lastName: "Johnson",
  fullName: "Sarah Johnson",
  email: "sarah.johnson@wificare.com",
  phoneNumber: "+1-555-0123",
  countryCode: "+1",
  status: "active",
  group: "Network Operations",
  zone: "North Zone",
  area: "urban",
  mode: "full-time",
  permanentAddress: "123 Main Street, Tech City, TC 12345",
  billingAddress: "123 Main Street, Tech City, TC 12345",
  country: "United States",
  language: "English",
  companyPreference: "WiFi Care",
  userName: "sarah.j",
  fatherName: "John Johnson",
  profileImage: null,
  lastLogin: "2025-01-27T10:30:00.000Z",
  createdAt: "2023-01-15T00:00:00.000Z",
  updatedAt: "2025-01-27T10:30:00.000Z",
  isActive: true,
  employeeId: "EMP001",
  department: "Network Operations",
  joiningDate: "2023-01-15T00:00:00.000Z",
  emergencyContact: {
    name: "John Johnson",
    relationship: "Spouse",
    phone: "+1-555-0126"
  },
  performance: {
    rating: 4.5,
    completedJobs: 156,
    activeJobs: 8,
    successRate: 94.2,
    avgResponseTime: "2.3 hours",
    customerSatisfaction: 4.7
  }
};

const mockAssignedComplaints = [
  {
    _id: "complaint1",
    title: "WiFi Connection Issue",
    description: "Customer experiencing intermittent WiFi disconnections",
    status: "in-progress",
    priority: "high",
    customerName: "John Doe",
    location: "Tech City, TC 12345",
    createdAt: "2025-01-25T09:00:00.000Z",
    assignedAt: "2025-01-25T10:00:00.000Z",
    estimatedCompletion: "2025-01-28T18:00:00.000Z"
  },
  {
    _id: "complaint2",
    title: "Router Configuration Problem",
    description: "Need help setting up new router configuration",
    status: "assigned",
    priority: "medium",
    customerName: "Jane Smith",
    location: "Digital District, DD 67890",
    createdAt: "2025-01-26T14:00:00.000Z",
    assignedAt: "2025-01-26T15:00:00.000Z",
    estimatedCompletion: "2025-01-29T16:00:00.000Z"
  },
  {
    _id: "complaint3",
    title: "Network Speed Issue",
    description: "Slow internet speed during peak hours",
    status: "resolved",
    priority: "low",
    customerName: "Mike Wilson",
    location: "Innovation Valley, IV 11111",
    createdAt: "2025-01-20T11:00:00.000Z",
    assignedAt: "2025-01-20T12:00:00.000Z",
    completedAt: "2025-01-22T16:00:00.000Z"
  }
];

const mockLeaveRequests = [
  {
    _id: "leave1",
    leaveType: "full_day",
    fromDate: "2025-02-15T00:00:00.000Z",
    toDate: "2025-02-15T00:00:00.000Z",
    reason: "personal",
    description: "Doctor appointment",
    totalDays: 1,
    status: "approved",
    createdAt: "2025-01-20T10:00:00.000Z",
    approvedBy: "Manager",
    approvedAt: "2025-01-21T14:00:00.000Z"
  },
  {
    _id: "leave2",
    leaveType: "full_day",
    fromDate: "2025-03-10T00:00:00.000Z",
    toDate: "2025-03-12T00:00:00.000Z",
    reason: "vacation",
    description: "Family vacation",
    totalDays: 3,
    status: "pending",
    createdAt: "2025-01-25T16:00:00.000Z",
    approvedBy: null,
    approvedAt: null
  }
];

const mockAttendance = [
  { date: "2025-01-01", status: "present", checkIn: "09:00", checkOut: "18:00" },
  { date: "2025-01-02", status: "present", checkIn: "08:45", checkOut: "17:30" },
  { date: "2025-01-03", status: "present", checkIn: "09:15", checkOut: "18:15" },
  { date: "2025-01-04", status: "present", checkIn: "08:30", checkOut: "17:45" },
  { date: "2025-01-05", status: "present", checkIn: "09:00", checkOut: "18:00" },
  { date: "2025-01-06", status: "weekend", checkIn: "-", checkOut: "-" },
  { date: "2025-01-07", status: "weekend", checkIn: "-", checkOut: "-" },
  { date: "2025-01-08", status: "present", checkIn: "08:45", checkOut: "18:00" },
  { date: "2025-01-09", status: "present", checkIn: "09:00", checkOut: "17:30" },
  { date: "2025-01-10", status: "present", checkIn: "08:30", checkOut: "18:15" }
];

const mockLeads = [
  {
    _id: "lead1",
    customerName: "ABC Company",
    contactPerson: "Robert Johnson",
    email: "robert@abc.com",
    phone: "+1-555-0200",
    company: "ABC Corporation",
    status: "contacted",
    source: "referral",
    createdAt: "2025-01-15T10:00:00.000Z",
    estimatedValue: "$5000"
  },
  {
    _id: "lead2",
    customerName: "XYZ Industries",
    contactPerson: "Lisa Chen",
    email: "lisa@xyz.com",
    phone: "+1-555-0201",
    company: "XYZ Industries Ltd",
    status: "qualified",
    source: "cold-call",
    createdAt: "2025-01-20T14:00:00.000Z",
    estimatedValue: "$8000"
  }
];

export default function EngineerDetails() {
  const params = useParams();
  const navigate = useNavigate();
  const engineerId = params?.id;
  
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock data - Replace with actual API calls using engineerId
  const engineer = mockEngineerData;
  const assignedComplaints = mockAssignedComplaints;
  const leaveRequests = mockLeaveRequests;
  const attendance = mockAttendance;
  const leads = mockLeads;

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

  const filteredComplaints = assignedComplaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         complaint.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || complaint.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const completionRate = (engineer.performance.completedJobs / (engineer.performance.completedJobs + engineer.performance.activeJobs)) * 100;

  return (
    <MainLayout title={`${engineer.fullName} - Engineer Details`}>
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{engineer.fullName}</h1>
              <p className="text-gray-600 dark:text-gray-400">{engineer.department} • {engineer.employeeId}</p>
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
                      <AvatarImage src={engineer.profileImage} alt={engineer.fullName} />
                      <AvatarFallback className="text-3xl">
                        {engineer.firstName.charAt(0)}{engineer.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    engineer.firstName.charAt(0) + engineer.lastName.charAt(0)
                  )}
                </div>
                <CardTitle className="text-xl">{engineer.fullName}</CardTitle>
                <p className="text-gray-600 dark:text-gray-400">{engineer.department}</p>
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
                  <span className="text-gray-600 dark:text-gray-400">Location:</span>
                  <span className="font-medium">{engineer.permanentAddress}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Joined:</span>
                  <span className="font-medium">{new Date(engineer.joiningDate).toLocaleDateString()}</span>
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
                {/* Rating */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-bold text-yellow-600 dark:text-yellow-400">
                        {engineer.performance.rating}/5
                      </span>
                    </div>
                  </div>
                  <Progress value={(engineer.performance.rating / 5) * 100} className="h-2" />
                </div>

                {/* Completion Rate */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {engineer.performance.successRate}%
                    </span>
                  </div>
                  <Progress value={engineer.performance.successRate} className="h-2" />
                </div>

                {/* Jobs Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg mx-auto mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{engineer.performance.completedJobs}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Completed</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg mx-auto mb-2">
                      <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{engineer.performance.activeJobs}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Active</p>
                  </div>
                </div>

                {/* Additional Metrics */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Avg Response Time:</span>
                    <span className="font-medium">{engineer.performance.avgResponseTime}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Customer Satisfaction:</span>
                    <span className="font-medium">{engineer.performance.customerSatisfaction}/5</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Content Tabs */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="complaints">Complaints</TabsTrigger>
                <TabsTrigger value="leaves">Leave Requests</TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
                <TabsTrigger value="leads">Leads</TabsTrigger>
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
                          <p className="text-2xl font-bold">{assignedComplaints.length}</p>
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
                          <p className="text-2xl font-bold">{assignedComplaints.filter(c => c.status === 'resolved').length}</p>
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
                          <p className="text-2xl font-bold">{leaveRequests.length}</p>
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
                          <p className="text-2xl font-bold">{leads.length}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Leads Generated</p>
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
                      {assignedComplaints.slice(0, 3).map((complaint) => (
                        <div key={complaint._id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{complaint.title}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {complaint.customerName} • {new Date(complaint.createdAt).toLocaleDateString()}
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
                        Assigned Complaints ({assignedComplaints.length})
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
                        {filteredComplaints.map((complaint) => (
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
                              {complaint.description}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                              <div className="flex items-center gap-4">
                                <span>Customer: {complaint.customerName}</span>
                                <span>Location: {complaint.location}</span>
                              </div>
                              <span>Created: {new Date(complaint.createdAt).toLocaleDateString()}</span>
                            </div>
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
                      Leave Requests ({leaveRequests.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {leaveRequests.length > 0 ? (
                      <div className="space-y-4">
                        {leaveRequests.map((leave) => (
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
                      {attendance.map((day) => (
                        <div key={day.date} className="text-center p-2">
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
                              {day.checkIn} - {day.checkOut}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Attendance Summary */}
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {attendance.filter(d => d.status === 'present').length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Present Days</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                          {attendance.filter(d => d.status === 'absent').length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Absent Days</div>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                          {attendance.filter(d => d.status === 'late').length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Late Days</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {Math.round((attendance.filter(d => d.status === 'present').length / attendance.length) * 100)}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Attendance Rate</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Leads Tab */}
              <TabsContent value="leads" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Leads Generated ({leads.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {leads.length > 0 ? (
                      <div className="space-y-4">
                        {leads.map((lead) => (
                          <div key={lead._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">{lead.customerName}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{lead.company}</p>
                              </div>
                              <Badge className={cn(
                                "text-xs",
                                lead.status === 'qualified' ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" :
                                lead.status === 'contacted' ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300" :
                                "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
                              )}>
                                {lead.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Contact:</span>
                                <p className="font-medium">{lead.contactPerson}</p>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Email:</span>
                                <p className="font-medium">{lead.email}</p>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                                <p className="font-medium">{lead.phone}</p>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Value:</span>
                                <p className="font-medium">{lead.estimatedValue}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                              <span>Source: {lead.source}</span>
                              <span>Created: {new Date(lead.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Leads Generated</h3>
                        <p className="text-gray-600 dark:text-gray-400">This engineer has not generated any leads yet.</p>
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
