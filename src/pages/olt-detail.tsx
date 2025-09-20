import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, Globe, Server, Zap, Hash, Calendar, User, Image as ImageIcon, Download, ExternalLink, AlertTriangle, CheckCircle, XCircle, Clock, ChevronDown, ChevronRight, Users, Network, Router, Wifi, Plus, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { MainLayout } from '@/components/layout/main-layout';
import { BASE_URL, useGetOltCompleteDataQuery } from '@/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Device Interfaces
interface DeviceOutput {
  type: 'user' | 'ms' | 'subms' | 'fdb' | 'x2';
  id: string;
  description: string;
}

interface MSDevice {
  ms_id: string;
  ms_name: string;
  ms_power: string; // Changed from ms_type to ms_power (e.g., "1x4")
  location: [number, number];
  input: {
    type: string;
    id: string;
  };
  outputs: DeviceOutput[];
  attachments?: string[];
  totalPorts?: number;
  activePorts?: number;
  availablePorts?: number;
}

interface FDBDevice {
  fdb_id: string;
  fdb_name: string;
  fdb_power: number;
  location: [number, number];
  input: {
    type: string;
    id: string;
    port?: number; // Added port for FDB input
  };
  outputs: DeviceOutput[];
  attachments?: string[];
  totalPorts?: number;
  activePorts?: number;
  availablePorts?: number;
  customers?: any[];
}

interface SubMSDevice {
  subms_id: string;
  subms_name: string;
  subms_power: string; // Changed to string to support "1x4" format
  location: [number, number];
  input: {
    type: string;
    id: string;
    port?: number; // Added port for SUBMS input
  };
  outputs: DeviceOutput[];
  attachments?: string[];
  totalPorts?: number;
  activePorts?: number;
  availablePorts?: number;
}

interface X2Device {
  x2_id: string;
  x2_name: string;
  x2_power: number;
  location: [number, number];
  input: {
    type: string;
    id: string;
    port?: number; // Added port for X2 input
  };
  outputs: DeviceOutput[];
  attachments?: string[];
  totalPorts?: number;
  activePorts?: number;
  availablePorts?: number;
  customers?: any[];
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
  dnsServers?: string[];
  attachments?: string[];
  outputs?: DeviceOutput[];
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
  customers?: any[];
}

// Device Tree Node Component
interface DeviceTreeNodeProps {
  device: any;
  level: number;
  olt: OLT;
  expandedDevices: Set<string>;
  toggleDeviceExpansion: (deviceId: string) => void;
  handleDeviceClick: (device: any, deviceType: string) => void;
  handleDeviceNavigation: (device: any, deviceType: string) => void;
  handleAddDevice: (parentDevice: any, deviceType: 'ms' | 'subms' | 'fdb' | 'x2') => void;
  getDeviceIcon: (deviceType: string) => JSX.Element;
  getDeviceTypeBadge: (deviceType: string) => JSX.Element;
  findConnectedDevices: (parentId: string, parentType: string) => any[];
  calculateDevicePorts: (device: any, deviceType: string) => { total: number; active: number; available: number };
  setSelectedParentDevice: (device: any) => void;
  setIsAddMSModalOpen: (open: boolean) => void;
}

