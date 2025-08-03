import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parseISO, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";
import {
  HardHat,
  Phone,
  MessageCircle,
  Mail,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  BarChart3,
  Users,
  TrendingUp,
  CalendarIcon,
  MapPin,
  Building,
  Target,
  Star,
  Zap,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  dummyNewInstallations, 
  dummyLeads, 
  dummyApplicationForms, 
  dummyWifiInstallationRequests, 
  dummyEngineers,
  type NewInstallation, 
  type Lead,
  type ApplicationForm,
  type WifiInstallationRequest 
} from "@/lib/dummyData";
import { cn } from "@/lib/utils";

export default function InstallationsLeads() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<{ from?: Date; to?: Date }>({});
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [installations, setInstallations] = useState(dummyNewInstallations);
  const [leads, setLeads] = useState(dummyLeads);
  const [applicationForms] = useState(dummyApplicationForms);
  const [installationRequests] = useState(dummyWifiInstallationRequests);
  const [showNewInstallationForm, setShowNewInstallationForm] = useState(false);
  const [showNewLeadForm, setShowNewLeadForm] = useState(false);

  // Action handlers for installations
  const updateInstallationStatus = (id: number, status: 'pending' | 'confirmed' | 'rejected') => {
    setInstallations(prev => prev.map(installation => 
      installation.id === id 
        ? { ...installation, status, updatedAt: new Date().toISOString() }
        : installation
    ));
  };

  // Action handlers for leads
  const updateLeadStatus = (id: number, status: 'new' | 'contacted' | 'qualified' | 'converted' | 'closed') => {
    setLeads(prev => prev.map(lead => 
      lead.id === id 
        ? { ...lead, status, updatedAt: new Date().toISOString() }
        : lead
    ));
  };

  // Helper functions for application forms and installation requests
  const getStatusColor = (status: string) => {
    switch (status) {
      case "inreview": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "accept": case "approved": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "reject": case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "new": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "contacted": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "converted": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "fibre": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "ott": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "iptv": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getEngineerName = (engineerId: number) => {
    const engineer = dummyEngineers.find(e => e.id === engineerId);
    return engineer ? engineer.name : "Unassigned";
  };

  // Filter installations
  const filteredInstallations = useMemo(() => {
    return installations.filter((installation) => {
      const matchesSearch = 
        installation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        installation.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        installation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        installation.phone.includes(searchTerm);

      const matchesStatus = statusFilter === "all" || installation.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || installation.priority === priorityFilter;
      
      let matchesDate = true;
      if (dateFilter.from && dateFilter.to) {
        const installationDate = parseISO(installation.createdAt);
        const fromDate = startOfDay(dateFilter.from);
        const toDate = endOfDay(dateFilter.to);
        matchesDate = isAfter(installationDate, fromDate) && isBefore(installationDate, toDate);
      }

      return matchesSearch && matchesStatus && matchesPriority && matchesDate;
    });
  }, [searchTerm, statusFilter, priorityFilter, dateFilter]);

  // Filter leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch = 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm) ||
        (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      const matchesSource = sourceFilter === "all" || lead.source === sourceFilter;
      const matchesPriority = priorityFilter === "all" || lead.priority === priorityFilter;
      
      let matchesDate = true;
      if (dateFilter.from && dateFilter.to) {
        const leadDate = parseISO(lead.createdAt);
        const fromDate = startOfDay(dateFilter.from);
        const toDate = endOfDay(dateFilter.to);
        matchesDate = isAfter(leadDate, fromDate) && isBefore(leadDate, toDate);
      }

      return matchesSearch && matchesStatus && matchesSource && matchesPriority && matchesDate;
    });
  }, [searchTerm, statusFilter, sourceFilter, priorityFilter, dateFilter]);

  // Analytics calculations
  const analytics = useMemo(() => {
    // Installation analytics
    const totalInstallations = dummyNewInstallations.length;
    const pendingInstallations = dummyNewInstallations.filter(i => i.status === "pending").length;
    const confirmedInstallations = dummyNewInstallations.filter(i => i.status === "confirmed").length;
    const rejectedInstallations = dummyNewInstallations.filter(i => i.status === "rejected").length;

    // Lead analytics
    const totalLeads = dummyLeads.length;
    const newLeads = dummyLeads.filter(l => l.status === "new").length;
    const contactedLeads = dummyLeads.filter(l => l.isContactedByManager).length;
    const convertedLeads = dummyLeads.filter(l => l.status === "converted").length;

    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads * 100).toFixed(1) : '0';
    const contactRate = totalLeads > 0 ? (contactedLeads / totalLeads * 100).toFixed(1) : '0';
    const installationSuccessRate = totalInstallations > 0 ? (confirmedInstallations / totalInstallations * 100).toFixed(1) : '0';

    return {
      totalInstallations,
      pendingInstallations,
      confirmedInstallations,
      rejectedInstallations,
      totalLeads,
      newLeads,
      contactedLeads,
      convertedLeads,
      conversionRate,
      contactRate,
      installationSuccessRate
    };
  }, []);

  const exportInstallationsToExcel = () => {
    const headers = ["ID", "Customer Name", "Email", "Phone", "Location", "Preferred Plan", "Request Type", "Status", "Priority", "Estimated Cost", "Created Date"];
    const csvContent = [
      headers.join(","),
      ...filteredInstallations.map(installation => [
        installation.id,
        `"${installation.customerName}"`,
        installation.email,
        installation.phone,
        `"${installation.location}"`,
        installation.preferredPlan || "N/A",
        installation.requestType,
        installation.status,
        installation.priority,
        installation.estimatedCost || "N/A",
        installation.createdAt
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `installations_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportLeadsToExcel = () => {
    const headers = ["ID", "Name", "Phone", "Email", "Address", "Location", "Source", "Status", "Priority", "Inquiry Type", "Contacted by Manager", "Created Date"];
    const csvContent = [
      headers.join(","),
      ...filteredLeads.map(lead => [
        lead.id,
        `"${lead.name}"`,
        lead.phone,
        lead.email || "N/A",
        `"${lead.address}"`,
        lead.location || "N/A",
        lead.source,
        lead.status,
        lead.priority,
        lead.inquiryType,
        lead.isContactedByManager ? "Yes" : "No",
        lead.createdAt
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string, type: "installation" | "lead") => {
    if (type === "installation") {
      switch (status) {
        case "pending":
          return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
        case "confirmed":
          return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>;
        case "rejected":
          return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
        default:
          return <Badge variant="outline">{status}</Badge>;
      }
    } else {
      const colors = {
        new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        contacted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        qualified: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        converted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        closed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      };
      return <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive">Urgent</Badge>;
      case "high":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">High</Badge>;
      case "medium":
        return <Badge variant="outline">Medium</Badge>;
      case "low":
        return <Badge variant="secondary" className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'ivr': return <Phone className="h-4 w-4" />;
      case 'whatsapp': return <MessageCircle className="h-4 w-4" />;
      case 'website': return <Mail className="h-4 w-4" />;
      case 'referral': return <Users className="h-4 w-4" />;
      case 'social_media': return <Target className="h-4 w-4" />;
      default: return <Phone className="h-4 w-4" />;
    }
  };

  return (
    <MainLayout title="New Installation & Leads">
      <div className="flex gap-6">
        {/* Comprehensive Data Sidebar */}
        <div className="w-80 space-y-6">
          {/* Application Forms Section */}
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="text-lg dashboard-card-title flex items-center">
                <HardHat className="mr-2 h-5 w-5" />
                Application Forms
              </CardTitle>
              <CardDescription className="dashboard-text-muted">
                WiFi installation applications ({applicationForms.length})
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-48 overflow-y-auto space-y-2">
              {applicationForms.slice(0, 8).map((app) => (
                <div 
                  key={app.id} 
                  className="p-2 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm dashboard-text">{app.applicationId}</span>
                    <Badge className={`${getStatusColor(app.status)} text-xs`}>
                      {app.status}
                    </Badge>
                  </div>
                  <p className="text-xs dashboard-text-muted">{app.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <Badge className={`${getTypeColor(app.applicationType)} text-xs`}>
                      {app.applicationType}
                    </Badge>
                    <span className="text-xs dashboard-text-muted">
                      {format(new Date(app.createdAt), "MMM dd")}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Installation Requests Section */}
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="text-lg dashboard-card-title flex items-center">
                <Building className="mr-2 h-5 w-5" />
                Installation Requests
              </CardTitle>
              <CardDescription className="dashboard-text-muted">
                Active installation requests ({installationRequests.length})
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-48 overflow-y-auto space-y-2">
              {installationRequests.slice(0, 8).map((req) => (
                <div 
                  key={req.id} 
                  className="p-2 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm dashboard-text">#{req.id}</span>
                    <Badge className={`${getStatusColor(req.status)} text-xs`}>
                      {req.status}
                    </Badge>
                  </div>
                  <p className="text-xs dashboard-text-muted">{req.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <Badge className={`${getTypeColor(req.installationType)} text-xs`}>
                      {req.installationType}
                    </Badge>
                    <span className="text-xs dashboard-text-muted">
                      {format(new Date(req.createdAt), "MMM dd")}
                    </span>
                  </div>
                  {req.assignedEngineer && (
                    <div className="mt-1 text-xs dashboard-text-muted">
                      Engineer: {getEngineerName(req.assignedEngineer)}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Regular Installations Section */}
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="text-lg dashboard-card-title flex items-center">
                <Zap className="mr-2 h-5 w-5" />
                New Installations
              </CardTitle>
              <CardDescription className="dashboard-text-muted">
                General installation requests ({installations.length})
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-48 overflow-y-auto space-y-2">
              {installations.slice(0, 8).map((installation) => (
                <div 
                  key={installation.id} 
                  className="p-2 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm dashboard-text">#{installation.id}</span>
                    <Badge className={`${getStatusColor(installation.status)} text-xs`}>
                      {installation.status}
                    </Badge>
                  </div>
                  <p className="text-xs dashboard-text-muted">{installation.customerName}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs dashboard-text-muted">{installation.requestType}</span>
                    <span className="text-xs dashboard-text-muted">
                      {format(new Date(installation.createdAt), "MMM dd")}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Leads Section */}
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="text-lg dashboard-card-title flex items-center">
                <Phone className="mr-2 h-5 w-5" />
                Customer Leads
              </CardTitle>
              <CardDescription className="dashboard-text-muted">
                Active leads and inquiries ({leads.length})
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-48 overflow-y-auto space-y-2">
              {leads.slice(0, 8).map((lead) => (
                <div 
                  key={lead.id} 
                  className="p-2 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm dashboard-text">#{lead.id}</span>
                    <Badge className={`${getStatusColor(lead.status)} text-xs`}>
                      {lead.status}
                    </Badge>
                  </div>
                  <p className="text-xs dashboard-text-muted">{lead.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center text-xs dashboard-text-muted">
                      {getSourceIcon(lead.source)}
                      <span className="ml-1">{lead.source}</span>
                    </div>
                    <span className="text-xs dashboard-text-muted">
                      {format(parseISO(lead.createdAt), "MMM dd")}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="text-lg dashboard-card-title flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Quick Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <div className="text-lg font-bold dashboard-text">{applicationForms.length}</div>
                  <div className="text-xs dashboard-text-muted">Applications</div>
                </div>
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
                  <div className="text-lg font-bold dashboard-text">{installationRequests.length}</div>
                  <div className="text-xs dashboard-text-muted">Requests</div>
                </div>
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                  <div className="text-lg font-bold dashboard-text">{installations.length}</div>
                  <div className="text-xs dashboard-text-muted">Installations</div>
                </div>
                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                  <div className="text-lg font-bold dashboard-text">{leads.length}</div>
                  <div className="text-xs dashboard-text-muted">Leads</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">New Installation & Leads</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Manage installation requests and customer inquiries</p>
            </div>
          </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="installations" className="flex items-center gap-2">
              <HardHat className="h-4 w-4" />
              New Installations
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Leads
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Installations</CardTitle>
                  <HardHat className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalInstallations}</div>
                  <p className="text-xs text-muted-foreground">
                    {analytics.installationSuccessRate}% success rate
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Installations</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.pendingInstallations}</div>
                  <p className="text-xs text-muted-foreground">
                    Awaiting confirmation
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalLeads}</div>
                  <p className="text-xs text-muted-foreground">
                    {analytics.conversionRate}% conversion rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Manager Contact Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.contactRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    {analytics.contactedLeads} leads contacted
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Installation Status Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Pending</span>
                      <span className="text-sm font-medium">{analytics.pendingInstallations}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{ width: `${(analytics.pendingInstallations / analytics.totalInstallations) * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Confirmed</span>
                      <span className="text-sm font-medium">{analytics.confirmedInstallations}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: `${(analytics.confirmedInstallations / analytics.totalInstallations) * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Rejected</span>
                      <span className="text-sm font-medium">{analytics.rejectedInstallations}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full" style={{ width: `${(analytics.rejectedInstallations / analytics.totalInstallations) * 100}%` }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Lead Status Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">New Leads</span>
                      <span className="text-sm font-medium">{analytics.newLeads}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(analytics.newLeads / analytics.totalLeads) * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Contacted</span>
                      <span className="text-sm font-medium">{analytics.contactedLeads}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{ width: `${(analytics.contactedLeads / analytics.totalLeads) * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Converted</span>
                      <span className="text-sm font-medium">{analytics.convertedLeads}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: `${(analytics.convertedLeads / analytics.totalLeads) * 100}%` }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="installations" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>New Installation Requests</CardTitle>
                    <CardDescription>Manage customer installation applications</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          <HardHat className="mr-2 h-4 w-4" />
                          New Installation
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>New Installation Request</DialogTitle>
                          <DialogDescription>
                            Fill in customer details and upload required documents
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Customer Name</Label>
                            <Input placeholder="Enter full name" />
                          </div>
                          <div>
                            <Label>Email</Label>
                            <Input type="email" placeholder="customer@email.com" />
                          </div>
                          <div>
                            <Label>Phone Number (with country code)</Label>
                            <Input placeholder="+91 98765 43210" />
                          </div>
                          <div>
                            <Label>Alternate Phone Number</Label>
                            <Input placeholder="+91 98765 43211" />
                          </div>
                          <div className="col-span-2">
                            <Label>Address</Label>
                            <Input placeholder="Complete address with area and city" />
                          </div>
                          <div>
                            <Label>Aadhar Card - Front Side</Label>
                            <Input type="file" accept="image/*" />
                          </div>
                          <div>
                            <Label>Aadhar Card - Back Side</Label>
                            <Input type="file" accept="image/*" />
                          </div>
                          <div className="col-span-2">
                            <Label>Passport Size Photo</Label>
                            <Input type="file" accept="image/*" />
                          </div>
                          <div>
                            <Label>Request Type</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="residential">Residential</SelectItem>
                                <SelectItem value="commercial">Commercial</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Priority</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                          <Button variant="outline">Cancel</Button>
                          <Button className="bg-blue-600 hover:bg-blue-700">Submit Request</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button onClick={exportInstallationsToExcel} className="bg-green-600 hover:bg-green-700">
                      <Download className="mr-2 h-4 w-4" />
                      Export Excel
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search installations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInstallations.map((installation) => (
                        <TableRow key={installation.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{installation.customerName}</div>
                              <div className="text-sm text-gray-500">{installation.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{installation.phone}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                              {installation.location}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={installation.requestType === 'commercial' ? 'default' : 'secondary'}>
                              {installation.requestType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(installation.status, "installation")}
                          </TableCell>
                          <TableCell>
                            {getPriorityBadge(installation.priority)}
                          </TableCell>
                          <TableCell>
                            {format(parseISO(installation.createdAt), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl">
                                  <DialogHeader>
                                    <DialogTitle>Installation Details - {installation.customerName}</DialogTitle>
                                    <DialogDescription>
                                      View installation request details and update status
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Customer Name</Label>
                                      <p className="text-sm">{installation.customerName}</p>
                                    </div>
                                    <div>
                                      <Label>Email</Label>
                                      <p className="text-sm">{installation.email}</p>
                                    </div>
                                    <div>
                                      <Label>Phone</Label>
                                      <p className="text-sm">{installation.phone}</p>
                                    </div>
                                    <div>
                                      <Label>Alternate Phone</Label>
                                      <p className="text-sm">{installation.alternatePhone || "Not provided"}</p>
                                    </div>
                                    <div className="col-span-2">
                                      <Label>Address</Label>
                                      <p className="text-sm">{installation.address}</p>
                                    </div>
                                    <div>
                                      <Label>Request Type</Label>
                                      <p className="text-sm capitalize">{installation.requestType}</p>
                                    </div>
                                    <div>
                                      <Label>Current Status</Label>
                                      <div className="text-sm">{getStatusBadge(installation.status, "installation")}</div>
                                    </div>
                                    {installation.aadharFront && (
                                      <div>
                                        <Label>Aadhar Front</Label>
                                        <p className="text-sm text-blue-600">Document uploaded</p>
                                      </div>
                                    )}
                                    {installation.aadharBack && (
                                      <div>
                                        <Label>Aadhar Back</Label>
                                        <p className="text-sm text-blue-600">Document uploaded</p>
                                      </div>
                                    )}
                                    {installation.passportPhoto && (
                                      <div>
                                        <Label>Passport Photo</Label>
                                        <p className="text-sm text-blue-600">Photo uploaded</p>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex gap-2 pt-4">
                                    <Button 
                                      onClick={() => updateInstallationStatus(installation.id, 'confirmed')}
                                      variant={installation.status === 'confirmed' ? 'default' : 'outline'}
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Confirm
                                    </Button>
                                    <Button 
                                      onClick={() => updateInstallationStatus(installation.id, 'rejected')}
                                      variant={installation.status === 'rejected' ? 'destructive' : 'outline'}
                                      className="bg-red-600 hover:bg-red-700 text-white"
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Reject
                                    </Button>
                                    <Button 
                                      onClick={() => updateInstallationStatus(installation.id, 'pending')}
                                      variant={installation.status === 'pending' ? 'default' : 'outline'}
                                    >
                                      <Clock className="h-4 w-4 mr-2" />
                                      Set Pending
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leads" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Lead Management</CardTitle>
                    <CardDescription>Track customer inquiries from various sources</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="bg-purple-600 hover:bg-purple-700">
                          <Users className="mr-2 h-4 w-4" />
                          New Lead
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Add New Lead</DialogTitle>
                          <DialogDescription>
                            Register a new customer inquiry
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Full Name</Label>
                            <Input placeholder="Enter customer name" />
                          </div>
                          <div>
                            <Label>Phone Number</Label>
                            <Input placeholder="+91 98765 43210" />
                          </div>
                          <div>
                            <Label>Email (Optional)</Label>
                            <Input type="email" placeholder="customer@email.com" />
                          </div>
                          <div>
                            <Label>Source</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select source" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="website">Website</SelectItem>
                                <SelectItem value="ivr">IVR Call</SelectItem>
                                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                <SelectItem value="referral">Referral</SelectItem>
                                <SelectItem value="social_media">Social Media</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-2">
                            <Label>Address</Label>
                            <Input placeholder="Complete address" />
                          </div>
                          <div>
                            <Label>Inquiry Type</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="general">General</SelectItem>
                                <SelectItem value="pricing">Pricing</SelectItem>
                                <SelectItem value="technical">Technical</SelectItem>
                                <SelectItem value="support">Support</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Priority</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-2">
                            <Label>Message (Optional)</Label>
                            <Input placeholder="Customer inquiry or message" />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                          <Button variant="outline">Cancel</Button>
                          <Button className="bg-purple-600 hover:bg-purple-700">Add Lead</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button onClick={exportLeadsToExcel} className="bg-green-600 hover:bg-green-700">
                      <Download className="mr-2 h-4 w-4" />
                      Export Excel
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search leads..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="converted">Converted</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sourceFilter} onValueChange={setSourceFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sources</SelectItem>
                      <SelectItem value="ivr">IVR Call</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="social_media">Social Media</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lead</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Manager Contact</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeads.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{lead.name}</div>
                              <div className="text-sm text-gray-500">{lead.inquiryType}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="text-sm">{lead.phone}</div>
                              <div className="text-sm text-gray-500">{lead.email || "No email"}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {getSourceIcon(lead.source)}
                              <span className="ml-2 capitalize">{lead.source.replace('_', ' ')}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(lead.status, "lead")}
                          </TableCell>
                          <TableCell>
                            {getPriorityBadge(lead.priority)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={lead.isContactedByManager ? "default" : "secondary"}>
                              {lead.isContactedByManager ? "Yes" : "No"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600">
                              {lead.address}
                            </div>
                          </TableCell>
                          <TableCell>
                            {format(parseISO(lead.createdAt), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Lead Details - {lead.name}</DialogTitle>
                                    <DialogDescription>
                                      View and manage lead information
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Name</Label>
                                      <p className="text-sm">{lead.name}</p>
                                    </div>
                                    <div>
                                      <Label>Phone</Label>
                                      <p className="text-sm">{lead.phone}</p>
                                    </div>
                                    <div>
                                      <Label>Email</Label>
                                      <p className="text-sm">{lead.email || "Not provided"}</p>
                                    </div>
                                    <div>
                                      <Label>Address</Label>
                                      <p className="text-sm">{lead.address}</p>
                                    </div>
                                    <div>
                                      <Label>Source</Label>
                                      <p className="text-sm capitalize">{lead.source.replace('_', ' ')}</p>
                                    </div>
                                    <div>
                                      <Label>Status</Label>
                                      <p className="text-sm">{lead.status}</p>
                                    </div>
                                    <div className="col-span-2">
                                      <Label>Message</Label>
                                      <p className="text-sm">{lead.message || "No message provided"}</p>
                                    </div>
                                  </div>
                                  <div className="flex gap-2 pt-4">
                                    <Button 
                                      onClick={() => updateLeadStatus(lead.id, 'contacted')}
                                      variant={lead.status === 'contacted' ? 'default' : 'outline'}
                                      className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                      <Phone className="h-4 w-4 mr-2" />
                                      Mark Contacted
                                    </Button>
                                    <Button 
                                      onClick={() => updateLeadStatus(lead.id, 'qualified')}
                                      variant={lead.status === 'qualified' ? 'default' : 'outline'}
                                      className="bg-purple-600 hover:bg-purple-700 text-white"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Mark Qualified
                                    </Button>
                                    <Button 
                                      onClick={() => updateLeadStatus(lead.id, 'converted')}
                                      variant={lead.status === 'converted' ? 'default' : 'outline'}
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                      <Star className="h-4 w-4 mr-2" />
                                      Convert
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}