export enum AreaType {
  URBAN = "urban",
  RURAL = "rural"
}

export enum Mode {
  ONLINE = "online",
  OFFLINE = "offline",
  STANDBY = "standby"
}

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
  userName: string;
  firstName: string;
  lastName: string;
  countryCode: string;
  phoneNumber: string;
  mobile?: string;
  language?: string;
  country: string;
}

export interface Step2Data {
  permanentAddress?: string;
  billingAddress?: string;
  area?: AreaType;
  zone?: string;
  ruralUrban?: string;
  category?: string;
  customerType?: string;
  group?: string;
}

export interface Step3Data {
  status?: string;
  mode?: Mode;
  customerPower?: string;
  bandwidth?: number;
  planId?: string;
  bbPlan?: string;
  ftthExchangePlan?: string;
  staticIp?: string;
  macIp?: string;
  oltIp?: string;
  mtceFranchise?: string;
  bbUserId?: string;
  workingStatus?: string;
  assigned?: string;
  acquisitionType?: string;
  balanceDue?: number;
  activationDate?: string;
  expirationDate?: string;
  installationDate?: string;
  lastBillingDate?: string;
  llInstallDate?: string;
  isAccountVerified?: boolean;
}
