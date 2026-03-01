import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  serviceId: number;
  serviceType?: string;
  read: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {

  private apiUrl = 'http://localhost:8089/api/notifications';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getMyNotifications(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<{ count: number }>(
      `${this.apiUrl}/unread/count`, { headers: this.getHeaders() }
    ).pipe(map(r => r.count));
  }

  markAsRead(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/read`, {}, { headers: this.getHeaders() });
  }

  markAllAsRead(): Observable<any> {
    return this.http.put(`${this.apiUrl}/read-all`, {}, { headers: this.getHeaders() });
  }
}