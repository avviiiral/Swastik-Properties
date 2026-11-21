import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { API_BASE_URL } from '../../../core/api-base-url.token';
import { AuthService } from '../../core/auth.service';

type AgentLeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CLOSED';
interface AgentLead {
  id: number; property_name: string; property_reference: string; enquiry_type: string;
  name: string; email: string; phone: string; message: string; details: Record<string, unknown>;
  source_path: string; status: AgentLeadStatus; created_at: string; updated_at: string;
}
interface AgentActivity { id: number; activity_type: string; body: string; actor_name: string; created_at: string; }

@Component({
  standalone: true,
  imports: [FormsModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="agent-page">
      <header class="top"><div><span class="eyebrow">SWASTIK PROPERTIES / AGENT DESK</span><h1>My assigned enquiries</h1><p>Work only on the enquiries assigned to your account. Record each customer interaction in the activity timeline.</p></div><div class="profile"><span>{{displayName}}</span><button type="button" (click)="signOut()">Sign out</button></div></header>
      @if(error()){<p class="alert" role="alert">{{error()}}</p>}
      @if(message()){<p class="success" role="status">{{message()}}</p>}
      <section class="stats"><article><span>Assigned to me</span><strong>{{leads().length}}</strong></article><article><span>New</span><strong>{{count('NEW')}}</strong></article><article><span>Qualified</span><strong>{{count('QUALIFIED')}}</strong></article><article><span>Contacted</span><strong>{{count('CONTACTED')}}</strong></article></section>
      @if(loading()){<p class="empty">Loading your assigned enquiries…</p>}
      @else if(!leads().length){<p class="empty">No enquiries are currently assigned to you. Contact your administrator if you expected to see a lead here.</p>}
      @else {
        <section class="lead-list">
          @for(lead of leads();track lead.id){
            <article class="lead">
              <div class="lead-head"><div><span class="kind">{{lead.enquiry_type.replaceAll('_',' ')}}</span><h2>{{lead.name}}</h2><small>Lead #{{lead.id}} · {{lead.created_at | date:'dd MMM yyyy, h:mm a'}}</small></div><span class="pill" [class.new]="lead.status==='NEW'">{{lead.status}}</span></div>
              <div class="contacts"><a [href]="'tel:'+lead.phone">{{lead.phone}}</a><a [href]="'mailto:'+lead.email">{{lead.email}}</a></div>
              @if(lead.property_name){<p class="property">{{lead.property_name}} <small>{{lead.property_reference}}</small></p>}
              <p class="message">{{lead.message}}</p>
              <div class="actions"><label>Update status<select [(ngModel)]="lead.status" [name]="'status-'+lead.id"><option value="NEW">New</option><option value="CONTACTED">Contacted</option><option value="QUALIFIED">Qualified</option><option value="CLOSED">Closed</option></select></label><button type="button" (click)="saveStatus(lead)">Save status</button></div>
              <div class="timeline"><h3>Interaction notes</h3>
                @if(activityLoading().has(lead.id)){<small>Loading timeline…</small>}
                @else {@for(item of activities()[lead.id] ?? [];track item.id){<div class="activity"><p>{{item.body}}</p><small>{{item.actor_name || 'Team member'}} · {{item.created_at | date:'dd MMM, h:mm a'}}</small></div>}}
                <div class="note"><textarea [(ngModel)]="notes[lead.id]" [name]="'note-'+lead.id" rows="2" maxlength="2000" placeholder="Record a call, customer requirement or next step…"></textarea><button type="button" (click)="addNote(lead)" [disabled]="!notes[lead.id]?.trim()">Add note</button></div>
              </div>
            </article>
          }
        </section>
      }
    </main>
  `,
  styles: [`
    :host{display:block;min-height:100vh;background:#f5f6f1;color:#29463a;font-family:'DM Sans',sans-serif}.agent-page{max-width:1050px;margin:auto;padding:32px 22px 64px}.top{display:flex;justify-content:space-between;align-items:flex-start;gap:20px}.eyebrow{font-size:9px;letter-spacing:.16em;color:#ad8754;font-weight:700}.top h1{font:500 clamp(30px,4vw,42px) Georgia,serif;margin:10px 0 7px;color:#1f4135}.top p{font-size:12px;color:#78867d;line-height:1.7;max-width:600px}.profile{display:flex;align-items:center;gap:12px;font-size:11px}.profile button{border:1px solid #d7e0d7;background:#fff;padding:9px 12px;color:#365345;cursor:pointer}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:24px 0}.stats article{background:#fff;border:1px solid #e3e9e1;padding:15px}.stats span{display:block;color:#829087;font-size:10px}.stats strong{display:block;margin-top:8px;font:500 28px Georgia,serif}.empty{padding:50px 20px;text-align:center;color:#7d8b81;background:#fff;border:1px solid #e3e9e1;font-size:12px}.lead-list{display:grid;gap:14px}.lead{padding:19px;background:#fff;border:1px solid #e3e9e1}.lead-head{display:flex;justify-content:space-between;gap:12px}.kind{font-size:8px;color:#a17b4d;text-transform:uppercase;letter-spacing:.12em}.lead h2{margin:6px 0;color:#29463a;font:600 20px Georgia,serif}.lead-head small,.activity small{font-size:9px;color:#859188}.pill{align-self:flex-start;padding:6px 9px;background:#f0f2ed;font-size:8px;font-weight:700}.pill.new{background:#fbf2e4;color:#926b34}.contacts{display:flex;flex-wrap:wrap;gap:20px;margin:14px 0;padding:12px 0;border-top:1px solid #edf0eb;border-bottom:1px solid #edf0eb}.contacts a{font-size:11px;color:#345a49;text-decoration:none}.property{font-size:11px;font-weight:700}.property small{margin-left:8px;color:#88948b;font-weight:400}.message{font-size:11px;color:#5d6f64;line-height:1.7;white-space:pre-line}.actions{display:flex;align-items:end;gap:10px;margin-top:14px}.actions label{display:grid;gap:6px;font-size:9px;color:#718076}.actions select,.note textarea{border:1px solid #dce4dc;background:#fcfcf9;padding:9px;color:#345344;font:11px 'DM Sans',sans-serif}.actions button,.note button{border:0;background:#24483b;color:white;padding:10px 14px;font-size:10px;cursor:pointer}.timeline{margin-top:18px;padding-top:14px;border-top:1px solid #edf0eb}.timeline h3{font-size:11px;margin:0 0 10px}.activity{padding:9px 10px;background:#f7f8f4;margin:6px 0}.activity p{margin:0 0 5px;font-size:10px;color:#53695d}.note{display:flex;gap:8px;margin-top:12px}.note textarea{flex:1;resize:vertical}.note button:disabled{opacity:.45}.alert,.success{padding:10px 13px;font-size:11px}.alert{background:#fff0ed;color:#963c35}.success{background:#edf6ef;color:#286344}@media(max-width:650px){.agent-page{padding:22px 14px}.top{flex-direction:column}.stats{grid-template-columns:1fr 1fr}.lead{padding:14px}.note{flex-direction:column}.actions{align-items:stretch;flex-direction:column}.actions button{align-self:flex-start}}
  `],
})
export class AgentLeadsComponent {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);
  readonly auth = inject(AuthService);
  readonly leads = signal<AgentLead[]>([]);
  readonly activities = signal<Record<number, AgentActivity[]>>({});
  readonly activityLoading = signal<Set<number>>(new Set());
  readonly loading = signal(true);
  readonly error = signal('');
  readonly message = signal('');
  readonly notes: Record<number, string> = {};
  readonly displayName = this.auth.user()?.first_name || this.auth.user()?.username || 'Agent';

  constructor() { this.load(); }
  load(): void {
    this.http.get<{results: AgentLead[]}>(this.base + '/submissions/agent/leads/').subscribe({
      next: response => { this.leads.set(response.results ?? []); this.loading.set(false); this.leads().forEach(lead => this.loadActivities(lead.id)); },
      error: () => { this.error.set('Unable to load your assigned leads. Please sign in again or contact an administrator.'); this.loading.set(false); },
    });
  }
  count(status: AgentLeadStatus): number { return this.leads().filter(lead => lead.status === status).length; }
  saveStatus(lead: AgentLead): void {
    this.http.patch<AgentLead>(this.base + '/submissions/agent/leads/' + lead.id + '/', {status: lead.status}).subscribe({
      next: updated => { this.leads.update(items => items.map(item => item.id === updated.id ? updated : item)); this.message.set('Lead #' + lead.id + ' status updated.'); this.error.set(''); this.loadActivities(lead.id); },
      error: () => this.error.set('Could not update this lead. It may no longer be assigned to your account.'),
    });
  }
  loadActivities(id: number): void {
    this.activityLoading.update(set => new Set(set).add(id));
    this.http.get<AgentActivity[]>(this.base + '/submissions/agent/leads/' + id + '/activities/').subscribe({
      next: items => { this.activities.update(all => ({...all, [id]: items})); this.activityLoading.update(set => {const next=new Set(set);next.delete(id);return next;}); },
      error: () => this.activityLoading.update(set => {const next=new Set(set);next.delete(id);return next;}),
    });
  }
  addNote(lead: AgentLead): void {
    const body = this.notes[lead.id]?.trim();
    if (!body) return;
    this.http.post<AgentActivity>(this.base + '/submissions/agent/leads/' + lead.id + '/activities/', {body}).subscribe({
      next: item => { this.activities.update(all => ({...all, [lead.id]: [item, ...(all[lead.id] ?? [])]})); this.notes[lead.id] = ''; this.message.set('Note added to lead #' + lead.id + '.'); this.error.set(''); },
      error: () => this.error.set('Could not add the note. Check whether the lead is still assigned to you.'),
    });
  }
  signOut(): void { this.auth.logout().subscribe({next:()=>location.assign('/admin/login'),error:()=>{this.auth.clearSession();location.assign('/admin/login')}}); }
}
