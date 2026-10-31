import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
@Component({selector:'sp-admin-layout',standalone:true,imports:[RouterLink,RouterLinkActive,RouterOutlet],templateUrl:'./admin-layout.component.html',styleUrl:'./admin-layout.component.css',changeDetection:ChangeDetectionStrategy.OnPush})
export class AdminLayoutComponent {
 readonly auth=inject(AuthService);private readonly router=inject(Router);readonly signingOut=signal(false);
 signOut():void{if(this.signingOut())return;this.signingOut.set(true);this.auth.logout().subscribe({next:()=>void this.router.navigateByUrl('/admin/login'),error:()=>{this.auth.clearSession();void this.router.navigateByUrl('/admin/login')},complete:()=>this.signingOut.set(false)});}
 get displayName():string{const user=this.auth.user();return user?([user.first_name,user.last_name].filter(Boolean).join(' ')||user.username):'Administrator';}
 get roleLabel():string{const role=this.auth.user()?.role;return role==='SUPER_ADMIN'?'Super Admin':role==='EDITOR'?'Blog Editor':role==='ADMIN'?'Admin':'Agent';}
}
