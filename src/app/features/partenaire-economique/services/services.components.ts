import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavbarComponent } from '../../../shared/navbar/navbar';
import { NotificationBellComponent } from '../../../shared/notification-bell/notification-bell.component';

@Component({
  selector: 'app-economic-partner-services',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, NotificationBellComponent],
  template: `
    <div class="page-layout">
      <app-navbar></app-navbar>
      <div class="page-main">
        <div class="page-content">

          <!-- Header -->
          <div class="page-header">
            <div>
              <a routerLink="/partenaire-economique/dashboard" class="back-link">← Back to Dashboard</a>
              <h1>Collaboration Opportunities</h1>
              <p class="subtitle">All approved collaboration services available for you</p>
            </div>
            <app-notification-bell></app-notification-bell>
          </div>

          <!-- Loading -->
          <div class="loading-state" *ngIf="loading">
            <div class="spinner"></div>
            <p>Loading services...</p>
          </div>

          <!-- Empty -->
          <div class="empty-state" *ngIf="!loading && services.length === 0">
            <div class="empty-icon">🤝</div>
            <h3>No collaboration services available yet</h3>
            <p>Check back later for new opportunities</p>
          </div>

          <!-- Services Grid -->
          <div class="services-grid" *ngIf="!loading && services.length > 0">
            <div class="service-card" *ngFor="let s of services">
              <div class="card-top">
                <span class="card-type">🤝 Collaboration</span>
                <span class="card-domain" *ngIf="s.activityDomain">{{ s.activityDomain }}</span>
              </div>
              <div class="card-body">
                <h3>{{ s.name }}</h3>
                <p class="card-desc">{{ (s.description || '') | slice:0:120 }}{{ (s.description?.length || 0) > 120 ? '...' : '' }}</p>

                <div class="card-meta" *ngIf="s.region">
                  <span class="meta-label">📍 Region:</span>
                  <span>{{ s.region.name }}</span>
                </div>
                <div class="card-meta" *ngIf="s.collaborationType">
                  <span class="meta-label">🔗 Type:</span>
                  <span>{{ s.collaborationType }}</span>
                </div>
                <div class="card-meta" *ngIf="s.collaborationDuration">
                  <span class="meta-label">⏱ Duration:</span>
                  <span>{{ s.collaborationDuration }}</span>
                </div>
                <div class="card-meta" *ngIf="s.expectedBenefits">
                  <span class="meta-label">✨ Benefits:</span>
                  <span>{{ s.expectedBenefits | slice:0:60 }}...</span>
                </div>
                <div class="card-meta" *ngIf="s.contactPerson">
                  <span class="meta-label">👤 Contact:</span>
                  <span>{{ s.contactPerson }}</span>
                </div>
                <div class="card-meta" *ngIf="s.provider">
                  <span class="meta-label">🏢 Provider:</span>
                  <span>{{ s.provider.firstName }} {{ s.provider.lastName }}</span>
                </div>
              </div>
              <div class="card-footer">
                <span class="availability-badge">{{ s.availability }}</span>
                <span class="price">{{ s.price | number }} TND</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-layout { display: flex; min-height: 100vh; background: linear-gradient(135deg, #f8fafc, #f1f5f9); font-family: 'Inter', sans-serif; }
    app-navbar { width: 280px; flex-shrink: 0; position: sticky; top: 0; height: 100vh; z-index: 100; }
    .page-main { flex: 1; padding: 2rem; overflow-y: auto; }
    .page-content { max-width: 1300px; margin: 0 auto; }

    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
    .back-link { display: inline-block; color: #7c3aed; font-size: 0.9rem; font-weight: 500; text-decoration: none; margin-bottom: 0.5rem; }
    .back-link:hover { color: #2563eb; }
    h1 { font-size: 2rem; font-weight: 700; color: #0f172a; margin: 0 0 0.25rem; }
    h1::after { content: ''; display: block; width: 60px; height: 4px; background: linear-gradient(90deg, #7c3aed, #a855f7); margin-top: 0.4rem; border-radius: 2px; }
    .subtitle { color: #64748b; margin: 0; }

    .loading-state, .empty-state { text-align: center; padding: 4rem; background: white; border-radius: 16px; }
    .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
    .empty-state h3 { color: #0f172a; margin-bottom: 0.5rem; }
    .empty-state p { color: #64748b; }
    .spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #7c3aed; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1rem; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .services-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }

    .service-card { background: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.2s, box-shadow 0.2s; }
    .service-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(124,58,237,0.12); }

    .card-top { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background: linear-gradient(135deg, #7c3aed, #a855f7); }
    .card-type { color: white; font-size: 0.8rem; font-weight: 600; }
    .card-domain { color: rgba(255,255,255,0.85); font-size: 0.75rem; }

    .card-body { padding: 1.25rem; flex: 1; }
    .card-body h3 { font-size: 1rem; font-weight: 600; color: #0f172a; margin: 0 0 0.6rem; }
    .card-desc { font-size: 0.85rem; color: #64748b; line-height: 1.5; margin: 0 0 1rem; }
    .card-meta { display: flex; gap: 0.4rem; font-size: 0.83rem; margin-bottom: 0.3rem; color: #334155; }
    .meta-label { color: #94a3b8; font-weight: 500; flex-shrink: 0; }

    .card-footer { display: flex; justify-content: space-between; align-items: center; padding: 0.85rem 1.25rem; border-top: 1px solid #f1f5f9; background: #fafafa; }
    .availability-badge { font-size: 0.75rem; font-weight: 600; color: #7c3aed; background: #f3e8ff; padding: 0.2rem 0.6rem; border-radius: 50px; }
    .price { font-size: 0.95rem; font-weight: 700; color: #0f172a; }

    @media (max-width: 768px) {
      .page-layout { flex-direction: column; }
      app-navbar { width: 100%; height: auto; position: relative; }
      .services-grid { grid-template-columns: 1fr; }
      .page-header { flex-direction: column; gap: 1rem; }
    }
  `]
})
export class EconomicPartnerServicesComponent implements OnInit {

  services: any[] = [];
  loading = false;

  private http = inject(HttpClient);

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.loading = true;
    this.http.get<any[]>('http://localhost:8089/api/collaboration-services/approved',
      { headers: this.getHeaders() }
    ).subscribe({
      next: (data) => { this.services = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}