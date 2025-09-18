import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Trash2, Eye, RefreshCw, AlertTriangle, CheckCircle, XCircle, Clock, Server, MapPin, Globe, Zap, Image as ImageIcon, Hash, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { MainLayout } from '@/components/layout/main-layout';
import { BASE_URL, useGetOltDataQuery } from '@/api';


// OLT Interface
interface OLT {
  _id: string;
  oltId: string;
  name: string;
  oltIp: string;
  macAddress: string;
  serialNumber: string;
  latitude: number;
  longitude: number;
  oltType: 'epon' | 'gpon' | 'xgs-pon';
  powerStatus: 'on' | 'off';
  oltPower: number;
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  dnsServers: string[];
  attachments: string[];
  outputs: any[];
  createdAt: string;
  updatedAt: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  totalPorts?: number;
  activePorts?: number;
  availablePorts?: number;
  ms_devices?: any[];
  fdb_devices?: any[];
  subms_devices?: any[];
  x2_devices?: any[];
  ownedBy?: {
    _id: string;
    email: string;
  };
}

// Mock Data
const mockOLTs: OLT[] = [
  {
    _id: '1',
    oltId: 'OLT1095',
    name: 'SAMRALA-03',
    oltIp: '192.154.1.10',
    macAddress: '32:1D:2B:3F:4D:5X',
    serialNumber: 'SN12ND047',
    latitude: 30.84,
    longitude: 76.19,
    oltType: 'epon',
    powerStatus: 'on',
    oltPower: 2,
    status: 'active',
    dnsServers: ['8.8.8.8', '1.1.1.1'],
    attachments: ['/view/image/olt1-1.jpeg', '/view/image/olt1-2.jpeg'],
    outputs: [],
    createdAt: '2025-08-30T07:47:56.548Z',
    updatedAt: '2025-08-30T07:47:56.548Z',
    location: { type: 'Point', coordinates: [76.19, 30.84] }
  },
  {
    _id: '2',
    oltId: 'OLT1096',
    name: 'LUDHIANA-01',
    oltIp: '192.154.1.11',
    macAddress: '32:1D:2B:3F:4D:5Y',
    serialNumber: 'SN12ND048',
    latitude: 30.90,
    longitude: 75.85,
    oltType: 'gpon',
    powerStatus: 'on',
    oltPower: 3,
    status: 'active',
    dnsServers: ['8.8.8.8', '1.1.1.1'],
    attachments: ['/view/image/olt2-1.jpeg'],
    outputs: [],
    createdAt: '2025-08-29T10:30:00.000Z',
    updatedAt: '2025-08-29T10:30:00.000Z',
    location: { type: 'Point', coordinates: [75.85, 30.90] }
  },
  {
    _id: '3',
    oltId: 'OLT1097',
    name: 'JALANDHAR-02',
    oltIp: '192.154.1.12',
    macAddress: '32:1D:2B:3F:4D:5Z',
    serialNumber: 'SN12ND049',
    latitude: 31.33,
    longitude: 75.58,
    oltType: 'xgs-pon',
    powerStatus: 'on',
    oltPower: 4,
    status: 'maintenance',
    dnsServers: ['8.8.8.8', '1.1.1.1'],
    attachments: ['/view/image/olt3-1.jpeg'],
    outputs: [],
    createdAt: '2025-08-28T15:20:00.000Z',
    updatedAt: '2025-08-28T15:20:00.000Z',
    location: { type: 'Point', coordinates: [75.58, 31.33] }
  }
];

