import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClientsByBrandReportResponse, AnalyticsByPeriodResponse } from '../models/client-brand-analytics';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8080/api/reports';

  getRentalsReport(): Observable<any> {
    return this.http.get(`${this.apiUrl}/rentals`);
  }

  getCarsReport(): Observable<any> {
    return this.http.get(`${this.apiUrl}/cars`);
  }

  getTopClients(minRentals: number = 3): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/clients/top?minRentals=${minRentals}`
    );
  }

  getClientsByBrand(brand: string) {
    return this.http.get<ClientsByBrandReportResponse>(
      `${this.apiUrl}/clients/by-brand?brand=${brand}`
    );
  }

  getAnalyticsByPeriod(startDate: string, endDate: string) {
    return this.http.get<AnalyticsByPeriodResponse>(
      `${this.apiUrl}/period?startDate=${startDate}&endDate=${endDate}`
    );
  }
}