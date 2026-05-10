import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'auth', loadComponent: () => import('./auth/auth.component').then(m => m.AuthComponent) },
  { path: 'home', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent), canActivate: [authGuard] },
  { path: 'profile', loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent), canActivate: [authGuard] },
  {
  path: 'clients',
    loadComponent: () =>
      import('./pages/clients/clients')
    .then(m => m.Clients),
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },

  {
    path: 'cars',
    loadComponent: () =>
      import('./pages/cars/cars').then(m => m.Cars),
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },

    {
      path: 'employees',
      loadComponent: () =>
        import('./pages/employees/employees').then(m => m.Employees),
      canActivate: [authGuard],
      data: { roles: ['ADMIN', 'MANAGER'] }
  },

  { path: '**', redirectTo: 'auth' }
]; 