import { Component } from '@angular/core';
import { NavbarComponent } from '../../../shared/navbar/navbar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="dashboard">
      <h1>🏘️ Dashboard Partenaire Local</h1>
      <p>Engagez-vous dans le développement de votre région.</p>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 2rem;
      font-family: 'Segoe UI', system-ui, sans-serif;
    }
    h1 { color: #7b2d8b; margin-bottom: 1rem; }
    p { color: #555; }
  `]
})
export class DashboardComponent {}