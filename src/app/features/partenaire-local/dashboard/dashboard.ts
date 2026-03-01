import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/navbar/navbar';
import { AuthService } from '../../../core/services/auth';
import { LocalPartnerServiceManager } from '../../../core/services/local-partner-service-manager';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

type ServiceType = 'COLLABORATION' | 'INVESTMENT' | 'TOURIST';
type ViewMode = 'list' | 'form';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, HttpClientModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  searchQuery = '';
  activeTab: ServiceType = 'COLLABORATION';
  viewMode: ViewMode = 'list';
  loading = false;
  saving = false;
  error = '';
  success = '';
  editingService: any = null;

  collaborationServices: any[] = [];
  investmentServices: any[] = [];
  touristServices: any[] = [];
  regions: any[] = [];
  economicSectors: any[] = [];
  partnerId: number | null = null;

  collaborationForm: any = this.emptyCollaborationForm();
  investmentForm: any = this.emptyInvestmentForm();
  touristForm: any = this.emptyTouristForm();

  skillInput = '';
  includedServiceInput = '';
  languageInput = '';

  readonly SERVICE_TYPES: { key: ServiceType; label: string; icon: string; color: string }[] = [
    { key: 'COLLABORATION', label: 'Collaboration', icon: '🤝', color: '#6366f1' },
    { key: 'INVESTMENT',    label: 'Investment',    icon: '📈', color: '#10b981' },
    { key: 'TOURIST',       label: 'Tourism',       icon: '🌍', color: '#f59e0b' }
  ];

  readonly AVAILABILITY_OPTIONS = ['IMMEDIATE', 'ON_DEMAND', 'UPCOMING'];
  readonly COLLAB_TYPES = ['PARTNERSHIP', 'JOINT_VENTURE', 'SUBCONTRACTING', 'FRANCHISE', 'LICENSING', 'OTHER'];
  readonly CATEGORIES = ['HOTEL', 'RESTAURANT', 'ACTIVITY', 'TRANSPORT', 'GUIDE', 'OTHER'];
