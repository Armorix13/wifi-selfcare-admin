import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarDays, Download, Eye, Phone, MessageCircle, Mail, TrendingUp, Users, Clock, CheckCircle, UserPlus, RefreshCw, Building2 } from 'lucide-react';
import { format, parseISO, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import { dummyLeads, Lead } from '@/lib/dummyData';
import { MainLayout } from '@/components/layout/main-layout';

// Extended Lead type for admin assignment
interface ExtendedLead extends Lead {
  assignedAdmin: string | null;
  assignmentDate: string | null;
}

// Mock admin/company data
const mockAdmins = [
  { id: 'admin1', name: 'Tech Solutions Ltd', email: 'admin@techsolutions.com', phone: '+91-98765-43210' },
  { id: 'admin2', name: 'Digital Connect Co', email: 'admin@digitalconnect.com', phone: '+91-98765-43211' },
  { id: 'admin3', name: 'Networks Pro', email: 'admin@networkspro.com', phone: '+91-98765-43212' },
  { id: 'admin4', name: 'WiFi Masters', email: 'admin@wifimasters.com', phone: '+91-98765-43213' },
];

export default function Leads() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedAdmin, setSelectedAdmin] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });
  const [leads, setLeads] = useState<ExtendedLead[]>(dummyLeads.map(lead => ({
    ...lead,
    assignedAdmin: null,
    assignmentDate: null
  })));

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm) ||
        (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = selectedStatus === 'all' || lead.status === selectedStatus;
      const matchesSource = selectedSource === 'all' || lead.source === selectedSource;
      const matchesAdmin = selectedAdmin === 'all' || lead.assignedAdmin === selectedAdmin;
      
      let matchesDate = true;
      if (dateFilter.from && dateFilter.to) {
        const leadDate = parseISO(lead.createdAt);
        const fromDate = startOfDay(parseISO(dateFilter.from));
        const toDate = endOfDay(parseISO(dateFilter.to));
        matchesDate = isAfter(leadDate, fromDate) && isBefore(leadDate, toDate);
      }
      
      return matchesSearch && matchesStatus && matchesSource && matchesAdmin && matchesDate;
    });
  }, [searchTerm, selectedStatus, selectedSource, selectedAdmin, dateFilter, leads]);

  const analytics = useMemo(() => {
    const totalLeads = leads.length;
    const newLeads = leads.filter(lead => lead.status === 'new').length;
    const contactedLeads = leads.filter(lead => lead.isContactedByManager).length;
    const convertedLeads = leads.filter(lead => lead.status === 'converted').length;
    const assignedLeads = leads.filter(lead => lead.assignedAdmin).length;
    const unassignedLeads = totalLeads - assignedLeads;
    
    const sourceDistribution = leads.reduce((acc, lead) => {
      acc[lead.source] = (acc[lead.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const adminDistribution = leads.reduce((acc, lead) => {
      if (lead.assignedAdmin) {
        acc[lead.assignedAdmin] = (acc[lead.assignedAdmin] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads * 100).toFixed(1) : '0';
    const contactRate = totalLeads > 0 ? (contactedLeads / totalLeads * 100).toFixed(1) : '0';
    const assignmentRate = totalLeads > 0 ? (assignedLeads / totalLeads * 100).toFixed(1) : '0';

    return {
      totalLeads,
      newLeads,
      contactedLeads,
      convertedLeads,
      assignedLeads,
      unassignedLeads,
      sourceDistribution,
      adminDistribution,
      conversionRate,
      contactRate,
      assignmentRate
    };
  }, [leads]);

  const assignLead = (leadId: number, adminId: string) => {
    setLeads(prev => prev.map(lead => 
      lead.id === leadId 
        ? { ...lead, assignedAdmin: adminId, assignmentDate: new Date().toISOString() }
        : lead
    ));
  };

  const reassignLead = (leadId: number, newAdminId: string) => {
    setLeads(prev => prev.map(lead => 
      lead.id === leadId 
        ? { ...lead, assignedAdmin: newAdminId, assignmentDate: new Date().toISOString() }
        : lead
    ));
  };

  const unassignLead = (leadId: number) => {
    setLeads(prev => prev.map(lead => 
      lead.id === leadId 
        ? { ...lead, assignedAdmin: null, assignmentDate: null }
        : lead
    ));
  };

  const getAdminName = (adminId: string | null) => {
    if (!adminId) return 'Unassigned';
    const admin = mockAdmins.find(a => a.id === adminId);
    return admin ? admin.name : 'Unknown Admin';
  };

  const exportToExcel = () => {
    const headers = ['Name', 'Phone', 'Email', 'Source', 'Status', 'Inquiry Date', 'Interest', 'Contacted by Manager', 'Assigned Admin', 'Assignment Date'];
    const csvContent = [
      headers.join(','),
      ...filteredLeads.map(lead => [
        lead.name,
        lead.phone,
        lead.email || 'N/A',
        lead.source,
        lead.status,
        lead.createdAt,
        lead.inquiryType,
        lead.isContactedByManager ? 'Yes' : 'No',
        getAdminName(lead.assignedAdmin),
        lead.assignmentDate ? format(parseISO(lead.assignmentDate), 'yyyy-MM-dd') : 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      contacted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      interested: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      converted: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      lost: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'ivr': return <Phone className="h-4 w-4" />;
      case 'whatsapp': return <MessageCircle className="h-4 w-4" />;
      case 'website': return <Mail className="h-4 w-4" />;
      default: return <Phone className="h-4 w-4" />;
    }
  };

  return (
    <MainLayout title="Leads Management">

    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Leads Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track and manage customer inquiries and leads</p>
        </div>
        <Button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700">
          <Download className="mr-2 h-4 w-4" />
          Export Excel
        </Button>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="leads" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Leads
          </TabsTrigger>
          <TabsTrigger value="new-installation" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            New Installation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border-blue-200 dark:border-blue-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-200">Total Leads</CardTitle>
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-800 dark:text-blue-100">{analytics.totalLeads}</div>
                <p className="text-xs text-blue-600 dark:text-blue-300">All time inquiries</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800 border-yellow-200 dark:border-yellow-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-200">New Leads</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-100">{analytics.newLeads}</div>
                <p className="text-xs text-yellow-600 dark:text-yellow-300">Pending contact</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border-green-200 dark:border-green-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700 dark:text-green-200">Assigned</CardTitle>
                <UserPlus className="h-4 w-4 text-green-600 dark:text-green-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-800 dark:text-green-100">{analytics.assignedLeads}</div>
                <p className="text-xs text-green-600 dark:text-green-300">{analytics.assignmentRate}% assignment rate</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 border-purple-200 dark:border-purple-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-200">Converted</CardTitle>
                <CheckCircle className="h-4 w-4 text-purple-600 dark:text-purple-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-800 dark:text-purple-100">{analytics.convertedLeads}</div>
                <p className="text-xs text-purple-600 dark:text-purple-300">{analytics.conversionRate}% conversion</p>
              </CardContent>
            </Card>
          </div>

          {/* Source Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Source Distribution</CardTitle>
                <CardDescription>Breakdown of leads by inquiry source</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.sourceDistribution).map(([source, count]) => (
                    <div key={source} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getSourceIcon(source)}
                        <span className="font-medium">{source}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(count / analytics.totalLeads) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Admin Assignment Distribution</CardTitle>
                <CardDescription>Breakdown of leads by assigned admin/company</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Unassigned</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ width: `${(analytics.unassignedLeads / analytics.totalLeads) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold">{analytics.unassignedLeads}</span>
                    </div>
                  </div>
                  {Object.entries(analytics.adminDistribution).map(([adminId, count]) => (
                    <div key={adminId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{getAdminName(adminId)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${(count / analytics.totalLeads) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leads" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <Input
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
                
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="interested">Interested</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedSource} onValueChange={setSelectedSource}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="ivr">IVR Call</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedAdmin} onValueChange={setSelectedAdmin}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Admins" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Admins</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {mockAdmins.map(admin => (
                      <SelectItem key={admin.id} value={admin.id}>{admin.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="date"
                  placeholder="From date"
                  value={dateFilter.from}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, from: e.target.value }))}
                />

                <Input
                  type="date"
                  placeholder="To date"
                  value={dateFilter.to}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, to: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Leads Table */}
          <Card>
            <CardHeader>
              <CardTitle>Leads ({filteredLeads.length})</CardTitle>
              <CardDescription>Customer inquiries from various sources with admin assignment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Interest</TableHead>
                      <TableHead>Assigned Admin</TableHead>
                      <TableHead>Inquiry Date</TableHead>
                      <TableHead>Manager Contact</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{lead.name}</div>
                            <div className="text-sm text-gray-500">{lead.email || 'No email'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{lead.phone}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getSourceIcon(lead.source)}
                            <span className="text-sm">{lead.source}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(lead.status)}>
                            {lead.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{lead.inquiryType}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {lead.assignedAdmin ? (
                              <>
                                <Building2 className="h-4 w-4 text-green-500" />
                                <div>
                                  <div className="text-sm font-medium">{getAdminName(lead.assignedAdmin)}</div>
                                  {lead.assignmentDate && (
                                    <div className="text-xs text-gray-500">
                                      {format(parseISO(lead.assignmentDate), 'MMM dd, yyyy')}
                                    </div>
                                  )}
                                </div>
                              </>
                            ) : (
                              <>
                                <Building2 className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-500">Unassigned</span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <CalendarDays className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              {format(parseISO(lead.createdAt), 'MMM dd, yyyy')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={lead.isContactedByManager ? "default" : "secondary"}>
                            {lead.isContactedByManager ? "Yes" : "No"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {!lead.assignedAdmin ? (
                              <Select onValueChange={(value) => assignLead(lead.id, value)}>
                                <SelectTrigger className="w-32">
                                  <SelectValue placeholder="Assign" />
                                </SelectTrigger>
                                <SelectContent>
                                  {mockAdmins.map(admin => (
                                    <SelectItem key={admin.id} value={admin.id}>
                                      {admin.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="flex items-center gap-1">
                                <Select onValueChange={(value) => reassignLead(lead.id, value)}>
                                  <SelectTrigger className="w-32">
                                    <SelectValue placeholder="Reassign" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {mockAdmins.map(admin => (
                                      <SelectItem key={admin.id} value={admin.id}>
                                        {admin.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => unassignLead(lead.id)}
                                  className="h-8 px-2"
                                >
                                  <RefreshCw className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
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

        <TabsContent value="new-installation">
          <Card>
            <CardHeader>
              <CardTitle>New Installation Requests</CardTitle>
              <CardDescription>This section will contain new installation management features</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">New Installation management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </MainLayout>
  );
}