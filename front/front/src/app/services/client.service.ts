import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from '../models/client.model';
import { UserProfileResponse } from '../models/user-profile.model';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private apiUrl = 'http://localhost:8080/api/clients';

  constructor(private http: HttpClient) {}

  getById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}`);
  }

  getProfile(id: number): Observable<UserProfileResponse> {
    console.log(`Fetching profile for user ID: ${id}`);
    return this.http.get<UserProfileResponse>(`${this.apiUrl}/${id}/profile`);
  }

  getByUserId(userId: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/by-user/${userId}`);
  }
}