readonly TARGET_AUDIENCES = ['BUSINESS', 'TOURIST', 'STUDENT', 'FAMILY', 'VIP'];
  constructor(
    private authService: AuthService,
    private serviceManager: LocalPartnerServiceManager,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadPartnerIdAndData();
    this.loadRegions();
    this.loadEconomicSectors();
  }

  private decodeJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      );
      return JSON.parse(json);
    } catch { return null; }
  }

  // ─── Step 1: get the partnerId, THEN load services ─────────────
  async loadPartnerIdAndData() {
    this.loading = true;
    this.error = '';

    const token = this.authService.getToken();
    if (!token) {
      this.error = 'Not authenticated. Please log in again.';
      this.loading = false;
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    try {
      // PRIMARY: /profile endpoint returns current user's data with id
      const profile: any = await lastValueFrom(
        this.http.get<any>('http://localhost:8089/api/partenaires-locaux/profile', { headers })
      );
      console.log('✅ Profile response:', profile);

      if (profile?.id) {
        this.partnerId = Number(profile.id);
        console.log('✅ partnerId set to:', this.partnerId);
        // MUST await so Angular detects the data changes
        await this.loadAllServices();
      } else {
        console.warn('⚠️ Profile returned no id, trying fallback...');
        await this.fallbackFindPartner(headers, token);
      }
    } catch (e: any) {
      console.warn('⚠️ Profile call failed:', e?.status, e?.message);
      await this.fallbackFindPartner(headers, token);
    } finally {
      this.loading = false;
    }
  }

  // ─── Fallback: list all partners, match by email from JWT ──────
  private async fallbackFindPartner(headers: HttpHeaders, token: string) {
    try {
      const jwtPayload = this.decodeJwt(token);
      const email = jwtPayload?.email || jwtPayload?.preferred_username || '';
      console.log('🔍 Fallback: looking for email', email);

      const partners: any[] = await lastValueFrom(
        this.http.get<any[]>('http://localhost:8089/api/partenaires-locaux', { headers })
      );
      console.log('📋 All partners:', partners.map((p: any) => ({ id: p.id, email: p.email })));

      const match = partners.find((p: any) =>
        p.email?.toLowerCase() === email?.toLowerCase()
      );

      if (match?.id) {
        this.partnerId = Number(match.id);
        console.log('✅ Partner found via fallback, id:', this.partnerId);
        await this.loadAllServices();
      } else {
        this.error = 'Partner account not found. Please contact support.';
      }
    } catch (e) {
      console.error('❌ Fallback also failed:', e);
      this.error = 'Failed to load partner data. Please refresh.';
    }
  }

  // ─── Load all 3 types in parallel using lastValueFrom (awaitable) ─
  async loadAllServices() {
    if (!this.partnerId) {
      console.warn('⚠️ loadAllServices called with no partnerId!');
      return;
    }
    console.log('📡 Fetching services for partnerId:', this.partnerId);

    // Promise.allSettled means one 404 won't block the others
    const [collabs, investments, tourists] = await Promise.allSettled([
      lastValueFrom(this.serviceManager.getCollaborationServicesByProvider(this.partnerId!)),
      lastValueFrom(this.serviceManager.getInvestmentServicesByProvider(this.partnerId!)),
      lastValueFrom(this.serviceManager.getTouristServicesByProvider(this.partnerId!))
    ]);

    // Extract values — if a call failed, keep the existing array (don't wipe it)
    if (collabs.status === 'fulfilled') {
      this.collaborationServices = Array.isArray(collabs.value) ? collabs.value : [];
    } else {
      console.warn('⚠️ Collaboration services failed:', (collabs as any).reason);
      this.collaborationServices = [];
    }

    if (investments.status === 'fulfilled') {
      this.investmentServices = Array.isArray(investments.value) ? investments.value : [];
    } else {
      console.warn('⚠️ Investment services failed:', (investments as any).reason);
      this.investmentServices = [];
    }

    if (tourists.status === 'fulfilled') {
  this.touristServices = Array.isArray(tourists.value) ? tourists.value : [];
  console.log('TOURIST DATA:', JSON.stringify(this.touristServices[0], null, 2)); // ← ajoute ici
} else {
  console.warn('⚠️ Tourist services failed:', (tourists as any).reason);
  this.touristServices = [];
}

    console.log('✅ Services loaded:', {
      collaboration: this.collaborationServices.length,
      investment: this.investmentServices.length,
      tourist: this.touristServices.length,
      collab_data: this.collaborationServices
    });
  }

  loadRegions() {
    this.serviceManager.getRegions().subscribe({
      next: (data) => { this.regions = data || []; },
      error: (e) => console.error('Regions error:', e)
    });
  }

  loadEconomicSectors() {
    this.serviceManager.getEconomicSectors().subscribe({
      next: (data) => { this.economicSectors = data || []; },
      error: (e) => console.error('Sectors error:', e)
    });
  }

  setTab(tab: ServiceType) { this.activeTab = tab; this.cancelForm(); }

  get activeServices(): any[] {
  let services: any[] = [];
  if (this.activeTab === 'COLLABORATION') services = this.collaborationServices;
  else if (this.activeTab === 'INVESTMENT') services = this.investmentServices;
  else services = this.touristServices;

  if (!this.searchQuery.trim()) return services;

  // découpe la phrase en mots individuels, ignore les mots vides < 2 chars
  const words = this.searchQuery
    .toLowerCase()
    .trim()
    .replace(/[\s,]+/g, ' ')
    .split(' ')
    .filter(w => w.length >= 1);

  // un service matche si TOUS les mots sont trouvés quelque part dans ses champs
  return services.filter(s => words.every(word => this.matchesSearch(s, word)));
}

private matchesSearch(obj: any, query: string, depth: number = 0): boolean {
  if (depth > 2) return false; // stoppe la récursion profonde
  if (obj === null || obj === undefined) return false;
  if (typeof obj === 'string') return obj.toLowerCase().includes(query);
  if (typeof obj === 'number') return String(obj).includes(query);
  if (typeof obj === 'boolean') return false;
  if (Array.isArray(obj)) {
    return obj.some(item => this.matchesSearch(item, query, depth + 1));
  }
  if (typeof obj === 'object') {
    const ignored = ['id', 'createdAt', 'publicationDate', 'providerId',
                     'regionId', 'economicSectorId', 'provider',
                     'collaborationServices', 'investmentServices', 'touristServices',
                     'interestedInvestors', 'attachedDocuments'];
    return Object.entries(obj).some(([key, val]) => {
      if (ignored.includes(key)) return false;
      return this.matchesSearch(val, query, depth + 1);
    });
  }
  return false;
}

  get activeTabConfig() {
    return this.SERVICE_TYPES.find(t => t.key === this.activeTab)!;
  }

  showAddForm() {
    this.editingService = null;
    this.resetForms();
    this.viewMode = 'form';
    this.error = '';
    this.success = '';
  }

  editService(service: any) {
    this.editingService = service;
    if (this.activeTab === 'COLLABORATION') {
      this.collaborationForm = {
        name: service.name || '', description: service.description || '',
        regionId: service.region?.id || '', price: service.price || 0,
        availability: service.availability || 'IMMEDIATE',
        contactPerson: service.contactPerson || '',
        collaborationType: service.collaborationType || '',
        activityDomain: service.activityDomain || '',
        expectedBenefits: service.expectedBenefits || '',
        requiredSkills: [...(service.requiredSkills || [])],
        collaborationDuration: service.collaborationDuration || '',
        address: service.address || ''
      };
    } else if (this.activeTab === 'INVESTMENT') {
      this.investmentForm = {
        name: service.name || '', title: service.title || '',
        description: service.description || '',
        regionId: service.region?.id || '', price: service.price || 0,
        availability: service.availability || 'IMMEDIATE',
        contactPerson: service.contactPerson || '',
        zone: service.zone || '',
        economicSectorId: service.economicSector?.id || '',
        totalAmount: service.totalAmount || 0,
        minimumAmount: service.minimumAmount || 0,
        deadlineDate: service.deadlineDate || '',
        projectDuration: service.projectDuration || ''
      };
    } else {
      this.touristForm = {
        name: service.name || '', description: service.description || '',
        regionId: service.region?.id || '', price: service.price || 0,
        groupPrice: service.groupPrice || 0,
        availability: service.availability || 'IMMEDIATE',
        contactPerson: service.contactPerson || '',
        category: service.category || '',
        targetAudience: service.targetAudience || '',
        durationHours: service.durationHours || 0,
        maxCapacity: service.maxCapacity || 0,
        includedServices: [...(service.includedServices || [])],
        availableLanguages: [...(service.availableLanguages || [])]
      };
    }
    this.viewMode = 'form';
    this.error = '';
    this.success = '';
  }

  cancelForm() {
    this.viewMode = 'list';
    this.editingService = null;
    this.resetForms();
    this.error = '';
    this.success = '';
  }

  resetForms() {
    this.collaborationForm = this.emptyCollaborationForm();
    this.investmentForm    = this.emptyInvestmentForm();
    this.touristForm       = this.emptyTouristForm();
    this.skillInput = '';
    this.includedServiceInput = '';
    this.languageInput = '';
  }

  addSkill() {
    const s = this.skillInput.trim();
    if (s && !this.collaborationForm.requiredSkills.includes(s)) this.collaborationForm.requiredSkills.push(s);
    this.skillInput = '';
  }
  removeSkill(skill: string) {
    this.collaborationForm.requiredSkills = this.collaborationForm.requiredSkills.filter((s: string) => s !== skill);
  }
  addIncludedService() {
    const s = this.includedServiceInput.trim();
    if (s && !this.touristForm.includedServices.includes(s)) this.touristForm.includedServices.push(s);
    this.includedServiceInput = '';
  }
  removeIncludedService(svc: string) {
    this.touristForm.includedServices = this.touristForm.includedServices.filter((s: string) => s !== svc);
  }
  addLanguage() {
    const lang = this.languageInput.trim();
    if (lang && !this.touristForm.availableLanguages.includes(lang)) this.touristForm.availableLanguages.push(lang);
    this.languageInput = '';
  }
  removeLanguage(lang: string) {
    this.touristForm.availableLanguages = this.touristForm.availableLanguages.filter((l: string) => l !== lang);
  }

  async submitForm() {
    if (!this.partnerId) { this.error = 'Partner ID not loaded. Please refresh the page.'; return; }
    this.saving = true;
    this.error = '';
    this.success = '';

    try {
      const isEdit = !!this.editingService;

      if (this.activeTab === 'COLLABORATION') {
        const payload = {
          ...this.collaborationForm,
          region: this.collaborationForm.regionId ? { id: +this.collaborationForm.regionId } : null
        };
        delete payload.regionId;
        if (isEdit) await lastValueFrom(this.serviceManager.updateCollaborationService(this.editingService.id, payload));
        else        await lastValueFrom(this.serviceManager.createCollaborationService(payload, this.partnerId));

      } else if (this.activeTab === 'INVESTMENT') {
        const payload = {
          ...this.investmentForm,
          region: this.investmentForm.regionId ? { id: +this.investmentForm.regionId } : null,
          economicSector: this.investmentForm.economicSectorId ? { id: +this.investmentForm.economicSectorId } : null
        };
        delete payload.regionId;
        delete payload.economicSectorId;
        if (isEdit) await lastValueFrom(this.serviceManager.updateInvestmentService(this.editingService.id, payload));
        else        await lastValueFrom(this.serviceManager.createInvestmentService(payload, this.partnerId));

      } else {
        const payload = {
          ...this.touristForm,
          region: this.touristForm.regionId ? { id: +this.touristForm.regionId } : null,
          provider: { id: this.partnerId }
        };
        delete payload.regionId;
        if (isEdit) await lastValueFrom(this.serviceManager.updateTouristService(this.editingService.id, payload));
        else        await lastValueFrom(this.serviceManager.createTouristService(payload));
      }

      // 1. Go to list view first
      this.viewMode = 'list';
      this.editingService = null;
      this.resetForms();

      // 2. Wait for the fresh data before showing success
      await this.loadAllServices();

      // 3. Show success
      this.success = isEdit ? 'Service updated successfully!' : '✅ Service created! Awaiting admin approval.';
      setTimeout(() => { this.success = ''; }, 4000);

    } catch (e: any) {
      console.error('❌ Submit error:', e);
      this.error = e?.error?.error || e?.error?.message || e?.message || 'An error occurred.';
    } finally {
      this.saving = false;
    }
  }

  async deleteService(service: any) {
    if (!confirm(`Delete "${service.name}"?`)) return;
    try {
      if (this.activeTab === 'COLLABORATION') {
        await lastValueFrom(this.serviceManager.deleteCollaborationService(service.id));
        this.collaborationServices = this.collaborationServices.filter(s => s.id !== service.id);
      } else if (this.activeTab === 'INVESTMENT') {
        await lastValueFrom(this.serviceManager.deleteInvestmentService(service.id));
        this.investmentServices = this.investmentServices.filter(s => s.id !== service.id);
      } else {
        await lastValueFrom(this.serviceManager.deleteTouristService(service.id));
        this.touristServices = this.touristServices.filter(s => s.id !== service.id);
      }
    } catch (e: any) {
      this.error = e?.error?.error || 'Failed to delete service';
    }
  }

  getStatusClass(s: string) { return s === 'APPROVED' ? 'badge-approved' : s === 'REJECTED' ? 'badge-rejected' : 'badge-pending'; }
  getStatusIcon(s: string)  { return s === 'APPROVED' ? '✅' : s === 'REJECTED' ? '❌' : '⏳'; }

  private emptyCollaborationForm() {
    return { name: '', description: '', regionId: '', price: 0, availability: 'IMMEDIATE', contactPerson: '', collaborationType: '', activityDomain: '', expectedBenefits: '', requiredSkills: [], collaborationDuration: '', address: '' };
  }
  private emptyInvestmentForm() {
    return { name: '', title: '', description: '', regionId: '', price: 0, availability: 'IMMEDIATE', contactPerson: '', zone: '', economicSectorId: '', totalAmount: 0, minimumAmount: 0, deadlineDate: '', projectDuration: '' };
  }
  private emptyTouristForm() {
    return { name: '', description: '', regionId: '', price: 0, groupPrice: 0, availability: 'IMMEDIATE', contactPerson: '', category: '', targetAudience: '', durationHours: 0, maxCapacity: 0, includedServices: [], availableLanguages: [] };
  }
}