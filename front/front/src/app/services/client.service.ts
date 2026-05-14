import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from '../models/client.model';
import { ClientProfileResponse } from '../models/user-profile.model';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private apiUrl = 'http://localhost:8080/api/clients';

  constructor(private http: HttpClient) {}

  getById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}`);
  }

  getProfile(id: number): Observable<ClientProfileResponse> {
    console.log(`Fetching profile for user ID: ${id}`);
    return this.http.get<ClientProfileResponse>(`${this.apiUrl}/${id}/profile`);
  }

  getByUserId(userId: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/by-user/${userId}`);
  }

  getAll(): Observable<ClientProfileResponse[]> {
    return this.http.get<ClientProfileResponse[]>(this.apiUrl);
  }

  deleteClient(login: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/login/${login}`);  
  }

  updateClient(login: string, request: {
  driverLicense: string;
  birthDate: string;
  personalEmail: string;
  rentCount: number;
  userId: number;
}): Observable<ClientProfileResponse> {
    return this.http.put<ClientProfileResponse>(`${this.apiUrl}/by-login/${login}`, request);
  }
}