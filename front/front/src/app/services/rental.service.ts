import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rental, CreateRentalRequest } from '../models/client.model';

@Injectable({ providedIn: 'root' })
export class RentalService {
  private apiUrl = 'http://localhost:8080/api/rentals';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Rental[]> {
    return this.http.get<Rental[]>(this.apiUrl);
  }

  getById(id: number): Observable<Rental> {
    return this.http.get<Rental>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateRentalRequest): Observable<Rental> {
    return this.http.post<Rental>(this.apiUrl, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getMyRentals(id: number): Observable<Rental[]> {
    return this.http.get<Rental[]>(`${this.apiUrl}/my-rentals/${id}`);
  }

  cancel(id: number): Observable<Rental> {
    return this.http.patch<Rental>(`${this.apiUrl}/${id}/cancel`, {});
  }

  getManagerRentals(id: number): Observable<Rental[]> {
    return this.http.get<Rental[]>(`${this.apiUrl}/manager-rentals/${id}`);
  }

  update(rentalId: number, data: any) {
    return this.http.patch<Rental>(`${this.apiUrl}/${rentalId}`, data);
  }
}