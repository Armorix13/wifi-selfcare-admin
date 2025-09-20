import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Server, Wifi, Router, Zap, MapPin, Calendar, User, Settings, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DeviceDetailProps {
  deviceType: 'ms' | 'subms' | 'fdb' | 'x2';
}

const DeviceDetail: React.FC<DeviceDetailProps> = ({ deviceType }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [device, setDevice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration - replace with actual API calls
  const mockDeviceData = {
    ms: {
      ms_id: id,
      ms_name: `MS Device ${id}`,
      ms_power: "1x8",
      location: [37.4219983, -122.084],
      input: { type: "olt", id: "OLT3655" },
      attachments: [
        "/view/image/ms-device-1.jpg",
        "/view/image/ms-device-2.jpg"
      ],
      outputs: [
        { type: "subms", id: "SUBMS001" },
        { type: "fdb", id: "FDB001" }
      ],
      status: "active",
      powerStatus: "on",
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-01T00:00:00.000Z"
    },
    subms: {
      subms_id: id,
      subms_name: `SUBMS Device ${id}`,
      subms_power: "1x4",
      location: [37.4219983, -122.084],
      input: { type: "ms", id: "MS9547" },
      attachments: [
        "/view/image/subms-device-1.jpg",
        "/view/image/subms-device-2.jpg"
      ],
      outputs: [
        { type: "fdb", id: "FDB001" }
      ],
      status: "active",
      powerStatus: "on",
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-01T00:00:00.000Z"
    },
    fdb: {
      fdb_id: id,
      fdb_name: `FDB Device ${id}`,
      fdb_power: 8,
      location: [37.4219983, -122.084],
      input: { type: "subms", id: "SUBMS001" },
      attachments: [
        "/view/image/fdb-device-1.jpg",
        "/view/image/fdb-device-2.jpg"
      ],
      outputs: [
        { type: "x2", id: "X2001" }
      ],
      status: "active",
      powerStatus: "on",
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-01T00:00:00.000Z"
    },
    x2: {
      x2_id: id,
      x2_name: `X2 Device ${id}`,
      x2_power: 2,
      location: [37.4219983, -122.084],
      input: { type: "fdb", id: "FDB001" },
      attachments: [
        "/view/image/x2-device-1.jpg",
        "/view/image/x2-device-2.jpg"
      ],
      outputs: [],
      status: "active",
      powerStatus: "on",
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-01T00:00:00.000Z"
    }
  };

  useEffect(() => {
    // Simulate API call
    const fetchDeviceData = async () => {
      setLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Use mock data for now
        const deviceData = mockDeviceData[deviceType];
        setDevice(deviceData);
      } catch (error) {
        console.error('Error fetching device data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch device data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDeviceData();
    }
  }, [id, deviceType, toast]);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'ms':
        return <Server className="h-5 w-5 text-blue-600" />;
      case 'subms':
        return <Wifi className="h-5 w-5 text-purple-600" />;
      case 'fdb':
        return <Router className="h-5 w-5 text-green-600" />;
      case 'x2':
        return <Zap className="h-5 w-5 text-orange-600" />;
      default:
        return <Server className="h-5 w-5 text-gray-600" />;
    }
  };

  const getDeviceTypeBadge = (type: string) => {
    const variants = {
      ms: "bg-blue-100 text-blue-800 border-blue-200",
      subms: "bg-purple-100 text-purple-800 border-purple-200",
      fdb: "bg-green-100 text-green-800 border-green-200",
      x2: "bg-orange-100 text-orange-800 border-orange-200"
    };

    return (
      <Badge className={variants[type as keyof typeof variants] || "bg-gray-100 text-gray-800 border-gray-200"}>
        {type.toUpperCase()}
      </Badge>
    );
  };

  const calculatePorts = (device: any, type: string) => {
    if (!device) return { total: 0, active: 0, available: 0 };

    let total = 0;
    const active = device.outputs?.length || 0;

    switch (type) {
      case 'ms':
        const msPower = device.ms_power || '1x4';
        total = parseInt(msPower.split('x')[1] || '0');
        break;
      case 'subms':
        const submsPower = device.subms_power || '1x2';
        total = parseInt(submsPower.split('x')[1] || '0');
        break;
      case 'fdb':
        total = device.fdb_power || 0;
        break;
      case 'x2':
        total = device.x2_power || 0;
        break;
    }

    return {
      total,
      active,
      available: total - active
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Device Not Found</h2>
          <p className="text-gray-600 mb-4">The requested device could not be found.</p>
          <Button onClick={() => navigate('/olt-management')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to OLT Management
          </Button>
        </div>
      </div>
    );
  }

  const ports = calculatePorts(device, deviceType);
  const deviceName = device[`${deviceType}_name`];
  const deviceId = device[`${deviceType}_id`];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/olt-management')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            {getDeviceIcon(deviceType)}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{deviceName}</h1>
              <p className="text-gray-600">{deviceId}</p>
            </div>
            {getDeviceTypeBadge(deviceType)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={device.status === 'active' ? 'default' : 'secondary'}>
            {device.status === 'active' ? (
              <><CheckCircle className="h-3 w-3 mr-1" /> Active</>
            ) : (
              <><AlertTriangle className="h-3 w-3 mr-1" /> Inactive</>
            )}
          </Badge>
        </div>
      </div>

      {/* Device Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Ports</p>
                <p className="text-2xl font-bold text-blue-600">{ports.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Active Ports</p>
                <p className="text-2xl font-bold text-green-600">{ports.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Available Ports</p>
                <p className="text-2xl font-bold text-orange-600">{ports.available}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Power Status</p>
                <p className="text-2xl font-bold text-purple-600 capitalize">{device.powerStatus}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device Details Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Latitude</label>
                  <p className="text-lg font-semibold">{device.location[0]}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Longitude</label>
                  <p className="text-lg font-semibold">{device.location[1]}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Power Configuration</label>
                  <p className="text-lg font-semibold">
                    {deviceType === 'ms' ? device.ms_power : 
                     deviceType === 'subms' ? device.subms_power :
                     deviceType === 'fdb' ? device.fdb_power :
                     device.x2_power}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Device Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Device ID</label>
                  <p className="text-lg font-semibold">{deviceId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Device Name</label>
                  <p className="text-lg font-semibold">{deviceName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created At</label>
                  <p className="text-lg font-semibold">
                    {new Date(device.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-lg font-semibold">
                    {new Date(device.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="connections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Device Connections</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Input Connection</h4>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  {getDeviceIcon(device.input.type)}
                  <span className="font-medium">{device.input.type.toUpperCase()}</span>
                  <Badge variant="outline">{device.input.id}</Badge>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Output Connections</h4>
                {device.outputs && device.outputs.length > 0 ? (
                  <div className="space-y-2">
                    {device.outputs.map((output: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        {getDeviceIcon(output.type)}
                        <span className="font-medium">{output.type.toUpperCase()}</span>
                        <Badge variant="outline">{output.id}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No output connections</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attachments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Device Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              {device.attachments && device.attachments.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {device.attachments.map((attachment: string, index: number) => (
                    <div key={index} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <img 
                        src={attachment} 
                        alt={`Attachment ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No attachments available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Device Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Device settings and configuration options will be available here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeviceDetail;
