import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavbarComponent } from '../../../shared/navbar/navbar';
import { NotificationBellComponent } from '../../../shared/notification-bell/notification-bell.component';

@Component({
  selector: 'app-international-company-services',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, NotificationBellComponent],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class InternationalCompanyServicesComponent implements OnInit {

  activeTab: 'collaboration' | 'investment' = 'collaboration';
  collaborationServices: any[] = [];
  investmentServices: any[] = [];
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
    this.loadCollaborationServices();
    this.loadInvestmentServices();
  }

  loadCollaborationServices(): void {
    this.loading = true;
    // ✅ FIX: Utiliser l'endpoint dédié aux sociétés internationales
    this.http.get<any[]>('http://localhost:8089/api/international-companies/services/collaboration',
      { headers: this.getHeaders() }
    ).subscribe({
      next: (data) => {
        this.collaborationServices = data;
        if (this.activeTab === 'collaboration') {
          this.filtered = data;
        }
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  loadInvestmentServices(): void {
    // ✅ FIX: Utiliser l'endpoint dédié aux sociétés internationales
    this.http.get<any[]>('http://localhost:8089/api/international-companies/services/investment',
      { headers: this.getHeaders() }
    ).subscribe({
      next: (data) => {
        this.investmentServices = data;
        if (this.activeTab === 'investment') {
          this.filtered = data;
        }
      },
      error: () => {}
    });
  }

  switchTab(tab: 'collaboration' | 'investment'): void {
    this.activeTab = tab;
    this.searchQuery = '';
    this.filtered = tab === 'collaboration' ? this.collaborationServices : this.investmentServices;
  }

  onSearch(): void {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) {
      this.filtered = this.activeTab === 'collaboration' ? this.collaborationServices : this.investmentServices;
      return;
    }
    const source = this.activeTab === 'collaboration' ? this.collaborationServices : this.investmentServices;
    this.filtered = source.filter(s => {
      const name = s.name || s.title || '';
      const desc = s.description || '';
      const region = s.region?.name || '';
      const contact = s.contactPerson || '';
      const providerName = s.provider ? `${s.provider.firstName} ${s.provider.lastName}` : '';
      const collabType = s.collaborationType || '';
      const domain = s.activityDomain || '';
      const zone = s.zone || '';
      const sector = s.economicSector?.name || '';
      const amount = s.totalAmount?.toString() || '';
      return [name, desc, region, contact, providerName, collabType, domain, zone, sector, amount]
        .some(val => val.toLowerCase().includes(q));
    });
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filtered = this.activeTab === 'collaboration' ? this.collaborationServices : this.investmentServices;
  }

  // ✅ FIX: Rediriger vers la messagerie de la société internationale
  contactProvider(provider: any): void {
    if (!provider?.email) return;
    const name = provider.firstName && provider.lastName
      ? `${provider.firstName} ${provider.lastName}` : 'Local Partner';
    this.router.navigate(['/societe-international/messagerie'], {
      queryParams: { contact: provider.email, name }
    });
  }
}