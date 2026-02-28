import { Component } from '@angular/core';
import { NavbarComponent } from '../../../shared/navbar/navbar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="dashboard">
      <h1>🌍 Dashboard Société Internationale</h1>
      <p>Développez votre présence sur le marché tunisien.</p>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 2rem;
      font-family: 'Segoe UI', system-ui, sans-serif;
    }
    h1 { color: #1a6b8a; margin-bottom: 1rem; }
    p { color: #555; }
  `]
})
export class DashboardComponent {}