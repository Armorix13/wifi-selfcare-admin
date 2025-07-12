import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { DataTable, StatusBadge } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Complaints() {
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ["/api/complaints"],
  });

  const updateComplaintMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest("PUT", `/api/complaints/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/complaints"] });
      toast({
        title: "Success",
        description: "Complaint updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update complaint",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (complaintId: number, newStatus: string) => {
    updateComplaintMutation.mutate({
      id: complaintId,
      data: { status: newStatus },
    });
  };

  const filteredComplaints = complaints.filter((complaint: any) => {
    return (
      (!statusFilter || complaint.status === statusFilter) &&
      (!priorityFilter || complaint.priority === priorityFilter) &&
      (!locationFilter || complaint.location === locationFilter)
    );
  });

  const columns = [
    {
      key: "id",
      label: "Complaint ID",
      sortable: true,
      render: (value: number) => `#${value}`,
    },
    {
      key: "customer",
      label: "Customer",
      render: (value: any, row: any) => (
        <div>
          <div className="text-sm text-gray-900">{row.customer?.name || "Unknown"}</div>
          <div className="text-sm text-gray-500">{row.customer?.phone || ""}</div>
        </div>
      ),
    },
    {
      key: "title",
      label: "Issue",
      render: (value: string) => (
        <div className="text-sm text-gray-900 max-w-xs truncate">{value}</div>
      ),
    },
    {
      key: "priority",
      label: "Priority",
      render: (value: string) => <StatusBadge status={value} />,
    },
    {
      key: "status",
      label: "Status",
      render: (value: string, row: any) => (
        <Select
          value={value}
          onValueChange={(newStatus) => handleStatusChange(row.id, newStatus)}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="visited">Visited</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="not-resolved">Not Resolved</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      key: "engineer",
      label: "Engineer",
      render: (value: any, row: any) => row.engineer?.name || "Unassigned",
    },
    {
      key: "createdAt",
      label: "Created",
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "Actions",
      render: (value: any, row: any) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-900">
            Edit
          </Button>
          <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-900">
            View
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <MainLayout title="Complaint Management">
        <div className="animate-pulse space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="h-8 bg-slate-200 rounded mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Complaint Management">
      <Card className="border border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Complaint Management
            </CardTitle>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Complaint
            </Button>
          </div>
        </CardHeader>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Locations</SelectItem>
                <SelectItem value="Mumbai Central">Mumbai Central</SelectItem>
                <SelectItem value="Delhi NCR">Delhi NCR</SelectItem>
                <SelectItem value="Bangalore">Bangalore</SelectItem>
                <SelectItem value="Chennai">Chennai</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              onClick={() => {
                setStatusFilter("");
                setPriorityFilter("");
                setLocationFilter("");
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>

        <CardContent className="p-0">
          <DataTable
            data={filteredComplaints}
            columns={columns}
            searchPlaceholder="Search complaints..."
          />
        </CardContent>
      </Card>
    </MainLayout>
  );
}
