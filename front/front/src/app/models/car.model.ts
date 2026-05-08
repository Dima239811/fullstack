export interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  price: number;
  deposit: number;
  available: boolean;
  vin?: string;
  registrationDate?: string;
  engineVolume?: number;
  color?: string;
  insuranceValidUntil?: string;
  inspectionValidUntil?: string;
}