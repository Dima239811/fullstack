import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

export interface RentalCarRequest {
  carId: number;
  rentalId: number;
  discount?: number;
}

export interface RentalCarResponse {
  id: {
    carId: number;
    rentalId: number;
  };
  car: any;
  rental: any;
  discount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class RentalCarService {
  private apiUrl = 'http://localhost:8080/api/rental-cars';

  constructor(private http: HttpClient) {}

  getAll(): Observable<RentalCarResponse[]> {
    return this.http.get<RentalCarResponse[]>(this.apiUrl);
  }

  getByRentalId(rentalId: number): Observable<RentalCarResponse[]> {
    return this.http.get<RentalCarResponse[]>(`${this.apiUrl}/rental/${rentalId}`);
  }

  create(request: RentalCarRequest): Observable<RentalCarResponse> {
    return this.http.post<RentalCarResponse>(this.apiUrl, request);
  }

  delete(carId: number, rentalId: number): Observable<void> {
    return this.http.delete<void>(this.apiUrl, {
      body: { carId, rentalId }
    });
  }

  isCarAvailable(carId: number, startDate: string, endDate: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.apiUrl}/${carId}/available?startDate=${startDate}&endDate=${endDate}`
    );
  }
}