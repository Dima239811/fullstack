export interface UserProfileResponse {
  // User fields
  login: string;
  fullName: string;
  phone: string;
  
  // Client fields
  driverLicense: string;
  birthDate: string;
  personalEmail: string;
}