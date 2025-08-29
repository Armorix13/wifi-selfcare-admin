import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, FileText, CalendarDays, TrendingUp, Users, AlertCircle, CheckCircle, XCircle, Eye, Download, Phone, Mail, MapPin, Calendar as CalendarIcon, User, BarChart3, PieChart } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { MainLayout } from "@/components/layout/main-layout";
import { 
  useGetAllLeaveRequestAnalyticsQuery,
  useGetAllLeaveRequestQuery,
  useApproveRejectLeaveRequestMutation } from "@/api";
import { useToast } from "@/hooks/use-toast";

const LeaveRequests = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("all");
  const [reasonFilter, setReasonFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Approval/Rejection modal states
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [selectedRequestForAction, setSelectedRequestForAction] = useState<any>(null);
  const [remarks, setRemarks] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: leaveRequestsAnalyticsData, isLoading: analyticsLoading } = useGetAllLeaveRequestAnalyticsQuery({});
  const { data: leaveRequestsData, isLoading: requestsLoading } = useGetAllLeaveRequestQuery({});
  const [approveRejectLeaveRequest, { isLoading: isActionLoading }] = useApproveRejectLeaveRequestMutation();

  // Extract data from API responses
  const analytics = leaveRequestsAnalyticsData?.data?.overview || {};
  const distribution = leaveRequestsAnalyticsData?.data?.distribution || {};
  const trends = leaveRequestsAnalyticsData?.data?.trends || {};
  const leaveRequests = leaveRequestsData?.data?.leaveRequests || [];
  const pagination = leaveRequestsData?.data?.pagination || {};

  // Update filtered requests when data changes
  useEffect(() => {
    if (leaveRequests.length > 0) {
      setFilteredRequests(leaveRequests);
    }
  }, [leaveRequests]);

  // Apply filters
  useEffect(() => {
    let filtered = leaveRequests;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((req:any) =>
        req.engineer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.engineer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.engineer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((req:any) => req.status === statusFilter);
    }

    // Apply leave type filter
    if (leaveTypeFilter !== "all") {
      filtered = filtered.filter((req:any) => req.leaveType === leaveTypeFilter);
    }

    // Apply reason filter
    if (reasonFilter !== "all") {
      filtered = filtered.filter((req:any) => req.reason === reasonFilter);
    }

    setFilteredRequests(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, statusFilter, leaveTypeFilter, reasonFilter, leaveRequests]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary", icon: Clock, text: "Pending" },
      approved: { variant: "default", icon: CheckCircle, text: "Approved" },
      rejected: { variant: "destructive", icon: XCircle, text: "Rejected" },
      cancelled: { variant: "outline", icon: XCircle, text: "Cancelled" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const getLeaveTypeBadge = (type: string) => {
    const typeConfig = {
      full_day: { variant: "outline", text: "Full Day" },
      half_day: { variant: "outline", text: "Half Day" },
      multiple_days: { variant: "outline", text: "Multiple Days" }
    };

    const config = typeConfig[type as keyof typeof typeConfig] || { variant: "outline", text: type };
    return <Badge variant={config.variant as any}>{config.text}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openActionModal = (request: any, type: "approve" | "reject") => {
    setSelectedRequestForAction(request);
    setActionType(type);
    setRemarks("");
    setRejectionReason("");
    setIsActionModalOpen(true);
  };

  const closeActionModal = () => {
    setIsActionModalOpen(false);
    setSelectedRequestForAction(null);
    setActionType(null);
    setRemarks("");
    setRejectionReason("");
  };

  const handleApproveReject = async () => {
    if (!selectedRequestForAction || !actionType) return;

    try {
      const payload = {
        body: {
          leaveRequestId: selectedRequestForAction._id,
          type: actionType === "approve" ? 1 : 2,
          remarks: remarks.trim() || (actionType === "approve" ? "Approved as requested" : ""),
          ...(actionType === "reject" && { rejectionReason: rejectionReason.trim() || "No specific reason provided" })
        }
      };

      await approveRejectLeaveRequest(payload).unwrap();
      
      toast({
        title: `Leave Request ${actionType === "approve" ? "Approved" : "Rejected"}`,
        description: `Successfully ${actionType === "approve" ? "approved" : "rejected"} the leave request.`,
        variant: actionType === "approve" ? "default" : "destructive",
      });

      closeActionModal();
      
      // Refresh the data
      // The mutation should invalidate the cache, but you can also manually refetch if needed
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || `Failed to ${actionType} leave request. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const openDetailModal = (request: any) => {
    setSelectedRequest(request);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedRequest(null);
  };

  const downloadDocument = (documentUrl: string, fileName: string) => {
    // In a real application, this would trigger a download
    console.log(`Downloading: ${fileName} from ${documentUrl}`);
    // You can implement actual download logic here
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRequests = filteredRequests.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  if (analyticsLoading || requestsLoading) {
    return (
      <MainLayout title="Leave Requests">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading leave requests data...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Leave Requests">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--dashboard-text)]">
            Leave Requests
          </h1>
          <p className="text-[var(--dashboard-text)]">
            Manage and review leave requests from engineers
          </p>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Requests</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{analytics.totalRequests || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Pending</p>
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{analytics.pendingRequests || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-green-500 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Approved</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{analytics.approvedRequests || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Approval Rate</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{analytics.approvalRate || 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200 dark:border-orange-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <CalendarDays className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Total Days</p>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{analytics.totalDays || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 border-red-200 dark:border-red-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-red-500 rounded-lg">
                  <XCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">Rejected</p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">{analytics.rejectedRequests || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/20 dark:to-indigo-900/20 border-indigo-200 dark:border-indigo-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-500 rounded-lg">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Avg Processing</p>
                  <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{analytics.avgProcessingDays || 0} days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Distribution Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {distribution.status && Object.entries(distribution.status).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        status === 'pending' ? 'bg-yellow-500' :
                        status === 'approved' ? 'bg-green-500' :
                        status === 'rejected' ? 'bg-red-500' :
                        'bg-gray-500'
                      }`} />
                      <span className="capitalize">{status}</span>
                    </div>
                    <Badge variant="outline">{count as number}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Leave Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Leave Type Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {distribution.leaveType && Object.entries(distribution.leaveType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="capitalize">{type.replace('_', ' ')}</span>
                    </div>
                    <Badge variant="outline">{count as number}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Filters & Search</CardTitle>
            <CardDescription>Filter leave requests by various criteria</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search by name, email, or reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="leaveType">Leave Type</Label>
                <Select value={leaveTypeFilter} onValueChange={setLeaveTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="full_day">Full Day</SelectItem>
                    <SelectItem value="half_day">Half Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Select value={reasonFilter} onValueChange={setReasonFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Reasons</SelectItem>
                    <SelectItem value="maternity">Maternity</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="sick">Sick</SelectItem>
                    <SelectItem value="vacation">Vacation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Results</Label>
                <div className="text-2xl font-bold text-primary">
                  {filteredRequests.length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leave Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>Leave Requests</CardTitle>
            <CardDescription>
              Review and manage leave requests from engineers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentRequests.map((request) => (
                <div
                  key={request._id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow duration-200 bg-card"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    {/* Engineer Info */}
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {request.engineer.firstName.charAt(0)}{request.engineer.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-lg">
                            {request.engineer.firstName} {request.engineer.lastName}
                          </h3>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{request.engineer.email}</p>
                        <p className="text-sm text-muted-foreground">{request.engineer.phoneNumber}</p>
                      </div>
                    </div>

                    {/* Leave Details */}
                    <div className="flex flex-col lg:items-end space-y-2">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {formatDate(request.fromDate)}
                            {request.fromDate !== request.toDate && ` - ${formatDate(request.toDate)}`}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{request.totalDays} day(s)</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {getLeaveTypeBadge(request.leaveType)}
                        <Badge variant="outline" className="capitalize">{request.reason}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Description and Actions */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          <strong>Description:</strong> {request.description}
                        </p>
                        {request.documents && request.documents.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {request.documents.length} document(s) attached
                            </span>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Requested on {formatDate(request.createdAt)}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDetailModal(request)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </Button>
                        {request.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => openActionModal(request, "approve")}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openActionModal(request, "reject")}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {currentRequests.length === 0 && (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">No leave requests found</h3>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search criteria or filters
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        {filteredRequests.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Items per page selector */}
                <div className="flex items-center space-x-2">
                  <Label className="text-sm text-muted-foreground">Show</Label>
                  <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <Label className="text-sm text-muted-foreground">entries</Label>
                </div>

                {/* Page info */}
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredRequests.length)} of {filteredRequests.length} results
                </div>

                {/* Pagination controls */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                  >
                    First
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  {/* Page numbers */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          className="w-10 h-8"
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    Last
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {selectedRequest.engineer.firstName.charAt(0)}{selectedRequest.engineer.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  Leave Request Details - {selectedRequest.engineer.firstName} {selectedRequest.engineer.lastName}
                </DialogTitle>
                <DialogDescription>
                  Complete information about the leave request and engineer details
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Engineer Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Engineer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                        <p className="font-medium">{selectedRequest.engineer.firstName} {selectedRequest.engineer.lastName}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">{selectedRequest.engineer.email}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">{selectedRequest.engineer.phoneNumber}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Leave Request Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5" />
                      Leave Request Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Leave Type</Label>
                        <div className="flex items-center gap-2">
                          {getLeaveTypeBadge(selectedRequest.leaveType)}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Reason</Label>
                        <Badge variant="outline" className="capitalize">{selectedRequest.reason}</Badge>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">From Date</Label>
                        <p className="font-medium">{formatDate(selectedRequest.fromDate)}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">To Date</Label>
                        <p className="font-medium">{formatDate(selectedRequest.toDate)}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Total Days</Label>
                        <p className="font-medium">{selectedRequest.totalDays} day(s)</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(selectedRequest.status)}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                      <p className="text-sm bg-muted p-3 rounded-md">{selectedRequest.description}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Documents */}
                {selectedRequest.documents && selectedRequest.documents.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5" />
                        Attached Documents
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedRequest.documents.map((doc: string, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">Document {index + 1}</span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadDocument(doc, `document_${index + 1}.pdf`)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Approval Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Request Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Requested On</Label>
                        <p className="font-medium">{formatDateTime(selectedRequest.createdAt)}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                        <p className="font-medium">{formatDateTime(selectedRequest.updatedAt)}</p>
                      </div>
                      {selectedRequest.approvedBy && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Approved By</Label>
                          <p className="font-medium">
                            {typeof selectedRequest.approvedBy === 'object' 
                              ? `${selectedRequest.approvedBy.firstName} ${selectedRequest.approvedBy.lastName}`
                              : selectedRequest.approvedBy
                            }
                          </p>
                        </div>
                      )}
                      {selectedRequest.approvedAt && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Approved On</Label>
                          <p className="font-medium">{formatDateTime(selectedRequest.approvedAt)}</p>
                        </div>
                      )}
                      {selectedRequest.remarks && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Remarks</Label>
                          <p className="font-medium">{selectedRequest.remarks}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Approval/Rejection Modal */}
      <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType === "approve" ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              {actionType === "approve" ? "Approve Leave Request" : "Reject Leave Request"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve" 
                ? "Add remarks for the approval (optional)"
                : "Provide a reason for rejection and any additional remarks"
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedRequestForAction && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">
                  {selectedRequestForAction.engineer.firstName} {selectedRequestForAction.engineer.lastName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(selectedRequestForAction.fromDate)}
                  {selectedRequestForAction.fromDate !== selectedRequestForAction.toDate && 
                    ` - ${formatDate(selectedRequestForAction.toDate)}`
                  } ({selectedRequestForAction.totalDays} day(s))
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  Reason: {selectedRequestForAction.reason}
                </p>
              </div>
            )}

            {actionType === "reject" && (
              <div className="space-y-2">
                <Label htmlFor="rejectionReason">Rejection Reason *</Label>
                <Textarea
                  id="rejectionReason"
                  placeholder="Enter the reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="remarks">
                {actionType === "approve" ? "Remarks (Optional)" : "Additional Remarks (Optional)"}
              </Label>
              <Textarea
                id="remarks"
                placeholder={
                  actionType === "approve" 
                    ? "Add any additional remarks for approval..."
                    : "Add any additional remarks or notes..."
                }
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={closeActionModal}
                disabled={isActionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApproveReject}
                disabled={
                  isActionLoading || 
                  (actionType === "reject" && !rejectionReason.trim())
                }
                className={
                  actionType === "approve" 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "bg-red-600 hover:bg-red-700"
                }
              >
                {isActionLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </div>
                ) : (
                  actionType === "approve" ? "Approve" : "Reject"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default LeaveRequests;
