export enum Role {
  SUPERADMIN = "superadmin",
  ADMIN = "admin",
  MANAGER = "manager",
  AGENT = "agent"
}

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: Role;
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  success: boolean;
  data: User;
  message: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
