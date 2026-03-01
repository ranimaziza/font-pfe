import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavbarComponent } from '../../../shared/navbar/navbar';

interface PendingServices {
  collaboration: any[];
  investment: any[];
  tourist: any[];
}

@Component({
  selector: 'app-admin-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class AdminNotificationsComponent implements OnInit {

  pendingServices: PendingServices = {
    collaboration: [],
    investment: [],
    tourist: []
  };

  loading = false;
  processingId: number | null = null;
  successMsg = '';
  errorMsg = '';

  private apiBase = 'http://localhost:8089/api/admin/services';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPendingServices();
  }

  get totalPending(): number {
    return (
      this.pendingServices.collaboration.length +
      this.pendingServices.investment.length +
      this.pendingServices.tourist.length
    );
  }

  loadPendingServices(): void {
    this.loading = true;
    this.errorMsg = '';

    const token = localStorage.getItem('auth_token') || '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<PendingServices>(`${this.apiBase}/pending`, { headers }).subscribe({
      next: (data) => {
        this.pendingServices = {
          collaboration: data.collaboration || [],
          investment: data.investment || [],
          tourist: data.tourist || []
        };
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading pending services:', err);
        this.errorMsg = 'Failed to load pending services. Please try again.';
        this.loading = false;
      }
    });
  }

  approveService(type: 'collaboration' | 'investment' | 'tourist', id: number): void {
    this.processingId = id;
    this.clearMessages();

const token = localStorage.getItem('auth_token') || '';    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.put(`${this.apiBase}/${type}/${id}/approve`, {}, { headers }).subscribe({
      next: () => {
        this.removeServiceFromList(type, id);
        this.successMsg = `Service approved successfully!`;
        this.processingId = null;
        this.autoHideSuccess();
      },
      error: (err) => {
        console.error('Error approving service:', err);
        this.errorMsg = 'Failed to approve service. Please try again.';
        this.processingId = null;
      }
    });
  }

  rejectService(type: 'collaboration' | 'investment' | 'tourist', id: number): void {
    this.processingId = id;
    this.clearMessages();

const token = localStorage.getItem('auth_token') || '';    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.delete(`${this.apiBase}/${type}/${id}/reject`, { headers }).subscribe({
      next: () => {
        this.removeServiceFromList(type, id);
        this.successMsg = `Service rejected and removed.`;
        this.processingId = null;
        this.autoHideSuccess();
      },
      error: (err) => {
        console.error('Error rejecting service:', err);
        this.errorMsg = 'Failed to reject service. Please try again.';
        this.processingId = null;
      }
    });
  }

  private removeServiceFromList(type: string, id: number): void {
    (this.pendingServices as any)[type] = (this.pendingServices as any)[type].filter(
      (s: any) => s.id !== id
    );
  }

  private clearMessages(): void {
    this.successMsg = '';
    this.errorMsg = '';
  }

  private autoHideSuccess(): void {
    setTimeout(() => {
      this.successMsg = '';
    }, 3000);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}