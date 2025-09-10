export enum AreaType {
  URBAN = "urban",
  RURAL = "rural"
}

export enum Mode {
  ONLINE = "online",
  OFFLINE = "offline",
  STANDBY = "standby"
}

// API Response Types based on the provided JSON structure
export interface ClientData {
  _id: string;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
  profileImage?: string;
  acquisitionType: string;
  bbPlan: string;
  bbUserId: string;
  ftthExchangePlan: string;
  mtceFranchise: string;
  ruralUrban: string;
  workingStatus: string;
  fullName: string;
  isActive: boolean;
  countryCode?: string;
}

export interface ModemDetail {
  _id: string;
  userId: string;
  modemName: string;
  ontType: string;
  modelNumber: string;
  serialNumber: string;
  ontMac: string;
  username: string;
  password: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FdbDetail {
  _id: string;
  fdbName: string;
  fdbType: string;
  fdbPower: number;
  latitude: number;
  longitude: number;
  input: {
    type: string;
    id: string;
    port: number;
    description: string;
  };
  powerStatus: string;
  status: string;
  ownedBy: string;
  attachments: string[];
  outputs: Array<{
    type: string;
    id: string;
    description: string;
  }>;
  createdAt: string;
  updatedAt: string;
  fdbId: string;
  location: {
    type: string;
    coordinates: number[];
  };
}

export interface OltDetail {
  _id: string;
  oltIp: string;
  macAddress: string;
  serialNumber: string;
  latitude: number;
  longitude: number;
  oltType: string;
  powerStatus: string;
  oltPower: number;
  status: string;
  dnsServers: string[];
  ownedBy: string;
  attachments: string[];
  outputs: any[];
  createdAt: string;
  updatedAt: string;
  oltId: string;
  location: {
    type: string;
    coordinates: number[];
  };
  name: string;
}

export interface CustomerDetail {
  _id: string;
  userId: string;
  fdbId: FdbDetail;
  oltId: OltDetail;
  installationDate: string;
  balanceDue: number;
  attachments: string[];
  isInstalled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ComplaintData {
  _id: string;
  user: string;
  title: string;
  issueDescription: string;
  complaintType: string;
  type: string;
  issueType: string;
  phoneNumber: string;
  priority: string;
  status: string;
  statusColor: string;
  resolved: boolean;
  otpVerified: boolean;
  isReComplaint: boolean;
  attachments: string[];
  resolutionAttachments: string[];
  statusHistory: Array<{
    status: string;
    remarks: string;
    metadata: any;
    updatedBy: string;
    updatedAt: string;
    additionalInfo?: any;
    _id: string;
    id: string;
    previousStatus?: string;
  }>;
  createdAt: string;
  updatedAt: string;
  id: string;
  assignedBy?: string;
  engineer?: {
    _id: string;
    email: string;
    phoneNumber: string;
  };
  resolutionTimeInHours?: number;
  attachmentCount: number;
  statusHistoryCount: number;
  resolutionAttachmentCount: number;
  latestStatusChange: {
    status: string;
    remarks: string;
    updatedAt: string;
    updatedBy: string;
  };
}

export interface OrderProduct {
  product: {
    _id: string;
    title: string;
    description: string;
    price: number;
    discount: number;
    category: string;
    images: string[];
    isActive: boolean;
    stock: number;
    sku: string;
    brand: string;
    tags: string[];
    averageRating: number;
    productType: string;
    createdAt: string;
    updatedAt: string;
    finalPrice: number;
    id: string;
  };
  quantity: number;
  price: number;
}

export interface OrderData {
  _id: string;
  user: string;
  products: OrderProduct[];
  deliveryAddress: string;
  name: string;
  phoneNumber: string;
  countryCode: string;
  state: string;
  district: string;
  pincode: string;
  paymentMethod: string;
  orderStatus: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  orderId: string;
}

export interface BillRequest {
  _id: string;
  userId: string;
  name: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  status: string;
  requestDate: string;
  createdAt: string;
  updatedAt: string;
  assignedAdmin?: string;
  billFileUrl?: string;
  billUploadDate?: string;
  paymentProofUrl?: string;
  paymentUploadDate?: string;
}

export interface InstallationRequest {
  _id: string;
  userId: string;
  applicationId?: string;
  name: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  alternateCountryCode?: string;
  alternatePhoneNumber?: string;
  aadhaarFrontUrl?: string;
  aadhaarBackUrl?: string;
  passportPhotoUrl?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  approvedDate?: string;
  assignedEngineer?: {
    _id: string;
    email: string;
    phoneNumber: string;
  };
  remarks?: string;
  iptvPlanId?: string;
  fibrePlanId?: string;
}

export interface InstallationRequests {
  wifi: InstallationRequest[];
  iptv: InstallationRequest[];
  ott: InstallationRequest[];
  fibre: InstallationRequest[];
}

export interface UserStatistics {
  totalComplaints: number;
  resolvedComplaints: number;
  pendingComplaints: number;
  totalOrders: number;
  totalLeads: number;
  totalBillRequests: number;
  totalInstallationRequests: number;
}

export interface UserDetailsResponse {
  success: boolean;
  message: string;
  data: {
    client: ClientData;
    modemDetail: ModemDetail;
    customerDetail: CustomerDetail;
    complaints: ComplaintData[];
    orders: OrderData[];
    leads: any[];
    billRequests: BillRequest[];
    installationRequests: InstallationRequests;
    statistics: UserStatistics;
  };
}

// Legacy UserData interface for backward compatibility
export interface UserData {
  // Basic Information
  email: string;
  name?: string;
  countryCode: string;
  phoneNumber: string;
  profileImage?: string;
  language?: string;
  country: string;
  userName: string;
  firstName: string;
  lastName: string;
  status?: string;
  group?: string;
  zone?: string;
  permanentAddress?: string;
  billingAddress?: string;
  balanceDue?: number;
  activationDate?: Date;
  expirationDate?: Date;
  staticIp?: string;
  macIp?: string;
  type?: string;
  fatherName?: string;
  area?: AreaType;
  mode?: Mode;
  isAccountVerified?: boolean;

