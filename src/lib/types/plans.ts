// Plan Types based on MongoDB Schemas

export interface IPlan {
  _id?: string;
  title: string;
  price: number;
  validity: string;
  speed: string;
  dataLimit: string;
  provider: string;
  logo: string;
  benefits: string[];
  description: string;
  planType: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOttPlan {
  _id?: string;
  title: string;
  price: number;
  speedBeforeLimit: string;
  speedAfterLimit: string;
  dataLimitGB: number;
  isUnlimited: boolean;
  validity: string;
  ottApps: string[];
  callBenefit: string;
  provider: string;
  logo: string;
  description: string;
  planType: 'ott';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IIptvPlan {
  _id?: string;
  name: string;
  totalChannels: number;
  payChannels: number;
  freeToAirChannels: number;
  price: number;
  lcoMarginPercent: number;
  distributorMarginPercent: number;
  channelList: string[];
  planType: 'starter' | 'lite' | 'popular' | 'family' | 'vip' | 'custom';
  quality: 'SD' | 'HD' | 'Mixed';
  provider: string;
  logo: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Form Data Types for creating/updating plans
export interface FibrePlanFormData {
  title: string;
  price: number;
  validity: string;
  speed: string;
  dataLimit: string;
  provider: string;
  description: string;
  planType: string;
  benefits: string; // This will be a comma-separated string in the form, converted to array on submission
  logo?: File;
}

export interface OttPlanFormData {
  title: string;
  price: number;
  speedBeforeLimit: string;
  speedAfterLimit: string;
  dataLimitGB: number;
  isUnlimited: boolean;
  validity: string;
  ottApps: string[];
  callBenefit: string;
  provider: string;
  description: string;
  planType: 'ott';
  logo?: File;
}

export interface IptvPlanFormData {
  name: string;
  totalChannels: number;
  payChannels: number;
  freeToAirChannels: number;
  price: number;
  lcoMarginPercent: number;
  distributorMarginPercent: number;
  channelList: string[];
  planType: 'starter' | 'lite' | 'popular' | 'family' | 'vip' | 'custom';
  quality: 'SD' | 'HD' | 'Mixed';
  provider: string;
  description: string;
  logo?: File;
}
