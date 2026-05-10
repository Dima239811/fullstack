export interface UserProfileResponse {
  // User fields
  login: string;
  fullName: string;
  phone: string;
  /* 
  // Client fields
  driverLicense: string;
  birthDate: string;
  personalEmail: string; */
}

export interface ClientProfileResponse extends UserProfileResponse {
  driverLicense: string;
  birthDate: string;
  personalEmail: string;
  type?: 'CLIENT';
}

export interface EmployeeProfileResponse extends UserProfileResponse {
  position: string;
  salary: number | null;
  department: string;
  officeNumber: string;
  workEmail: string;
  id: number;
  type: 'EMPLOYEE';
}

export type Profile = ClientProfileResponse | EmployeeProfileResponse;
