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
  validity: number | string;
  description: string;
  features: string[];
  subscribers: number;
  rating: number;
  isActive: boolean;
  createdAt: string;
  title?: string;
  dataLimit?: string;
  logo?: string;
  benefits?: string;
  planType?: 'Basic' | 'Premium' | 'Enterprise' | 'Gold';
}

export interface NewInstallation {
  id: number;
  customerName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  address: string;
  location: string;
  aadharFront?: string; // File path/URL for Aadhar front
  aadharBack?: string;  // File path/URL for Aadhar back
  passportPhoto?: string; // File path/URL for passport size photo
  preferredPlan: string | null;
  requestType: 'residential' | 'commercial';
  status: 'pending' | 'confirmed' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedCost: number | null;
  notes: string | null;
  assignedEngineerId: number | null;
  assignedEngineerName: string | null;
  scheduledDate: string | null;
  installationDate: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  address: string; // Added address field
  location: string | null;
  source: 'website' | 'ivr' | 'whatsapp' | 'referral' | 'social_media';
  inquiryType: 'general' | 'pricing' | 'technical' | 'support';
  message: string | null;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isContactedByManager: boolean;
  assignedTo: number | null;
  assignedToName: string | null;
  followUpDate: string | null;
  lastContactDate: string | null;
  conversionProbability: number;
  estimatedValue: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
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

// Product Management Interfaces
export interface Product {
  id: number;
  name: string;
  model: string;
  brand: string;
  category: 'modem' | 'router' | 'cable' | 'antenna' | 'adapter' | 'switch' | 'extender' | 'fiber-cable' | 'power-supply';
  productType: 'user-sale' | 'engineer-only';
  description: string;
  specifications: {
    [key: string]: string;
  };
  price: number;
  stock: number;
  lowStockThreshold: number;
  status: 'active' | 'inactive' | 'discontinued';
  images: string[];
  warranty: string;
  supplier: string;
  supplierContact: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  productId: number;
  productName: string;
  customerId?: number;
  customerName?: string;
  engineerId?: number;
  engineerName?: string;
  orderType: 'user-purchase' | 'engineer-request' | 'stock-replenishment';
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: 'pending' | 'approved' | 'shipped' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deliveryAddress: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
}

export interface ProductFeedback {
  id: number;
  productId: number;
  productName: string;
  customerId?: number;
  customerName?: string;
  engineerId?: number;
  engineerName?: string;
  rating: number;
  title: string;
  comment: string;
  pros: string[];
  cons: string[];
  wouldRecommend: boolean;
  verifiedPurchase: boolean;
  helpfulVotes: number;
  createdAt: string;
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
    name: "JioFiber Gold Plan",
    title: "JioFiber Gold Plan - 1 Year",
    provider: "jio",
    speed: "300 Mbps",
    price: 8499,
    validity: "12 Months",
    dataLimit: "Unlimited",
    description: "JioFiber Gold Plan offers blazing 300 Mbps speed with unlimited data, making it ideal for large families or work-from-home setups. Includes major OTT subscriptions.",
    benefits: "Netflix + Prime + Disney+ Hotstar",
    planType: "Premium",
    logo: "https://logos-world.net/wp-content/uploads/2020/11/Jio-Logo.png",
    features: ["Unlimited Data", "Netflix Premium", "Amazon Prime", "Disney+ Hotstar", "Free Router", "24/7 Support"],
    subscribers: 3250,
    rating: 4.8,
    isActive: true,
    createdAt: "2024-01-15T10:00:00Z"
  },
  {
    id: 2,
    name: "JioFiber Premium",
    title: "JioFiber Premium - 6 Months",
    provider: "jio",
    speed: "100 Mbps",
    price: 3999,
    validity: "6 Months",
    dataLimit: "Unlimited",
    description: "High-speed internet perfect for streaming, gaming, and work from home requirements",
    benefits: "Netflix Basic + Disney+ Hotstar",
    planType: "Premium",
    logo: "https://logos-world.net/wp-content/uploads/2020/11/Jio-Logo.png",
    features: ["Unlimited Data", "Netflix Basic", "Disney+ Hotstar", "Free Router", "Installation Support"],
    subscribers: 2100,
    rating: 4.5,
    isActive: true,
    createdAt: "2024-01-15T10:00:00Z"
  },
  {
    id: 3,
    name: "Airtel Xstream Fiber",
    title: "Airtel Xstream Fiber - Premium",
    provider: "airtel",
    speed: "200 Mbps",
    price: 5999,
    validity: "12 Months",
    dataLimit: "Unlimited",
    description: "Ultra-fast fiber connection with premium OTT benefits and superior customer service",
    benefits: "Airtel Xstream + Netflix + Amazon Prime",
    planType: "Premium",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Airtel_logo.svg/512px-Airtel_logo.svg.png",
    features: ["Unlimited Data", "Airtel Xstream Premium", "Netflix", "Amazon Prime", "Free Installation", "Wi-Fi 6 Router"],
    subscribers: 1850,
    rating: 4.6,
    isActive: true,
    createdAt: "2024-01-15T10:00:00Z"
  },
  {
    id: 4,
    name: "BSNL Fiber Enterprise",
    title: "BSNL Fiber Enterprise - Business",
    provider: "bsnl",
    speed: "500 Mbps",
    price: 12999,
    validity: "12 Months",
    dataLimit: "Unlimited",
    description: "Enterprise-grade fiber solution with dedicated support and guaranteed uptime for businesses",
    benefits: "Dedicated Support + Static IP + Business Email",
    planType: "Enterprise",
    features: ["Unlimited Data", "Static IP", "Dedicated Support", "99.9% Uptime SLA", "Business Email", "Advanced Router"],
    subscribers: 450,
    rating: 4.4,
    isActive: true,
    createdAt: "2024-01-15T10:00:00Z"
  },
  {
    id: 5,
    name: "Airtel Basic",
    title: "Airtel Basic - Starter Pack",
    provider: "airtel",
    speed: "40 Mbps",
    price: 599,
    validity: 30,
    dataLimit: "500 GB",
    description: "Perfect starter plan for basic internet needs with essential OTT benefits",
    benefits: "Airtel Xstream App",
    planType: "Basic",
    features: ["500 GB Data", "Airtel Xstream App", "Free Installation", "Email Support"],
    subscribers: 950,
    rating: 4.1,
    isActive: true,
    createdAt: "2024-01-15T10:00:00Z"
  },
  {
    id: 6,
    name: "My Internet Pro",
    title: "My Internet Pro - Ultimate",
    provider: "my-internet",
    speed: "1 Gbps",
    price: 15999,
    validity: "12 Months",
    dataLimit: "Unlimited",
    description: "Ultra-premium gigabit connection for power users, content creators, and tech enthusiasts",
    benefits: "All OTT Apps + Gaming Server Access",
    planType: "Enterprise",
    features: ["1 Gbps Speed", "All OTT Subscriptions", "Gaming Server Access", "Priority Support", "Wi-Fi 6E Router", "Free Setup"],
    subscribers: 125,
    rating: 4.9,
    isActive: true,
    createdAt: "2024-01-15T10:00:00Z"
  },
  {
    id: 7,
    name: "BSNL Basic",
    title: "BSNL Basic - Economic",
    provider: "bsnl",
    speed: "25 Mbps",
    price: 299,
    validity: 30,
    dataLimit: "200 GB",
    description: "Most affordable option for basic browsing and essential connectivity needs",
    benefits: "Email Support",
    planType: "Basic",
    features: ["200 GB Data", "Basic Router", "Email Support", "Standard Installation"],
    subscribers: 680,
    rating: 3.8,
    isActive: true,
    createdAt: "2024-01-15T10:00:00Z"
  },
  {
    id: 8,
    name: "JioFiber Entertainment",
    title: "JioFiber Entertainment - Family Pack",
    provider: "jio",
    speed: "150 Mbps",
    price: 1299,
    validity: 90,
    dataLimit: "Unlimited",
    description: "Perfect family entertainment package with multiple OTT subscriptions and high-speed internet",
    benefits: "Netflix + Prime + 10 OTT Apps",
    planType: "Gold",
    features: ["Unlimited Data", "Netflix Standard", "Amazon Prime", "Disney+ Hotstar", "Sony LIV", "ZEE5", "Family Router"],
    subscribers: 1650,
    rating: 4.7,
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

// Product Management Dummy Data Generators
export const generateDummyProducts = (): Product[] => [
  {
    id: 1,
    name: "TP-Link Archer AX73 WiFi 6 Router",
    model: "Archer AX73",
    brand: "TP-Link",
    category: "router",
    productType: "user-sale",
    description: "High-performance WiFi 6 router with 4804 Mbps + 574 Mbps dual-band speed, 6 high-gain antennas, and advanced security features.",
    specifications: {
      "WiFi Standard": "802.11ax (WiFi 6)",
      "Speed": "AX5400 (4804 + 574 Mbps)",
      "Antenna": "6 × high-gain antennas",
      "Ports": "1 × Gigabit WAN, 4 × Gigabit LAN, 1 × USB 3.0",
      "Processor": "1.5GHz Triple-Core CPU",
      "Coverage": "Up to 2,500 sq ft"
    },
    price: 12999,
    stock: 45,
    lowStockThreshold: 10,
    status: "active",
    images: ["/products/tp-link-ax73-1.jpg", "/products/tp-link-ax73-2.jpg"],
    warranty: "2 years",
    supplier: "TP-Link India Pvt Ltd",
    supplierContact: "+91 80 4017 9999",
    location: "Mumbai Warehouse A",
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-20T15:30:00Z"
  },
  {
    id: 2,
    name: "D-Link DSL-2750U ADSL2+ Modem Router",
    model: "DSL-2750U",
    brand: "D-Link",
    category: "modem",
    productType: "user-sale",
    description: "ADSL2+ wireless N300 modem router with 4-port switch, ideal for home and small office use.",
    specifications: {
      "Technology": "ADSL2+",
      "WiFi Speed": "300 Mbps (2.4GHz)",
      "Ports": "4 × 10/100 Ethernet LAN",
      "Antenna": "2 × 5dBi detachable antennas",
      "Features": "QoS, Firewall, VPN Pass-through"
    },
    price: 2999,
    stock: 78,
    lowStockThreshold: 15,
    status: "active",
    images: ["/products/dlink-2750u-1.jpg"],
    warranty: "1 year",
    supplier: "D-Link India Ltd",
    supplierContact: "+91 11 4710 9200",
    location: "Delhi Warehouse B",
    createdAt: "2024-01-05T10:00:00Z",
    updatedAt: "2024-01-18T12:45:00Z"
  },
  {
    id: 3,
    name: "Cat6 Ethernet Cable - 50 Meter",
    model: "CAT6-50M",
    brand: "AMP Netconnect",
    category: "cable",
    productType: "engineer-only",
    description: "High-quality Category 6 UTP cable for professional networking installations. Supports Gigabit Ethernet.",
    specifications: {
      "Category": "Cat 6 UTP",
      "Length": "50 meters",
      "Speed": "Up to 1 Gbps",
      "Bandwidth": "250 MHz",
      "Conductor": "23 AWG solid copper",
      "Jacket": "PVC, flame retardant"
    },
    price: 1899,
    stock: 156,
    lowStockThreshold: 25,
    status: "active",
    images: ["/products/cat6-cable-1.jpg"],
    warranty: "5 years",
    supplier: "AMP Netconnect India",
    supplierContact: "+91 80 2665 8800",
    location: "Bangalore Warehouse C",
    createdAt: "2024-01-08T10:00:00Z",
    updatedAt: "2024-01-22T09:15:00Z"
  },
  {
    id: 4,
    name: "Netgear Nighthawk X6S Tri-Band Router",
    model: "R8000P",
    brand: "Netgear",
    category: "router",
    productType: "user-sale",
    description: "Premium tri-band WiFi router with MU-MIMO technology, Smart Connect, and dynamic QoS for ultimate performance.",
    specifications: {
      "WiFi Standard": "802.11ac",
      "Speed": "AC4000 (750 + 1625 + 1625 Mbps)",
      "Bands": "Tri-band (1 × 2.4GHz + 2 × 5GHz)",
      "Antenna": "6 × high-performance antennas",
      "Ports": "1 × Gigabit WAN, 4 × Gigabit LAN, 2 × USB 3.0",
      "Processor": "1.8GHz Dual-Core"
    },
    price: 24999,
    stock: 23,
    lowStockThreshold: 5,
    status: "active",
    images: ["/products/netgear-r8000p-1.jpg", "/products/netgear-r8000p-2.jpg"],
    warranty: "2 years",
    supplier: "Netgear India",
    supplierContact: "+91 80 4172 6400",
    location: "Chennai Warehouse D",
    createdAt: "2024-01-12T10:00:00Z",
    updatedAt: "2024-01-25T14:20:00Z"
  },
  {
    id: 5,
    name: "Fiber Optic Patch Cord - SC to LC",
    model: "FOC-SC-LC-3M",
    brand: "Panduit",
    category: "fiber-cable",
    productType: "engineer-only",
    description: "Single-mode fiber optic patch cord with SC and LC connectors. 3-meter length for professional installations.",
    specifications: {
      "Fiber Type": "Single-mode 9/125μm",
      "Length": "3 meters",
      "Connector A": "SC/UPC",
      "Connector B": "LC/UPC",
      "Insertion Loss": "≤ 0.3dB",
      "Return Loss": "≥ 50dB"
    },
    price: 599,
    stock: 234,
    lowStockThreshold: 50,
    status: "active",
    images: ["/products/fiber-patch-cord-1.jpg"],
    warranty: "1 year",
    supplier: "Panduit India Pvt Ltd",
    supplierContact: "+91 124 471 6000",
    location: "Gurgaon Warehouse E",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-26T11:30:00Z"
  },
  {
    id: 6,
    name: "24-Port Gigabit Ethernet Switch",
    model: "TL-SG1024",
    brand: "TP-Link",
    category: "switch",
    productType: "engineer-only",
    description: "Unmanaged 24-port Gigabit Ethernet switch for expanding network capacity in professional environments.",
    specifications: {
      "Ports": "24 × 10/100/1000 Mbps Auto-Negotiation",
      "Switching Capacity": "48 Gbps",
      "MAC Address Table": "8K",
      "Buffer Memory": "4.1 Mb",
      "Power Consumption": "16.5W maximum",
      "Mounting": "Desktop/Rack mountable"
    },
    price: 8999,
    stock: 34,
    lowStockThreshold: 8,
    status: "active",
    images: ["/products/tp-link-sg1024-1.jpg"],
    warranty: "Lifetime",
    supplier: "TP-Link India Pvt Ltd",
    supplierContact: "+91 80 4017 9999",
    location: "Hyderabad Warehouse F",
    createdAt: "2024-01-18T10:00:00Z",
    updatedAt: "2024-01-27T16:45:00Z"
  },
  {
    id: 7,
    name: "WiFi Range Extender AC1200",
    model: "RE315",
    brand: "TP-Link",
    category: "extender",
    productType: "user-sale",
    description: "Dual-band WiFi range extender that boosts WiFi coverage up to 1200 Mbps with OneMesh technology.",
    specifications: {
      "WiFi Speed": "AC1200 (300 + 867 Mbps)",
      "Coverage": "Up to 1,500 sq ft",
      "Antenna": "2 × dual-band antennas",
      "Ethernet Port": "1 × Gigabit Ethernet",
      "Features": "OneMesh, AP Mode, High-Speed Mode"
    },
    price: 2499,
    stock: 67,
    lowStockThreshold: 12,
    status: "active",
    images: ["/products/tp-link-re315-1.jpg"],
    warranty: "1 year",
    supplier: "TP-Link India Pvt Ltd",
    supplierContact: "+91 80 4017 9999",
    location: "Pune Warehouse G",
    createdAt: "2024-01-20T10:00:00Z",
    updatedAt: "2024-01-28T13:15:00Z"
  },
  {
    id: 8,
    name: "12V 2A Power Adapter",
    model: "PSU-12V2A",
    brand: "Generic",
    category: "power-supply",
    productType: "engineer-only",
    description: "Universal 12V 2A switching power adapter for routers, modems, and networking equipment.",
    specifications: {
      "Input": "100-240V AC, 50/60Hz",
      "Output": "12V DC, 2A",
      "Connector": "5.5mm × 2.1mm DC jack",
      "Cable Length": "1.5 meters",
      "Protection": "Over-current, Over-voltage, Short-circuit",
      "Efficiency": ">80%"
    },
    price: 399,
    stock: 189,
    lowStockThreshold: 30,
    status: "active",
    images: ["/products/power-adapter-12v-1.jpg"],
    warranty: "6 months",
    supplier: "Power Solutions India",
    supplierContact: "+91 22 2834 5600",
    location: "Mumbai Warehouse A",
    createdAt: "2024-01-22T10:00:00Z",
    updatedAt: "2024-01-29T10:00:00Z"
  }
];

export const generateDummyOrders = (): Order[] => [
  {
    id: 1,
    orderNumber: "ORD-2024-001",
    productId: 1,
    productName: "TP-Link Archer AX73 WiFi 6 Router",
    customerId: 1,
    customerName: "Rajesh Kumar",
    orderType: "user-purchase",
    quantity: 1,
    unitPrice: 12999,
    totalAmount: 12999,
    status: "delivered",
    priority: "medium",
    deliveryAddress: "123 Main St, Mumbai Central",
    notes: "Delivered to security guard",
    createdAt: "2024-01-20T10:00:00Z",
    updatedAt: "2024-01-25T16:30:00Z",
    deliveredAt: "2024-01-25T16:30:00Z"
  },
  {
    id: 2,
    orderNumber: "ORD-2024-002",
    productId: 3,
    productName: "Cat6 Ethernet Cable - 50 Meter",
    engineerId: 1,
    engineerName: "Mike Johnson",
    orderType: "engineer-request",
    quantity: 3,
    unitPrice: 1899,
    totalAmount: 5697,
    status: "approved",
    priority: "high",
    deliveryAddress: "Field Service Location - Mumbai Central",
    notes: "Required for customer installation",
    createdAt: "2024-01-22T09:15:00Z",
    updatedAt: "2024-01-22T14:20:00Z"
  },
  {
    id: 3,
    orderNumber: "ORD-2024-003",
    productId: 4,
    productName: "Netgear Nighthawk X6S Tri-Band Router",
    customerId: 3,
    customerName: "Amit Patel",
    orderType: "user-purchase",
    quantity: 1,
    unitPrice: 24999,
    totalAmount: 24999,
    status: "shipped",
    priority: "medium",
    deliveryAddress: "789 Tech Park, Bangalore",
    createdAt: "2024-01-24T11:30:00Z",
    updatedAt: "2024-01-26T09:45:00Z"
  },
  {
    id: 4,
    orderNumber: "ORD-2024-004",
    productId: 6,
    productName: "24-Port Gigabit Ethernet Switch",
    engineerId: 2,
    engineerName: "Sarah Davis",
    orderType: "engineer-request",
    quantity: 1,
    unitPrice: 8999,
    totalAmount: 8999,
    status: "pending",
    priority: "urgent",
    deliveryAddress: "Corporate Office - Delhi NCR",
    notes: "Urgent replacement needed for network outage",
    createdAt: "2024-01-26T14:00:00Z",
    updatedAt: "2024-01-26T14:00:00Z"
  },
  {
    id: 5,
    orderNumber: "ORD-2024-005",
    productId: 7,
    productName: "WiFi Range Extender AC1200",
    customerId: 4,
    customerName: "Sunita Verma",
    orderType: "user-purchase",
    quantity: 2,
    unitPrice: 2499,
    totalAmount: 4998,
    status: "delivered",
    priority: "low",
    deliveryAddress: "321 Rural Lane, Patna",
    createdAt: "2024-01-25T16:20:00Z",
    updatedAt: "2024-01-28T11:15:00Z",
    deliveredAt: "2024-01-28T11:15:00Z"
  }
];

export const generateDummyProductFeedback = (): ProductFeedback[] => [
  {
    id: 1,
    productId: 1,
    productName: "TP-Link Archer AX73 WiFi 6 Router",
    customerId: 1,
    customerName: "Rajesh Kumar",
    rating: 5,
    title: "Excellent WiFi 6 Performance",
    comment: "Amazing speed and coverage. WiFi 6 makes a huge difference for streaming and gaming.",
    pros: ["Fast WiFi 6 speeds", "Great coverage", "Easy setup", "Stable connection"],
    cons: ["Slightly expensive", "Large size"],
    wouldRecommend: true,
    verifiedPurchase: true,
    helpfulVotes: 12,
    createdAt: "2024-01-28T10:30:00Z"
  },
  {
    id: 2,
    productId: 2,
    productName: "D-Link DSL-2750U ADSL2+ Modem Router",
    customerId: 2,
    customerName: "Priya Sharma",
    rating: 4,
    title: "Good value for money",
    comment: "Works well for basic internet needs. Setup was straightforward and it's been reliable.",
    pros: ["Affordable", "Easy setup", "Reliable for basic use"],
    cons: ["Limited range", "Only 2.4GHz"],
    wouldRecommend: true,
    verifiedPurchase: true,
    helpfulVotes: 8,
    createdAt: "2024-01-26T14:20:00Z"
  },
  {
    id: 3,
    productId: 4,
    productName: "Netgear Nighthawk X6S Tri-Band Router",
    customerId: 3,
    customerName: "Amit Patel",
    rating: 5,
    title: "Premium Performance Router",
    comment: "Outstanding tri-band performance. Perfect for heavy usage with multiple devices.",
    pros: ["Tri-band technology", "Excellent speed", "Advanced features", "Great app control"],
    cons: ["Expensive", "Complex for beginners"],
    wouldRecommend: true,
    verifiedPurchase: true,
    helpfulVotes: 15,
    createdAt: "2024-01-29T16:45:00Z"
  },
  {
    id: 4,
    productId: 7,
    productName: "WiFi Range Extender AC1200",
    customerId: 4,
    customerName: "Sunita Verma",
    rating: 4,
    title: "Great range extension",
    comment: "Solved my WiFi dead zones perfectly. Easy to install and works seamlessly.",
    pros: ["Easy installation", "Good range extension", "OneMesh compatibility"],
    cons: ["Speed reduction in extended areas"],
    wouldRecommend: true,
    verifiedPurchase: true,
    helpfulVotes: 6,
    createdAt: "2024-01-30T09:10:00Z"
  }
];

// Generate New Installations dummy data
export const generateDummyNewInstallations = (): NewInstallation[] => [
  {
    id: 1,
    customerName: "Rajesh Kumar",
    email: "rajesh.kumar@gmail.com",
    phone: "+91 98765 43210",
    alternatePhone: "+91 98765 43211",
    address: "123 Tech Park Road, Sector 5",
    location: "Bangalore",
    aadharFront: "/uploads/aadhar-front-1.jpg",
    aadharBack: "/uploads/aadhar-back-1.jpg",
    passportPhoto: "/uploads/passport-1.jpg",
    preferredPlan: "Jio Fiber 100 Mbps",
    requestType: "residential",
    status: "pending",
    priority: "medium",
    estimatedCost: 3500,
    notes: "Customer requested evening installation between 4-6 PM",
    assignedEngineerId: null,
    assignedEngineerName: null,
    scheduledDate: null,
    installationDate: null,
    rejectionReason: null,
    createdAt: "2024-01-25T10:30:00Z",
    updatedAt: "2024-01-25T10:30:00Z"
  },
  {
    id: 2,
    customerName: "Priya Sharma",
    email: "priya.sharma@yahoo.com",
    phone: "+91 87654 32109",
    alternatePhone: "+91 87654 32110",
    address: "456 Residential Complex, Phase 2",
    location: "Mumbai",
    aadharFront: "/uploads/aadhar-front-2.jpg",
    aadharBack: "/uploads/aadhar-back-2.jpg",
    passportPhoto: "/uploads/passport-2.jpg",
    preferredPlan: "BSNL Broadband 50 Mbps",
    requestType: "residential",
    status: "confirmed",
    priority: "high",
    estimatedCost: 2800,
    notes: "Pre-wiring already done by customer",
    assignedEngineerId: 1,
    assignedEngineerName: "John Doe",
    scheduledDate: "2024-02-05T09:00:00Z",
    installationDate: null,
    rejectionReason: null,
    createdAt: "2024-01-22T14:15:00Z",
    updatedAt: "2024-01-26T11:20:00Z"
  },
  {
    id: 3,
    customerName: "Amit Patel",
    email: "amit.patel@company.co.in",
    phone: "+91 76543 21098",
    address: "789 Business Center, Commercial Zone",
    location: "Delhi NCR",
    preferredPlan: "Airtel Corporate 500 Mbps",
    requestType: "commercial",
    status: "rejected",
    priority: "low",
    estimatedCost: null,
    notes: "Commercial installation requires additional approvals",
    assignedEngineerId: null,
    assignedEngineerName: null,
    scheduledDate: null,
    installationDate: null,
    rejectionReason: "Infrastructure not suitable for high-speed connection",
    createdAt: "2024-01-20T16:45:00Z",
    updatedAt: "2024-01-24T09:30:00Z"
  },
  {
    id: 4,
    customerName: "Sunita Verma",
    email: "sunita.verma@hotmail.com",
    phone: "+91 91234 56789",
    address: "321 Garden View Apartments",
    location: "Chennai",
    preferredPlan: "My Internet Premium 200 Mbps",
    requestType: "residential",
    status: "confirmed",
    priority: "urgent",
    estimatedCost: 4200,
    notes: "Customer is relocating, needs urgent installation",
    assignedEngineerId: 4,
    assignedEngineerName: "Ravi Singh",
    scheduledDate: "2024-02-01T08:00:00Z",
    installationDate: null,
    rejectionReason: null,
    createdAt: "2024-01-28T11:20:00Z",
    updatedAt: "2024-01-28T15:45:00Z"
  },
  {
    id: 5,
    customerName: "Vikram Singh",
    email: "vikram.singh@gmail.com",
    phone: "+91 98123 45678",
    address: "654 IT Corridor, Tech City",
    location: "Hyderabad",
    preferredPlan: "Jio Fiber Business 300 Mbps",
    requestType: "commercial",
    status: "pending",
    priority: "high",
    estimatedCost: 6800,
    notes: "Office setup for 20 employees, requires multiple access points",
    assignedEngineerId: null,
    assignedEngineerName: null,
    scheduledDate: null,
    installationDate: null,
    rejectionReason: null,
    createdAt: "2024-01-29T09:15:00Z",
    updatedAt: "2024-01-29T09:15:00Z"
  }
];

// Generate Leads dummy data
export const generateDummyLeads = (): Lead[] => [
  {
    id: 1,
    name: "Deepak Agarwal",
    email: "deepak.agarwal@email.com",
    phone: "+91 99887 66554",
    address: "45 IT Park, Hinjewadi Phase 1, Pune",
    location: "Pune",
    source: "website",
    inquiryType: "pricing",
    message: "Looking for high-speed internet plans for home office",
    status: "new",
    priority: "medium",
    isContactedByManager: false,
    assignedTo: null,
    assignedToName: null,
    followUpDate: "2024-02-02T10:00:00Z",
    lastContactDate: null,
    conversionProbability: 60,
    estimatedValue: 12000,

    notes: "Interested in 100+ Mbps plans",
    createdAt: "2024-01-30T14:22:00Z",
    updatedAt: "2024-01-30T14:22:00Z"
  },
  {
    id: 2,
    name: "Kavya Reddy",
    email: "kavya.reddy@gmail.com",
    phone: "+91 88776 65443",
    address: "78 Software Layout, Electronic City",
    location: "Bangalore",
    source: "ivr",
    inquiryType: "general",
    message: null,
    status: "contacted",
    priority: "high",
    isContactedByManager: true,
    assignedTo: 1,
    assignedToName: "Admin User",
    followUpDate: "2024-02-05T15:30:00Z",
    lastContactDate: "2024-01-29T16:45:00Z",
    conversionProbability: 85,
    estimatedValue: 18000,

    notes: "Very interested, comparing with competitors",
    createdAt: "2024-01-28T11:30:00Z",
    updatedAt: "2024-01-29T16:45:00Z"
  },
  {
    id: 3,
    name: "Mohit Gupta",
    email: null,
    phone: "+91 77665 54332",
    address: "12 Cyber Hub, Sector 15, Gurgaon",
    location: "Gurgaon",
    source: "whatsapp",
    inquiryType: "technical",
    message: "Need fiber connection for gaming, low latency required",
    status: "qualified",
    priority: "medium",
    isContactedByManager: true,
    assignedTo: 1,
    assignedToName: "Admin User",
    followUpDate: "2024-02-03T11:00:00Z",
    lastContactDate: "2024-01-27T14:20:00Z",
    conversionProbability: 70,
    estimatedValue: 15000,

    notes: "Gaming enthusiast, prefers fiber over cable",
    createdAt: "2024-01-26T09:45:00Z",
    updatedAt: "2024-01-27T14:20:00Z"
  },
  {
    id: 4,
    name: "Ananya Joshi",
    email: "ananya.joshi@company.com",
    phone: "+91 66554 43321",
    address: "34 Business District, Bandra East",
    location: "Mumbai",
    source: "referral",
    inquiryType: "pricing",
    message: "Referred by existing customer, need commercial plan",
    status: "converted",
    priority: "high",
    isContactedByManager: true,
    assignedTo: 1,
    assignedToName: "Admin User",
    followUpDate: null,
    lastContactDate: "2024-01-25T10:15:00Z",
    conversionProbability: 100,
    estimatedValue: 25000,

    notes: "Successfully converted to commercial plan subscription",
    createdAt: "2024-01-24T08:30:00Z",
    updatedAt: "2024-01-25T10:15:00Z"
  },
  {
    id: 5,
    name: "Suresh Yadav",
    email: "suresh.yadav@yahoo.com",
    phone: "+91 55443 32210",
    address: "56 Pink City Area, Civil Lines",
    location: "Jaipur",
    source: "social_media",
    inquiryType: "support",
    message: "Saw your Facebook ad, interested in rural connectivity",
    status: "closed",
    priority: "low",
    isContactedByManager: false,
    assignedTo: null,
    assignedToName: null,
    followUpDate: null,
    lastContactDate: "2024-01-23T13:45:00Z",
    conversionProbability: 20,
    estimatedValue: null,

    notes: "Not in service area, closed after initial contact",
    createdAt: "2024-01-22T16:20:00Z",
    updatedAt: "2024-01-23T13:45:00Z"
  },
  {
    id: 6,
    name: "Ravi Kumar",
    email: "ravi.kumar@tech.in",
    phone: "+91 44332 21109",
    address: "89 Tech Park, OMR Road",
    location: "Chennai",
    source: "website",
    inquiryType: "technical",
    message: "Need dedicated IP for server hosting",
    status: "new",
    priority: "urgent",
    isContactedByManager: false,
    assignedTo: null,
    assignedToName: null,
    followUpDate: "2024-02-01T09:00:00Z",
    lastContactDate: null,
    conversionProbability: 80,
    estimatedValue: 35000,

    notes: "Requires technical consultation for server hosting setup",
    createdAt: "2024-01-30T17:10:00Z",
    updatedAt: "2024-01-30T17:10:00Z"
  }
];

// Export data arrays for easy access
export const dummyUsers = generateDummyUsers();
export const dummyCustomers = generateDummyCustomers();
export const dummyEngineers = generateDummyEngineers();
export const dummyServicePlans = generateDummyServicePlans();
export const dummyComplaints = generateDummyComplaints();
export const dummySupportTickets = generateDummySupportTickets();
export const dummyNotifications = generateDummyNotifications();
export const dashboardStats = generateDashboardStats();
export const dummyProducts = generateDummyProducts();
export const dummyOrders = generateDummyOrders();
export const dummyProductFeedback = generateDummyProductFeedback();
export const dummyNewInstallations = generateDummyNewInstallations();
export const dummyLeads = generateDummyLeads();