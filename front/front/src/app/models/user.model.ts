export interface User {
  id?: number;
  login: string;
  password?: string;
  fullName?: string;
  phone?: string;
  role?: 'CLIENT' | 'ADMIN' | 'MANAGER';
  userId?: number;
}

export interface AuthResponse {
  token: string;
}

export interface RegisterRequest {
  login: string;
  password: string;
  fullName: string;
  phone: string;
  driverLicense: string;
  birthDate: string;
  personalEmail: string;
}