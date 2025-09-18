import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, Globe, Server, Zap, Hash, Calendar, User, Image as ImageIcon, Download, ExternalLink, AlertTriangle, CheckCircle, XCircle, Clock, ChevronDown, ChevronRight, Users, Network, Router, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { MainLayout } from '@/components/layout/main-layout';
import { BASE_URL } from '@/api';

// Device Interfaces
interface DeviceOutput {
  type: 'user' | 'ms' | 'subms' | 'fdb' | 'x2';
  id: string;
  description: string;
}

interface MSDevice {
  ms_id: string;
  ms_name: string;
  ms_type: string;
  location: [number, number];
  input: {
    type: string;
    id: string;
  };
  outputs: DeviceOutput[];
  totalPorts: number;
  activePorts: number;
  availablePorts: number;
}

interface FDBDevice {
  fdb_id: string;
  fdb_name: string;
  fdb_power: number;
  location: [number, number];
  input: {
    type: string;
    id: string;
  };
  outputs: DeviceOutput[];
  totalPorts: number;
  activePorts: number;
  availablePorts: number;
  customers: any[];
}

interface SubMSDevice {
  subms_id: string;
  subms_name: string;
  subms_type: string;
  location: [number, number];
  input: {
    type: string;
    id: string;
  };
  outputs: DeviceOutput[];
  totalPorts: number;
  activePorts: number;
  availablePorts: number;
}

interface X2Device {
  x2_id: string;
  x2_name: string;
  x2_power: number;
  location: [number, number];
  input: {
    type: string;
    id: string;
  };
  outputs: DeviceOutput[];
  totalPorts: number;
  activePorts: number;
  availablePorts: number;
  customers: any[];
}

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
  outputs: DeviceOutput[];
  createdAt: string;
  updatedAt: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  totalPorts?: number;
  activePorts?: number;
  availablePorts?: number;
  ms_devices?: MSDevice[];
  fdb_devices?: FDBDevice[];
  subms_devices?: SubMSDevice[];
  x2_devices?: X2Device[];
  ownedBy?: {
    _id: string;
    email: string;
  };
}

// Device Tree Node Component
interface DeviceTreeNodeProps {
  device: any;
  level: number;
  olt: OLT;
  expandedDevices: Set<string>;
  toggleDeviceExpansion: (deviceId: string) => void;
  handleDeviceClick: (device: any, deviceType: string) => void;
  getDeviceIcon: (deviceType: string) => JSX.Element;
  getDeviceTypeBadge: (deviceType: string) => JSX.Element;
  findConnectedDevices: (parentId: string, parentType: string) => any[];
}

