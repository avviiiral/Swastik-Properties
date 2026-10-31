import { Routes } from '@angular/router';
import { adminGuard } from './admin/core/admin.guard';
import { LoginComponent } from './admin/features/auth/login.component';
import { PropertiesComponent as AdminPropertiesComponent } from './admin/features/properties/properties.component';
import { AdminLayoutComponent } from './admin/layout/admin-layout.component';
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { PropertyDetailComponent } from './pages/property-detail/property-detail.component';
import { PropertyListComponent } from './pages/properties/property-list.component';

export const appRoutes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', component: HomeComponent, title: 'Swastik Properties | Find your place in Maharashtra' },
      { path: 'properties', component: PropertyListComponent, title: 'Explore Properties | Swastik Properties' },
      { path: 'properties/:slug', component: PropertyDetailComponent }
    ]
  },
  { path: 'admin/login', component: LoginComponent, title: 'Admin Sign In | Swastik Properties' },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'properties' },
      { path: 'properties', component: AdminPropertiesComponent, title: 'Property Management | Swastik Properties' }
    ]
  },
  { path: '**', redirectTo: '' }
];
