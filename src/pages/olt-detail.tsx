import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Globe, Server, Zap, Hash, Calendar, User, Image as ImageIcon, Download, ExternalLink, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { MainLayout } from '@/components/layout/main-layout';
import { BASE_URL } from '@/api';

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

export default function OLTDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [olt, setOlt] = useState<OLT | null>(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState<string>('');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');

  // Mock data - replace with actual API call
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockOlt: OLT = {
        _id: id || '1',
        oltId: 'OLT8814',
        name: 'TESTING OLT',
        oltIp: '192.168.1.1',
        macAddress: '10:10:10:10:10:11',
        serialNumber: '9876543210',
        latitude: 37.4219983,
        longitude: -122.084,
        oltType: 'epon',
        powerStatus: 'on',
        oltPower: 16,
        status: 'active',
        dnsServers: [],
        attachments: [
          '/view/image/4123d2bc-fa8e-4a33-bc0e-900effb249c4-1756580760379.jpg',
          '/view/image/bb49a764-4b4d-4a88-9f1c-914c0033cb3d-1756580760563.jpg',
          '/view/image/538c7e7f-fca1-4e1c-b4be-fb10951ad16c-1756580760741.jpg',
          '/view/image/570f1f5c-f888-40eb-8310-f54551d78492-1756580760746.jpg'
        ],
        outputs: [],
        createdAt: '2025-08-30T19:06:00.924Z',
        updatedAt: '2025-08-30T19:06:00.924Z',
        location: {
          type: 'Point',
          coordinates: [-122.084, 37.4219983]
        },
        totalPorts: 16,
        activePorts: 1,
        availablePorts: 15,
        ms_devices: [
          {
            ms_id: 'MS6261',
            ms_name: 'MY FIRST MS',
            ms_type: '1x8',
            location: [37.4219983, -122.084],
            input: {
              type: 'olt',
              id: 'OLT8814'
            },
            outputs: [],
            totalPorts: 8,
            activePorts: 1,
            availablePorts: 7
          }
        ],
        fdb_devices: [],
        subms_devices: [
          {
            subms_id: 'SUBMS1909',
            subms_name: 'MY FIRST SUB MS',
            subms_type: '1x4',
            location: [37.4219983, -122.084],
            input: {
              type: 'ms',
              id: 'MS6261'
            },
            outputs: [],
            totalPorts: 4,
            activePorts: 0,
            availablePorts: 4
          }
        ],
        x2_devices: [],
        ownedBy: {
          _id: '68a976f837283960f117a7c4',
          email: 'sisko.wifiselfcare@yopmail.com'
        }
      };
      setOlt(mockOlt);
      setLoading(false);
      
      // Get address from coordinates
      getAddressFromCoordinates(mockOlt.latitude, mockOlt.longitude);
    }, 1000);
  }, [id]);

  const getAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyCf_6aGwNfuYI0Ylc0aI2F0H-75qepzIco`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        setAddress(data.results[0].formatted_address);
      } else {
        setAddress('Address not available');
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      setAddress('Address not available');
    }
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

  const handleImageClick = (attachment: string) => {
    setSelectedImage(attachment);
    setIsImageModalOpen(true);
  };

  const openImageInNewTab = (attachment: string) => {
    const imageUrl = `${BASE_URL}${attachment}`;
    window.open(imageUrl, '_blank');
  };

  if (loading) {
    return (
      <MainLayout title="OLT Details">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading OLT Details</h3>
            <p className="text-gray-500">Please wait while we fetch the data</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!olt) {
    return (
      <MainLayout title="OLT Not Found">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">OLT Not Found</h3>
            <p className="text-gray-500">The requested OLT could not be found</p>
            <Button onClick={() => navigate('/olt-management')} className="mt-4">
              Back to OLT Management
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`OLT Details - ${olt.name}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/olt-management')} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to OLT Management
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{olt.name}</h1>
              <p className="text-gray-600 mt-1">OLT ID: {olt.oltId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(olt.status)}
            {getStatusBadge(olt.status)}
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="devices">Connected Devices</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
            <TabsTrigger value="technical">Technical Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Serial Number</label>
                      <p className="text-sm text-gray-900 font-mono">{olt.serialNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">IP Address</label>
                      <p className="text-sm text-gray-900 font-mono">{olt.oltIp}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">MAC Address</label>
                      <p className="text-sm text-gray-900 font-mono">{olt.macAddress}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">OLT Type</label>
                      <div className="mt-1">{getOLTTypeBadge(olt.oltType)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Power & Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Power & Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Power Status</label>
                      <div className="mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          olt.powerStatus === 'on' 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {olt.powerStatus === 'on' ? 'ON' : 'OFF'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Power Usage</label>
                      <p className="text-sm text-gray-900">{olt.oltPower}W</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Ports</label>
                    <div className="mt-1">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Active: {olt.activePorts || 0}</span>
                        <span>Total: {olt.totalPorts || 0}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${olt.totalPorts ? (olt.activePorts || 0) / olt.totalPorts * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <p className="text-sm text-gray-900">{address || 'Loading address...'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Latitude</label>
                      <p className="text-sm text-gray-900">{olt.latitude}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Longitude</label>
                      <p className="text-sm text-gray-900">{olt.longitude}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(`https://maps.google.com/?q=${olt.latitude},${olt.longitude}`, '_blank')}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    View on Google Maps
                  </Button>
                </CardContent>
              </Card>

              {/* Ownership */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Ownership
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Owner Email</label>
                    <p className="text-sm text-gray-900">{olt.ownedBy?.email || 'Not assigned'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Created</label>
                      <p className="text-sm text-gray-900">{new Date(olt.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Last Updated</label>
                      <p className="text-sm text-gray-900">{new Date(olt.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="devices" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* MS Devices */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    MS Devices ({olt.ms_devices?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {olt.ms_devices && olt.ms_devices.length > 0 ? (
                    <div className="space-y-4">
                      {olt.ms_devices.map((ms, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-900">{ms.ms_name}</h4>
                            <Badge variant="outline">{ms.ms_id}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">Type:</span> {ms.ms_type}
                            </div>
                            <div>
                              <span className="text-gray-500">Ports:</span> {ms.activePorts}/{ms.totalPorts}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No MS devices connected</p>
                  )}
                </CardContent>
              </Card>

              {/* SUBMS Devices */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    SUBMS Devices ({olt.subms_devices?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {olt.subms_devices && olt.subms_devices.length > 0 ? (
                    <div className="space-y-4">
                      {olt.subms_devices.map((subms, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-900">{subms.subms_name}</h4>
                            <Badge variant="outline">{subms.subms_id}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">Type:</span> {subms.subms_type}
                            </div>
                            <div>
                              <span className="text-gray-500">Ports:</span> {subms.activePorts}/{subms.totalPorts}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No SUBMS devices connected</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="attachments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Attachments ({olt.attachments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {olt.attachments.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {olt.attachments.map((attachment, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                          <img 
                            src={`${BASE_URL}${attachment}`}
                            alt={`Attachment ${index + 1}`}
                            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                            onClick={() => handleImageClick(attachment)}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center hidden">
                            <ImageIcon className="h-8 w-8 text-blue-500" />
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => openImageInNewTab(attachment)}
                            className="h-8 w-8 p-0"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="mt-2 text-center">
                          <p className="text-xs text-gray-500">Image {index + 1}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No attachments available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="technical" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Technical Specifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    Technical Specifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">OLT Type</label>
                      <p className="text-sm text-gray-900">{olt.oltType.toUpperCase()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Power Rating</label>
                      <p className="text-sm text-gray-900">{olt.oltPower}W</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Total Ports</label>
                      <p className="text-sm text-gray-900">{olt.totalPorts || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Active Ports</label>
                      <p className="text-sm text-gray-900">{olt.activePorts || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Network Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Network Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">IP Address</label>
                    <p className="text-sm font-mono text-gray-900">{olt.oltIp}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">MAC Address</label>
                    <p className="text-sm font-mono text-gray-900">{olt.macAddress}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">DNS Servers</label>
                    {olt.dnsServers.length > 0 ? (
                      <div className="space-y-1">
                        {olt.dnsServers.map((dns, index) => (
                          <p key={index} className="text-sm font-mono text-gray-900">{dns}</p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No DNS servers configured</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* System Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    System Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Created</label>
                      <p className="text-sm text-gray-900">{new Date(olt.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Last Updated</label>
                      <p className="text-sm text-gray-900">{new Date(olt.updatedAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">{getStatusBadge(olt.status)}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Location Data */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Latitude</label>
                      <p className="text-sm text-gray-900">{olt.latitude}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Longitude</label>
                      <p className="text-sm text-gray-900">{olt.longitude}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Coordinates</label>
                    <p className="text-sm font-mono text-gray-900">
                      [{olt.location.coordinates[0]}, {olt.location.coordinates[1]}]
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <p className="text-sm text-gray-900">{address || 'Loading address...'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Image Modal */}
        <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>OLT Image</DialogTitle>
              <DialogDescription>View attachment for {olt.name}</DialogDescription>
            </DialogHeader>
            <div className="flex justify-center">
              <img 
                src={`${BASE_URL}${selectedImage}`}
                alt="OLT Attachment"
                className="max-w-full max-h-[500px] object-contain rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="max-w-full max-h-[500px] bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center rounded-lg hidden">
                <div className="text-center">
                  <ImageIcon className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                  <p className="text-gray-500">Image could not be loaded</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsImageModalOpen(false)}>
                Close
              </Button>
              <Button onClick={() => openImageInNewTab(selectedImage)}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