const DeviceTreeNode: React.FC<DeviceTreeNodeProps> = ({
  device,
  level,
  olt,
  expandedDevices,
  toggleDeviceExpansion,
  handleDeviceClick,
  handleDeviceNavigation,
  handleAddDevice,
  getDeviceIcon,
  getDeviceTypeBadge,
  findConnectedDevices,
  calculateDevicePorts,
  setSelectedParentDevice,
  setIsAddMSModalOpen,
}) => {
  const deviceId = device[`${device.deviceType}_id`];
  const deviceName = device[`${device.deviceType}_name`];
  const isExpanded = expandedDevices.has(deviceId);
  const connectedDevices = findConnectedDevices(deviceId, device.deviceType);
  const hasChildren = connectedDevices.length > 0;
  const ports = calculateDevicePorts(device, device.deviceType);

  const marginLeft = level * 24;

  const getAvailableDeviceTypes = (deviceType: string) => {
    switch (deviceType) {
      case 'ms':
        return ['subms', 'fdb'];
      case 'subms':
        return ['fdb'];
      case 'fdb':
        return ['x2'];
      case 'x2':
        return [];
      default:
        return [];
    }
  };

  const availableDeviceTypes = getAvailableDeviceTypes(device.deviceType);

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
          onClick={() => handleDeviceNavigation(device, device.deviceType)}
        >
          {getDeviceIcon(device.deviceType)}
          <span className="font-medium">{deviceName}</span>
          <Badge variant="outline" className="text-xs">{deviceId}</Badge>
          {getDeviceTypeBadge(device.deviceType)}
          
          <div className="ml-auto flex items-center gap-2 text-sm text-gray-600">
            <span>Ports: {ports.active}/{ports.total}</span>
            <span>Available: {ports.available}</span>
          </div>
        </div>
        
        {ports.available > 0 && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-blue-500 hover:text-blue-700"
            onClick={(e) => {
              e.stopPropagation();
              if (availableDeviceTypes.length === 1) {
                handleAddDevice(device, availableDeviceTypes[0] as 'ms' | 'subms' | 'fdb' | 'x2');
              } else if (device.deviceType === 'ms') {
                // For MS devices, show Add Connection modal
                setSelectedParentDevice(device);
                setIsAddMSModalOpen(true);
              } else {
                // Show modal to select device type for other devices
                handleDeviceClick(device, device.deviceType);
              }
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
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
              handleDeviceNavigation={handleDeviceNavigation}
              handleAddDevice={handleAddDevice}
              getDeviceIcon={getDeviceIcon}
              getDeviceTypeBadge={getDeviceTypeBadge}
              findConnectedDevices={findConnectedDevices}
              calculateDevicePorts={calculateDevicePorts}
              setSelectedParentDevice={setSelectedParentDevice}
              setIsAddMSModalOpen={setIsAddMSModalOpen}
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
  
  // Use RTK Query to fetch OLT data
  const { data: oltData, isLoading, error } = useGetOltCompleteDataQuery(id || '', {
    skip: !id, // Skip query if no ID
  });
  
  const olt = oltData?.data;
  const [address, setAddress] = useState<string>('');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [expandedDevices, setExpandedDevices] = useState<Set<string>>(new Set());
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);

  // State for Add Device Modals
  const [isAddMSModalOpen, setIsAddMSModalOpen] = useState(false);
  const [isAddMSDeviceModalOpen, setIsAddMSDeviceModalOpen] = useState(false);
  const [isAddSubMSModalOpen, setIsAddSubMSModalOpen] = useState(false);
  const [isAddFDBModalOpen, setIsAddFDBModalOpen] = useState(false);
  const [isAddDeviceModalOpen, setIsAddDeviceModalOpen] = useState(false);
  const [selectedParentDevice, setSelectedParentDevice] = useState<any>(null);
  const [addDeviceForm, setAddDeviceForm] = useState({
    name: '',
    power: '',
    latitude: 0,
    longitude: 0,
    deviceType: 'ms' as 'ms' | 'subms' | 'fdb' | 'x2'
  });

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

  // Get address from coordinates when OLT data is loaded
  useEffect(() => {
    if (olt && olt.latitude && olt.longitude) {
      getAddressFromCoordinates(olt.latitude, olt.longitude);
    }
  }, [olt]);

  // Handle API errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch OLT data. Redirecting to OLT Management.",
        variant: "destructive",
      });
      navigate('/olt-management');
    }
  }, [error, navigate, toast]);

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
    olt.ms_devices?.forEach((ms: MSDevice) => {
      if (ms.input.type === parentType && ms.input.id === parentId) {
        connected.push({ ...ms, deviceType: 'ms' });
      }
    });

    // Find FDB devices connected to this parent
    olt.fdb_devices?.forEach((fdb: FDBDevice) => {
      if (fdb.input.type === parentType && fdb.input.id === parentId) {
        connected.push({ ...fdb, deviceType: 'fdb' });
      }
    });

    // Find SUBMS devices connected to this parent
    olt.subms_devices?.forEach((subms: SubMSDevice) => {
      if (subms.input.type === parentType && subms.input.id === parentId) {
        connected.push({ ...subms, deviceType: 'subms' });
      }
    });

    // Find X2 devices connected to this parent
    olt.x2_devices?.forEach((x2: X2Device) => {
      if (x2.input.type === parentType && x2.input.id === parentId) {
        connected.push({ ...x2, deviceType: 'x2' });
      }
    });

    return connected;
  };

  // Device Management Functions
  const handleAddDevice = (parentDevice: any, deviceType: 'ms' | 'subms' | 'fdb' | 'x2') => {
    setSelectedParentDevice(parentDevice);
    setAddDeviceForm({
      name: '',
      power: '',
      latitude: parentDevice.location?.[0] || 0,
      longitude: parentDevice.location?.[1] || 0,
      deviceType
    });
    setIsAddDeviceModalOpen(true);
  };

  const handleAddMS = () => {
    setAddDeviceForm({
      name: '',
      power: '1x4',
      latitude: olt?.latitude || 0,
      longitude: olt?.longitude || 0,
      deviceType: 'ms'
    });
    setIsAddMSDeviceModalOpen(true);
  };

  const handleDeviceNavigation = (device: any, deviceType: string) => {
    // Navigate to device detail page
    navigate(`/device-details/${deviceType}/${device[`${deviceType}_id`]}`, {
      state: { deviceData: device, parentOlt: olt }
    });
  };

  const calculateDevicePorts = (device: any, deviceType: string) => {
    switch (deviceType) {
      case 'olt':
        return {
          total: device.oltPower || 0,
          active: device.outputs?.length || 0,
          available: (device.oltPower || 0) - (device.outputs?.length || 0)
        };
      case 'ms':
        const msPower = device.ms_power || '1x4';
        const msOutputs = parseInt(msPower.split('x')[1] || '0');
        return {
          total: msOutputs,
          active: device.outputs?.length || 0,
          available: msOutputs - (device.outputs?.length || 0)
        };
      case 'fdb':
        return {
          total: device.fdb_power || 0,
          active: device.outputs?.length || 0,
          available: (device.fdb_power || 0) - (device.outputs?.length || 0)
        };
      case 'subms':
        const submsPower = device.subms_power || '1x4';
        const submsOutputs = parseInt(submsPower.split('x')[1] || '0');
        return {
          total: submsOutputs,
          active: device.outputs?.length || 0,
          available: submsOutputs - (device.outputs?.length || 0)
        };
      case 'x2':
        return {
          total: device.x2_power || 0,
          active: device.outputs?.length || 0,
          available: (device.x2_power || 0) - (device.outputs?.length || 0)
        };
      default:
        return { total: 0, active: 0, available: 0 };
    }
  };

  if (isLoading) {
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
                      <p className="text-sm text-gray-900">{calculateDevicePorts(olt, 'olt').total} Ports</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Active Ports</label>
                      <p className="text-sm text-gray-900">{calculateDevicePorts(olt, 'olt').active} Ports</p>
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
                      <p className="text-2xl font-bold text-gray-900">{calculateDevicePorts(olt, 'olt').total}</p>
                      <label className="text-xs font-medium text-gray-500">Total Ports</label>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{calculateDevicePorts(olt, 'olt').active}</p>
                      <label className="text-xs font-medium text-gray-500">Active Ports</label>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{calculateDevicePorts(olt, 'olt').available}</p>
                      <label className="text-xs font-medium text-gray-500">Available Ports</label>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(calculateDevicePorts(olt, 'olt').active / Math.max(calculateDevicePorts(olt, 'olt').total, 1)) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-center text-gray-500">
                    Port Utilization: {Math.round((calculateDevicePorts(olt, 'olt').active / Math.max(calculateDevicePorts(olt, 'olt').total, 1)) * 100)}%
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
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Network className="h-5 w-5" />
                      Device Hierarchy
                    </CardTitle>
                    <CardDescription>
                      Connected devices in hierarchical structure. Click on devices to view details.
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAddMS}
                    className={`flex items-center gap-2 ${
                      olt && calculateDevicePorts(olt, 'olt').available === 0 
                        ? 'opacity-50 cursor-not-allowed' 
                        : ''
                    }`}
                    disabled={olt && calculateDevicePorts(olt, 'olt').available === 0}
                  >
                    <Plus className="h-4 w-4" />
                    {olt && calculateDevicePorts(olt, 'olt').available === 0 
                      ? `All Ports Used (${calculateDevicePorts(olt, 'olt').active}/${calculateDevicePorts(olt, 'olt').total})`
                      : `Add MS (${olt ? calculateDevicePorts(olt, 'olt').active : 0}/${olt ? calculateDevicePorts(olt, 'olt').total : 0})`
                    }
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {/* OLT Root */}
                  <div className={`flex items-center gap-2 p-3 rounded-lg border ${
                    calculateDevicePorts(olt, 'olt').available === 0 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-blue-50 border-blue-200'
                  }`}>
                    <Server className={`h-5 w-5 ${
                      calculateDevicePorts(olt, 'olt').available === 0 
                        ? 'text-red-600' 
                        : 'text-blue-600'
                    }`} />
                    <span className={`font-semibold ${
                      calculateDevicePorts(olt, 'olt').available === 0 
                        ? 'text-red-900' 
                        : 'text-blue-900'
                    }`}>
                      {olt.name} ({olt.oltId})
                    </span>
                    <Badge className={`${
                      calculateDevicePorts(olt, 'olt').available === 0 
                        ? 'bg-red-100 text-red-800 border-red-200' 
                        : 'bg-blue-100 text-blue-800 border-blue-200'
                    }`}>
                      OLT
                    </Badge>
                    <div className={`ml-auto flex items-center gap-2 text-sm ${
                      calculateDevicePorts(olt, 'olt').available === 0 
                        ? 'text-red-700' 
                        : 'text-blue-700'
                    }`}>
                      <span>Ports: {calculateDevicePorts(olt, 'olt').active}/{calculateDevicePorts(olt, 'olt').total}</span>
                      <span>Available: {calculateDevicePorts(olt, 'olt').available}</span>
                      {calculateDevicePorts(olt, 'olt').available === 0 && (
                        <Badge variant="destructive" className="text-xs">
                          FULL
                        </Badge>
                      )}
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
                      handleDeviceNavigation={handleDeviceNavigation}
                      handleAddDevice={handleAddDevice}
                      getDeviceIcon={getDeviceIcon}
                      getDeviceTypeBadge={getDeviceTypeBadge}
                      findConnectedDevices={findConnectedDevices}
                      calculateDevicePorts={calculateDevicePorts}
                      setSelectedParentDevice={setSelectedParentDevice}
                      setIsAddMSModalOpen={setIsAddMSModalOpen}
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
                    {olt.attachments.map((attachment: string, index: number) => (
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
                        {olt.dnsServers.map((dns: string, index: number) => (
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
                        {(olt.ms_devices?.reduce((acc: number, ms: MSDevice) => acc + (ms.activePorts || 0), 0) || 0) + 
                         (olt.fdb_devices?.reduce((acc: number, fdb: FDBDevice) => acc + (fdb.activePorts || 0), 0) || 0) + 
                         (olt.subms_devices?.reduce((acc: number, subms: SubMSDevice) => acc + (subms.activePorts || 0), 0) || 0) + 
                         (olt.x2_devices?.reduce((acc: number, x2: X2Device) => acc + (x2.activePorts || 0), 0) || 0)}
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

        {/* Add Connection Modal - Mobile App Style */}
        <Dialog open={isAddMSModalOpen} onOpenChange={setIsAddMSModalOpen}>
          <DialogContent className="sm:max-w-[400px] rounded-2xl">
            <DialogHeader className="text-center pb-2">
              <DialogTitle className="text-blue-600 text-xl font-semibold">Add Connection</DialogTitle>
              <DialogDescription className="text-gray-600 text-sm">
                Select the type of device you want to add.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Add SUB MS Option */}
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center gap-2 rounded-xl border-2 hover:border-blue-400 hover:bg-blue-50 transition-all"
                  onClick={() => {
                    setIsAddMSModalOpen(false);
                    setAddDeviceForm({
                      name: '',
                      power: '1x4',
                      latitude: selectedParentDevice?.location?.[0] || olt?.latitude || 0,
                      longitude: selectedParentDevice?.location?.[1] || olt?.longitude || 0,
                      deviceType: 'subms'
                    });
                    setIsAddSubMSModalOpen(true);
                  }}
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Wifi className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="font-medium text-sm">Add SUB MS</span>
                </Button>

                {/* Add FDB Option */}
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center gap-2 rounded-xl border-2 hover:border-blue-400 hover:bg-blue-50 transition-all"
                  onClick={() => {
                    setIsAddMSModalOpen(false);
                    setAddDeviceForm({
                      name: '',
                      power: '8',
                      latitude: selectedParentDevice?.location?.[0] || olt?.latitude || 0,
                      longitude: selectedParentDevice?.location?.[1] || olt?.longitude || 0,
                      deviceType: 'fdb'
                    });
                    setIsAddFDBModalOpen(true);
                  }}
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <ArrowLeftRight className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="font-medium text-sm">Add FDB</span>
                </Button>
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button 
                variant="ghost" 
                className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full"
                onClick={() => setIsAddMSModalOpen(false)}
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add MS Device Modal */}
        <Dialog open={isAddMSDeviceModalOpen} onOpenChange={setIsAddMSDeviceModalOpen}>
          <DialogContent className="sm:max-w-[500px] rounded-2xl">
            <DialogHeader className="text-center pb-2">
              <DialogTitle className="text-blue-600 text-xl font-semibold">Add MS Device</DialogTitle>
              <DialogDescription className="text-gray-600 text-sm">
                Add a new MS device to {olt?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ms-device-name" className="text-sm font-medium">MS Device Name</Label>
                <Input
                  id="ms-device-name"
                  value={addDeviceForm.name}
                  onChange={(e) => setAddDeviceForm({ ...addDeviceForm, name: e.target.value })}
                  placeholder="MS-Device-01"
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ms-device-power" className="text-sm font-medium">MS Power (e.g., 1x4, 1x8)</Label>
                <Input
                  id="ms-device-power"
                  value={addDeviceForm.power}
                  onChange={(e) => setAddDeviceForm({ ...addDeviceForm, power: e.target.value })}
                  placeholder="1x4"
                  className="rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="ms-device-latitude" className="text-sm font-medium">Latitude</Label>
                  <Input
                    id="ms-device-latitude"
                    type="number"
                    step="0.0001"
                    value={addDeviceForm.latitude}
                    onChange={(e) => setAddDeviceForm({ ...addDeviceForm, latitude: parseFloat(e.target.value) || 0 })}
                    placeholder="30.699138"
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ms-device-longitude" className="text-sm font-medium">Longitude</Label>
                  <Input
                    id="ms-device-longitude"
                    type="number"
                    step="0.0001"
                    value={addDeviceForm.longitude}
                    onChange={(e) => setAddDeviceForm({ ...addDeviceForm, longitude: parseFloat(e.target.value) || 0 })}
                    placeholder="76.709269"
                    className="rounded-lg"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="pt-2 gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setIsAddMSDeviceModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  // TODO: Implement MS device creation API call
                  toast({
                    title: "Success",
                    description: "MS device added successfully!",
                  });
                  setIsAddMSDeviceModalOpen(false);
                  setAddDeviceForm({ name: '', power: '', latitude: 0, longitude: 0, deviceType: 'ms' });
                }}
              >
                Add MS Device
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add SUBMS Modal */}
        <Dialog open={isAddSubMSModalOpen} onOpenChange={setIsAddSubMSModalOpen}>
          <DialogContent className="sm:max-w-[500px] rounded-2xl">
            <DialogHeader className="text-center pb-2">
              <DialogTitle className="text-blue-600 text-xl font-semibold">Add SUB MS</DialogTitle>
              <DialogDescription className="text-gray-600 text-sm">
                Add a new SUB MS device to {selectedParentDevice?.[`${selectedParentDevice?.deviceType}_name`] || olt?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subms-name" className="text-sm font-medium">SUB MS Name</Label>
                <Input
                  id="subms-name"
                  value={addDeviceForm.name}
                  onChange={(e) => setAddDeviceForm({ ...addDeviceForm, name: e.target.value })}
                  placeholder="SUBMS-Device-01"
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subms-power" className="text-sm font-medium">Power (e.g., 1x4, 1x8)</Label>
                <Input
                  id="subms-power"
                  value={addDeviceForm.power}
                  onChange={(e) => setAddDeviceForm({ ...addDeviceForm, power: e.target.value })}
                  placeholder="1x4"
                  className="rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="subms-latitude" className="text-sm font-medium">Latitude</Label>
                  <Input
                    id="subms-latitude"
                    type="number"
                    step="0.0001"
                    value={addDeviceForm.latitude}
                    onChange={(e) => setAddDeviceForm({ ...addDeviceForm, latitude: parseFloat(e.target.value) || 0 })}
                    placeholder="30.699138"
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subms-longitude" className="text-sm font-medium">Longitude</Label>
                  <Input
                    id="subms-longitude"
                    type="number"
                    step="0.0001"
                    value={addDeviceForm.longitude}
                    onChange={(e) => setAddDeviceForm({ ...addDeviceForm, longitude: parseFloat(e.target.value) || 0 })}
                    placeholder="76.709269"
                    className="rounded-lg"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="pt-2 gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setIsAddSubMSModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  // TODO: Implement SUBMS creation API call
                  toast({
                    title: "Success",
                    description: "SUB MS device added successfully!",
                  });
                  setIsAddSubMSModalOpen(false);
                  setAddDeviceForm({ name: '', power: '', latitude: 0, longitude: 0, deviceType: 'subms' });
                }}
              >
                Add SUB MS
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add FDB Modal */}
        <Dialog open={isAddFDBModalOpen} onOpenChange={setIsAddFDBModalOpen}>
          <DialogContent className="sm:max-w-[500px] rounded-2xl">
            <DialogHeader className="text-center pb-2">
              <DialogTitle className="text-blue-600 text-xl font-semibold">Add FDB</DialogTitle>
              <DialogDescription className="text-gray-600 text-sm">
                Add a new FDB device to {selectedParentDevice?.[`${selectedParentDevice?.deviceType}_name`] || olt?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fdb-name" className="text-sm font-medium">FDB Name</Label>
                <Input
                  id="fdb-name"
                  value={addDeviceForm.name}
                  onChange={(e) => setAddDeviceForm({ ...addDeviceForm, name: e.target.value })}
                  placeholder="FDB-Device-01"
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fdb-power" className="text-sm font-medium">Power (Number of Ports)</Label>
                <Input
                  id="fdb-power"
                  type="number"
                  value={addDeviceForm.power}
                  onChange={(e) => setAddDeviceForm({ ...addDeviceForm, power: e.target.value })}
                  placeholder="8"
                  className="rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="fdb-latitude" className="text-sm font-medium">Latitude</Label>
                  <Input
                    id="fdb-latitude"
                    type="number"
                    step="0.0001"
                    value={addDeviceForm.latitude}
                    onChange={(e) => setAddDeviceForm({ ...addDeviceForm, latitude: parseFloat(e.target.value) || 0 })}
                    placeholder="30.699138"
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fdb-longitude" className="text-sm font-medium">Longitude</Label>
                  <Input
                    id="fdb-longitude"
                    type="number"
                    step="0.0001"
                    value={addDeviceForm.longitude}
                    onChange={(e) => setAddDeviceForm({ ...addDeviceForm, longitude: parseFloat(e.target.value) || 0 })}
                    placeholder="76.709269"
                    className="rounded-lg"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="pt-2 gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setIsAddFDBModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  // TODO: Implement FDB creation API call
                  toast({
                    title: "Success",
                    description: "FDB device added successfully!",
                  });
                  setIsAddFDBModalOpen(false);
                  setAddDeviceForm({ name: '', power: '', latitude: 0, longitude: 0, deviceType: 'fdb' });
                }}
              >
                Add FDB
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Device Modal */}
        <Dialog open={isAddDeviceModalOpen} onOpenChange={setIsAddDeviceModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add {addDeviceForm.deviceType.toUpperCase()} Device</DialogTitle>
              <DialogDescription>
                Add a new {addDeviceForm.deviceType.toUpperCase()} device connected to {selectedParentDevice?.[`${selectedParentDevice?.deviceType}_name`]}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="device-name">{addDeviceForm.deviceType.toUpperCase()} Name</Label>
                <Input
                  id="device-name"
                  value={addDeviceForm.name}
                  onChange={(e) => setAddDeviceForm({ ...addDeviceForm, name: e.target.value })}
                  placeholder={`${addDeviceForm.deviceType.toUpperCase()}-Device-01`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="device-power">Power/Outputs</Label>
                <Input
                  id="device-power"
                  value={addDeviceForm.power}
                  onChange={(e) => setAddDeviceForm({ ...addDeviceForm, power: e.target.value })}
                  placeholder={addDeviceForm.deviceType === 'ms' || addDeviceForm.deviceType === 'subms' ? '1x4' : '8'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="device-latitude">Latitude</Label>
                <Input
                  id="device-latitude"
                  type="number"
                  step="0.0001"
                  value={addDeviceForm.latitude}
                  onChange={(e) => setAddDeviceForm({ ...addDeviceForm, latitude: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="device-longitude">Longitude</Label>
                <Input
                  id="device-longitude"
                  type="number"
                  step="0.0001"
                  value={addDeviceForm.longitude}
                  onChange={(e) => setAddDeviceForm({ ...addDeviceForm, longitude: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDeviceModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                // TODO: Implement device creation API call
                toast({
                  title: "Success",
                  description: `${addDeviceForm.deviceType.toUpperCase()} device added successfully!`,
                });
                setIsAddDeviceModalOpen(false);
              }}>
                Add {addDeviceForm.deviceType.toUpperCase()}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
