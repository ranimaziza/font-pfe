import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class LocalPartnerServiceManager {
  private readonly API_URL = 'http://localhost:8089/api';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
  }

  // ─── Regions ────────────────────────────────────────────────
  getRegions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/regions`, { headers: this.getHeaders() });
  }

  // ─── Economic Sectors ────────────────────────────────────────
  getEconomicSectors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/economic-sectors`, { headers: this.getHeaders() });
  }

  // ─── Collaboration Services ───────────────────────────────────
  createCollaborationService(service: any, providerId: number): Observable<any> {
    return this.http.post(
      `${this.API_URL}/collaboration-services/with-provider/${providerId}`,
      service,
      { headers: this.getHeaders() }
    );
  }

  getCollaborationServicesByProvider(providerId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.API_URL}/collaboration-services/provider/${providerId}`,
      { headers: this.getHeaders() }
    ).pipe(catchError(() => of([])));
  }

  deleteCollaborationService(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/collaboration-services/${id}`, { headers: this.getHeaders() });
  }

  updateCollaborationService(id: number, service: any): Observable<any> {
    return this.http.put(`${this.API_URL}/collaboration-services/${id}`, service, { headers: this.getHeaders() });
  }

  // ─── Investment Services ──────────────────────────────────────
  createInvestmentService(service: any, providerId: number): Observable<any> {
    return this.http.post(
      `${this.API_URL}/investment-services/with-provider/${providerId}`,
      service,
      { headers: this.getHeaders() }
    );
  }

  getInvestmentServicesByProvider(providerId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.API_URL}/investment-services/provider/${providerId}`,
      { headers: this.getHeaders() }
    ).pipe(catchError(() => of([])));
  }

  deleteInvestmentService(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/investment-services/${id}`, { headers: this.getHeaders() });
  }

  updateInvestmentService(id: number, service: any): Observable<any> {
    return this.http.put(`${this.API_URL}/investment-services/${id}`, service, { headers: this.getHeaders() });
  }

  // ─── Tourist Services ─────────────────────────────────────────
  // NOTE: Check your TouristServiceController @RequestMapping value
  // Common options: /api/tourist-services  OR  /api/touristic-services
  createTouristService(service: any): Observable<any> {
    return this.http.post(`${this.API_URL}/tourist-services`, service, { headers: this.getHeaders() });
  }

  getTouristServicesByProvider(providerId: number): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.API_URL}/tourist-services/provider/${providerId}`,
    { headers: this.getHeaders() }
  ).pipe(catchError(() => of([])));
}

  deleteTouristService(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/tourist-services/${id}`, { headers: this.getHeaders() });
  }

  updateTouristService(id: number, service: any): Observable<any> {
    return this.http.put(`${this.API_URL}/tourist-services/${id}`, service, { headers: this.getHeaders() });
  }
}