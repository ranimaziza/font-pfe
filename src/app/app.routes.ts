import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard'; 
import { roleGuard } from './core/guards/role-guard';
import { Role } from './shared/models/user.model';
import { AdminNotificationsComponent } from './features/admin/notifications/notifications.component';
import { InboxComponent } from './shared/inbox/inbox.component';

export const routes: Routes = [

  // ── Pages publiques ───────────────────────────────
  {
    path: '',
    loadComponent: () => import('./features/public/home/home')
      .then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/public/login/login')
      .then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/public/register/register')
      .then(m => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/public/forgot-password/forgot-password.component')
      .then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component')
      .then(m => m.ProfileComponent),
    canActivate: [authGuard]  
  },

  // ── Admin ─────────────────────────────────────────
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.ADMIN] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/dashboard')
          .then(m => m.DashboardComponent)
      },
      // AJOUTER ICI - Gestion des utilisateurs
      {
        path: 'users',
        loadComponent: () => import('./features/admin/users/users.component')
          .then(m => m.AdminUsersComponent)
      },
      {
  path: 'notifications',
  component:AdminNotificationsComponent
  // add canActivate: [AuthGuard] if you have a guard
}
    ]
  },

  // ── Touriste ──────────────────────────────────────
  {
    path: 'touriste',
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.TOURIST] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/touriste/dashboard/dashboard')
          .then(m => m.DashboardComponent)
      },
    {
      path: 'services',
      loadComponent: () => import('./features/touriste/services/services.component')
        .then(m => m.TouristServicesComponent)
    }
    ]
  },

  // ── Investisseur ──────────────────────────────────
  {
    path: 'investisseur',
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.INVESTOR] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/investisseur/dashboard/dashboard')
          .then(m => m.DashboardComponent)
      },
      {
        path: 'services',
        loadComponent: () => import('./features/investisseur/services/services.component')
          .then(m => m.InvestorServicesComponent)
      }
    ]
  },

  // ── Partenaire Économique ─────────────────────────
  {
    path: 'partenaire-economique',
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.PARTNER] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/partenaire-economique/dashboard/dashboard')
          .then(m => m.DashboardComponent)
      },{
        path: 'services',
        loadComponent: () => import('./features/partenaire-economique/services/services.components')
          .then(m => m.EconomicPartnerServicesComponent)
      }
    ]
  },

  // ── Partenaire Local ──────────────────────────────
  {
    path: 'partenaire-local',
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.LOCAL_PARTNER] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/partenaire-local/dashboard/dashboard')
          .then(m => m.DashboardComponent)
      },    {
      path: 'messagerie',
      loadComponent: () => import('./features/partenaire-local/messagerie/partenaire-local-messagerie.component')
        .then(m => m.PartenaireLocalMessagerieComponent)
    }
    ]
  },

  // ── Société Internationale ────────────────────────
  {
    path: 'societe-international',
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.INTERNATIONAL_COMPANY] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/societe-international/dashboard/dashboard')
          .then(m => m.DashboardComponent)
      },
    {
      path: 'services',   // <-- AJOUTER CETTE ROUTE
      loadComponent: () => import('./features/societe-international/services/services.component')
        .then(m => m.InternationalCompanyServicesComponent)
    },{
        path: 'messagerie',
        loadComponent: () => import('./features/societe-international/messagerie/societe-international-messagerie.component')
          .then(m => m.SocieteInternationalMessagerieComponent)
      }
    ]
  },{
  path: 'messagerie',
  loadComponent: () => import('./shared/inbox/inbox.component')
    .then(m => m.InboxComponent),
  canActivate: [authGuard]
},

  // ── Wildcard ──────────────────────────────────────
  { path: '**', redirectTo: '' }
];