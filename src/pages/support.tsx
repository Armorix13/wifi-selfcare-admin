import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { SupportAnalytics } from "@/components/support/support-analytics";
import { TicketManagement } from "@/components/support/ticket-management";
import { RatingSystem } from "@/components/support/rating-system";
import { SettingsPanel } from "@/components/support/settings-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageSquare, 
  Star, 
  BarChart3, 
  Settings,
  Headphones,
  ThumbsUp
} from "lucide-react";

// Enhanced support ticket interface
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

// Enhanced rating interface
interface Rating {
  id: number;
  ticketId: number;
  customerName: string;
  customerEmail: string;
  rating: number;
  feedback: string;
  category: string;
  engineerName?: string;
  createdAt: string;
  helpful: number;
  notHelpful: number;
  tags: string[];
}

export default function Support() {
  const { toast } = useToast();

  // Comprehensive dummy data for support tickets
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([
    {
      id: 1,
      title: "Internet Speed Significantly Slower Than Advertised",
      description: "Customer reports consistent slow internet speeds during peak hours (7-9 PM). Speed tests show 15 Mbps instead of promised 100 Mbps. Issue has persisted for 2 weeks.",
      customerName: "Rajesh Kumar",
      email: "rajesh.kumar@email.com",
      phone: "+91 98765 43210",
      status: "in-progress",
      priority: "high",
      category: "technical",
      assignedTo: "Alex Rodriguez",
      createdAt: "2025-01-20T10:30:00Z",
      updatedAt: "2025-01-20T14:45:00Z",
      responses: [
        {
          id: 1,
          message: "Thank you for contacting us. We've escalated this to our technical team and will run diagnostics on your line.",
          sender: "Support Agent",
          timestamp: "2025-01-20T11:00:00Z",
          isCustomer: false
        },
        {
          id: 2,
          message: "I've been having this issue for weeks now. When can I expect a resolution?",
          sender: "Rajesh Kumar",
          timestamp: "2025-01-20T14:30:00Z",
          isCustomer: true
        }
      ]
    },
    {
      id: 2,
      title: "Billing Discrepancy - Charged for Cancelled Service",
      description: "Customer was charged for premium TV package that was cancelled 2 months ago. Requesting refund and correction of billing records.",
      customerName: "Priya Sharma",
      email: "priya.sharma@email.com",
      phone: "+91 87654 32109",
      status: "resolved",
      priority: "medium",
      category: "billing",
      assignedTo: "Jennifer White",
      rating: 5,
      feedback: "Excellent service! The billing team resolved my issue quickly and provided a full refund. Very satisfied with the support.",
      createdAt: "2025-01-19T09:15:00Z",
      updatedAt: "2025-01-19T16:20:00Z",
      responses: [
        {
          id: 1,
          message: "We've reviewed your account and confirmed the billing error. A refund of $45.99 has been processed and will appear in 3-5 business days.",
          sender: "Billing Specialist",
          timestamp: "2025-01-19T12:00:00Z",
          isCustomer: false
        }
      ]
    },
    {
      id: 3,
      title: "Frequent Connection Drops and Service Interruptions",
      description: "Internet connection drops every 2-3 hours requiring router restart. Customer works from home and this affects productivity significantly.",
      customerName: "Amit Patel",
      email: "amit.patel@email.com",
      phone: "+91 76543 21098",
      status: "open",
      priority: "urgent",
      category: "technical",
      createdAt: "2025-01-20T08:45:00Z",
      updatedAt: "2025-01-20T08:45:00Z"
    },
    {
      id: 4,
      title: "Installation Appointment Scheduling",
      description: "New customer requesting installation appointment for fiber optic service at new address. Prefers weekend slot.",
      customerName: "Sarah Chen",
      email: "sarah.chen@email.com",
      phone: "+91 65432 10987",
      status: "in-progress",
      priority: "medium",
      category: "installation",
      assignedTo: "Installation Team",
      createdAt: "2025-01-18T14:20:00Z",
      updatedAt: "2025-01-19T10:15:00Z",
      responses: [
        {
          id: 1,
          message: "We have availability this Saturday between 9 AM - 12 PM. Would this work for you?",
          sender: "Installation Coordinator",
          timestamp: "2025-01-19T10:15:00Z",
          isCustomer: false
        }
      ]
    },
    {
      id: 5,
      title: "Router Configuration Issues After Recent Update",
      description: "Customer unable to connect devices after automatic router firmware update. WiFi network visible but authentication fails.",
      customerName: "Michael Johnson",
      email: "michael.johnson@email.com",
      phone: "+91 54321 09876",
      status: "resolved",
      priority: "high",
      category: "technical",
      assignedTo: "Tech Support",
      rating: 4,
      feedback: "Good support but took longer than expected to resolve. The technician was knowledgeable and patient.",
      createdAt: "2025-01-17T16:30:00Z",
      updatedAt: "2025-01-18T11:45:00Z"
    },
    {
      id: 6,
      title: "Data Usage Inquiry and Plan Upgrade",
      description: "Customer consistently exceeding data limits and wants to understand usage patterns and available upgrade options.",
      customerName: "Lisa Wang",
      email: "lisa.wang@email.com",
      phone: "+91 43210 98765",
      status: "closed",
      priority: "low",
      category: "general",
      assignedTo: "Customer Service",
      rating: 5,
      feedback: "Very helpful! The representative explained everything clearly and helped me find the perfect plan for my needs.",
      createdAt: "2025-01-16T13:10:00Z",
      updatedAt: "2025-01-17T09:30:00Z"
    },
    {
      id: 7,
      title: "Service Outage Compensation Request",
      description: "Customer experienced 8-hour service outage last week and is requesting service credit as per SLA agreement.",
      customerName: "David Thompson",
      email: "david.thompson@email.com",
      phone: "+91 32109 87654",
      status: "in-progress",
      priority: "medium",
      category: "billing",
      assignedTo: "Customer Relations",
      createdAt: "2025-01-15T10:45:00Z",
      updatedAt: "2025-01-16T14:20:00Z"
    }
  ]);

  // Comprehensive dummy data for ratings
  const [ratings] = useState<Rating[]>([
    {
      id: 1,
      ticketId: 2,
      customerName: "Priya Sharma",
      customerEmail: "priya.sharma@email.com",
      rating: 5,
      feedback: "Excellent service! The billing team resolved my issue quickly and provided a full refund. Very satisfied with the support.",
      category: "billing",
      engineerName: "Jennifer White",
      createdAt: "2025-01-19T16:30:00Z",
      helpful: 12,
      notHelpful: 1,
      tags: ["quick-resolution", "billing-expert", "professional"]
    },
    {
      id: 2,
      ticketId: 5,
      customerName: "Michael Johnson",
      customerEmail: "michael.johnson@email.com",
      rating: 4,
      feedback: "Good support but took longer than expected to resolve. The technician was knowledgeable and patient, walked me through each step.",
      category: "technical",
      engineerName: "Alex Rodriguez",
      createdAt: "2025-01-18T12:00:00Z",
      helpful: 8,
      notHelpful: 2,
      tags: ["knowledgeable", "patient", "technical-expertise"]
    },
    {
      id: 3,
      ticketId: 6,
      customerName: "Lisa Wang",
      customerEmail: "lisa.wang@email.com",
      rating: 5,
      feedback: "Very helpful! The representative explained everything clearly and helped me find the perfect plan for my needs. Saved me money too!",
      category: "general",
      engineerName: "Customer Service Team",
      createdAt: "2025-01-17T10:15:00Z",
      helpful: 15,
      notHelpful: 0,
      tags: ["clear-explanation", "helpful", "cost-effective"]
    },
    {
      id: 4,
      ticketId: 1,
      customerName: "Rajesh Kumar",
      customerEmail: "rajesh.kumar@email.com",
      rating: 3,
      feedback: "The issue was eventually resolved but it took multiple follow-ups. The team could have been more proactive in communication.",
      category: "technical",
      engineerName: "Alex Rodriguez",
      createdAt: "2025-01-16T14:45:00Z",
      helpful: 6,
      notHelpful: 3,
      tags: ["resolved", "communication-needed", "follow-up-required"]
    },
    {
      id: 5,
      ticketId: 8,
      customerName: "Amanda Foster",
      customerEmail: "amanda.foster@email.com",
      rating: 5,
      feedback: "Outstanding customer service! The representative went above and beyond to ensure my internet was restored quickly. Highly recommend!",
      category: "technical",
      engineerName: "Lisa Chen",
      createdAt: "2025-01-15T16:20:00Z",
      helpful: 20,
      notHelpful: 0,
      tags: ["outstanding", "above-beyond", "quick-restoration"]
    },
    {
      id: 6,
      ticketId: 9,
      customerName: "Robert Martinez",
      customerEmail: "robert.martinez@email.com",
      rating: 2,
      feedback: "Support was slow to respond and the initial solution didn't work. Had to call back multiple times. Room for improvement.",
      category: "technical",
      engineerName: "James Park",
      createdAt: "2025-01-14T11:30:00Z",
      helpful: 4,
      notHelpful: 8,
      tags: ["slow-response", "multiple-calls", "improvement-needed"]
    },
    {
      id: 7,
      ticketId: 10,
      customerName: "Emily Rodriguez",
      customerEmail: "emily.rodriguez@email.com",
      rating: 4,
      feedback: "Good technical knowledge and friendly service. The engineer explained the problem clearly and provided tips to prevent future issues.",
      category: "technical",
      engineerName: "Kevin Lee",
      createdAt: "2025-01-13T09:45:00Z",
      helpful: 11,
      notHelpful: 1,
      tags: ["technical-knowledge", "friendly", "preventive-tips"]
    },
    {
      id: 8,
      ticketId: 11,
      customerName: "Thomas Wilson",
      customerEmail: "thomas.wilson@email.com",
      rating: 5,
      feedback: "Fantastic experience! The installation team was punctual, professional, and cleaned up after themselves. Perfect service!",
      category: "installation",
      engineerName: "Installation Team",
      createdAt: "2025-01-12T15:30:00Z",
      helpful: 18,
      notHelpful: 0,
      tags: ["punctual", "professional", "clean-installation"]
    }
  ]);

  // Pagination state
  const [ticketsPage, setTicketsPage] = useState(1);
  const [ratingsPage, setRatingsPage] = useState(1);
  const ticketsPerPage = 5;
  const ratingsPerPage = 6;

  const ticketsTotalPages = Math.ceil(supportTickets.length / ticketsPerPage);
  const ratingsTotalPages = Math.ceil(ratings.length / ratingsPerPage);

  const isLoading = false;

  const handleUpdateTicket = (id: number, updates: Partial<SupportTicket>) => {
    setSupportTickets(prev => 
      prev.map(ticket => 
        ticket.id === id 
          ? { ...ticket, ...updates, updatedAt: new Date().toISOString() }
          : ticket
      )
    );
  };

  const handleDeleteTicket = (id: number) => {
    setSupportTickets(prev => prev.filter(ticket => ticket.id !== id));
    toast({
      title: "Ticket Deleted",
      description: "Support ticket has been removed successfully",
    });
  };

  const handleCreateTicket = (ticketData: Omit<SupportTicket, "id" | "createdAt" | "updatedAt">) => {
    const newTicket: SupportTicket = {
      ...ticketData,
      id: Math.max(...supportTickets.map(t => t.id)) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setSupportTickets(prev => [newTicket, ...prev]);
  };

  // Calculate key metrics
  const totalTickets = supportTickets.length;
  const openTickets = supportTickets.filter(t => t.status === "open").length;
  const resolvedTickets = supportTickets.filter(t => t.status === "resolved").length;
  const avgRating = ratings.length > 0 
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
    : 0;

  if (isLoading) {
    return (
      <MainLayout title="Support & Rating Center">
        <div className="animate-pulse space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card rounded-xl shadow-sm p-6 border">
                <div className="h-6 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Support & Rating Center">
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Support & Rating Center</h1>
            <p className="text-muted-foreground mt-1">Comprehensive customer support management and feedback analysis</p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="text-sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              {totalTickets} total tickets
            </Badge>
            <Badge variant="outline" className="text-sm">
              <Star className="h-4 w-4 mr-2" />
              {avgRating.toFixed(1)} avg rating
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="tickets" className="flex items-center space-x-2">
              <Headphones className="h-4 w-4" />
              <span>Support Tickets</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                {openTickets}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="ratings" className="flex items-center space-x-2">
              <ThumbsUp className="h-4 w-4" />
              <span>Ratings & Reviews</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                {ratings.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <SupportAnalytics 
              supportTickets={supportTickets}
              ratings={ratings}
            />
          </TabsContent>

          <TabsContent value="tickets" className="space-y-6">
            <TicketManagement
              tickets={supportTickets}
              onUpdateTicket={handleUpdateTicket}
              onDeleteTicket={handleDeleteTicket}
              onCreateTicket={handleCreateTicket}
              currentPage={ticketsPage}
              totalPages={ticketsTotalPages}
              onPageChange={setTicketsPage}
              itemsPerPage={ticketsPerPage}
            />
          </TabsContent>

          <TabsContent value="ratings" className="space-y-6">
            <RatingSystem
              ratings={ratings}
              currentPage={ratingsPage}
              totalPages={ratingsTotalPages}
              onPageChange={setRatingsPage}
              itemsPerPage={ratingsPerPage}
            />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SettingsPanel 
              onSettingsUpdate={(settings) => {
                toast({
                  title: "Settings Updated",
                  description: "Support system settings have been saved successfully",
                });
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
