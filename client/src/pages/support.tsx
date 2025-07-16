import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { DataTable, StatusBadge } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Support() {
  const { toast } = useToast();

  // Dummy support tickets data
  const [supportTickets, setSupportTickets] = useState([
    {
      id: 1,
      title: "Internet Speed Issue",
      description: "Customer experiencing slow internet speeds during peak hours",
      customerName: "Rajesh Kumar",
      email: "rajesh@email.com",
      phone: "+91 98765 43210",
      status: "open",
      priority: "high",
      category: "technical",
      rating: null,
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z"
    },
    {
      id: 2,
      title: "Billing Inquiry",
      description: "Question about monthly charges and plan details",
      customerName: "Priya Sharma",
      email: "priya@email.com", 
      phone: "+91 87654 32109",
      status: "resolved",
      priority: "medium",
      category: "billing",
      rating: 5,
      createdAt: "2024-01-14T09:15:00Z",
      updatedAt: "2024-01-14T14:20:00Z"
    },
    {
      id: 3,
      title: "Connection Drops Frequently",
      description: "Internet connection drops every few hours, needs technical assistance",
      customerName: "Amit Patel",
      email: "amit@email.com",
      phone: "+91 76543 21098",
      status: "in-progress",
      priority: "urgent",
      category: "technical",
      rating: null,
      createdAt: "2024-01-16T08:45:00Z",
      updatedAt: "2024-01-16T11:30:00Z"
    }
  ]);

  // Dummy complaints data
  const complaints = [
    {
      id: 1,
      customerName: "Rajesh Kumar",
      email: "rajesh@email.com",
      description: "Internet speed is very slow",
      status: "resolved",
      priority: "high",
      rating: 4
    },
    {
      id: 2,
      customerName: "Priya Sharma", 
      email: "priya@email.com",
      description: "Billing issue with last month charges",
      status: "pending",
      priority: "medium",
      rating: null
    }
  ];

  const ticketsLoading = false;
  const complaintsLoading = false;

  const handleStatusChange = (ticketId: number, newStatus: string) => {
    setSupportTickets(prev => 
      prev.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, status: newStatus, updatedAt: new Date().toISOString() }
          : ticket
      )
    );
    toast({
      title: "Success",
      description: "Support ticket updated successfully",
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
