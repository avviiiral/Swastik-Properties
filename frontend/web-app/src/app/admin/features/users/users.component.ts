import {Component,OnInit,inject,signal} from '@angular/core';
import {DatePipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {API_BASE_URL} from '../../../core/api-base-url.token';
import {AuthService} from '../../core/auth.service';
interface ManagedUser{id:number;username:string;email:string;first_name:string;last_name:string;role:'SUPER_ADMIN'|'ADMIN'|'EDITOR'|'AGENT';is_active:boolean;date_joined:string;}
@Component({standalone:true,imports:[FormsModule,DatePipe],template:`
<section class="users"><div class="heading"><div><span>ACCESS &amp; TEAM</span><h1>Workspace users</h1><p>Control access to the Swastik workspace.</p></div><button (click)="openCreate()">Add user +</button></div>
@if(error()){<p class="notice">{{error()}}</p>}
<div class="table"><div class="row head"><span>Name</span><span>Email</span><span>Role</span><span>Status</span><span>Created</span><span>Actions</span></div>
@for(u of users();track u.id){<div class="row"><strong>{{name(u)}}</strong><span>{{u.email}}</span><span class="role">{{u.role}}</span><span>{{u.is_active?'Active':'Inactive'}}</span><span>{{u.date_joined|date:'mediumDate'}}</span><span class="actions"><button (click)="edit(u)">Edit</button><button (click)="toggle(u)">{{u.is_active?'Deactivate':'Activate'}}</button>@if(auth.hasRole('SUPER_ADMIN')){<button class="danger" (click)="remove(u)">Delete</button>}</span></div>}
</div>
@if(modal()){<div class="overlay" (click)="modal.set(false)"><section class="modal" (click)="$event.stopPropagation()"><h2>{{selected()?'Edit user':'Add user'}}</h2><form (ngSubmit)="save()">
<label>First name<input [(ngModel)]="form.first_name" name="first_name"></label><label>Last name<input [(ngModel)]="form.last_name" name="last_name"></label><label>Email<input [(ngModel)]="form.email" name="email" type="email" required></label><label>Username<input [(ngModel)]="form.username" name="username" required></label>
@if(!selected()){<label>Initial password<input [(ngModel)]="form.password" name="password" type="password" required></label>}
<label>Role<select [(ngModel)]="form.role" name="role">@for(r of assignableRoles();track r){<option [value]="r">{{r}}</option>}</select></label>
<div class="actions"><button type="button" (click)="modal.set(false)">Cancel</button><button type="submit">Save user</button></div></form></section></div>}
</section>`,styles:[`
.users{max-width:1280px}.heading{display:flex;justify-content:space-between;align-items:end;margin-bottom:25px}.heading span{color:#b88c55;font-size:10px;letter-spacing:.15em}.heading h1{font:500 42px var(--font-display);margin:8px 0;color:#1b3a33}.heading p{color:#7c887f;font-size:13px}.heading>button,.modal .actions button:last-child{padding:12px 16px;border:0;background:#1b3a33;color:#fff;font-size:12px}.table{overflow:auto;background:#fff;border:1px solid #e4e9e4}.row{display:grid;grid-template-columns:1.1fr 1.6fr .8fr .7fr .9fr 1.6fr;gap:12px;align-items:center;min-width:900px;padding:14px;border-bottom:1px solid #edf0eb;color:#66746a;font-size:11px}.row.head{background:#f5f7f3;color:#89948c;font-size:9px;text-transform:uppercase;letter-spacing:.1em}.row>strong{color:#2b4238}.role{font-weight:700;color:#9c7445}.actions{display:flex;gap:6px;flex-wrap:wrap}.actions button{border:1px solid #dfe5dd;background:#fff;padding:6px 8px;color:#43594b;font-size:10px}.actions button.danger{color:#a83f37}.notice{padding:15px;background:#fff0ef;color:#9b3831}.overlay{position:fixed;inset:0;z-index:50;display:grid;place-items:center;padding:20px;background:rgba(13,31,25,.55)}.modal{width:min(480px,100%);max-height:90vh;overflow:auto;padding:25px;background:#fafaf7;box-shadow:var(--shadow-lg)}.modal h2{font:500 29px var(--font-display);color:#1b3a33;margin:0 0 18px}.modal form,.modal label{display:grid;gap:9px}.modal form{gap:13px}.modal label{color:#66736b;font-size:11px}.modal input,.modal select{min-height:39px;padding:8px 10px;border:1px solid #dfe5dd;background:white}.modal .actions{justify-content:flex-end;margin-top:8px}.modal .actions button:first-child{padding:12px 16px;border:1px solid #dfe5dd;background:#fff;color:#43594b;font-size:12px}@media(max-width:700px){.heading{align-items:flex-start;flex-direction:column;gap:14px}}
` ]})
export class UsersComponent implements OnInit{
 private readonly http=inject(HttpClient);private readonly base=inject(API_BASE_URL);readonly auth=inject(AuthService);
 readonly users=signal<ManagedUser[]>([]);readonly modal=signal(false);readonly selected=signal<ManagedUser|null>(null);readonly error=signal('');
 form:any=this.emptyForm();readonly assignableRoles=()=>this.auth.hasRole('SUPER_ADMIN')?['ADMIN','EDITOR','AGENT']:['EDITOR','AGENT'];
 ngOnInit(){this.load();}
 emptyForm(){return {username:'',email:'',first_name:'',last_name:'',password:'',role:'AGENT'};}
 load(){this.http.get<any>(this.base+'/auth/users/').subscribe({next:r=>this.users.set(r.results??r),error:()=>this.error.set('Unable to load users. Check access and try again.')});}
 name(u:ManagedUser){return [u.first_name,u.last_name].filter(Boolean).join(' ')||u.username;}
 openCreate(){this.selected.set(null);this.form=this.emptyForm();this.form.role=this.assignableRoles()[0];this.modal.set(true);}
 edit(u:ManagedUser){this.selected.set(u);this.form={...u,password:''};this.modal.set(true);}
 save(){const u=this.selected();const url=this.base+'/auth/users/'+(u?u.id+'/':'');const body={...this.form};delete body.password;const req=u?this.http.patch(url,body):this.http.post(url,this.form);req.subscribe({next:()=>{this.modal.set(false);this.load();},error:e=>this.error.set(e.error?.detail||'User could not be saved.')});}
 toggle(u:ManagedUser){if(!confirm((u.is_active?'Deactivate':'Activate')+' '+u.email+'?'))return;this.http.post(this.base+'/auth/users/'+u.id+'/activation/',{is_active:!u.is_active}).subscribe({next:()=>this.load(),error:e=>this.error.set(e.error?.detail||'Status change failed.')});}
 remove(u:ManagedUser){if(!confirm('Permanently delete '+u.email+'? This cannot be undone.'))return;this.http.delete(this.base+'/auth/users/'+u.id+'/').subscribe({next:()=>this.load(),error:e=>this.error.set(e.error?.detail||'Delete failed.')});}
}