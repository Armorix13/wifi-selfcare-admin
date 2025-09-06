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
  MessageSquare,
  Wifi,
  Activity,
  Timer,
  UserCheck,
  FileText,
  ExternalLink,
  Grid,
  Table as TableIcon,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import { format, parseISO, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import { useAuth } from '@/lib/auth';
import { Role } from '@/lib/types/auth';
import React from 'react';
import { useGetAllLeadsQuery, useMarkLeadAsTrackedMutation } from '@/api';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

interface CompanyLead {
  _id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  countryCode: string;
  status: string;
  connectionType: string;
  installationAddress: string;
  leadPlatform: string;
  email: string;
  source?: string; // Make source optional since some leads don't have it
  priority: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  isTracked: boolean;
  contactAttempts: number;
  byUserId?: {
    _id: string;
    email: string;
    phoneNumber: string;
    role: string;
    firstName: string;
    lastName: string;
  };
  byEngineerId?: {
    _id: string;
    email: string;
    phoneNumber: string;
    role: string;
    firstName: string;
    lastName: string;
  };
  assignedTo?: {
    _id: string;
    email: string;
    phoneNumber: string;
    role: string;
    firstName: string;
    lastName: string;
  };
}

interface LeadStatistics {
  totalLeads: number;
  todayLeads: number;
  monthlyLeads: number;
  highPriorityCount: number;
  statusDistribution: Array<{ _id: string; count: number }>;
  platformDistribution: Array<{ _id: string; count: number }>;
  priorityDistribution: Array<{ _id: string; count: number }>;
  trackingStats: {
    _id: string | null;
    totalTracked: number;
    totalUntracked: number;
    totalContactAttempts: number;
    avgContactAttempts: number | null;
  };
}

interface LeadResponse {
  success: boolean;
  message: string;
  data: {
    leads: CompanyLead[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalLeads: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      limit: number;
    };
    statistics: LeadStatistics;
  };
}

export default function CompanyLeads() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedConnectionType, setSelectedConnectionType] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });
  const [showLeadDetails, setShowLeadDetails] = useState(false);
  const [selectedLead, setSelectedLead] = useState<CompanyLead | null>(null);
  const [showNewLeadForm, setShowNewLeadForm] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingLead, setTrackingLead] = useState<CompanyLead | null>(null);
  const [trackingAction, setTrackingAction] = useState<'track' | 'untrack'>('track');

  // API Query
  const { data: leadsData, isLoading, error } = useGetAllLeadsQuery({});
  
  // Tracking Mutation
  const [markLeadAsTracked, { isLoading: isTrackingLoading }] = useMarkLeadAsTrackedMutation();

  // Extract data from API response
  const leads = leadsData?.data?.leads || [];
  const statistics = leadsData?.data?.statistics;
  const pagination = leadsData?.data?.pagination;

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // Match API limit

  // Filter leads based on search and filters
  const filteredLeads = useMemo(() => {
    return leads.filter((lead: any) => {
      const fullName = `${lead.firstName} ${lead.lastName}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phoneNumber.includes(searchTerm) ||
        lead.installationAddress.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = selectedStatus === 'all' || lead.status === selectedStatus;
      const matchesPriority = selectedPriority === 'all' || lead.priority === selectedPriority;
      const matchesSource = selectedSource === 'all' || (lead.source && lead.source === selectedSource) || (!lead.source && selectedSource === 'direct');
      const matchesConnectionType = selectedConnectionType === 'all' || lead.connectionType === selectedConnectionType;

      let matchesDate = true;

      if (dateFilter.from && dateFilter.to) {
        const leadDate = parseISO(lead.createdAt);
        const fromDate = startOfDay(parseISO(dateFilter.from));
        const toDate = endOfDay(parseISO(dateFilter.to));
        matchesDate = isAfter(leadDate, fromDate) && isBefore(leadDate, toDate);
      }

      return matchesSearch && matchesStatus && matchesPriority && matchesSource && matchesConnectionType && matchesDate;
    });
  }, [leads, searchTerm, selectedStatus, selectedPriority, selectedSource, selectedConnectionType, dateFilter]);

  // Pagination logic
  const totalPages = pagination?.totalPages || Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedPriority, selectedSource, selectedConnectionType, dateFilter]);

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

  // Helper functions - defined before useMemo hooks
  const getStatusColor = (status: string) => {
    const colors = {
      new: '#3b82f6',
      inreview: '#f59e0b',
      contacted: '#8b5cf6',
      interested: '#10b981',
      'proposal-sent': '#ec4899',
      negotiating: '#f97316',
      converted: '#059669',
      lost: '#dc2626',
      tracked: '#10b981',
      untracked: '#f59e0b'
    };
    return colors[status as keyof typeof colors] || '#6b7280';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: '#6b7280',
      medium: '#3b82f6',
      high: '#f59e0b',
      urgent: '#dc2626'
    };
    return colors[priority as keyof typeof colors] || '#6b7280';
  };

  const getPlatformColor = (platform: string) => {
    const colors = {
      'From our website': '#3b82f6',
      'Mobile App': '#8b5cf6',
      'Admin Panel': '#10b981',
      'IVR System': '#f59e0b',
      'WhatsApp': '#059669',
      'Referral': '#ec4899',
      'Cold Call': '#dc2626',
      'Social Media': '#8b5cf6',
      'Trade Show': '#f97316',
      'Advertising': '#06b6d4'
    };
    return colors[platform as keyof typeof colors] || '#6b7280';
  };

  const getStatusBadgeColor = (status: string) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      inreview: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      contacted: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      interested: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'proposal-sent': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      negotiating: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      converted: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
      lost: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      tracked: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      untracked: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadgeColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getSourceIcon = (source: string | undefined) => {
    if (!source) return Globe; // Default icon for undefined/null source
    
    const icons = {
      'from website': Monitor,
      'mobile app': Smartphone,
      'admin panel': Shield,
      'ivr system': PhoneCall,
      'whatsapp': MessageSquare,
      'referral': Users,
      'cold call': Phone,
      'social media': Globe,
      'trade show': Building,
      'advertising': TrendingUp,
      'from application': Smartphone // Add this mapping for the API data
    };
    return icons[source.toLowerCase() as keyof typeof icons] || Globe;
  };

  const getSourceLabel = (source: string | undefined) => {
    if (!source) return 'Direct Lead'; // Default label for undefined/null source
    
    const labels = {
      'from website': 'Website',
      'mobile app': 'Mobile App',
      'admin panel': 'Admin Panel',
      'ivr system': 'IVR System',
      'whatsapp': 'WhatsApp',
      'referral': 'Referral',
      'cold call': 'Cold Call',
      'social media': 'Social Media',
      'trade show': 'Trade Show',
      'advertising': 'Advertising',
      'from application': 'Application' // Add this mapping for the API data
    };
    return labels[source.toLowerCase() as keyof typeof labels] || source;
  };

  const getLeadCreator = (lead: CompanyLead) => {
    if (lead.byEngineerId) {
      return {
        type: 'Engineer',
        name: `${lead.byEngineerId.firstName} ${lead.byEngineerId.lastName}`,
        email: lead.byEngineerId.email,
        role: lead.byEngineerId.role,
        icon: UserCheck
      };
    } else if (lead.byUserId) {
      return {
        type: 'User',
        name: `${lead.byUserId.firstName} ${lead.byUserId.lastName}`,
        email: lead.byUserId.email,
        role: lead.byUserId.role,
        icon: User
      };
    }
    return null;
  };

  // Helper function to determine if a lead is tracked based on status
  const isLeadTracked = (lead: CompanyLead) => {
    return lead.status === 'tracked';
  };

  // Chart data preparation
  const statusChartData = useMemo(() => {
    if (!statistics?.statusDistribution) return [];
    return statistics.statusDistribution.map((item: { _id: string; count: number }) => ({
      name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
      value: item.count,
      color: getStatusColor(item._id)
    }));
  }, [statistics]);

  const platformChartData = useMemo(() => {
    if (!statistics?.platformDistribution) return [];
    return statistics.platformDistribution.map((item: { _id: string; count: number }) => ({
      name: item._id,
      value: item.count,
      color: getPlatformColor(item._id)
    }));
  }, [statistics]);

  const priorityChartData = useMemo(() => {
    if (!statistics?.priorityDistribution) return [];
    return statistics.priorityDistribution.map((item: { _id: string; count: number }) => ({
      name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
      value: item.count,
      color: getPriorityColor(item._id)
    }));
  }, [statistics]);

  const exportToExcel = () => {
    const headers = [
      'Name', 'Email', 'Phone', 'Status', 'Connection Type', 'Address', 'Platform', 'Source', 'Priority', 'Created By', 'Created Date'
    ];
    const csvContent = [
      headers.join(','),
      ...filteredLeads.map((lead: CompanyLead) => {
        const creator = getLeadCreator(lead);
        const creatorInfo = creator ? `${creator.name} (${creator.type})` : 'Direct Lead';

        return [
          `${lead.firstName} ${lead.lastName}`,
          lead.email,
          `${lead.countryCode} ${lead.phoneNumber}`,
          lead.status,
          lead.connectionType,
          lead.installationAddress,
          lead.leadPlatform,
          lead.source,
          lead.priority,
          creatorInfo,
          format(parseISO(lead.createdAt), 'yyyy-MM-dd')
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `company_leads_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleViewLead = (lead: CompanyLead) => {
    setSelectedLead(lead);
    setShowLeadDetails(true);
  };

  const handleToggleTracking = (lead: CompanyLead) => {
    setTrackingLead(lead);
    setTrackingAction(isLeadTracked(lead) ? 'untrack' : 'track');
    setShowTrackingModal(true);
  };

  const confirmTrackingAction = async () => {
    if (!trackingLead) return;
    
    try {
      const body = {
        status: trackingAction === 'track' ? 'tracked' : 'untracked'
      };
      
      await markLeadAsTracked({
        id: trackingLead._id,
        body
      });
      
      // Close modal and reset state
      setShowTrackingModal(false);
      setTrackingLead(null);
      
      // Note: The mutation will automatically invalidate the leads cache
      // and refetch the data, so the UI will update automatically
      
    } catch (error) {
      console.error('Failed to update tracking status:', error);
      // You can add proper error handling here (toast notification, etc.)
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Company Leads">
        <div className="space-y-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="Company Leads">
        <div className="space-y-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Leads</h2>
              <p className="text-gray-600">Failed to load company leads. Please try again later.</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Company Leads">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Company Leads</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {user?.role === Role.SUPERADMIN ? 'All company leads across the system' :
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
                         <Button variant="outline" className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200">
               <UserCheck className="w-4 h-4 mr-2" />
               {leads.filter((lead:any) => isLeadTracked(lead)).length} Tracked
             </Button>
            <Dialog open={showNewLeadForm} onOpenChange={setShowNewLeadForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Lead
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Company Lead</DialogTitle>
                  <DialogDescription>
                    Add a new business lead for ISP services
                  </DialogDescription>
                </DialogHeader>
                <div className="text-center py-8 text-gray-500">
                  Company Lead form implementation would go here
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

                 {/* Tracking Summary */}
         <div className="bg-gradient-to-r from-green-50 to-orange-50 border border-green-200 rounded-lg p-6">
           <div className="flex items-center justify-between">
             <div>
               <h3 className="text-lg font-semibold text-gray-900 mb-2">Lead Tracking Overview</h3>
               <p className="text-sm text-gray-600">Monitor your lead pipeline and follow-up activities</p>
             </div>
             <div className="flex items-center gap-4">
                                <div className="text-center">
                   <div className="text-2xl font-bold text-green-600">{leads.filter((lead:any) => isLeadTracked(lead)).length}</div>
                   <div className="text-sm text-green-600 font-medium">Tracked</div>
                 </div>
                 <div className="text-center">
                   <div className="text-2xl font-bold text-orange-600">{leads.filter((lead:any) => !isLeadTracked(lead)).length}</div>
                   <div className="text-sm text-orange-600 font-medium">Untracked</div>
                 </div>
               <div className="text-center">
                 <div className="text-2xl font-bold text-blue-600">{statistics?.totalLeads || 0}</div>
                 <div className="text-sm text-blue-600 font-medium">Total</div>
               </div>
             </div>
           </div>
         </div>

         {/* Analytics Cards */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                  <p className="text-2xl font-bold">{statistics?.totalLeads || 0}</p>
                </div>
                <Building className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today's Leads</p>
                  <p className="text-2xl font-bold text-green-600">{statistics?.todayLeads || 0}</p>
                </div>
                <CalendarDays className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Leads</p>
                  <p className="text-2xl font-bold text-purple-600">{statistics?.monthlyLeads || 0}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                  <p className="text-2xl font-bold text-red-600">{statistics?.highPriorityCount || 0}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

                 {/* Tracking Statistics */}
         {statistics?.trackingStats && (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
               <CardContent className="p-6">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-sm font-medium text-muted-foreground">Tracked Leads</p>
                     <p className="text-2xl font-bold text-green-600">{leads.filter((lead:any) => isLeadTracked(lead)).length}</p>
                     <p className="text-xs text-green-600 font-medium">✓ Actively Monitored</p>
                   </div>
                   <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                     <CheckCircle className="h-6 w-6 text-green-600" />
                   </div>
                 </div>
               </CardContent>
             </Card>
 
             <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-orange-500">
               <CardContent className="p-6">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-sm font-medium text-muted-foreground">Untracked Leads</p>
                     <p className="text-2xl font-bold text-orange-600">{leads.filter((lead:any) => !isLeadTracked(lead)).length}</p>
                     <p className="text-xs text-orange-600 font-medium">⚠ Needs Attention</p>
                   </div>
                   <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                     <AlertCircle className="h-6 w-6 text-orange-600" />
                   </div>
                 </div>
               </CardContent>
             </Card>
 
             <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-amber-500">
               <CardContent className="p-6">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-sm font-medium text-muted-foreground">Contact Attempts</p>
                     <p className="text-2xl font-bold text-amber-600">{statistics.trackingStats.totalContactAttempts}</p>
                     <p className="text-xs text-amber-600 font-medium">📞 Total Calls</p>
                   </div>
                   <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                     <Phone className="h-6 w-6 text-amber-600" />
                   </div>
                 </div>
               </CardContent>
             </Card>
           </div>
         )}

        {/* Lead Creation Breakdown */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lead Creation Breakdown
            </CardTitle>
            <CardDescription>
              Overview of who created the leads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {leads.filter((lead: any) => lead.byEngineerId).length}
                </div>
                <div className="text-sm text-muted-foreground">By Engineers</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {leads.filter((lead: any) => lead.byUserId).length}
                </div>
                <div className="text-sm text-muted-foreground">By Users</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-950/20 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">
                  {leads.filter((lead: any) => !lead.byEngineerId && !lead.byUserId).length}
                </div>
                <div className="text-sm text-muted-foreground">Direct Leads</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusChartData.map((entry: any, index: any) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Platform Distribution */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Platform Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={platformChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {platformChartData.map((entry: any, index: any) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search leads, emails, addresses..."
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
                     <SelectItem value="inreview">In Review</SelectItem>
                     <SelectItem value="contacted">Contacted</SelectItem>
                     <SelectItem value="interested">Interested</SelectItem>
                     <SelectItem value="proposal-sent">Proposal Sent</SelectItem>
                     <SelectItem value="negotiating">Negotiating</SelectItem>
                     <SelectItem value="converted">Converted</SelectItem>
                     <SelectItem value="lost">Lost</SelectItem>
                     <SelectItem value="tracked">Tracked</SelectItem>
                     <SelectItem value="untracked">Untracked</SelectItem>
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
                    <SelectItem value="from website">Website</SelectItem>
                    <SelectItem value="mobile app">Mobile App</SelectItem>
                    <SelectItem value="admin panel">Admin Panel</SelectItem>
                    <SelectItem value="ivr system">IVR System</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="cold call">Cold Call</SelectItem>
                    <SelectItem value="social media">Social Media</SelectItem>
                    <SelectItem value="trade show">Trade Show</SelectItem>
                    <SelectItem value="advertising">Advertising</SelectItem>
                    <SelectItem value="from application">Application</SelectItem>
                    <SelectItem value="direct">Direct Lead</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedConnectionType} onValueChange={setSelectedConnectionType}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Connection Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Fiber">Fiber</SelectItem>
                    <SelectItem value="Cable">Cable</SelectItem>
                    <SelectItem value="DSL">DSL</SelectItem>
                    <SelectItem value="Wireless">Wireless</SelectItem>
                    <SelectItem value="Satellite">Satellite</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                  >
                    <TableIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leads Display */}
        {viewMode === 'table' ? (
          /* Table View */
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Company Leads</CardTitle>
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
                      <TableHead>Connection Type</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                                             <TableHead>Created By</TableHead>
                       <TableHead>Tracking</TableHead>
                       <TableHead>Created</TableHead>
                       <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedLeads.map((lead: any) => {
                      const SourceIcon = getSourceIcon(lead.source);
                      return (
                                                 <TableRow 
                           key={lead._id} 
                           className={`hover:bg-muted/50 ${
                             isLeadTracked(lead)
                               ? 'border-l-4 border-l-green-500 bg-green-50/30' 
                               : 'border-l-4 border-l-orange-500 bg-orange-50/30'
                           }`}
                         >
                          <TableCell>
                            <div>
                              <div className="font-medium">{lead.firstName} {lead.lastName}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                {/* <MapPin className="w-3 h-3" />
                                {lead.installationAddress.split(',')[0]} */}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{lead.email}</div>
                              <div className="text-sm text-muted-foreground">{lead.countryCode} {lead.phoneNumber}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <div className="text-sm">{lead.installationAddress}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Wifi className="w-4 h-4 text-blue-600" />
                              <span className="font-medium">{lead.connectionType}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <SourceIcon className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">{lead.leadPlatform}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeColor(lead.status)}>
                              {lead.status.replace('-', ' ').toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityBadgeColor(lead.priority)}>
                              {lead.priority.toUpperCase()}
                            </Badge>
                          </TableCell>
                                                     <TableCell>
                             {(() => {
                               const creator = getLeadCreator(lead);
                               if (creator) {
                                 const CreatorIcon = creator.icon;
                                 return (
                                   <div className="flex items-center space-x-2">
                                     <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                       <CreatorIcon className="h-3 w-3 text-white" />
                                     </div>
                                     <div>
                                       <div className="text-sm font-medium">{creator.name}</div>
                                       <div className="text-xs text-muted-foreground capitalize">{creator.type}</div>
                                     </div>
                                   </div>
                                 );
                               }
                               return (
                                 <span className="text-muted-foreground text-sm">Direct Lead</span>
                               );
                             })()}
                           </TableCell>
                                                        <TableCell>
                               <div className="flex items-center gap-2">
                                 {isLeadTracked(lead) ? (
                                   <>
                                     <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                     <Badge className="bg-green-100 text-green-800 text-xs font-medium">
                                       Tracked
                                     </Badge>
                                   </>
                                 ) : (
                                   <>
                                     <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                     <Badge className="bg-orange-100 text-orange-800 text-xs font-medium">
                                       Untracked
                                     </Badge>
                                   </>
                                 )}
                               </div>
                             </TableCell>
                           <TableCell>
                             <div className="text-sm">
                               {format(parseISO(lead.createdAt), 'MMM dd, yyyy')}
                             </div>
                           </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewLead(lead)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                                                             <Button
                                 variant={isLeadTracked(lead) ? "default" : "outline"}
                                 size="sm"
                                 onClick={() => handleToggleTracking(lead)}
                                 className={isLeadTracked(lead) ? "bg-green-600 hover:bg-green-700" : ""}
                               >
                                 {isLeadTracked(lead) ? (
                                   <BookmarkCheck className="w-4 h-4" />
                                 ) : (
                                   <Bookmark className="w-4 h-4" />
                                 )}
                               </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedLeads.map((lead: any) => {
              const SourceIcon = getSourceIcon(lead.source);
              return (
                                 <Card 
                   key={lead._id} 
                   className={`hover:shadow-lg transition-all duration-300 hover:scale-105 ${
                     isLeadTracked(lead)
                       ? 'border-l-4 border-l-green-500 bg-green-50/20' 
                       : 'border-l-4 border-l-orange-500 bg-orange-50/20'
                   }`}
                 >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-sm">{lead.firstName} {lead.lastName}</CardTitle>
                          <p className="text-xs text-muted-foreground">{lead.email}</p>
                        </div>
                      </div>
                      <Badge className={getStatusBadgeColor(lead.status)}>
                        {lead.status.replace('-', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{lead.countryCode} {lead.phoneNumber}</span>
                      </div>
                      <Badge className={getPriorityBadgeColor(lead.priority)}>
                        {lead.priority.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground truncate">{lead.installationAddress}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Wifi className="h-3 w-3 text-blue-600" />
                      <span className="text-sm font-medium">{lead.connectionType}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <SourceIcon className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{lead.leadPlatform}</span>
                    </div>

                                         <div className="flex items-center justify-between text-xs text-muted-foreground">
                       <span>Created: {format(parseISO(lead.createdAt), 'MMM dd')}</span>
                                               <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                          isLeadTracked(lead)
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {isLeadTracked(lead) ? (
                            <>
                              <UserCheck className="h-3 w-3" />
                              <span className="font-medium">Tracked</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3 w-3" />
                              <span className="font-medium">Untracked</span>
                            </>
                          )}
                        </div>
                     </div>

                    {/* Lead Creator Information */}
                    {(() => {
                      const creator = getLeadCreator(lead);
                      if (creator) {
                        const CreatorIcon = creator.icon;
                        return (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 border-t border-border/50">
                            <CreatorIcon className="h-3 w-3" />
                            <span>By: {creator.name} ({creator.type})</span>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    <div className="flex gap-1 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewLead(lead)}
                        className="flex-1 h-8 text-xs"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                                             <Button
                         variant={isLeadTracked(lead) ? "default" : "outline"}
                         size="sm"
                         onClick={() => handleToggleTracking(lead)}
                         className={`h-8 text-xs ${
                           isLeadTracked(lead)
                             ? "bg-green-600 hover:bg-green-700 text-white" 
                             : "hover:bg-green-50 hover:text-green-700"
                         }`}
                       >
                         {isLeadTracked(lead) ? (
                           <BookmarkCheck className="h-3 w-3 mr-1" />
                         ) : (
                           <Bookmark className="h-3 w-3 mr-1" />
                         )}
                         {isLeadTracked(lead) ? "Tracked" : "Track"}
                       </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
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
        )}
      </div>

      {/* Lead Details Dialog */}
      <Dialog open={showLeadDetails} onOpenChange={setShowLeadDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedLead && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedLead.firstName} {selectedLead.lastName}</DialogTitle>
                <DialogDescription>
                  Company Lead Details • {selectedLead.email}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Customer Information</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                      <p className="font-medium">{selectedLead.firstName} {selectedLead.lastName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                      <p className="font-medium">{selectedLead.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                      <p className="font-medium">{selectedLead.countryCode} {selectedLead.phoneNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Lead Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Lead Details</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                      <Badge className={`mt-1 ${getStatusBadgeColor(selectedLead.status)}`}>
                        {selectedLead.status.replace('-', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Priority</Label>
                      <Badge className={`mt-1 ${getPriorityBadgeColor(selectedLead.priority)}`}>
                        {selectedLead.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Connection Type</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Wifi className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">{selectedLead.connectionType}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address and Platform */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Address & Platform</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Installation Address</Label>
                    <p className="mt-1 font-medium">{selectedLead.installationAddress}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Lead Platform</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {(() => {
                        const SourceIcon = getSourceIcon(selectedLead.source);
                        return <SourceIcon className="h-4 w-4 text-muted-foreground" />;
                      })()}
                      <p className="font-medium">{selectedLead.leadPlatform}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lead Creator Information */}
              {(() => {
                const creator = getLeadCreator(selectedLead);
                if (creator) {
                  const CreatorIcon = creator.icon;
                  return (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Lead Creator</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Creator Type</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <CreatorIcon className="h-4 w-4 text-blue-600" />
                            <span className="font-medium capitalize">{creator.type}</span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Creator Name</Label>
                          <p className="mt-1 font-medium">{creator.name}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Creator Email</Label>
                          <p className="mt-1 font-medium">{creator.email}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Creator Role</Label>
                          <Badge variant="outline" className="mt-1 capitalize">{creator.role}</Badge>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Source and Tracking */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Source & Tracking</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Source</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {(() => {
                        const SourceIcon = getSourceIcon(selectedLead.source);
                        return <SourceIcon className="h-4 w-4 text-muted-foreground" />;
                      })()}
                      <p className="font-medium">{getSourceLabel(selectedLead.source)}</p>
                    </div>
                  </div>
                                       <div>
                       <Label className="text-sm font-medium text-muted-foreground">Tracking Status</Label>
                       <div className="flex items-center gap-2 mt-1">
                         {isLeadTracked(selectedLead) ? (
                           <>
                             <UserCheck className="h-4 w-4 text-green-500" />
                             <span className="text-green-600 font-medium">Tracked</span>
                           </>
                         ) : (
                           <>
                             <AlertCircle className="h-4 w-4 text-orange-500" />
                             <span className="text-orange-600 font-medium">Untracked</span>
                           </>
                         )}
                       </div>
                     </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Contact Attempts</Label>
                    <p className="mt-1 font-medium">{selectedLead.contactAttempts}</p>
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
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Last Updated:</strong> {format(parseISO(selectedLead.updatedAt), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
                 </DialogContent>
       </Dialog>

       {/* Tracking Confirmation Modal */}
       <Dialog open={showTrackingModal} onOpenChange={setShowTrackingModal}>
         <DialogContent className="max-w-md">
           <DialogHeader>
             <DialogTitle className="text-center text-xl">
               {trackingAction === 'track' ? (
                 <div className="flex items-center justify-center gap-2">
                   <span>🎯</span>
                   <span>Mark as Tracked</span>
                 </div>
               ) : (
                 <div className="flex items-center justify-center gap-2">
                   <span>❌</span>
                   <span>Remove Tracking</span>
                 </div>
               )}
             </DialogTitle>
             <DialogDescription className="text-center">
               {trackingAction === 'track' 
                 ? "Are you sure you want to mark this lead as tracked? This will help you monitor follow-up activities."
                 : "Are you sure you want to remove tracking from this lead? This will stop monitoring follow-up activities."
               }
             </DialogDescription>
           </DialogHeader>

           {trackingLead && (
             <div className="space-y-4">
               {/* Lead Preview */}
               <div className="bg-muted/30 rounded-lg p-4">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                     <User className="h-5 w-5 text-white" />
                   </div>
                   <div className="flex-1">
                     <h4 className="font-semibold text-sm">
                       {trackingLead.firstName} {trackingLead.lastName}
                     </h4>
                     <p className="text-xs text-muted-foreground">{trackingLead.email}</p>
                     <p className="text-xs text-muted-foreground">{trackingLead.countryCode} {trackingLead.phoneNumber}</p>
                   </div>
                 </div>
                 
                 <div className="mt-3 flex items-center justify-between text-xs">
                   <Badge className={getStatusBadgeColor(trackingLead.status)}>
                     {trackingLead.status.replace('-', ' ').toUpperCase()}
                   </Badge>
                   <Badge className={getPriorityBadgeColor(trackingLead.priority)}>
                     {trackingLead.priority.toUpperCase()}
                   </Badge>
                 </div>
               </div>

               {/* Current Status */}
               <div className="text-center">
                 <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-muted/50">
                   {trackingAction === 'track' ? (
                     <>
                       <span className="text-2xl">📌</span>
                       <span className="text-sm font-medium">Currently Untracked</span>
                     </>
                   ) : (
                     <>
                       <span className="text-2xl">✅</span>
                       <span className="text-sm font-medium">Currently Tracked</span>
                     </>
                   )}
                 </div>
               </div>

               {/* Action Buttons */}
               <div className="flex gap-3 pt-2">
                                   <Button
                    variant="outline"
                    onClick={() => setShowTrackingModal(false)}
                    disabled={isTrackingLoading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                                   <Button
                    onClick={confirmTrackingAction}
                    disabled={isTrackingLoading}
                    className={`flex-1 ${
                      trackingAction === 'track' 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-orange-600 hover:bg-orange-700'
                    }`}
                  >
                    {isTrackingLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : trackingAction === 'track' ? (
                      <>
                        <span className="mr-2">🎯</span>
                        Mark as Tracked
                      </>
                    ) : (
                      <>
                        <span className="mr-2">❌</span>
                        Remove Tracking
                      </>
                    )}
                  </Button>
               </div>

               {/* Info Message */}
               <div className="text-center text-xs text-muted-foreground">
                 {trackingAction === 'track' ? (
                   <div className="flex items-center justify-center gap-1">
                     <span>💡</span>
                     <span>Tracked leads will be monitored for follow-up activities</span>
                   </div>
                 ) : (
                   <div className="flex items-center justify-center gap-1">
                     <span>⚠️</span>
                     <span>Untracked leads won't show in tracking reports</span>
                   </div>
                 )}
               </div>
             </div>
           )}
         </DialogContent>
       </Dialog>
     </MainLayout>
   );
 }
