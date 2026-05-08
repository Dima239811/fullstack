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
  car: any; // или Car model
  rental: any; // или Rental model
  discount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class RentalCarService {
  private apiUrl = 'http://localhost:8080/api/rental-cars';

  constructor(private http: HttpClient) {}

  // Получить все связи (только для ADMIN/MANAGER)
  getAll(): Observable<RentalCarResponse[]> {
    return this.http.get<RentalCarResponse[]>(this.apiUrl);
  }

  // Получить связи для конкретной аренды (только для ADMIN/MANAGER)
  getByRentalId(rentalId: number): Observable<RentalCarResponse[]> {
    return this.http.get<RentalCarResponse[]>(`${this.apiUrl}/rental/${rentalId}`);
  }

  // Создать связь RentalCar (только для ADMIN/MANAGER)
  create(request: RentalCarRequest): Observable<RentalCarResponse> {
    return this.http.post<RentalCarResponse>(this.apiUrl, request);
  }

  // Удалить связь (только для ADMIN/MANAGER)
  delete(carId: number, rentalId: number): Observable<void> {
    return this.http.delete<void>(this.apiUrl, {
      body: { carId, rentalId }
    });
  }

  // Проверить доступность машины на даты (публичный эндпоинт)
  isCarAvailable(carId: number, startDate: string, endDate: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.apiUrl}/${carId}/available?startDate=${startDate}&endDate=${endDate}`
    );
  }
}