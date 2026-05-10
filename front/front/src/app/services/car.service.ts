import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Car, CarCreateUpdateDto } from '../models/car.model';

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

  create(car: CarCreateUpdateDto) {
    return this.http.post<CarCreateUpdateDto>(this.apiUrl, car);
  }

  update(id: number, car: CarCreateUpdateDto) {
    return this.http.put<CarCreateUpdateDto>(`${this.apiUrl}/${id}`, car);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}