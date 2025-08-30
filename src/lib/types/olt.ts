export interface OLT {
  _id: string;
  name: string;
  ipAddress: string;
  location: string;
  status: OLTStatus;
  model: string;
  serialNumber: string;
  firmwareVersion: string;
  portCount: number;
  activePorts: number;
  capacity: number;
  utilization: number;
  lastMaintenance: string;
  nextMaintenance: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export enum OLTStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  MAINTENANCE = 'maintenance',
  ERROR = 'error',
  DEGRADED = 'degraded'
}

export interface OLTPort {
  _id: string;
  portNumber: number;
  status: PortStatus;
  customerId?: string;
  customerName?: string;
  bandwidth: number;
  lastSeen: string;
  signalStrength: number;
}

export enum PortStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  FAULTY = 'faulty',
  RESERVED = 'reserved'
}

export interface OLTMetrics {
  totalPorts: number;
  activePorts: number;
  utilization: number;
  uptime: number;
  errorRate: number;
  bandwidthUsage: number;
}

export interface OLTCreateRequest {
  name: string;
  ipAddress: string;
  location: string;
  model: string;
  serialNumber: string;
  firmwareVersion: string;
  portCount: number;
  capacity: number;
  notes?: string;
}

export interface OLTUpdateRequest {
  name?: string;
  ipAddress?: string;
  location?: string;
  status?: OLTStatus;
  firmwareVersion?: string;
  notes?: string;
}

export interface OLTResponse {
  success: boolean;
  data: OLT | OLT[];
  message: string;
  total?: number;
  page?: number;
  limit?: number;
}
