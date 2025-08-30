/// <reference types="google.maps" />

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Trash2, Eye, RefreshCw, AlertTriangle, CheckCircle, XCircle, Clock, Server, MapPin, Globe, Zap, Image as ImageIcon, Maximize2, Minimize2 } from 'lucide-react';
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

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = 'AIzaSyCf_6aGwNfuYI0Ylc0aI2F0H-75qepzIco';


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
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedOLTName, setSelectedOLTName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);
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

  // Load Google Maps
  useEffect(() => {
    if (window.google && window.google.maps) {
      setMapLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    const center = { lat: 30.84, lng: 76.19 };
    const newMap = new google.maps.Map(mapRef.current, {
      center,
      zoom: 8,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] }
      ],
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: true,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false
    });

    setMap(newMap);
  }, [mapLoaded]);

  // Add markers
  useEffect(() => {
    if (!map || !filteredOlts.length) return;

    markers.forEach(marker => marker.setMap(null));
    const newMarkers: google.maps.Marker[] = [];

    filteredOlts.forEach((olt) => {
      const marker = new google.maps.Marker({
        position: { lat: olt.latitude, lng: olt.longitude },
        map,
        title: olt.name,
        icon: {
          url: getMarkerIcon(olt.status),
          scaledSize: new google.maps.Size(32, 32)
        }
      });

      const infoWindow = new google.maps.InfoWindow({
        content: createInfoWindowContent(olt)
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);

    if (newMarkers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      newMarkers.forEach(marker => {
        bounds.extend(marker.getPosition()!);
      });
      map.fitBounds(bounds);
    }
  }, [map, filteredOlts]);

  const getMarkerIcon = (status: string) => {
    const baseUrl = 'https://maps.google.com/mapfiles/ms/icons/';
    switch (status) {
      case 'active': return baseUrl + 'green-dot.png';
      case 'inactive': return baseUrl + 'red-dot.png';
      case 'maintenance': return baseUrl + 'yellow-dot.png';
      case 'error': return baseUrl + 'red-dot.png';
      default: return baseUrl + 'blue-dot.png';
    }
  };

  const createInfoWindowContent = (olt: OLT) => {
    return `
      <div style="padding: 12px; min-width: 200px;">
        <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
          ${olt.name}
        </h3>
        <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 12px; font-family: monospace;">
          ${olt.oltId}
        </p>
        <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 12px;">
          <strong>IP:</strong> ${olt.oltIp}
        </p>
        <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 12px;">
          <strong>Status:</strong> <span style="color: ${getStatusColor(olt.status)}; font-weight: 600;">${olt.status}</span>
        </p>
        <div style="margin-top: 8px;">
          <button onclick="window.open('/olt-management/${olt._id}', '_blank')" 
                  style="background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">
            View Details
          </button>
        </div>
      </div>
    `;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#059669';
      case 'inactive': return '#dc2626';
      case 'maintenance': return '#d97706';
      case 'error': return '#dc2626';
      default: return '#6b7280';
    }
  };

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
      'active': 'bg-green-100 text-green-800 border-green-200',
      'inactive': 'bg-red-100 text-red-800 border-red-200',
      'maintenance': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'error': 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800 border-gray-200'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getOLTTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      'epon': 'bg-blue-100 text-blue-800 border-blue-200',
      'gpon': 'bg-purple-100 text-purple-800 border-purple-200',
      'xgs-pon': 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };

    return (
      <Badge className={variants[type] || 'bg-gray-100 text-gray-800 border-gray-200'}>
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
    navigate(`/olt-management/${olt._id}`);
  };

  const toggleMapFullscreen = () => {
    setIsMapFullscreen(!isMapFullscreen);
  };

  const centerMapOnOLT = (olt: OLT) => {
    if (map) {
      map.setCenter({ lat: olt.latitude, lng: olt.longitude });
      map.setZoom(12);
    }
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

  // Add timeout for image loading
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
    
    filteredOlts.forEach((olt, oltIndex) => {
      olt.attachments.slice(0, 3).forEach((attachment, imgIndex) => {
        const timeout = setTimeout(() => {
          const loadingSpinner = document.getElementById(`loading-${olt._id}-${imgIndex}`);
          if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
            console.log(`Timeout: Hiding loading spinner for ${olt.name} image ${imgIndex + 1}`);
          }
        }, 10000); // 10 second timeout
        
        timeouts.push(timeout);
      });
    });

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [filteredOlts]);

  return (
    <MainLayout title="OLT Management">
      <div className={`h-screen flex flex-col ${isMapFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">OLT Management</h1>
            <p className="text-gray-600 mt-1">Manage Optical Line Terminals and monitor network infrastructure</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={toggleMapFullscreen} className="flex items-center gap-2">
              {isMapFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              {isMapFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
            </Button>
                       <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-2" title="Coming Soon">
             <Plus className="h-4 w-4" />
             Add OLT
           </Button>
           <Button 
             variant="outline" 
             onClick={() => {
               console.log('Testing image URLs:');
               filteredOlts.forEach(olt => {
                 olt.attachments.slice(0, 3).forEach((attachment, index) => {
                   console.log(`${olt.name} Image ${index + 1}: ${BASE_URL}${attachment}`);
                 });
               });
             }}
             className="flex items-center gap-2"
           >
             Test Images
           </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search OLTs by name, ID, IP, or serial number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] h-11">
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
            <SelectTrigger className="w-[180px] h-11">
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
            className="h-11 px-6"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - OLT Cards */}
        <div className={`${isMapFullscreen ? 'hidden' : 'w-1/2'} border-r border-gray-200 overflow-y-auto p-6 bg-gray-50`}>
          {oltLoading ? (
            <div className="flex items-center justify-center h-64">
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
              
              <div className="space-y-4">
                {filteredOlts.map((olt) => (
              <Card key={olt._id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer bg-white border-gray-200">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <CardTitle className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {olt.name}
                      </CardTitle>
                      <CardDescription className="text-sm font-mono text-blue-600 bg-blue-50 px-3 py-1 rounded-md border border-blue-200">
                        {olt.oltId}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(olt.status)}
                      <div className="transform group-hover:scale-105 transition-transform">
                        {getStatusBadge(olt.status)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                                     {/* OLT Image Gallery */}
                   {olt.attachments.length > 0 && (
                     <div className="relative">
                       <div className="flex gap-3 overflow-x-auto pb-2">
                         {olt.attachments.slice(0, 3).map((attachment, index) => (
                           <div key={index} className="relative flex-shrink-0 group/image">
                                                           <div className="relative group/tooltip">
                                {/* Loading spinner - shown initially */}
                                <div className="absolute inset-0 w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center z-10" id={`loading-${olt._id}-${index}`}>
                                  <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                                </div>
                                
                                <img 
                                  src={`${BASE_URL}${attachment}`}
                                  alt={`${olt.name} - Image ${index + 1}`}
                                  className="w-20 h-20 rounded-lg object-cover border-2 border-blue-200 group-hover/image:border-blue-400 transition-all duration-300 cursor-pointer hover:scale-105"
                                  onClick={() => handleImageClick(attachment, olt.name)}
                                  onLoadStart={() => console.log(`Starting to load: ${BASE_URL}${attachment}`)}
                                  onLoad={(e) => {
                                    // Hide loading spinner when image loads
                                    const target = e.target as HTMLImageElement;
                                    const loadingSpinner = document.getElementById(`loading-${olt._id}-${index}`);
                                    if (loadingSpinner) {
                                      loadingSpinner.style.display = 'none';
                                      console.log(`Image loaded successfully: ${olt.name} image ${index + 1}`);
                                    }
                                  }}
                                  onError={(e) => {
                                    // Fallback to placeholder if image fails to load
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const fallback = document.getElementById(`fallback-${olt._id}-${index}`);
                                    if (fallback) fallback.style.display = 'flex';
                                    console.log(`Image failed to load: ${olt.name} image ${index + 1} - ${BASE_URL}${attachment}`);
                                  }}
                                />
                                
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                                  {`${BASE_URL}${attachment}`}
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                </div>
                              </div>
                                                           {/* Fallback placeholder */}
                              <div className="absolute inset-0 w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center border-2 border-blue-200 group-hover/image:border-blue-400 transition-all duration-300 hidden" id={`fallback-${olt._id}-${index}`}>
                                <ImageIcon className="h-8 w-8 text-blue-500 group-hover/image:scale-110 transition-transform" />
                              </div>
                             {index === 2 && olt.attachments.length > 3 && (
                               <div 
                                 className="absolute inset-0 bg-gradient-to-t from-blue-600/80 to-blue-400/60 rounded-lg flex items-center justify-center rounded-lg cursor-pointer hover:from-blue-700/90 hover:to-blue-500/70 transition-all duration-200"
                                 onClick={() => openImageModal(olt.attachments, olt.name)}
                                 title={`View all ${olt.attachments.length} images`}
                               >
                                 <span className="text-white text-sm font-bold">+{olt.attachments.length - 3}</span>
                               </div>
                             )}
                           </div>
                         ))}
                       </div>
                       {olt.attachments.length > 3 && (
                         <div className="mt-2 text-center">
                           <button
                             onClick={() => openImageModal(olt.attachments, olt.name)}
                             className="text-xs text-blue-600 hover:text-blue-800 underline cursor-pointer transition-colors duration-200"
                           >
                             View all {olt.attachments.length} images
                           </button>
                         </div>
                       )}
                     </div>
                   )}

                  {/* OLT Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-blue-500 rounded-lg">
                          <Globe className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">IP Address</span>
                      </div>
                      <span className="font-mono text-sm text-gray-900 font-semibold">{olt.oltIp}</span>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-green-500 rounded-lg">
                          <MapPin className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Location</span>
                      </div>
                      <span className="text-sm text-gray-900 font-semibold">{olt.latitude.toFixed(4)}, {olt.longitude.toFixed(4)}</span>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-purple-500 rounded-lg">
                          <Server className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Type</span>
                      </div>
                      <div className="transform group-hover:scale-105 transition-transform">
                        {getOLTTypeBadge(olt.oltType)}
                      </div>
                    </div>
                    
                                         <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                       <div className="flex items-center gap-2 mb-2">
                         <div className="p-2 bg-yellow-500 rounded-lg">
                           <Zap className="h-4 w-4 text-white" />
                         </div>
                         <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Power</span>
                       </div>
                       <span className="text-sm text-gray-900 font-semibold">
                         {olt.oltPower}W 
                         <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                           olt.powerStatus === 'on' 
                             ? 'bg-green-100 text-green-800 border border-green-200' 
                             : 'bg-red-100 text-red-800 border border-red-200'
                         }`}>
                           {olt.powerStatus === 'on' ? 'ON' : 'OFF'}
                         </span>
                       </span>
                     </div>
                     
                     <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                       <div className="flex items-center gap-2 mb-2">
                         <div className="p-2 bg-indigo-500 rounded-lg">
                           <Server className="h-4 w-4 text-white" />
                         </div>
                         <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Ports</span>
                       </div>
                       <span className="text-sm text-gray-900 font-semibold">
                         {olt.activePorts || 0}/{olt.totalPorts || 0} Active
                       </span>
                       <div className="mt-1">
                         <div className="w-full bg-gray-200 rounded-full h-2">
                           <div 
                             className="bg-indigo-500 h-2 rounded-full transition-all duration-300" 
                             style={{ width: `${olt.totalPorts ? (olt.activePorts || 0) / olt.totalPorts * 100 : 0}%` }}
                           ></div>
                         </div>
                       </div>
                     </div>
                   </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => centerMapOnOLT(olt)}
                      className="flex-1 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 transition-all duration-300"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Show on Map
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openViewDialog(olt)}
                      className="bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 transition-all duration-300"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(olt)}
                      className="bg-orange-50 text-orange-700 hover:bg-orange-100 hover:text-orange-800 transition-all duration-300"
                      title="Coming Soon"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDeleteDialog(olt)}
                      className="bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 transition-all duration-300"
                      title="Coming Soon"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
              </div>
            </>
          )}
        </div>

        {/* Right Side - Google Map */}
        <div className={`${isMapFullscreen ? 'w-full' : 'w-1/2'} bg-gray-100 relative`}>
          {!mapLoaded ? (
            <div className="absolute inset-0 bg-white flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Google Maps</h3>
                <p className="text-gray-500">Please wait while we initialize the map</p>
              </div>
            </div>
          ) : (
            <div ref={mapRef} className="w-full h-full" />
          )}
          
          {/* Map Controls */}
          {mapLoaded && (
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white/95 backdrop-blur-sm border-gray-200 hover:bg-white hover:border-gray-300"
                onClick={() => {
                  if (map) {
                    const center = { lat: 30.84, lng: 76.19 };
                    map.setCenter(center);
                    map.setZoom(8);
                  }
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset View
              </Button>
              <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-gray-200">
                <div className="text-xs font-medium text-gray-700 mb-2">Map Legend</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Inactive</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Maintenance</span>
                  </div>
                </div>
              </div>
            </div>
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
                  <SelectItem value="xgs-pon">XGS-PON</SelectItem>
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
