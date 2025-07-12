import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { DataTable, StatusBadge } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Support() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: supportTickets = [], isLoading: ticketsLoading } = useQuery({
    queryKey: ["/api/support-tickets"],
  });

  const { data: complaints = [], isLoading: complaintsLoading } = useQuery({
    queryKey: ["/api/complaints"],
  });

  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest("PUT", `/api/support-tickets/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support-tickets"] });
      toast({
        title: "Success",
        description: "Support ticket updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update support ticket",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (ticketId: number, newStatus: string) => {
    updateTicketMutation.mutate({
      id: ticketId,
      data: { status: newStatus },
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  const getAvatarColor = (index: number) => {
    const colors = ["bg-blue-600", "bg-purple-600", "bg-green-600", "bg-yellow-600", "bg-red-600"];
    return colors[index % colors.length];
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const supportTicketColumns = [
    {
      key: "id",
      label: "Ticket ID",
      sortable: true,
      render: (value: number) => `#SUP${value.toString().padStart(3, '0')}`,
    },
    {
      key: "customer",
      label: "User",
      render: (value: any, row: any) => row.customer?.name || "Unknown",
    },
    {
      key: "subject",
      label: "Subject",
    },
    {
      key: "priority",
      label: "Priority",
      render: (value: string) => <StatusBadge status={value} />,
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => <StatusBadge status={value} />,
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
        <Button
          variant="ghost"
          size="sm"
          className="text-blue-600 hover:text-blue-900"
          onClick={() => handleStatusChange(row.id, "resolved")}
        >
          Reply
        </Button>
      ),
    },
  ];

  // Get complaints with ratings for reviews section
  const complaintsWithRatings = complaints.filter((complaint: any) => 
    complaint.rating && complaint.feedback
  );

  if (ticketsLoading || complaintsLoading) {
    return (
      <MainLayout title="Support & Rating">
        <div className="animate-pulse space-y-6">
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
    <MainLayout title="Support & Rating">
      <div className="space-y-6">
        {/* Support Tickets */}
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Support Tickets
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              data={supportTickets}
              columns={supportTicketColumns}
              searchPlaceholder="Search support tickets..."
            />
          </CardContent>
        </Card>

        {/* Ratings Overview */}
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Recent Ratings & Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            {complaintsWithRatings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No ratings and reviews yet
              </div>
            ) : (
              <div className="space-y-4">
                {complaintsWithRatings.slice(0, 10).map((complaint: any, index: number) => (
                  <div
                    key={complaint.id}
                    className="border border-slate-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`h-8 w-8 ${getAvatarColor(index)} rounded-full flex items-center justify-center`}>
                          <span className="text-white font-medium text-sm">
                            {complaint.customer ? getInitials(complaint.customer.name) : "U"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {complaint.customer?.name || "Unknown User"}
                          </p>
                          <p className="text-xs text-gray-500">
                            Complaint #{complaint.id}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {renderStars(complaint.rating)}
                        <span className="text-sm font-medium text-gray-900 ml-1">
                          {complaint.rating}.0
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      "{complaint.feedback}"
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        Engineer: {complaint.engineer?.name || "Unknown"}
                      </span>
                      <span>{new Date(complaint.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
