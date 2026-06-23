import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    component: AppComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent) },
      { path: 'clients', loadComponent: () => import('./features/clients/client-list/client-list.component').then((m) => m.ClientListComponent) },
      { path: 'clients/new', loadComponent: () => import('./features/clients/client-form/client-form.component').then((m) => m.ClientFormComponent) },
      { path: 'clients/:id/edit', loadComponent: () => import('./features/clients/client-form/client-form.component').then((m) => m.ClientFormComponent) },
      { path: 'cases', loadComponent: () => import('./features/cases/case-list/case-list.component').then((m) => m.CaseListComponent) },
      { path: 'cases/new', loadComponent: () => import('./features/cases/case-form/case-form.component').then((m) => m.CaseFormComponent) },
      { path: 'cases/:id', loadComponent: () => import('./features/cases/case-detail/case-detail.component').then((m) => m.CaseDetailComponent) },
      { path: 'cases/:id/edit', loadComponent: () => import('./features/cases/case-form/case-form.component').then((m) => m.CaseFormComponent) },
      { path: 'deadlines', loadComponent: () => import('./features/deadlines/deadline-list/deadline-list.component').then((m) => m.DeadlineListComponent) },
      { path: 'deadlines/new', loadComponent: () => import('./features/deadlines/deadline-form/deadline-form.component').then((m) => m.DeadlineFormComponent) },
      { path: 'deadlines/:id/edit', loadComponent: () => import('./features/deadlines/deadline-form/deadline-form.component').then((m) => m.DeadlineFormComponent) },
      { path: 'hearings', loadComponent: () => import('./features/hearings/hearing-list/hearing-list.component').then((m) => m.HearingListComponent) },
      { path: 'hearings/new', loadComponent: () => import('./features/hearings/hearing-form/hearing-form.component').then((m) => m.HearingFormComponent) },
      { path: 'hearings/:id/edit', loadComponent: () => import('./features/hearings/hearing-form/hearing-form.component').then((m) => m.HearingFormComponent) },
      { path: 'petitions', loadComponent: () => import('./features/petitions/petition-list/petition-list.component').then((m) => m.PetitionListComponent) },
      { path: 'petitions/new', loadComponent: () => import('./features/petitions/petition-form/petition-form.component').then((m) => m.PetitionFormComponent) },
      { path: 'petitions/:id/edit', loadComponent: () => import('./features/petitions/petition-form/petition-form.component').then((m) => m.PetitionFormComponent) },
      { path: 'documents', loadComponent: () => import('./features/documents/document-list/document-list.component').then((m) => m.DocumentListComponent) },
      { path: 'calculations', loadComponent: () => import('./features/calculations/calculation-list/calculation-list.component').then((m) => m.CalculationListComponent) },
      { path: 'calculations/new', loadComponent: () => import('./features/calculations/calculation-form/calculation-form.component').then((m) => m.CalculationFormComponent) },
      { path: 'calculations/:id/edit', loadComponent: () => import('./features/calculations/calculation-form/calculation-form.component').then((m) => m.CalculationFormComponent) },
      { path: 'notifications', loadComponent: () => import('./features/notifications/notification-list/notification-list.component').then((m) => m.NotificationListComponent) },
      { path: 'administration', canActivate: [adminGuard], loadComponent: () => import('./features/administration/user-list/user-list.component').then((m) => m.UserListComponent) },
      { path: 'audit', canActivate: [adminGuard], loadComponent: () => import('./features/audit/audit-list/audit-list.component').then((m) => m.AuditListComponent) },
      { path: 'research', loadComponent: () => import('./features/research/research.component').then((m) => m.ResearchComponent) },
      { path: 'settings', loadComponent: () => import('./features/settings/settings.component').then((m) => m.SettingsComponent) },
    ],
  },
  { path: '**', redirectTo: '' },
];
