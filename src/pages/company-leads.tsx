import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  CalendarDays, 
  Download, 
  Eye, 
  Phone, 
  MessageCircle, 
  Mail, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle,
  Building,
  MapPin,
  Target,
  Star,
  Zap,
  Plus,
  Search,
  Filter,
  BarChart3,
  DollarSign,
  Globe,
  Shield,
  AlertCircle,
  User,
  Smartphone,
  Monitor,
  PhoneCall,
  MessageSquare
} from 'lucide-react';
import { format, parseISO, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import { dummyCompanyLeads } from '@/lib/dummyData';
import { useAuth } from '@/lib/auth';
import { Role } from '@/lib/types/auth';
import React from 'react'; // Added missing import for React

interface CompanyLead {
  id: string;
  customerName: string; // Individual customer name
  contactPerson: string;
  email: string | null;
  phone: string;
  countryCode: string;
  address: string; // Individual address
  location: string;
  inquiryType: string; // Make flexible to match dummy data
  currentProvider?: string | null;
  currentPlan?: string | null;
  monthlyBudget: string;
  requirements: string[];
  status: string; // Make flexible to match dummy data
  priority: string; // Make flexible to match dummy data
  source: string;
  assignedTo?: string; // Who this lead is assigned to
  assignedToId?: string; // ID of the assigned user
  referredBy?: {
    id: string;
    name: string;
    role: string;
    email: string;
    source: string;
  };
  lastContactDate?: string | null;
  nextFollowUpDate?: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
  isContactedByManager: boolean;
  potentialRevenue?: number;
}

export default function CompanyLeads() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedInquiryType, setSelectedInquiryType] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });
  const [showLeadDetails, setShowLeadDetails] = useState(false);
  const [selectedLead, setSelectedLead] = useState<CompanyLead | null>(null);
  const [showNewLeadForm, setShowNewLeadForm] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Debug: Log the imported data
  console.log('dummyCompanyLeads imported:', dummyCompanyLeads);
  console.log('dummyCompanyLeads length:', dummyCompanyLeads.length);

  // Fallback test data in case import fails
  const fallbackData = [
    {
      id: "test_001",
      customerName: "Test Customer 1",
      contactPerson: "Test Contact 1",
      email: "test1@example.com",
      phone: "1234567890",
      countryCode: "+91",
      address: "Test Address 1",
      location: "Test Location 1",
      inquiryType: "new-connection",
      currentProvider: null,
      currentPlan: null,
      monthlyBudget: "₹2,000 - ₹3,000",
      requirements: ["Test requirement 1"],
      status: "new",
      priority: "medium",
      source: "website",
      assignedTo: "Test Team",
      assignedToId: "test_001",
      referredBy: {
        id: "user_test",
        name: "Test User",
        role: "ADMIN",
        email: "test@company.com",
        source: "website"
      },
      lastContactDate: null,
      nextFollowUpDate: null,
      notes: "Test lead for debugging",
      createdAt: "2024-01-30T00:00:00Z",
      updatedAt: "2024-01-30T00:00:00Z",
      isContactedByManager: false,
      potentialRevenue: 25000
    }
  ];

  // Use fallback data if import fails
  const dataToUse = dummyCompanyLeads && dummyCompanyLeads.length > 0 ? dummyCompanyLeads : fallbackData;
  console.log('dataToUse:', dataToUse);
  console.log('dataToUse length:', dataToUse.length);

  // Role-based lead filtering - show leads assigned to current user
  const accessibleLeads = useMemo(() => {
    if (!user) return [];
    
    // For now, show all leads to all users (can be enhanced later)
    // This will be replaced with proper role-based filtering when dummy data is updated
    const leads = dataToUse || [];
    console.log('accessibleLeads:', leads);
    console.log('accessibleLeads length:', leads.length);
    
    // Fallback: if no leads, return empty array
    if (!leads || leads.length === 0) {
      console.warn('No leads found in dummyCompanyLeads');
      return [];
    }
    
    return leads;
  }, [user]);

  const filteredLeads = useMemo(() => {
    const filtered = accessibleLeads.filter(lead => {
      const matchesSearch = 
        lead.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        lead.phone.includes(searchTerm);
      
      const matchesStatus = selectedStatus === 'all' || lead.status === selectedStatus;
      const matchesPriority = selectedPriority === 'all' || lead.priority === selectedPriority;
      const matchesSource = selectedSource === 'all' || lead.source === selectedSource;
      const matchesInquiryType = selectedInquiryType === 'all' || lead.inquiryType === selectedInquiryType;
      
      let matchesDate = true;
      if (dateFilter.from && dateFilter.to) {
        const leadDate = parseISO(lead.createdAt);
        const fromDate = startOfDay(parseISO(dateFilter.from));
        const toDate = endOfDay(parseISO(dateFilter.to));
        matchesDate = isAfter(leadDate, fromDate) && isBefore(leadDate, toDate);
      }
      
      return matchesSearch && matchesStatus && matchesPriority && matchesSource && matchesInquiryType && matchesDate;
    });
    
    console.log('filteredLeads:', filtered);
    console.log('filteredLeads length:', filtered.length);
    console.log('searchTerm:', searchTerm);
    console.log('selectedStatus:', selectedStatus);
    console.log('selectedPriority:', selectedPriority);
    console.log('selectedSource:', selectedSource);
    console.log('selectedInquiryType:', selectedInquiryType);
    
    return filtered;
  }, [accessibleLeads, searchTerm, selectedStatus, selectedPriority, selectedSource, selectedInquiryType, dateFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedPriority, selectedSource, selectedInquiryType, dateFilter]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const analytics = useMemo(() => {
    const totalLeads = accessibleLeads.length;
    const newLeads = accessibleLeads.filter(lead => lead.status === 'new').length;
    const contactedLeads = accessibleLeads.filter(lead => lead.isContactedByManager).length;
    const convertedLeads = accessibleLeads.filter(lead => lead.status === 'converted').length;
    const highPriorityLeads = accessibleLeads.filter(lead => lead.priority === 'high' || lead.priority === 'urgent').length;
    
    // New metrics
    const today = new Date();
    const todayLeads = accessibleLeads.filter(lead => {
      const leadDate = new Date(lead.createdAt);
      return leadDate.toDateString() === today.toDateString();
    }).length;
    
    const trackedLeads = accessibleLeads.filter(lead => 
      lead.assignedToId || lead.isContactedByManager
    ).length;
    
    const untrackedLeads = totalLeads - trackedLeads;
    
    const sourceDistribution = accessibleLeads.reduce((acc, lead) => {
      acc[lead.source] = (acc[lead.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const inquiryTypeDistribution = accessibleLeads.reduce((acc, lead) => {
      acc[lead.inquiryType] = (acc[lead.inquiryType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalPotentialRevenue = accessibleLeads
      .filter(lead => lead.potentialRevenue)
      .reduce((sum, lead) => sum + (lead.potentialRevenue || 0), 0);

    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads * 100).toFixed(1) : '0';
    const contactRate = totalLeads > 0 ? (contactedLeads / totalLeads * 100).toFixed(1) : '0';

    return {
      totalLeads,
      newLeads,
      contactedLeads,
      convertedLeads,
      highPriorityLeads,
      todayLeads,
      trackedLeads,
      untrackedLeads,
      sourceDistribution,
      inquiryTypeDistribution,
      totalPotentialRevenue,
      conversionRate,
      contactRate
    };
  }, [accessibleLeads]);

  const getSourceIcon = (source: string) => {
    const icons = {
      website: Monitor,
      app: Smartphone,
      'admin-panel': Shield,
      ivr: PhoneCall,
      whatsapp: MessageSquare,
      referral: Users,
      'cold-call': Phone,
      'social-media': Globe,
      'trade-show': Building,
      advertising: TrendingUp
    };
    return icons[source as keyof typeof icons] || Globe;
  };

  const getSourceLabel = (source: string) => {
    const labels = {
      website: 'Website',
      app: 'Mobile App',
      'admin-panel': 'Admin Panel',
      ivr: 'IVR System',
      whatsapp: 'WhatsApp',
      referral: 'Referral',
      'cold-call': 'Cold Call',
      'social-media': 'Social Media',
      'trade-show': 'Trade Show',
      advertising: 'Advertising'
    };
    return labels[source as keyof typeof labels] || source;
  };

  const exportToExcel = () => {
    const headers = [
      'Customer Name', 'Contact Person', 'Email', 'Phone', 'Address', 'Inquiry Type', 
      'Current Provider', 'Monthly Budget', 'Status', 'Priority', 'Source', 
      'Assigned To', 'Referred By', 'Created Date', 'Potential Revenue'
    ];
    const csvContent = [
      headers.join(','),
      ...filteredLeads.map(lead => [
        lead.customerName,
        lead.contactPerson,
        lead.email || 'N/A',
        lead.phone,
        lead.address,
        lead.inquiryType,
        lead.currentProvider || 'N/A',
        lead.monthlyBudget,
        lead.status,
        lead.priority,
        getSourceLabel(lead.source),
        lead.assignedTo || 'Unassigned',
        lead.referredBy ? `${lead.referredBy.name} (${lead.referredBy.role})` : 'N/A',
        lead.createdAt,
        lead.potentialRevenue || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `company_leads_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      contacted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      interested: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'proposal-sent': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      negotiating: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      converted: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
      lost: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleViewLead = (lead: CompanyLead) => {
    setSelectedLead(lead);
    setShowLeadDetails(true);
  };

  return (
    <MainLayout title="Company Leads">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customer Leads</h1>
            <p className="text-gray-600 mt-1">
              {user?.role === Role.SUPERADMIN ? 'All customer leads across the system' :
               user?.role === Role.ADMIN ? 'Leads assigned to you and your engineers' :
               user?.role === Role.MANAGER ? 'Leads assigned to you and your team' :
               'Leads assigned to you'}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={exportToExcel}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Dialog open={showNewLeadForm} onOpenChange={setShowNewLeadForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Company Lead
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Company Lead</DialogTitle>
                  <DialogDescription>
                    Add a new business lead for ISP services
                  </DialogDescription>
                </DialogHeader>
                {/* Add Company Lead Form would go here */}
                <div className="text-center py-8 text-gray-500">
                  Company Lead form implementation would go here
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                  <p className="text-2xl font-bold">{analytics.totalLeads}</p>
                </div>
                <Building className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">New Leads</p>
                  <p className="text-2xl font-bold text-blue-600">{analytics.newLeads}</p>
                </div>
                <Target className="h-4 w-4 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Untracked Leads</p>
                  <p className="text-2xl font-bold text-orange-600">{analytics.untrackedLeads}</p>
                </div>
                <AlertCircle className="h-4 w-4 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today's Leads</p>
                  <p className="text-2xl font-bold text-green-600">{analytics.todayLeads}</p>
                </div>
                <CalendarDays className="h-4 w-4 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Analytics Cards - Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contacted Leads</p>
                  <p className="text-2xl font-bold text-purple-600">{analytics.contactedLeads}</p>
                </div>
                <Phone className="h-4 w-4 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tracked Leads</p>
                  <p className="text-2xl font-bold text-indigo-600">{analytics.trackedLeads}</p>
                </div>
                <CheckCircle className="h-4 w-4 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                  <p className="text-2xl font-bold text-red-600">{analytics.highPriorityLeads}</p>
                </div>
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search companies, contacts, emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="interested">Interested</SelectItem>
                    <SelectItem value="proposal-sent">Proposal Sent</SelectItem>
                    <SelectItem value="negotiating">Negotiating</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedSource} onValueChange={setSelectedSource}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="app">Mobile App</SelectItem>
                    <SelectItem value="admin-panel">Admin Panel</SelectItem>
                    <SelectItem value="ivr">IVR System</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="cold-call">Cold Call</SelectItem>
                    <SelectItem value="social-media">Social Media</SelectItem>
                    <SelectItem value="trade-show">Trade Show</SelectItem>
                    <SelectItem value="advertising">Advertising</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedInquiryType} onValueChange={setSelectedInquiryType}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Inquiry Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="new-connection">New Connection</SelectItem>
                    <SelectItem value="upgrade">Upgrade</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Leads</CardTitle>
            <CardDescription>
              {filteredLeads.length} leads found • Page {currentPage} of {totalPages} • Last updated {format(new Date(), 'MMM dd, yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Inquiry Type</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Referred By</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLeads.map((lead) => {
                    const SourceIcon = getSourceIcon(lead.source);
                    return (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{lead.customerName}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {lead.location}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{lead.contactPerson}</div>
                            <div className="text-sm text-muted-foreground">{lead.email || 'N/A'}</div>
                            <div className="text-sm text-muted-foreground">{lead.countryCode} {lead.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="text-sm">{lead.address}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{lead.inquiryType}</div>
                            <div className="text-sm text-muted-foreground">{lead.location}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {lead.assignedTo ? (
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium text-sm">{lead.assignedTo}</div>
                                <div className="text-xs text-muted-foreground">Assigned</div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {lead.referredBy ? (
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium text-sm">{lead.referredBy.name}</div>
                                <div className="text-xs text-muted-foreground">{lead.referredBy.role}</div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {format(parseISO(lead.createdAt), 'MMM dd, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewLead(lead)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between px-2 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Showing {startIndex + 1} to {Math.min(endIndex, filteredLeads.length)} of {filteredLeads.length} leads
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, current page, and pages around current page
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return (
                    <span key={page} className="px-2 text-muted-foreground">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Lead Details Dialog */}
      <Dialog open={showLeadDetails} onOpenChange={setShowLeadDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedLead && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedLead.customerName}</DialogTitle>
                <DialogDescription>
                  Customer Lead Details • {selectedLead.contactPerson}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Customer Information</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Inquiry Type</Label>
                      <p className="font-medium">{selectedLead.inquiryType}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                      <p className="font-medium">{selectedLead.address}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                      <p className="font-medium">{selectedLead.location}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Contact Information</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Contact Person</Label>
                      <p className="font-medium">{selectedLead.contactPerson}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                      <p className="font-medium">{selectedLead.email || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                      <p className="font-medium">{selectedLead.countryCode} {selectedLead.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lead Status & Notes */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Lead Status & Notes</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <Badge className={`mt-1 ${getStatusColor(selectedLead.status)}`}>
                      {selectedLead.status.replace('-', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Priority</Label>
                    <Badge className={`mt-1 ${getPriorityColor(selectedLead.priority)}`}>
                      {selectedLead.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Source</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {(() => {
                        const SourceIcon = getSourceIcon(selectedLead.source);
                        return <SourceIcon className="w-4 h-4 text-muted-foreground" />;
                      })()}
                      <p className="font-medium">{getSourceLabel(selectedLead.source)}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                  <p className="mt-1 text-sm">{selectedLead.notes || 'No notes available'}</p>
                </div>
              </div>

              {/* Lead Assignment & Referral */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Lead Assignment & Referral</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Assigned To</Label>
                      {selectedLead.assignedTo ? (
                        <div className="flex items-center gap-2 mt-1">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{selectedLead.assignedTo}</p>
                            <p className="text-sm text-muted-foreground">Assigned</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Unassigned</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Referred By</Label>
                      {selectedLead.referredBy ? (
                        <div className="flex items-center gap-2 mt-1">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{selectedLead.referredBy.name}</p>
                            <p className="text-sm text-muted-foreground">{selectedLead.referredBy.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{selectedLead.referredBy.role}</Badge>
                              <Badge variant="secondary">{getSourceLabel(selectedLead.referredBy.source)}</Badge>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Direct lead</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Created:</strong> {format(parseISO(selectedLead.createdAt), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                  {selectedLead.lastContactDate && (
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>Last Contact:</strong> {format(parseISO(selectedLead.lastContactDate), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  )}
                  {selectedLead.nextFollowUpDate && (
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>Next Follow-up:</strong> {format(parseISO(selectedLead.nextFollowUpDate), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
