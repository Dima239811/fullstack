import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmployeeProfileResponse } from '../models/user-profile.model';
import { CreateEmployeeRequest } from '../models/employee.model';
import { EmployeeUpdateRequest } from '../models/employee.model';


@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private apiUrl = 'http://localhost:8080/api/employees';

  constructor(private http: HttpClient) {}
  getAll(): Observable<EmployeeProfileResponse[]> {
    return this.http.get<EmployeeProfileResponse[]>(this.apiUrl);
  }

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

  create(employee: CreateEmployeeRequest): Observable<CreateEmployeeRequest> {
    return this.http.post<CreateEmployeeRequest>(this.apiUrl, employee);
  }

  update(id: number, employee: EmployeeUpdateRequest): Observable<EmployeeProfileResponse> {
    return this.http.put<EmployeeProfileResponse>(`${this.apiUrl}/${id}`, employee);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
