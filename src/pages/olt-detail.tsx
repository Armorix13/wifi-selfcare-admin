import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, RefreshCw, AlertTriangle, CheckCircle, XCircle, Clock, Wifi, Server, Activity, BarChart3, Calendar, MapPin, Hash, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { OLT, OLTStatus, OLTPort, PortStatus, OLTMetrics } from '@/lib/types/olt';
import { MainLayout } from '@/components/layout/main-layout';

// Mock data for demonstration
const mockOLT: OLT = {
  _id: '1',
  name: 'OLT-001',
  ipAddress: '192.168.1.100',
  location: 'Data Center A',
  status: OLTStatus.ONLINE,
  model: 'Huawei MA5800-X2',
  serialNumber: 'HW123456789',
  firmwareVersion: 'V1.2.3',
  portCount: 16,
  activePorts: 12,
  capacity: 1000,
  utilization: 75,
  lastMaintenance: '2024-01-15',
  nextMaintenance: '2024-04-15',
  notes: 'Primary OLT for downtown area. Handles high-traffic residential and business connections. Last firmware update was successful with no issues reported.',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-20'
};

const mockPorts: OLTPort[] = [
  {
    _id: '1',
    portNumber: 1,
    status: PortStatus.ACTIVE,
    customerId: 'CUST001',
    customerName: 'John Doe',
    bandwidth: 100,
    lastSeen: '2024-01-20T10:30:00Z',
    signalStrength: -25
  },
  {
    _id: '2',
    portNumber: 2,
    status: PortStatus.ACTIVE,
    customerId: 'CUST002',
    customerName: 'Jane Smith',
    bandwidth: 200,
    lastSeen: '2024-01-20T10:25:00Z',
    signalStrength: -22
  },
  {
    _id: '3',
    portNumber: 3,
    status: PortStatus.INACTIVE,
    customerId: undefined,
    customerName: undefined,
    bandwidth: 0,
    lastSeen: '2024-01-19T15:45:00Z',
    signalStrength: 0
  },
  {
    _id: '4',
    portNumber: 4,
    status: PortStatus.ACTIVE,
    customerId: 'CUST004',
    customerName: 'Bob Johnson',
    bandwidth: 150,
    lastSeen: '2024-01-20T11:15:00Z',
    signalStrength: -28
  },
  {
    _id: '5',
    portNumber: 5,
    status: PortStatus.FAULTY,
    customerId: 'CUST005',
    customerName: 'Alice Brown',
    bandwidth: 0,
    lastSeen: '2024-01-18T09:20:00Z',
    signalStrength: -45
  }
];

const mockMaintenanceHistory = [
  {
    id: '1',
    date: '2024-01-15',
    type: 'Scheduled Maintenance',
    description: 'Firmware update to V1.2.3',
    technician: 'Mike Wilson',
    status: 'Completed',
    duration: '2 hours'
  },
  {
    id: '2',
    date: '2024-01-10',
    type: 'Hardware Check',
    description: 'Routine hardware inspection and cleaning',
    technician: 'Sarah Davis',
    status: 'Completed',
    duration: '1 hour'
  },
  {
    id: '3',
    date: '2024-01-05',
    type: 'Emergency Repair',
    description: 'Power supply replacement',
    technician: 'Mike Wilson',
    status: 'Completed',
    duration: '3 hours'
  }
];