const DeviceTreeNode: React.FC<DeviceTreeNodeProps> = ({
  device,
  level,
  olt,
  expandedDevices,
  toggleDeviceExpansion,
  handleDeviceClick,
  getDeviceIcon,
  getDeviceTypeBadge,
  findConnectedDevices,
}) => {
  const deviceId = device[`${device.deviceType}_id`];
  const deviceName = device[`${device.deviceType}_name`];
  const isExpanded = expandedDevices.has(deviceId);
  const connectedDevices = findConnectedDevices(deviceId, device.deviceType);
  const hasChildren = connectedDevices.length > 0;

  const marginLeft = level * 24;

  return (
    <div>
      <div
        className="flex items-center gap-2 p-2 rounded-lg border hover:bg-gray-50 cursor-pointer"
        style={{ marginLeft: `${marginLeft}px` }}
      >
        {hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              toggleDeviceExpansion(deviceId);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        )}
        {!hasChildren && <div className="w-6" />}
        
        <div 
          className="flex items-center gap-2 flex-1"
          onClick={() => handleDeviceClick(device, device.deviceType)}
        >
          {getDeviceIcon(device.deviceType)}
          <span className="font-medium">{deviceName}</span>
          <Badge variant="outline" className="text-xs">{deviceId}</Badge>
          {getDeviceTypeBadge(device.deviceType)}
          
          <div className="ml-auto flex items-center gap-2 text-sm text-gray-600">
            <span>Ports: {device.activePorts}/{device.totalPorts}</span>
            <span>Available: {device.availablePorts}</span>
          </div>
        </div>
      </div>

      {/* Render children if expanded */}
      {isExpanded && hasChildren && (
        <div className="space-y-1 mt-1">
          {connectedDevices.map((childDevice) => (
            <DeviceTreeNode
              key={`${childDevice.deviceType}-${childDevice[`${childDevice.deviceType}_id`]}`}
              device={childDevice}
              level={level + 1}
              olt={olt}
              expandedDevices={expandedDevices}
              toggleDeviceExpansion={toggleDeviceExpansion}
              handleDeviceClick={handleDeviceClick}
              getDeviceIcon={getDeviceIcon}
              getDeviceTypeBadge={getDeviceTypeBadge}
              findConnectedDevices={findConnectedDevices}
            />
          ))}
        </div>
      )}

      {/* Show outputs if device has any */}
      {isExpanded && device.outputs && device.outputs.length > 0 && (
        <div className="space-y-1 mt-1">
          {device.outputs.map((output: DeviceOutput, index: number) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-200"
              style={{ marginLeft: `${marginLeft + 24}px` }}
            >
              {getDeviceIcon(output.type)}
              <span className="text-sm text-gray-700">{output.description}</span>
              <Badge variant="secondary" className="text-xs">{output.type.toUpperCase()}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function OLTDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [olt, setOlt] = useState<OLT | null>(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState<string>('');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [expandedDevices, setExpandedDevices] = useState<Set<string>>(new Set());
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);

  // Fetch OLT data from location state or API
  useEffect(() => {
    const fetchOLTData = async () => {
      try {
        // Check if OLT data was passed via navigation state
        const passedOltData = (location.state as any)?.oltData;
        
        if (passedOltData) {
          // Use the passed data directly
          setOlt(passedOltData);
          setLoading(false);
          
          // Get address from coordinates
          getAddressFromCoordinates(passedOltData.latitude, passedOltData.longitude);
        } else {
          // No data passed via navigation state, redirect to OLT management
          toast({
            title: "Redirecting",
            description: "No OLT data found. Redirecting to OLT Management page.",
            variant: "destructive",
          });
          
          // Navigate back to OLT management page
          navigate('/olt-management');
          return;
        }
      } catch (error) {
        console.error('Error fetching OLT data:', error);
        setLoading(false);
        toast({
          title: "Error",
          description: "Failed to fetch OLT data",
          variant: "destructive",
        });
      }
    };

    fetchOLTData();
  }, [id, location.state, toast]);

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

  const toggleDeviceExpansion = (deviceId: string) => {
    const newExpanded = new Set(expandedDevices);
    if (newExpanded.has(deviceId)) {
      newExpanded.delete(deviceId);
    } else {
      newExpanded.add(deviceId);
    }
    setExpandedDevices(newExpanded);
  };

  const handleDeviceClick = (device: any, deviceType: string) => {
    setSelectedDevice({ ...device, deviceType });
    setIsDeviceModalOpen(true);
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'ms': return <Network className="h-4 w-4" />;
      case 'fdb': return <Router className="h-4 w-4" />;
      case 'subms': return <Wifi className="h-4 w-4" />;
      case 'x2': return <Server className="h-4 w-4" />;
      case 'user': return <Users className="h-4 w-4" />;
      default: return <Server className="h-4 w-4" />;
    }
  };

  const getDeviceTypeBadge = (deviceType: string) => {
    const variants: Record<string, string> = {
      'ms': 'bg-blue-100 text-blue-800 border-blue-200',
      'fdb': 'bg-green-100 text-green-800 border-green-200',
      'subms': 'bg-purple-100 text-purple-800 border-purple-200',
      'x2': 'bg-orange-100 text-orange-800 border-orange-200',
      'user': 'bg-pink-100 text-pink-800 border-pink-200'
    };

    return (
      <Badge className={variants[deviceType] || 'bg-gray-100 text-gray-800 border-gray-200'}>
        {deviceType.toUpperCase()}
      </Badge>
    );
  };

  const findConnectedDevices = (parentId: string, parentType: string) => {
    const connected: any[] = [];
    
    if (!olt) return connected;

    // Find MS devices connected to this parent
    olt.ms_devices?.forEach(ms => {
      if (ms.input.type === parentType && ms.input.id === parentId) {
        connected.push({ ...ms, deviceType: 'ms' });
      }
    });

    // Find FDB devices connected to this parent
    olt.fdb_devices?.forEach(fdb => {
      if (fdb.input.type === parentType && fdb.input.id === parentId) {
        connected.push({ ...fdb, deviceType: 'fdb' });
      }
    });

    // Find SUBMS devices connected to this parent
    olt.subms_devices?.forEach(subms => {
      if (subms.input.type === parentType && subms.input.id === parentId) {
        connected.push({ ...subms, deviceType: 'subms' });
      }
    });

    // Find X2 devices connected to this parent
    olt.x2_devices?.forEach(x2 => {
      if (x2.input.type === parentType && x2.input.id === parentId) {
        connected.push({ ...x2, deviceType: 'x2' });
      }
    });

    return connected;
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
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
                      <label className="text-sm font-medium text-gray-500">Total Ports</label>
                      <p className="text-sm text-gray-900">{olt.oltPower} Ports</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Port Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="h-5 w-5" />
                    Port Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{olt.totalPorts || 0}</p>
                      <label className="text-xs font-medium text-gray-500">Total Ports</label>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{olt.activePorts || 0}</p>
                      <label className="text-xs font-medium text-gray-500">Active Ports</label>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{olt.availablePorts || 0}</p>
                      <label className="text-xs font-medium text-gray-500">Available Ports</label>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${((olt.activePorts || 0) / (olt.totalPorts || 1)) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-center text-gray-500">
                    Port Utilization: {Math.round(((olt.activePorts || 0) / (olt.totalPorts || 1)) * 100)}%
                  </p>
                </CardContent>
              </Card>

              {/* Connected Devices Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="h-5 w-5" />
                    Connected Devices
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Network className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">MS Devices</span>
                    </div>
                    <Badge variant="outline">{olt.ms_devices?.length || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Router className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">FDB Devices</span>
                    </div>
                    <Badge variant="outline">{olt.fdb_devices?.length || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">SUBMS Devices</span>
                    </div>
                    <Badge variant="outline">{olt.subms_devices?.length || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium">X2 Devices</span>
                    </div>
                    <Badge variant="outline">{olt.x2_devices?.length || 0}</Badge>
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
            {/* Device Hierarchy Tree */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Device Hierarchy
                </CardTitle>
                <CardDescription>
                  Connected devices in hierarchical structure. Click on devices to view details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {/* OLT Root */}
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Server className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">{olt.name} ({olt.oltId})</span>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">OLT</Badge>
                    <div className="ml-auto flex items-center gap-2 text-sm text-blue-700">
                      <span>Ports: {olt.activePorts || 0}/{olt.totalPorts || 0}</span>
                      <span>Available: {olt.availablePorts || 0}</span>
                    </div>
                  </div>

                  {/* Connected Devices */}
                  {findConnectedDevices(olt.oltId, 'olt').map((device) => (
                    <DeviceTreeNode
                      key={`${device.deviceType}-${device[`${device.deviceType}_id`]}`}
                      device={device}
                      level={1}
                      olt={olt}
                      expandedDevices={expandedDevices}
                      toggleDeviceExpansion={toggleDeviceExpansion}
                      handleDeviceClick={handleDeviceClick}
                      getDeviceIcon={getDeviceIcon}
                      getDeviceTypeBadge={getDeviceTypeBadge}
                      findConnectedDevices={findConnectedDevices}
                    />
                  ))}

                  {findConnectedDevices(olt.oltId, 'olt').length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No devices connected to this OLT
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Device Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Network className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">MS Devices</p>
                      <p className="text-2xl font-bold text-blue-600">{olt.ms_devices?.length || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Router className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">FDB Devices</p>
                      <p className="text-2xl font-bold text-green-600">{olt.fdb_devices?.length || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Wifi className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium">SUBMS Devices</p>
                      <p className="text-2xl font-bold text-purple-600">{olt.subms_devices?.length || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Server className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium">X2 Devices</p>
                      <p className="text-2xl font-bold text-orange-600">{olt.x2_devices?.length || 0}</p>
                    </div>
                  </div>
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
                      <div className="mt-1">{getOLTTypeBadge(olt.oltType)}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Serial Number</label>
                      <p className="text-sm font-mono text-gray-900">{olt.serialNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Total Ports</label>
                      <p className="text-sm text-gray-900">{olt.totalPorts} Ports</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Port Configuration</label>
                      <p className="text-sm text-gray-900">{olt.oltPower} Port OLT</p>
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

              {/* Device Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="h-5 w-5" />
                    Device Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Total Connected Devices</label>
                      <p className="text-lg font-semibold text-blue-600">
                        {(olt.ms_devices?.length || 0) + (olt.fdb_devices?.length || 0) + (olt.subms_devices?.length || 0) + (olt.x2_devices?.length || 0)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Active Connections</label>
                      <p className="text-lg font-semibold text-green-600">
                        {(olt.ms_devices?.reduce((acc, ms) => acc + ms.activePorts, 0) || 0) + 
                         (olt.fdb_devices?.reduce((acc, fdb) => acc + fdb.activePorts, 0) || 0) + 
                         (olt.subms_devices?.reduce((acc, subms) => acc + subms.activePorts, 0) || 0) + 
                         (olt.x2_devices?.reduce((acc, x2) => acc + x2.activePorts, 0) || 0)}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>MS Devices</span>
                      <span>{olt.ms_devices?.length || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>FDB Devices</span>
                      <span>{olt.fdb_devices?.length || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>SUBMS Devices</span>
                      <span>{olt.subms_devices?.length || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>X2 Devices</span>
                      <span>{olt.x2_devices?.length || 0}</span>
                    </div>
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
                  <div>
                    <label className="text-sm font-medium text-gray-500">Power Status</label>
                    <div className="mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        olt.powerStatus === 'on' 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {olt.powerStatus === 'on' ? 'ONLINE' : 'OFFLINE'}
                      </span>
                    </div>
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
                      <p className="text-sm font-mono text-gray-900">{olt.latitude}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Longitude</label>
                      <p className="text-sm font-mono text-gray-900">{olt.longitude}</p>
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
                  <Button 
                    variant="outline" 
                    className="w-full mt-2"
                    onClick={() => window.open(`https://maps.google.com/?q=${olt.latitude},${olt.longitude}`, '_blank')}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    View on Google Maps
                  </Button>
                </CardContent>
              </Card>

              {/* Owner Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Owner Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Owner Email</label>
                    <p className="text-sm text-gray-900">{olt.ownedBy?.email || 'Not assigned'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Owner ID</label>
                    <p className="text-sm font-mono text-gray-900">{olt.ownedBy?._id || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">OLT ID</label>
                    <p className="text-sm font-mono text-gray-900">{olt.oltId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Database ID</label>
                    <p className="text-sm font-mono text-gray-900">{olt._id}</p>
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

        {/* Device Detail Modal */}
        <Dialog open={isDeviceModalOpen} onOpenChange={setIsDeviceModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedDevice && getDeviceIcon(selectedDevice.deviceType)}
                Device Details
              </DialogTitle>
              <DialogDescription>
                {selectedDevice && `${selectedDevice.deviceType.toUpperCase()} Device Information`}
              </DialogDescription>
            </DialogHeader>
            {selectedDevice && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Device ID</label>
                    <p className="text-sm text-gray-900 font-mono">
                      {selectedDevice[`${selectedDevice.deviceType}_id`]}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Device Name</label>
                    <p className="text-sm text-gray-900">
                      {selectedDevice[`${selectedDevice.deviceType}_name`]}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Device Type</label>
                    <div className="mt-1">
                      {getDeviceTypeBadge(selectedDevice.deviceType)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      {selectedDevice.deviceType === 'ms' || selectedDevice.deviceType === 'subms' ? 'Type' : 'Power'}
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedDevice[`${selectedDevice.deviceType}_type`] || 
                       selectedDevice[`${selectedDevice.deviceType}_power`] || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Total Ports</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedDevice.totalPorts}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Active Ports</label>
                    <p className="text-lg font-semibold text-green-600">{selectedDevice.activePorts}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Available Ports</label>
                    <p className="text-lg font-semibold text-blue-600">{selectedDevice.availablePorts}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <p className="text-sm text-gray-900">
                    Lat: {selectedDevice.location[0]}, Lng: {selectedDevice.location[1]}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Input Connection</label>
                  <div className="flex items-center gap-2 mt-1">
                    {getDeviceIcon(selectedDevice.input.type)}
                    <span className="text-sm text-gray-900">{selectedDevice.input.id}</span>
                    <Badge variant="outline" className="text-xs">
                      {selectedDevice.input.type.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {selectedDevice.outputs && selectedDevice.outputs.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Output Connections</label>
                    <div className="space-y-2 mt-1">
                      {selectedDevice.outputs.map((output: DeviceOutput, index: number) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          {getDeviceIcon(output.type)}
                          <span className="text-sm text-gray-700">{output.description}</span>
                          <Badge variant="secondary" className="text-xs">{output.type.toUpperCase()}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDeviceModalOpen(false)}>
                    Close
                  </Button>
                  <Button 
                    onClick={() => window.open(`https://maps.google.com/?q=${selectedDevice.location[0]},${selectedDevice.location[1]}`, '_blank')}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    View Location
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