  // New fields from Excel sheet
  oltIp?: string; // OLT_IP - Optical Line Terminal IP address
  mtceFranchise?: string; // MTCE_FRANCHISE - Maintenance Franchise
  category?: string; // CATEG - Category
  mobile?: string; // MOBILE - Mobile Number (separate from phoneNumber)
  bbUserId?: string; // BB_USER_ID - Broadband User ID
  ftthExchangePlan?: string; // FTTH_EXCH_PLAN - Fiber to the Home Exchange Plan
  bbPlan?: string; // BB_PLAN - Broadband Plan
  llInstallDate?: Date; // LL_INSTALL - Landline Installation Date
  workingStatus?: string; // WKG_ST - Working Status
  assigned?: string; // ASSIGNED
  ruralUrban?: string; // RURAL_UR - Rural/Urban
  acquisitionType?: string; // ACQUISITION_TYPE

  // Customer-specific fields for fiber network
  customerId?: string; // Auto-generated customer ID (e.g., CUS1234)
  customerType?: string; // residential, commercial, enterprise
  customerPower?: string; // on, off, standby
  bandwidth?: number; // in Mbps
  planId?: string; // Reference to plan
  installationDate?: Date; // Customer installation date
  lastBillingDate?: Date; // Last billing date
}

export interface UserFormData extends Omit<UserData, 'activationDate' | 'expirationDate' | 'llInstallDate' | 'installationDate' | 'lastBillingDate'> {
  activationDate?: string;
  expirationDate?: string;
  llInstallDate?: string;
  installationDate?: string;
  lastBillingDate?: string;
}

export interface Step1Data {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  countryCode: string;
  companyPreference?: string;
  customCompany?: string;
  permanentAddress?: string;
  residentialAddress?: string;
  landlineNumber?: string;
}

export interface Step2Data {
  modemName?: string;
  ontType?: string;
  modelNumber?: string;
  serialNumber?: string;
  ontMac?: string;
  username?: string;
  password?: string;
}

export interface Step3Data {
  oltId?: string; // OLT ID field
  fdbId?: string; // FDB ID field
  mtceFranchise?: string;
  bbUserId?: string;
  bbPassword?: string;
  ruralUrban?: string;
  acquisitionType?: string;
  category?: string;
  ftthExchangePlan?: string;
  llInstallDate?: string;
  bbPlan?: string;
  workingStatus?: string;
}