export default function OLTManagement() {
  const navigate = useNavigate();
  const [olts, setOlts] = useState<OLT[]>([]);
  const [filteredOlts, setFilteredOlts] = useState<OLT[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [oltTypeFilter, setOltTypeFilter] = useState<string>('all');
  const [selectedOLT, setSelectedOLT] = useState<OLT | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedOLTName, setSelectedOLTName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { data: oltData, isLoading: oltLoading } = useGetOltDataQuery({});

  // Update olts when API data is received
  useEffect(() => {
    if (oltData?.data) {
      setOlts(oltData.data);
      setFilteredOlts(oltData.data);
    }
  }, [oltData]);

  // Form states
  const [createForm, setCreateForm] = useState({
    oltId: '',
    name: '',
    oltIp: '',
    macAddress: '',
    serialNumber: '',
    latitude: 30.84,
    longitude: 76.19,
    oltType: 'epon' as const,
    powerStatus: 'on' as const,
    oltPower: 2,
    dnsServers: ['8.8.8.8', '1.1.1.1']
  });

  const [editForm, setEditForm] = useState<any>({});

  useEffect(() => {
    filterOLTs();
  }, [searchTerm, statusFilter, oltTypeFilter, olts]);

  const filterOLTs = () => {
    let filtered = olts;

    if (searchTerm) {
      filtered = filtered.filter(olt =>
        olt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        olt.oltId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        olt.oltIp.includes(searchTerm) ||
        olt.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(olt => olt.status === statusFilter);
    }

    if (oltTypeFilter !== 'all') {
      filtered = filtered.filter(olt => olt.oltType === oltTypeFilter);
    }

    setFilteredOlts(filtered);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'maintenance': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Server className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'active': 'bg-green-100 text-green-800 border-green-200 text-xs',
      'inactive': 'bg-red-100 text-red-800 border-red-200 text-xs',
      'maintenance': 'bg-yellow-100 text-yellow-800 border-yellow-200 text-xs',
      'error': 'bg-red-100 text-red-800 border-red-200 text-xs'
    };

    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800 border-gray-200 text-xs'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getOLTTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      'epon': 'bg-blue-100 text-blue-800 border-blue-200 text-xs',
      'gpon': 'bg-purple-100 text-purple-800 border-purple-200 text-xs',
      'xgs-pon': 'bg-indigo-100 text-indigo-800 border-indigo-200 text-xs'
    };

    return (
      <Badge className={variants[type] || 'bg-gray-100 text-gray-800 border-gray-200 text-xs'}>
        {type.toUpperCase()}
      </Badge>
    );
  };

  const handleCreateOLT = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({ 
        title: "Coming Soon", 
        description: "Create functionality will be available in the next update" 
      });
      
      setIsCreateDialogOpen(false);
      setCreateForm({
        oltId: '', name: '', oltIp: '', macAddress: '', serialNumber: '',
        latitude: 30.84, longitude: 76.19, oltType: 'epon', powerStatus: 'on', oltPower: 2,
        dnsServers: ['8.8.8.8', '1.1.1.1']
      });
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleEditOLT = async () => {
    if (!selectedOLT) return;
    
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({ 
        title: "Coming Soon", 
        description: "Edit functionality will be available in the next update" 
      });
      
      setIsEditDialogOpen(false);
      setEditForm({});
      setSelectedOLT(null);
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOLT = async () => {
    if (!selectedOLT) return;
    
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({ 
        title: "Coming Soon", 
        description: "Delete functionality will be available in the next update" 
      });
      
      setIsDeleteDialogOpen(false);
      setSelectedOLT(null);
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (olt: OLT) => {
    setSelectedOLT(olt);
    setEditForm({
      name: olt.name, oltIp: olt.oltIp, status: olt.status,
      oltType: olt.oltType, powerStatus: olt.powerStatus, oltPower: olt.oltPower
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (olt: OLT) => {
    setSelectedOLT(olt);
    setIsDeleteDialogOpen(true);
  };

  const openViewDialog = (olt: OLT) => {
    navigate(`/olt-management/${olt._id}`, {
      state: { oltData: olt }
    });
  };

  const openMapView = (olt: OLT) => {
    navigate(`/map?oltId=${olt._id}`);
  };

  const handleImageClick = (attachment: string, oltName: string) => {
    const imageUrl = `${BASE_URL}${attachment}`;
    window.open(imageUrl, '_blank');
  };

  const openImageModal = (attachments: string[], oltName: string) => {
    setSelectedImages(attachments);
    setSelectedOLTName(oltName);
    setIsImageModalOpen(true);
  };

  return (
    <MainLayout title="OLT Management">
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 p-3 lg:p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-0 mb-4 lg:mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">OLT Management</h1>
              <p className="text-gray-600 mt-1 text-sm lg:text-base">Manage Optical Line Terminals and monitor network infrastructure</p>
            </div>
            <div className="flex items-center gap-2 lg:gap-3 w-full lg:w-auto">
              <Button onClick={() => navigate('/map')} className="flex items-center gap-2 text-xs lg:text-sm">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">View on Map</span>
              </Button>
              {/* <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-2 text-xs lg:text-sm" title="Coming Soon">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add OLT</span>
              </Button> */}
            </div>
          </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 lg:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search OLTs by name, ID, IP, or serial number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9 lg:h-11 text-sm lg:text-base"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[140px] lg:w-[180px] h-9 lg:h-11 text-sm lg:text-base">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
          <Select value={oltTypeFilter} onValueChange={setOltTypeFilter}>
            <SelectTrigger className="w-full sm:w-[140px] lg:w-[180px] h-9 lg:h-11 text-sm lg:text-base">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="epon">EPON</SelectItem>
              <SelectItem value="gpon">GPON</SelectItem>
              <SelectItem value="xgs-pon">XGS-PON</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={() => { setSearchTerm(''); setStatusFilter('all'); setOltTypeFilter('all'); }}
            className="h-9 lg:h-11 px-4 lg:px-6 text-sm lg:text-base"
          >
            <RefreshCw className="h-4 w-4 mr-1 lg:mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* OLT Cards */}
        <div className="flex-1 overflow-y-auto p-3 lg:p-6 bg-gray-50 min-h-0">
          {oltLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Loading OLTs</h3>
                <p className="text-gray-500">Please wait while we fetch the data</p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="font-medium">{filteredOlts.length} OLTs found</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredOlts.map((olt) => (
                  <Card 
                    key={olt._id} 
                    className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer bg-white border-gray-200 hover:border-blue-300"
                    onClick={() => openViewDialog(olt)}
                  >
                    <CardContent className="p-4">
                      {/* Header with Name and Status */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="space-y-1">
                          <CardTitle className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {olt.name}
                          </CardTitle>
                          <CardDescription className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                            {olt.oltId}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(olt.status)}
                          {getStatusBadge(olt.status)}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" title="Click anywhere on card to view details">
                            <Info className="h-3 w-3 text-blue-500" />
                          </div>
                        </div>
                      </div>

                      {/* Key Information Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Server className="h-3 w-3" />
                            <span>Serial</span>
                          </div>
                          <p className="text-xs font-medium text-gray-900 truncate">{olt.serialNumber}</p>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Globe className="h-3 w-3" />
                            <span>IP</span>
                          </div>
                          <p className="text-xs font-mono text-gray-900 truncate">{olt.oltIp}</p>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Hash className="h-3 w-3" />
                            <span>MAC</span>
                          </div>
                          <p className="text-xs font-mono text-gray-900 truncate">{olt.macAddress}</p>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Zap className="h-3 w-3" />
                            <span>Type</span>
                          </div>
                          {getOLTTypeBadge(olt.oltType)}
                        </div>
                      </div>

                      {/* Power Status */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Zap className="h-3 w-3" />
                          <span>Power</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          olt.powerStatus === 'on' 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {olt.powerStatus === 'on' ? 'ON' : 'OFF'}
                        </span>
                        <span className="text-xs text-gray-600">({olt.oltPower} Port)</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openMapView(olt);
                          }}
                          className="flex-1 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 transition-all duration-300 text-xs h-8"
                        >
                          <MapPin className="h-3 w-3 mr-1" />
                          Map
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openViewDialog(olt);
                          }}
                          className="bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 transition-all duration-300 text-xs h-8"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDialog(olt);
                          }}
                          className="bg-orange-50 text-orange-700 hover:bg-orange-100 hover:text-orange-800 transition-all duration-300 text-xs h-8"
                          title="Coming Soon"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteDialog(olt);
                          }}
                          className="bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 transition-all duration-300 text-xs h-8"
                          title="Coming Soon"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create OLT Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
          <DialogTitle>Add New OLT - Coming Soon</DialogTitle>
          <DialogDescription>Create functionality will be available in the next update</DialogDescription>
        </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="oltId">OLT ID</Label>
              <Input id="oltId" value={createForm.oltId} onChange={(e) => setCreateForm({ ...createForm, oltId: e.target.value })} placeholder="OLT1095" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} placeholder="SAMRALA-03" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oltIp">IP Address</Label>
              <Input id="oltIp" value={createForm.oltIp} onChange={(e) => setCreateForm({ ...createForm, oltIp: e.target.value })} placeholder="192.154.1.10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="macAddress">MAC Address</Label>
              <Input id="macAddress" value={createForm.macAddress} onChange={(e) => setCreateForm({ ...createForm, macAddress: e.target.value })} placeholder="32:1D:2B:3F:4D:5X" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number</Label>
              <Input id="serialNumber" value={createForm.serialNumber} onChange={(e) => setCreateForm({ ...createForm, serialNumber: e.target.value })} placeholder="SN12ND047" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oltType">OLT Type</Label>
              <Select value={createForm.oltType} onValueChange={(value) => setCreateForm({ ...createForm, oltType: value as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="epon">EPON</SelectItem>
                  <SelectItem value="gpon">GPON</SelectItem>
                  {/* <SelectItem value="xgs-pon">XGS-PON</SelectItem> */}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input id="latitude" type="number" step="0.0001" value={createForm.latitude} onChange={(e) => setCreateForm({ ...createForm, latitude: parseFloat(e.target.value) })} placeholder="30.84" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input id="longitude" type="number" step="0.0001" value={createForm.longitude} onChange={(e) => setCreateForm({ ...createForm, longitude: parseFloat(e.target.value) })} placeholder="76.19" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateOLT} disabled={loading}>{loading ? 'Processing...' : 'Coming Soon'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit OLT Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
          <DialogTitle>Edit OLT - Coming Soon</DialogTitle>
          <DialogDescription>Edit functionality will be available in the next update</DialogDescription>
        </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" value={editForm.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-oltIp">IP Address</Label>
              <Input id="edit-oltIp" value={editForm.oltIp || ''} onChange={(e) => setEditForm({ ...editForm, oltIp: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={editForm.status || ''} onValueChange={(value) => setEditForm({ ...editForm, status: value })}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-oltType">OLT Type</Label>
              <Select value={editForm.oltType || ''} onValueChange={(value) => setEditForm({ ...editForm, oltType: value })}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="epon">EPON</SelectItem>
                  <SelectItem value="gpon">GPON</SelectItem>
                  <SelectItem value="xgs-pon">XGS-PON</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-powerStatus">Power Status</Label>
              <Select value={editForm.powerStatus || ''} onValueChange={(value) => setEditForm({ ...editForm, powerStatus: value })}>
                <SelectTrigger><SelectValue placeholder="Select power status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="on">ON</SelectItem>
                  <SelectItem value="off">OFF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-oltPower">Power (W)</Label>
              <Input id="edit-oltPower" type="number" value={editForm.oltPower || ''} onChange={(e) => setEditForm({ ...editForm, oltPower: parseInt(e.target.value) })} min="0" max="10" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditOLT} disabled={loading}>{loading ? 'Processing...' : 'Coming Soon'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete OLT Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
                  <DialogHeader>
          <DialogTitle>Delete OLT - Coming Soon</DialogTitle>
          <DialogDescription>Delete functionality will be available in the next update</DialogDescription>
        </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                       <Button variant="destructive" onClick={handleDeleteOLT} disabled={loading}>{loading ? 'Processing...' : 'Coming Soon'}</Button>
         </DialogFooter>
       </DialogContent>
     </Dialog>

     {/* Image Modal */}
     <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
       <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
         <DialogHeader>
           <DialogTitle>{selectedOLTName} - All Images</DialogTitle>
           <DialogDescription>View all attachments for this OLT device</DialogDescription>
         </DialogHeader>
         <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
           {selectedImages.map((attachment, index) => (
             <div key={index} className="relative group">
               <img 
                 src={`${BASE_URL}${attachment}`}
                 alt={`${selectedOLTName} - Image ${index + 1}`}
                 className="w-full h-32 object-cover rounded-lg border border-gray-200 hover:border-blue-400 transition-all duration-300 cursor-pointer hover:scale-105"
                 onClick={() => handleImageClick(attachment, selectedOLTName)}
                 onError={(e) => {
                   const target = e.target as HTMLImageElement;
                   target.style.display = 'none';
                   const fallback = target.nextElementSibling as HTMLElement;
                   if (fallback) fallback.style.display = 'flex';
                 }}
               />
               {/* Fallback placeholder */}
               <div className="w-full h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center border border-gray-200 hidden">
                 <ImageIcon className="h-8 w-8 text-blue-500" />
               </div>
               {/* Image path tooltip */}
               <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                 {attachment.split('/').pop()}
               </div>
             </div>
           ))}
         </div>
         <DialogFooter>
           <Button variant="outline" onClick={() => setIsImageModalOpen(false)}>Close</Button>
         </DialogFooter>
       </DialogContent>
     </Dialog>
   </div>
 </MainLayout>
 );
}
