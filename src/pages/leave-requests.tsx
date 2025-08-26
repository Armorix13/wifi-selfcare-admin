import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, FileText, CalendarDays, TrendingUp, Users, AlertCircle, CheckCircle, XCircle, Eye, Download, Phone, Mail, MapPin, Calendar as CalendarIcon, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { MainLayout } from "@/components/layout/main-layout";

// Mock data for leave requests
const mockLeaveRequests = [
  {
    _id: "68ac9bb3d681a3f5e4c19954",
    engineer: {
      _id: "68aad97ed681a3f5e4c17646",
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@wificare.com",
      phoneNumber: "+1-555-0123",
      role: "engineer",
      address: "123 Main Street, Tech City, TC 12345",
      department: "Network Operations",
      employeeId: "EMP001",
      joiningDate: "2023-01-15T00:00:00.000Z",
      emergencyContact: {
        name: "John Johnson",
        relationship: "Spouse",
        phone: "+1-555-0126"
      }
    },
    leaveType: "full_day",
    fromDate: "2025-08-26T00:00:00.000Z",
    toDate: "2025-08-26T00:00:00.000Z",
    reason: "maternity",
    description: "Maternity leave for upcoming delivery. Doctor has recommended complete rest and monitoring. This is a planned leave as per company policy for expecting mothers.",
    totalDays: 1,
    status: "pending",
    documents: ["/view/image/8d4c655d-7159-495f-9f0b-b8487ed5c5fd-1756142513388.jpg"],
    createdAt: "2025-08-25T17:21:55.828Z",
    updatedAt: "2025-08-25T17:21:55.828Z",
    approvedBy: null,
    approvedAt: null,
    rejectionReason: null,
    statement: "I hereby request maternity leave starting from August 26, 2025, as recommended by my healthcare provider. I have attached the necessary medical documentation and will ensure a smooth handover of my current projects before the leave period.",
    additionalNotes: "Please note that this is my first pregnancy and I have been advised to take complete rest during this period. I will be available for any urgent queries via email during my leave."
  },
  {
    _id: "68ac9bb3d681a3f5e4c19955",
    engineer: {
      _id: "68aad97ed681a3f5e4c17647",
      firstName: "Michael",
      lastName: "Chen",
      email: "michael.chen@wificare.com",
      phoneNumber: "+1-555-0124",
      role: "engineer",
      address: "456 Oak Avenue, Digital District, DD 67890",
      department: "System Administration",
      employeeId: "EMP002",
      joiningDate: "2022-06-20T00:00:00.000Z",
      emergencyContact: {
        name: "Lisa Chen",
        relationship: "Sister",
        phone: "+1-555-0127"
      }
    },
    leaveType: "half_day",
    fromDate: "2025-08-28T00:00:00.000Z",
    toDate: "2025-08-28T00:00:00.000Z",
    reason: "personal",
    description: "Doctor appointment in the morning for routine checkup",
    totalDays: 0.5,
    status: "approved",
    documents: [],
    createdAt: "2025-08-24T10:15:30.000Z",
    updatedAt: "2025-08-24T14:30:00.000Z",
    approvedBy: "Admin User",
    approvedAt: "2025-08-24T14:30:00.000Z",
    rejectionReason: null,
    statement: "I need to attend a scheduled doctor appointment on August 28th morning. I will return to work by 2 PM and ensure no disruption to my scheduled tasks.",
    additionalNotes: "I have already informed my team lead about this appointment and arranged for coverage of my morning responsibilities."
  },
  {
    _id: "68ac9bb3d681a3f5e4c19956",
    engineer: {
      _id: "68aad97ed681a3f5e4c17648",
      firstName: "Emily",
      lastName: "Rodriguez",
      email: "emily.rodriguez@wificare.com",
      phoneNumber: "+1-555-0125",
      role: "engineer",
      address: "789 Pine Street, Innovation Valley, IV 11111",
      department: "Software Development",
      employeeId: "EMP003",
      joiningDate: "2021-09-10T00:00:00.000Z",
      emergencyContact: {
        name: "Carlos Rodriguez",
        relationship: "Father",
        phone: "+1-555-0128"
      }
    },
    leaveType: "full_day",
    fromDate: "2025-09-02T00:00:00.000Z",
    toDate: "2025-09-05T00:00:00.000Z",
    reason: "vacation",
    description: "Family vacation to Hawaii - celebrating parents' anniversary",
    totalDays: 4,
    status: "pending",
    documents: [],
    createdAt: "2025-08-20T09:45:15.000Z",
    updatedAt: "2025-08-20T09:45:15.000Z",
    approvedBy: null,
    approvedAt: null,
    rejectionReason: null,
    statement: "I am requesting vacation leave from September 2-5, 2025, to celebrate my parents' 30th wedding anniversary in Hawaii. This is a family trip that has been planned for several months.",
    additionalNotes: "I will ensure all my current projects are completed or properly handed over before the leave period. I have also arranged for a colleague to cover any urgent issues that may arise during my absence."
  },
  {
    _id: "68ac9bb3d681a3f5e4c19957",
    engineer: {
      _id: "68aad97ed681a3f5e4c17649",
      firstName: "David",
      lastName: "Thompson",
      email: "david.thompson@wificare.com",
      phoneNumber: "+1-555-0126",
      role: "engineer",
      address: "321 Elm Street, Tech Hub, TH 22222",
      department: "Network Security",
      employeeId: "EMP004",
      joiningDate: "2020-03-15T00:00:00.000Z",
      emergencyContact: {
        name: "Mary Thompson",
        relationship: "Mother",
        phone: "+1-555-0129"
      }
    },
    leaveType: "full_day",
    fromDate: "2025-08-30T00:00:00.000Z",
    toDate: "2025-08-30T00:00:00.000Z",
    reason: "sick",
    description: "Not feeling well, need rest",
    totalDays: 1,
    status: "approved",
    documents: [],
    createdAt: "2025-08-25T08:20:45.000Z",
    updatedAt: "2025-08-25T16:15:30.000Z",
    approvedBy: "Manager User",
    approvedAt: "2025-08-25T16:15:30.000Z",
    rejectionReason: null,
    statement: "I am feeling unwell today and experiencing symptoms that prevent me from working effectively. I need to take a sick day to rest and recover.",
    additionalNotes: "I will monitor my condition and return to work as soon as I am feeling better. I have informed my team about my absence."
  }
];

