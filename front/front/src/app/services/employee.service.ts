import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmployeeProfileResponse } from '../models/user-profile.model';


@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private apiUrl = 'http://localhost:8080/api/employees';

  constructor(private http: HttpClient) {}

  /**
   * Получить список всех сотрудников
   */
  getAll(): Observable<EmployeeProfileResponse[]> {
    return this.http.get<EmployeeProfileResponse[]>(this.apiUrl);
  }

  /**
   * Получить сотрудника по ID
   */
  getById(id: number): Observable<EmployeeProfileResponse> {
    return this.http.get<EmployeeProfileResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Получить профиль сотрудника по ID пользователя
   */
  getProfile(id: number): Observable<EmployeeProfileResponse> {
    console.log(`Fetching employee profile for user ID: ${id}`);
    return this.http.get<EmployeeProfileResponse>(`${this.apiUrl}/${id}/profile`);
  }

  /**
   * Создать нового сотрудника
   */
  create(employee: EmployeeProfileResponse): Observable<EmployeeProfileResponse> {
    return this.http.post<EmployeeProfileResponse>(this.apiUrl, employee);
  }

  /**
   * Обновить данные сотрудника
   */
  update(id: number, employee: EmployeeProfileResponse): Observable<EmployeeProfileResponse> {
    return this.http.put<EmployeeProfileResponse>(`${this.apiUrl}/${id}`, employee);
  }

  /**
   * Удалить сотрудника по ID
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
