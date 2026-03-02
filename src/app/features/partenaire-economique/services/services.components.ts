import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavbarComponent } from '../../../shared/navbar/navbar';
import { NotificationBellComponent } from '../../../shared/notification-bell/notification-bell.component';

@Component({
  selector: 'app-economic-partner-services',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, NotificationBellComponent],
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

          <!-- Search Bar -->
          <div class="search-wrapper">
            <div class="search-box">
              <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                   viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (ngModelChange)="onSearch()"
                placeholder="Search by name, description, type, region, contact, domain..."
                class="search-input"
              />
              <button class="clear-btn" *ngIf="searchQuery" (click)="clearSearch()">✕</button>
            </div>
            <span class="results-count" *ngIf="searchQuery">
              {{ filtered.length }} result{{ filtered.length !== 1 ? 's' : '' }} found
            </span>
          </div>

          <!-- Loading -->
          <div class="loading-state" *ngIf="loading">
            <div class="spinner"></div>
            <p>Loading services...</p>
          </div>

          <!-- Empty -->
          <div class="empty-state" *ngIf="!loading && filtered.length === 0">
            <div class="empty-icon">{{ searchQuery ? '🔍' : '🤝' }}</div>
            <h3>{{ searchQuery ? 'No results for "' + searchQuery + '"' : 'No collaboration services available yet' }}</h3>
            <p>{{ searchQuery ? 'Try different keywords' : 'Check back later for new opportunities' }}</p>
            <button class="clear-search-btn" *ngIf="searchQuery" (click)="clearSearch()">Clear search</button>
          </div>

          <!-- Services Grid -->
          <div class="services-grid" *ngIf="!loading && filtered.length > 0">
            <div class="service-card" *ngFor="let s of filtered">
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
                <div class="card-meta" *ngIf="s.address">
                  <span class="meta-label">🏠 Address:</span>
                  <span>{{ s.address }}</span>
                </div>

                <!-- ✅ AJOUT : Bouton Contact Provider -->
                <div class="card-contact" *ngIf="s.provider">
                  <button class="contact-btn" (click)="contactProvider(s.provider)">
                    <span>💬</span> Contact Provider
                  </button>
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
    .search-wrapper { margin-bottom: 1.5rem; }
    .search-box { display: flex; align-items: center; gap: 0.75rem; background: white; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 0.75rem 1.1rem; box-shadow: 0 2px 10px rgba(0,0,0,0.05); transition: border-color 0.2s, box-shadow 0.2s; }
    .search-box:focus-within { border-color: #7c3aed; box-shadow: 0 4px 16px rgba(124,58,237,0.12); }
    .search-icon { color: #94a3b8; flex-shrink: 0; }
    .search-input { flex: 1; border: none; outline: none; font-size: 0.95rem; color: #0f172a; background: transparent; }
    .search-input::placeholder { color: #94a3b8; }
    .clear-btn { background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 0.9rem; padding: 0 0.25rem; transition: color 0.2s; }
    .clear-btn:hover { color: #dc2626; }
    .results-count { display: block; margin-top: 0.5rem; font-size: 0.85rem; color: #64748b; padding-left: 0.25rem; }
    .loading-state, .empty-state { text-align: center; padding: 4rem; background: white; border-radius: 16px; }
    .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
    .empty-state h3 { color: #0f172a; margin-bottom: 0.5rem; }
    .empty-state p { color: #64748b; margin-bottom: 1.5rem; }
    .clear-search-btn { padding: 0.6rem 1.4rem; background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; }
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
    .card-contact { margin-top: 1rem; padding-top: 0.75rem; border-top: 1px dashed #e2e8f0; }
    .contact-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.6rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; color: #0f172a; font-size: 0.9rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .contact-btn:hover { background: #7c3aed; color: white; border-color: #7c3aed; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(124,58,237,0.2); }
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
  filtered: any[] = [];
  searchQuery = '';
  loading = false;

  private http = inject(HttpClient);
  private router = inject(Router);

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
      next: (data) => { this.services = data; this.filtered = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  onSearch(): void {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) { this.filtered = this.services; return; }
    this.filtered = this.services.filter(s => [
      s.name, s.description, s.collaborationType, s.activityDomain,
      s.expectedBenefits, s.collaborationDuration, s.contactPerson, s.address,
      s.availability, s.region?.name,
      s.provider?.firstName, s.provider?.lastName,
      s.price?.toString(), ...(s.requiredSkills || [])
    ].some(val => val && val.toString().toLowerCase().includes(q)));
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filtered = this.services;
  }

  // ✅ AJOUT : Naviguer vers la messagerie
  contactProvider(provider: any): void {
    if (!provider?.email) return;
    const name = provider.firstName && provider.lastName
      ? `${provider.firstName} ${provider.lastName}` : 'Local Partner';
    this.router.navigate(['/messagerie'], {
      queryParams: { contact: provider.email, name }
    });
  }
}