const LeaveRequests = () => {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState(mockLeaveRequests);
  const [filteredRequests, setFilteredRequests] = useState(mockLeaveRequests);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Analytics data
  const analytics = {
    total: leaveRequests.length,
    pending: leaveRequests.filter(req => req.status === "pending").length,
    approved: leaveRequests.filter(req => req.status === "approved").length,
    rejected: leaveRequests.filter(req => req.status === "rejected").length,
    thisMonth: leaveRequests.filter(req => {
      const reqDate = new Date(req.fromDate);
      const now = new Date();
      return reqDate.getMonth() === now.getMonth() && reqDate.getFullYear() === now.getFullYear();
    }).length,
    avgDays: leaveRequests.reduce((acc, req) => acc + req.totalDays, 0) / leaveRequests.length || 0
  };

  useEffect(() => {
    let filtered = leaveRequests;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(req =>
        req.engineer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.engineer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.engineer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.reason.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    // Apply leave type filter
    if (leaveTypeFilter !== "all") {
      filtered = filtered.filter(req => req.leaveType === leaveTypeFilter);
    }

    setFilteredRequests(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, statusFilter, leaveTypeFilter, leaveRequests]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary", icon: Clock, text: "Pending" },
      approved: { variant: "default", icon: CheckCircle, text: "Approved" },
      rejected: { variant: "destructive", icon: XCircle, text: "Rejected" }
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

  const handleStatusChange = (requestId: string, newStatus: string) => {
    setLeaveRequests(prev => 
      prev.map(req => 
        req._id === requestId 
          ? { ...req, status: newStatus, updatedAt: new Date().toISOString() }
          : req
      )
    );
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

  return (
    <MainLayout title="Leave Requests">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--dashboard-text)]">
            Leave Requests
          </h1>
          <p className="text-[var(--dashboard-text-muted)]">
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
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{analytics.total}</p>
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
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{analytics.pending}</p>
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
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{analytics.approved}</p>
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
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Avg Days</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{analytics.avgDays.toFixed(1)}</p>
                </div>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Engineer</Label>
                <Input
                  id="search"
                  placeholder="Search by name or email..."
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
                    <SelectItem value="multiple_days">Multiple Days</SelectItem>
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
                          <strong>Reason:</strong> {request.description}
                        </p>
                        {request.documents.length > 0 && (
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
                              onClick={() => handleStatusChange(request._id, "approved")}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleStatusChange(request._id, "rejected")}
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
                        <Label className="text-sm font-medium text-muted-foreground">Employee ID</Label>
                        <p className="font-medium">{selectedRequest.engineer.employeeId}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Department</Label>
                        <p className="font-medium">{selectedRequest.engineer.department}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Joining Date</Label>
                        <p className="font-medium">{formatDate(selectedRequest.engineer.joiningDate)}</p>
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
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{selectedRequest.engineer.address}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Emergency Contact</Label>
                      <div className="flex items-center gap-4">
                        <span className="text-sm">
                          <strong>{selectedRequest.engineer.emergencyContact.name}</strong> 
                          ({selectedRequest.engineer.emergencyContact.relationship})
                        </span>
                        <span className="text-sm">{selectedRequest.engineer.emergencyContact.phone}</span>
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

                {/* Statement and Additional Notes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Statement & Additional Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Official Statement</Label>
                      <div className="bg-muted p-4 rounded-md">
                        <p className="text-sm italic">"{selectedRequest.statement}"</p>
                      </div>
                    </div>
                    {selectedRequest.additionalNotes && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Additional Notes</Label>
                        <div className="bg-muted p-4 rounded-md">
                          <p className="text-sm">{selectedRequest.additionalNotes}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Documents */}
                {selectedRequest.documents.length > 0 && (
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
                      Approval Information
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
                          <p className="font-medium">{selectedRequest.approvedBy}</p>
                        </div>
                      )}
                      {selectedRequest.approvedAt && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Approved On</Label>
                          <p className="font-medium">{formatDateTime(selectedRequest.approvedAt)}</p>
                        </div>
                      )}
                      {selectedRequest.rejectionReason && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Rejection Reason</Label>
                          <p className="font-medium text-destructive">{selectedRequest.rejectionReason}</p>
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
    </MainLayout>
  );
};

export default LeaveRequests;
