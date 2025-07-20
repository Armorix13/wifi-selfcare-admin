// Complete dummy data for the admin panel - no backend dependencies

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'super-admin' | 'admin' | 'manager';
  isActive: boolean;
  createdAt: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  location: string;
  serviceProvider: string | null;
  planName: string | null;
  activationDate: string | null;
  expirationDate: string | null;
  balanceDue: number;
  staticIp: string | null;
  macAddress: string | null;
  status: 'active' | 'suspended' | 'expired' | 'pending';
  area: 'rural' | 'urban';
  mode: 'online' | 'offline';
  isActive: boolean;
  createdAt: string;
}

export interface Engineer {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  specialization: 'Network' | 'Hardware' | 'Software' | 'Installation' | 'Maintenance';
  rating: number;
  completedJobs: number;
  activeJobs: number;
  isActive: boolean;
  createdAt: string;
}

export interface ServicePlan {
  id: number;
  name: string;
  provider: 'jio' | 'airtel' | 'bsnl' | 'my-internet';
  speed: string;
  price: number;
  validity: number;
  description: string;
  features: string[];
  subscribers: number;
  rating: number;
  isActive: boolean;
  createdAt: string;
}

export interface Complaint {
  id: number;
  customerId: number;
  customerName: string;
  title: string;
  description: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status: 'pending' | 'assigned' | 'in-progress' | 'visited' | 'resolved' | 'not-resolved';
  engineerId: number | null;
  engineerName: string | null;
  location: string;
  attachments?: string[];
  resolution?: string;
  rating?: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface SupportTicket {
  id: number;
  customerId: number;
  customerName: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  category: 'technical' | 'billing' | 'general' | 'complaint';
  assignedTo?: number;
  assignedToName?: string;
  response?: string;
  rating?: number;
  feedback?: string;
  tags: string[];
  attachments: string[];
  slaBreached: boolean;
  escalated: boolean;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  recipientType: string;
  recipients: string[];
  sentBy: number;
  sentByName: string;
  sentAt: string;
  deliveredCount: number;
  readCount: number;
  totalRecipients: number;
  status: 'sent' | 'scheduled' | 'failed' | 'draft';
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
}

export interface DashboardStats {
  totalComplaints: number;
  activeComplaints: number;
  resolvedToday: number;
  avgResolutionTime: number;
  totalEngineers: number;
  activeEngineers: number;
  totalCustomers: number;
  networkUptime: number;
  customerSatisfaction: number;
  monthlyRevenue: number;
}

// Dummy data generation functions
export const generateDummyUsers = (): User[] => [
  {
    id: 1,
    username: "admin",
    email: "admin@company.com",
    role: "super-admin",
    isActive: true,
    createdAt: "2024-01-15T10:00:00Z"
  },
  {
    id: 2,
    username: "manager",
    email: "manager@company.com",
    role: "manager",
    isActive: true,
    createdAt: "2024-01-20T10:00:00Z"
  },
  {
    id: 3,
    username: "staff",
    email: "staff@company.com",
    role: "admin",
    isActive: true,
    createdAt: "2024-02-01T10:00:00Z"
  }
];

export const generateDummyCustomers = (): Customer[] => [
  {
    id: 1,
    name: "Rajesh Kumar",
    email: "rajesh@email.com",
    phone: "+91 98765 43210",
    address: "123 Main St, Mumbai Central",
    location: "Mumbai Central",
    serviceProvider: "Jio Fiber",
    planName: "Jio Fiber 100 Mbps",
    activationDate: "2024-01-15",
    expirationDate: "2024-12-15",
    balanceDue: 0,
    staticIp: "192.168.1.100",
    macAddress: "AA:BB:CC:DD:EE:01",
    status: "active",
    area: "urban",
    mode: "online",
    isActive: true,
    createdAt: "2024-01-15T10:00:00Z"
  },
  {
    id: 2,
    name: "Priya Sharma",
    email: "priya@email.com",
    phone: "+91 87654 32109",
    address: "456 Park Ave, Delhi NCR",
    location: "Delhi NCR",
    serviceProvider: null,
    planName: null,
    activationDate: null,
    expirationDate: null,
    balanceDue: 0,
    staticIp: null,
    macAddress: null,
    status: "pending",
    area: "urban",
    mode: "offline",
    isActive: true,
    createdAt: "2024-02-01T10:00:00Z"
  },
  {
    id: 3,
    name: "Amit Patel",
    email: "amit@email.com",
    phone: "+91 76543 21098",
    address: "789 Tech Park, Bangalore",
    location: "Bangalore",
    serviceProvider: "BSNL Broadband",
    planName: "BSNL Standard 50 Mbps",
    activationDate: "2023-12-01",
    expirationDate: "2024-11-30",
    balanceDue: 1200,
    staticIp: "192.168.1.102",
    macAddress: "AA:BB:CC:DD:EE:03",
    status: "suspended",
    area: "rural",
    mode: "offline",
    isActive: false,
    createdAt: "2023-12-01T10:00:00Z"
  },
  {
    id: 4,
    name: "Sunita Verma",
    email: "sunita.verma@email.com",
    phone: "+91 91234 56789",
    address: "321 Rural Lane, Patna",
    location: "Patna",
    serviceProvider: "Airtel",
    planName: "Airtel Xstream 200 Mbps",
    activationDate: "2024-02-01",
    expirationDate: "2025-01-31",
    balanceDue: 500,
    staticIp: "192.168.1.101",
    macAddress: "AA:BB:CC:DD:EE:02",
    status: "active",
    area: "rural",
    mode: "online",
    isActive: true,
    createdAt: "2024-02-01T10:00:00Z"
  },
  {
    id: 5,
    name: "Vikram Singh",
    email: "vikram.singh@email.com",
    phone: "+91 98123 45678",
    address: "654 Tech Park, Hyderabad",
    location: "Hyderabad",
    serviceProvider: "My Internet",
    planName: "My Internet Premium 300 Mbps",
    activationDate: "2024-03-10",
    expirationDate: "2025-03-09",
    balanceDue: 0,
    staticIp: "192.168.1.103",
    macAddress: "AA:BB:CC:DD:EE:04",
    status: "active",
    area: "urban",
    mode: "online",
    isActive: true,
    createdAt: "2024-03-10T10:00:00Z"
  }
];

export const generateDummyEngineers = (): Engineer[] => [
  {
    id: 1,
    name: "Mike Johnson",
    email: "mike.johnson@company.com",
    phone: "+91 98765 11111",
    location: "Mumbai Central",
    specialization: "Network",
    rating: 87,
    completedJobs: 145,
    activeJobs: 3,
    isActive: true,
    createdAt: "2024-01-10T10:00:00Z"
  },
  {
    id: 2,
    name: "Sarah Davis",
    email: "sarah.davis@company.com",
    phone: "+91 98765 22222",
    location: "Delhi NCR",
    specialization: "Hardware",
    rating: 92,
    completedJobs: 128,
    activeJobs: 2,
    isActive: true,
    createdAt: "2024-01-12T10:00:00Z"
  },
  {
    id: 3,
    name: "Tom Wilson",
    email: "tom.wilson@company.com",
    phone: "+91 98765 33333",
    location: "Bangalore",
    specialization: "Software",
    rating: 89,
    completedJobs: 167,
    activeJobs: 4,
    isActive: true,
    createdAt: "2024-01-08T10:00:00Z"
  },
  {
    id: 4,
    name: "Jennifer Lee",
    email: "jennifer.lee@company.com",
    phone: "+91 98765 44444",
    location: "Chennai",
    specialization: "Installation",
    rating: 94,
    completedJobs: 203,
    activeJobs: 1,
    isActive: true,
    createdAt: "2024-01-05T10:00:00Z"
  },
  {
    id: 5,
    name: "David Brown",
    email: "david.brown@company.com",
    phone: "+91 98765 55555",
    location: "Pune",
    specialization: "Maintenance",
    rating: 85,
    completedJobs: 98,
    activeJobs: 5,
    isActive: true,
    createdAt: "2024-01-18T10:00:00Z"
  }
];

export const generateDummyServicePlans = (): ServicePlan[] => [
  {
    id: 1,
    name: "JioFiber Basic",
    provider: "jio",
    speed: "30 Mbps",
    price: 399,
    validity: 30,
    description: "Perfect for browsing, video calls, and light streaming",
    features: ["100 GB FUP", "Free Router", "Jio Apps"],
    subscribers: 1250,
    rating: 4.2,
    isActive: true,
    createdAt: "2024-01-15T10:00:00Z"
  },
  {
    id: 2,
    name: "JioFiber Premium",
    provider: "jio",
    speed: "100 Mbps",
    price: 699,
    validity: 30,
    description: "High-speed internet for streaming and gaming",
    features: ["Unlimited Data", "Netflix Basic", "Disney+ Hotstar", "Free Router"],
    subscribers: 2100,
    rating: 4.5,
    isActive: true,
    createdAt: "2024-01-15T10:00:00Z"
  },
  {
    id: 3,
    name: "Airtel Xstream Essential",
    provider: "airtel",
    speed: "40 Mbps",
    price: 499,
    validity: 30,
    description: "Reliable connectivity for home and work",
    features: ["Unlimited Data", "Airtel Xstream App", "Free Installation"],
    subscribers: 950,
    rating: 4.3,
    isActive: true,
    createdAt: "2024-01-15T10:00:00Z"
  },
  {
    id: 4,
    name: "BSNL Fiber Basic",
    provider: "bsnl",
    speed: "25 Mbps",
    price: 329,
    validity: 30,
    description: "Budget-friendly option for basic browsing",
    features: ["500 GB FUP", "Email Support", "Basic Router"],
    subscribers: 680,
    rating: 3.8,
    isActive: true,
    createdAt: "2024-01-15T10:00:00Z"
  }
];

export const generateDummyComplaints = (): Complaint[] => [
  {
    id: 1,
    customerId: 1,
    customerName: "Rajesh Kumar",
    title: "Internet Connection Down",
    description: "No internet connection for 2 hours in Building A",
    priority: "high",
    status: "pending",
    location: "Mumbai Central",
    engineerId: null,
    engineerName: null,
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    customerId: 2,
    customerName: "Priya Sharma",
    title: "Slow WiFi Speed",
    description: "WiFi speed is very slow in conference room",
    priority: "medium",
    status: "assigned",
    location: "Delhi NCR",
    engineerId: 1,
    engineerName: "Mike Johnson",
    createdAt: "2024-01-14T14:20:00Z",
    updatedAt: "2024-01-15T09:15:00Z"
  },
  {
    id: 3,
    customerId: 3,
    customerName: "Amit Patel",
    title: "Router Blinking Red",
    description: "Router status light is blinking red constantly",
    priority: "high",
    status: "in-progress",
    location: "Bangalore",
    engineerId: 2,
    engineerName: "Sarah Davis",
    createdAt: "2024-01-13T16:45:00Z",
    updatedAt: "2024-01-14T11:30:00Z"
  },
  {
    id: 4,
    customerId: 4,
    customerName: "Sunita Verma",
    title: "WiFi Password Issues",
    description: "Unable to connect devices with provided password",
    priority: "low",
    status: "resolved",
    location: "Patna",
    engineerId: 3,
    engineerName: "Tom Wilson",
    resolution: "Password reset and shared with customer",
    rating: 5,
    feedback: "Quick resolution, very satisfied",
    createdAt: "2024-01-12T09:15:00Z",
    updatedAt: "2024-01-13T15:20:00Z",
    resolvedAt: "2024-01-13T15:20:00Z"
  },
  {
    id: 5,
    customerId: 5,
    customerName: "Vikram Singh",
    title: "Network Outage",
    description: "Complete network outage affecting entire floor",
    priority: "urgent",
    status: "pending",
    location: "Hyderabad",
    engineerId: null,
    engineerName: null,
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-01-15T08:00:00Z"
  }
];

export const generateDummySupportTickets = (): SupportTicket[] => [
  {
    id: 1,
    customerId: 1,
    customerName: "Rajesh Kumar",
    subject: "Billing inquiry for December",
    message: "I have questions about my December bill charges",
    priority: "medium",
    status: "open",
    category: "billing",
    tags: ["billing", "december", "charges"],
    attachments: [],
    slaBreached: false,
    escalated: false,
    createdAt: "2024-01-15T09:00:00Z",
    updatedAt: "2024-01-15T09:00:00Z"
  },
  {
    id: 2,
    customerId: 2,
    customerName: "Priya Sharma",
    subject: "Technical support needed",
    message: "Need help configuring my new router settings",
    priority: "high",
    status: "in-progress",
    category: "technical",
    assignedTo: 1,
    assignedToName: "Mike Johnson",
    tags: ["router", "configuration", "technical"],
    attachments: ["router_model.jpg"],
    slaBreached: false,
    escalated: false,
    createdAt: "2024-01-14T11:30:00Z",
    updatedAt: "2024-01-15T08:45:00Z"
  },
  {
    id: 3,
    customerId: 3,
    customerName: "Amit Patel",
    subject: "Service complaint",
    message: "Frequent disconnections during peak hours",
    priority: "high",
    status: "resolved",
    category: "complaint",
    assignedTo: 2,
    assignedToName: "Sarah Davis",
    response: "Network optimization completed in your area",
    rating: 4,
    feedback: "Issue resolved quickly",
    tags: ["disconnection", "peak-hours", "network"],
    attachments: [],
    slaBreached: false,
    escalated: false,
    createdAt: "2024-01-10T14:20:00Z",
    updatedAt: "2024-01-12T16:30:00Z",
    resolvedAt: "2024-01-12T16:30:00Z"
  }
];

export const generateDummyNotifications = (): Notification[] => [
  {
    id: 1,
    title: "System Maintenance Scheduled",
    message: "Network maintenance will be performed on January 20th from 2:00 AM to 4:00 AM",
    type: "info",
    priority: "medium",
    recipientType: "all-customers",
    recipients: ["all"],
    sentBy: 1,
    sentByName: "Admin User",
    sentAt: "2024-01-15T10:00:00Z",
    deliveredCount: 1250,
    readCount: 980,
    totalRecipients: 1250,
    status: "sent",
    channels: {
      push: true,
      email: true,
      sms: false
    }
  },
  {
    id: 2,
    title: "Emergency Network Issue",
    message: "We are experiencing network issues in South Mumbai. Our team is working to resolve this.",
    type: "warning",
    priority: "high",
    recipientType: "location-based",
    recipients: ["Mumbai Central", "South Mumbai"],
    sentBy: 2,
    sentByName: "Manager User",
    sentAt: "2024-01-14T16:30:00Z",
    deliveredCount: 450,
    readCount: 420,
    totalRecipients: 450,
    status: "sent",
    channels: {
      push: true,
      email: true,
      sms: true
    }
  }
];

export const generateDashboardStats = (): DashboardStats => ({
  totalComplaints: 156,
  activeComplaints: 23,
  resolvedToday: 8,
  avgResolutionTime: 4.2,
  totalEngineers: 25,
  activeEngineers: 22,
  totalCustomers: 1847,
  networkUptime: 99.2,
  customerSatisfaction: 4.3,
  monthlyRevenue: 2847650
});