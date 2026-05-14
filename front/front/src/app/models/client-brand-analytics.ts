export interface ClientBrandAnalytics {
  id: number;
  driverLicense: string;
  fullName: string;
  totalRentals: number;
  brandRentals: number;
}

export interface ClientsByBrandReportResponse {
  data: ClientBrandAnalytics[];
  report: string;
  count: number;
  message: string;
}

export interface AnalyticsByPeriodResponse {
  totalRentals: number;
  totalClients: number;
  totalIncome: number;
  topClient: string;
}