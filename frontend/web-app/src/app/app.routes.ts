import { Routes } from '@angular/router';
import { adminGuard, agentGuard, workspaceGuard } from './admin/core/admin.guard';
import { LoginComponent } from './admin/features/auth/login.component';
import { PropertiesComponent as AdminPropertiesComponent } from './admin/features/properties/properties.component';
import { AdminLayoutComponent } from './admin/layout/admin-layout.component';
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { PropertyDetailComponent } from './pages/property-detail/property-detail.component';
import { PropertyListComponent } from './pages/properties/property-list.component';
import { AboutComponent } from './pages/about/about.component';
import { BlogListComponent } from './pages/blog/blog-list.component';
import { BlogDetailComponent } from './pages/blog/blog-detail.component';
import { ContactComponent } from './pages/contact/contact.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { ThankYouComponent } from './pages/thank-you/thank-you.component';

export const appRoutes: Routes = [
  { path: '', component: PublicLayoutComponent, children: [
    { path: '', pathMatch: 'full', component: HomeComponent, title: 'Swastik Properties | Find your place in Maharashtra' },
    { path: 'properties', component: PropertyListComponent, title: 'Explore Properties | Swastik Properties' },
    { path: 'properties/:slug', component: PropertyDetailComponent },
    { path: 'about', component: AboutComponent, title: 'About | Swastik Properties' },
    { path: 'blog', component: BlogListComponent, title: 'Journal | Swastik Properties' },
    { path: 'blog/:slug', component: BlogDetailComponent },
    { path: 'contact', component: ContactComponent, title: 'Contact | Swastik Properties' },
    { path: 'thank-you', component: ThankYouComponent, title: 'Thank You | Swastik Properties' },
  ]},
  { path: 'admin/login', component: LoginComponent, title: 'Workspace Sign In | Swastik Properties' },
  { path: 'agent/login', component: LoginComponent, title: 'Agent Sign In | Swastik Properties' },
  { path: 'agent', pathMatch: 'full', canActivate: [agentGuard], loadComponent: () => import('./admin/features/agent/agent-leads.component').then(m => m.AgentLeadsComponent), title: 'My Assigned Enquiries | Swastik Properties' },
  { path: 'admin', pathMatch: 'full', canActivate: [workspaceGuard], component: LoginComponent },
  { path: 'admin/forbidden', loadComponent: () => import('./admin/features/forbidden/forbidden.component').then(m => m.ForbiddenComponent), title: 'Access Denied | Swastik Properties' },
  { path: 'admin', component: AdminLayoutComponent, canActivate: [adminGuard], children: [
    { path: '', pathMatch: 'full', redirectTo: 'overview' },
    { path: 'overview', loadComponent: () => import('./admin/features/dashboard/dashboard.component').then(m => m.DashboardComponent), data: { roles: ['ADMIN', 'SUPER_ADMIN'] }, title: 'Admin Overview | Swastik Properties' },
    { path: 'properties', component: AdminPropertiesComponent, data: { roles: ['ADMIN', 'SUPER_ADMIN'] }, title: 'Property Management | Swastik Properties' },
    { path: 'leads', loadComponent: () => import('./admin/features/leads/leads.component').then(m => m.LeadsComponent), data: { roles: ['ADMIN', 'SUPER_ADMIN'] }, title: 'Enquiries & Requirements | Swastik Properties' },
    { path: 'blog', loadComponent: () => import('./admin/features/blog/blog-admin-list.component').then(m => m.BlogAdminListComponent), data: { roles: ['EDITOR', 'SUPER_ADMIN'] }, title: 'Blog Management | Swastik Properties' },
    { path: 'blog/new', loadComponent: () => import('./admin/features/blog/blog-editor.component').then(m => m.BlogEditorComponent), data: { roles: ['EDITOR', 'SUPER_ADMIN'] } },
    { path: 'blog/:id', loadComponent: () => import('./admin/features/blog/blog-editor.component').then(m => m.BlogEditorComponent), data: { roles: ['EDITOR', 'SUPER_ADMIN'] } },
    { path: 'users', loadComponent: () => import('./admin/features/users/users.component').then(m => m.UsersComponent), data: { roles: ['ADMIN', 'SUPER_ADMIN'] }, title: 'User Management | Swastik Properties' },
  ]},
  { path: '**', component: PublicLayoutComponent, children: [
    { path: '', component: NotFoundComponent, title: 'Page Not Found | Swastik Properties' },
  ] },
];