export default function OLTDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [olt, setOlt] = useState<OLT | null>(null);
  const [ports, setPorts] = useState<OLTPort[]>([]);
  const [maintenanceHistory, setMaintenanceHistory] = useState(mockMaintenanceHistory);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate API call to fetch OLT data
    setOlt(mockOLT);
    setPorts(mockPorts);
  }, [id]);

  const getStatusIcon = (status: OLTStatus) => {
    switch (status) {
      case OLTStatus.ONLINE:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case OLTStatus.OFFLINE:
        return <XCircle className="h-4 w-4 text-red-500" />;
      case OLTStatus.MAINTENANCE:
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case OLTStatus.ERROR:
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case OLTStatus.DEGRADED:
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <Server className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: OLTStatus) => {
    const variants: Record<OLTStatus, string> = {
      [OLTStatus.ONLINE]: 'bg-green-100 text-green-800 border-green-200',
      [OLTStatus.OFFLINE]: 'bg-red-100 text-red-800 border-red-200',
      [OLTStatus.MAINTENANCE]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      [OLTStatus.ERROR]: 'bg-red-100 text-red-800 border-red-200',
      [OLTStatus.DEGRADED]: 'bg-orange-100 text-orange-800 border-orange-200'
    };

    return (
      <Badge className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPortStatusBadge = (status: PortStatus) => {
    const variants: Record<PortStatus, string> = {
      [PortStatus.ACTIVE]: 'bg-green-100 text-green-800 border-green-200',
      [PortStatus.INACTIVE]: 'bg-gray-100 text-gray-800 border-gray-200',
      [PortStatus.FAULTY]: 'bg-red-100 text-red-800 border-red-200',
      [PortStatus.RESERVED]: 'bg-blue-100 text-blue-800 border-blue-200'
    };

    return (
      <Badge className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getOLTMetrics = (): OLTMetrics => {
    if (!olt) return {
      totalPorts: 0,
      activePorts: 0,
      utilization: 0,
      uptime: 0,
      errorRate: 0,
      bandwidthUsage: 0
    };

    return {
      totalPorts: olt.portCount,
      activePorts: olt.activePorts,
      utilization: olt.utilization,
      uptime: 99.5, // Mock uptime
      errorRate: 0.1, // Mock error rate
      bandwidthUsage: olt.utilization
    };
  };

  const handleDeleteOLT = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Success",
        description: "OLT deleted successfully",
      });

      navigate('/olt-management');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete OLT",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  if (!olt) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const metrics = getOLTMetrics();

  return (
    <MainLayout title='Olt Details'>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/olt-management')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to OLTs
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{olt.name}</h1>
              <p className="text-muted-foreground">
                Optical Line Terminal Details
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              {getStatusIcon(olt.status)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {getStatusBadge(olt.status)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {olt.status === OLTStatus.ONLINE ? 'Operating normally' : 'Requires attention'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Port Utilization</CardTitle>
              <Wifi className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{olt.utilization}%</div>
              <Progress value={olt.utilization} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {olt.activePorts}/{olt.portCount} ports active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Uptime</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.uptime}%</div>
              <p className="text-xs text-muted-foreground mt-2">
                System availability
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.errorRate}%</div>
              <p className="text-xs text-muted-foreground mt-2">
                Port errors
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ports">Ports</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Name:</span>
                      <p className="font-medium">{olt.name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Model:</span>
                      <p className="font-medium">{olt.model}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">IP Address:</span>
                      <p className="font-medium font-mono">{olt.ipAddress}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Serial Number:</span>
                      <p className="font-medium font-mono">{olt.serialNumber}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Firmware:</span>
                      <p className="font-medium">{olt.firmwareVersion}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Capacity:</span>
                      <p className="font-medium">{olt.capacity} Mbps</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location & Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location & Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-muted-foreground">Location:</span>
                      <p className="font-medium">{olt.location}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Current Status:</span>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(olt.status)}
                        {getStatusBadge(olt.status)}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Last Maintenance:</span>
                      <p className="font-medium">{olt.lastMaintenance}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Next Maintenance:</span>
                      <p className="font-medium">{olt.nextMaintenance}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notes */}
            {olt.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {olt.notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="ports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Port Status</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {ports.filter(port => port.status === PortStatus.ACTIVE).length} Active
                    </Badge>
                    <Badge variant="outline">
                      {ports.filter(port => port.status === PortStatus.FAULTY).length} Faulty
                    </Badge>
                  </div>
                </CardTitle>
                <CardDescription>
                  Monitor individual port status and customer connections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Port</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Bandwidth</TableHead>
                      <TableHead>Signal Strength</TableHead>
                      <TableHead>Last Seen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ports.map((port) => (
                      <TableRow key={port._id}>
                        <TableCell className="font-medium">Port {port.portNumber}</TableCell>
                        <TableCell>
                          {getPortStatusBadge(port.status)}
                        </TableCell>
                        <TableCell>
                          {port.customerName ? (
                            <div>
                              <div className="font-medium">{port.customerName}</div>
                              <div className="text-xs text-muted-foreground">{port.customerId}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>{port.bandwidth} Mbps</TableCell>
                        <TableCell>
                          {port.signalStrength !== 0 ? (
                            <div className="flex items-center gap-2">
                              <span>{port.signalStrength} dBm</span>
                              {port.signalStrength > -30 && (
                                <Badge variant="outline" className="text-green-600 border-green-200">
                                  Good
                                </Badge>
                              )}
                              {port.signalStrength <= -30 && port.signalStrength > -40 && (
                                <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                                  Fair
                                </Badge>
                              )}
                              {port.signalStrength <= -40 && (
                                <Badge variant="outline" className="text-red-600 border-red-200">
                                  Poor
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(port.lastSeen).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Port Utilization</span>
                        <span>{olt.utilization}%</span>
                      </div>
                      <Progress value={olt.utilization} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Bandwidth Usage</span>
                        <span>{olt.utilization}%</span>
                      </div>
                      <Progress value={olt.utilization} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>System Uptime</span>
                        <span>{metrics.uptime}%</span>
                      </div>
                      <Progress value={metrics.uptime} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Health */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="h-5 w-5" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{olt.activePorts}</div>
                      <div className="text-sm text-green-600">Active Ports</div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{olt.portCount - olt.activePorts}</div>
                      <div className="text-sm text-blue-600">Available Ports</div>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{metrics.errorRate}%</div>
                      <div className="text-sm text-yellow-600">Error Rate</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{olt.capacity} Mbps</div>
                      <div className="text-sm text-purple-600">Total Capacity</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Maintenance History
                </CardTitle>
                <CardDescription>
                  Track all maintenance activities and scheduled tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Technician</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {maintenanceHistory.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.date}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{record.type}</Badge>
                        </TableCell>
                        <TableCell>{record.description}</TableCell>
                        <TableCell>{record.technician}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.duration}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete OLT</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{olt.name}"? This action cannot be undone and will affect all connected customers.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteOLT} disabled={loading}>
                {loading ? 'Deleting...' : 'Delete OLT'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
