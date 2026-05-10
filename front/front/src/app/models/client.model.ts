export interface Client {
  id: number;
  user: {
    id: number;
    login: string;
    fullName: string;
    phone: string;
    role: string;
  };
  driverLicense: string;
  birthDate: string;
  personalEmail: string;
}

export interface RentalCarBriefResponse {
  carId: number;
  brand: string;
  model: string;
  price: number;
  deposit: number;
}

export interface Rental {
  id: number;
  status: string;
  startDate: string;
  endDate: string;
  comment?: string;

  clientId: number;
  clientFullName: string;
  clientLogin: string;

  employeeId: number;
  employeeFullName: string;
  employeeLogin: string;

  cars: RentalCarBriefResponse[];
}

export interface CreateRentalRequest {
  clientId: number;
  employeeId?: number;
  startDate: string;
  endDate: string;
  carIds: number[];
  comment?: string;
  discount?: number;
}