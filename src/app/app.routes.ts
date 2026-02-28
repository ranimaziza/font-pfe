import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard'; 
import { roleGuard } from './core/guards/role-guard';
import { Role } from './shared/models/user.model';

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
      }
      //  Vous pouvez ajouter d'autres routes admin ici
      // {
      //   path: 'settings',
      //   loadComponent: () => import('./features/admin/settings/settings.component')
      //     .then(m => m.AdminSettingsComponent)
      // }
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
      }
    ]
  },

  // ── Wildcard ──────────────────────────────────────
  { path: '**', redirectTo: '' }
];