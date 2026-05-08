import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Car } from '../models/car.model';

@Injectable({
  providedIn: 'root'
})
export class CarService {
  private apiUrl = 'http://localhost:8080/api/cars';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Car[]>(this.apiUrl);
  }

  getAvailable() {
    return this.http.get<Car[]>(`${this.apiUrl}/available`);
  }

  getById(id: number) {
    return this.http.get<Car>(`${this.apiUrl}/${id}`);
  }

  create(car: Car) {
    return this.http.post<Car>(this.apiUrl, car);
  }

  update(id: number, car: Car) {
    return this.http.put<Car>(`${this.apiUrl}/${id}`, car);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}