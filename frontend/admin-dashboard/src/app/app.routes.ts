import { Routes } from '@angular/router';

import { adminGuard } from './core/admin.guard';
import { LoginComponent } from './features/auth/login.component';
import { AdminLayoutComponent } from './layout/admin-layout.component';
import { PropertiesComponent } from './features/properties/properties.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'properties' },
      { path: 'properties', component: PropertiesComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
