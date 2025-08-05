import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  MessageSquare, 
  Clock, 
  User, 
  Phone, 
  Mail,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  Reply,
  Send
} from "lucide-react";
import { format } from "date-fns";

interface SupportTicket {
  id: number;
  title: string;
  description: string;
  customerName: string;
  email: string;
  phone: string;
  status: "open" | "in-progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  category: "technical" | "billing" | "general" | "installation";
  assignedTo?: string;
  rating?: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
  responses?: {
    id: number;
    message: string;
    sender: string;
    timestamp: string;
    isCustomer: boolean;
  }[];
}

interface TicketManagementProps {
  tickets: SupportTicket[];
  onUpdateTicket: (id: number, updates: Partial<SupportTicket>) => void;
  onDeleteTicket: (id: number) => void;
  onCreateTicket: (ticket: Omit<SupportTicket, "id" | "createdAt" | "updatedAt">) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
}

export function TicketManagement({
  tickets,
  onUpdateTicket,
  onDeleteTicket,
  onCreateTicket,
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage
}: TicketManagementProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "closed":
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800 border-red-200";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || ticket.status === filterStatus;
    const matchesPriority = filterPriority === "all" || ticket.priority === filterPriority;
    const matchesCategory = filterCategory === "all" || ticket.category === filterCategory;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const handleStatusChange = (ticketId: number, newStatus: string) => {
    onUpdateTicket(ticketId, { 
      status: newStatus as SupportTicket["status"], 
      updatedAt: new Date().toISOString() 
    });
    toast({
      title: "Status Updated",
      description: `Ticket status changed to ${newStatus}`,
    });
  };

  const handleReply = (ticketId: number) => {
    if (!replyMessage.trim()) return;

    const newResponse = {
      id: Date.now(),
      message: replyMessage,
      sender: "Support Agent",
      timestamp: new Date().toISOString(),
      isCustomer: false
    };

    const ticket = tickets.find(t => t.id === ticketId);
    const responses = ticket?.responses || [];
    
    onUpdateTicket(ticketId, {
      responses: [...responses, newResponse],
      status: "in-progress",
      updatedAt: new Date().toISOString()
    });

    setReplyMessage("");
    toast({
      title: "Reply Sent",
      description: "Your response has been sent to the customer",
    });
  };

  const CreateTicketForm = () => {
    const [formData, setFormData] = useState({
      title: "",
      description: "",
      customerName: "",
      email: "",
      phone: "",
      priority: "medium" as SupportTicket["priority"],
      category: "general" as SupportTicket["category"],
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onCreateTicket({
        ...formData,
        status: "open",
        responses: []
      });
      setShowCreateDialog(false);
      setFormData({
        title: "",
        description: "",
        customerName: "",
        email: "",
        phone: "",
        priority: "medium",
        category: "general",
      });
      toast({
        title: "Ticket Created",
        description: "New support ticket has been created successfully",
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="customerName">Customer Name</Label>
            <Input
              id="customerName"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as SupportTicket["category"] })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="installation">Installation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="title">Subject</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value as SupportTicket["priority"] })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
            Cancel
          </Button>
          <Button type="submit">Create Ticket</Button>
        </div>
      </form>
    );
  };

  const PaginationControls = () => {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, filteredTickets.length);

    return (
      <div className="flex items-center justify-between py-4 border-t">
        <div className="text-sm text-muted-foreground">
          Showing {startItem}-{endItem} of {filteredTickets.length} tickets
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
              className="w-8 h-8 p-0"
            >
              {page}
            </Button>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-primary" />
            Support Tickets
            <Badge variant="outline" className="ml-2">
              {filteredTickets.length} tickets
            </Badge>
          </CardTitle>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Support Ticket</DialogTitle>
                <DialogDescription>
                  Create a new support ticket for customer assistance.
                </DialogDescription>
              </DialogHeader>
              <CreateTicketForm />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="installation">Installation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {filteredTickets.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No tickets found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <div key={ticket.id} className="p-6 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center space-x-2 mb-3">
                      <Badge variant="outline" className="text-xs">
                        #{ticket.id.toString().padStart(4, '0')}
                      </Badge>
                      <Badge className={`text-xs ${getStatusColor(ticket.status)}`}>
                        {getStatusIcon(ticket.status)}
                        <span className="ml-1">{ticket.status}</span>
                      </Badge>
                      <Badge className={`text-xs ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {ticket.category}
                      </Badge>
                    </div>

                    {/* Content */}
                    <h4 className="font-semibold text-foreground mb-2">{ticket.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {ticket.description}
                    </p>

                    {/* Customer Info */}
                    <div className="flex items-center space-x-4 mb-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-primary/10">
                            {getInitials(ticket.customerName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{ticket.customerName}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span>{ticket.email}</span>
                      </div>
                      {ticket.phone && (
                        <div className="flex items-center space-x-1 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{ticket.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>Created: {format(new Date(ticket.createdAt), "MMM d, yyyy 'at' h:mm a")}</span>
                      </div>
                      <span>Updated: {format(new Date(ticket.updatedAt), "MMM d, yyyy 'at' h:mm a")}</span>
                      {ticket.responses && ticket.responses.length > 0 && (
                        <span>{ticket.responses.length} responses</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center space-x-2">
                            <span>Ticket #{ticket.id.toString().padStart(4, '0')}</span>
                            <Badge className={`text-xs ${getStatusColor(ticket.status)}`}>
                              {ticket.status}
                            </Badge>
                          </DialogTitle>
                          <DialogDescription>
                            {ticket.title}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-6">
                          {/* Customer Info */}
                          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                            <div>
                              <Label className="text-sm font-medium">Customer</Label>
                              <p className="text-sm">{ticket.customerName}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Email</Label>
                              <p className="text-sm">{ticket.email}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Phone</Label>
                              <p className="text-sm">{ticket.phone || "N/A"}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Priority</Label>
                              <Badge className={`text-xs ${getPriorityColor(ticket.priority)}`}>
                                {ticket.priority}
                              </Badge>
                            </div>
                          </div>

                          {/* Description */}
                          <div>
                            <Label className="text-sm font-medium">Description</Label>
                            <p className="text-sm text-muted-foreground mt-1">{ticket.description}</p>
                          </div>

                          {/* Responses */}
                          {ticket.responses && ticket.responses.length > 0 && (
                            <div>
                              <Label className="text-sm font-medium">Conversation</Label>
                              <div className="space-y-3 mt-2 max-h-60 overflow-y-auto">
                                {ticket.responses.map((response) => (
                                  <div 
                                    key={response.id} 
                                    className={`p-3 rounded-lg ${
                                      response.isCustomer 
                                        ? "bg-blue-50 border-l-4 border-blue-500" 
                                        : "bg-green-50 border-l-4 border-green-500"
                                    }`}
                                  >
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-sm font-medium">
                                        {response.isCustomer ? ticket.customerName : response.sender}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {format(new Date(response.timestamp), "MMM d, h:mm a")}
                                      </span>
                                    </div>
                                    <p className="text-sm">{response.message}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Reply */}
                          <div>
                            <Label className="text-sm font-medium">Reply</Label>
                            <div className="flex space-x-2 mt-2">
                              <Textarea
                                placeholder="Type your response..."
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                                rows={3}
                                className="flex-1"
                              />
                              <Button 
                                onClick={() => handleReply(ticket.id)}
                                disabled={!replyMessage.trim()}
                                className="self-end"
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Status Actions */}
                          <div className="flex space-x-2 pt-4 border-t">
                            <Select value={ticket.status} onValueChange={(value) => handleStatusChange(ticket.id, value)}>
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="in-progress">In Progress</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button variant="outline" onClick={() => onDeleteTicket(ticket.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Select value={ticket.status} onValueChange={(value) => handleStatusChange(ticket.id, value)}>
                      <SelectTrigger className="w-[120px] h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {filteredTickets.length > 0 && <PaginationControls />}
      </CardContent>
    </Card>
  );
}