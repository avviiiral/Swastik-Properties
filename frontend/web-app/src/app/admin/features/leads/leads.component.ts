import { DatePipe, KeyValuePipe, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LeadStatus,
  LeadType,
  PropertyEnquiryApi,
  PropertyEnquiryRecord,
} from '../../../core/services/property-enquiry-api.service';

@Component({
  standalone: true,
  imports: [FormsModule, DatePipe, KeyValuePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="leads-page">
      <div class="eyebrow">SWASTIK PROPERTIES / LEAD MANAGEMENT</div>
      <div class="title-row"><div><h1>Enquiries & requirements</h1><p>Every public website form arrives here. Review the request, record follow-up notes and update its status.</p></div>
        <button class="export" type="button" (click)="download()" [disabled]="exporting() || !count()">{{exporting() ? 'Preparing…' : 'Export CSV'}} <b>↓</b></button>
      </div>

      <div class="summary">
        <article><span>Total matching enquiries</span><strong>{{count()}}</strong></article>
        <article><span>New on this page</span><strong>{{newOnPage()}}</strong></article>
        <article><span>Qualified on this page</span><strong>{{qualifiedOnPage()}}</strong></article>
      </div>

      <section class="panel">
        <div class="filters">
          <label>Search<input name="search" [(ngModel)]="search" (keyup.enter)="load(1)" placeholder="Name, phone, email or property"></label>
          <label>Form type<select name="type" [(ngModel)]="type" (ngModelChange)="load(1)"><option value="">All form types</option>@for (item of types; track item.value) {<option [value]="item.value">{{item.label}}</option>}</select></label>
          <label>Status<select name="status" [(ngModel)]="status" (ngModelChange)="load(1)"><option value="">All statuses</option>@for (item of statuses; track item.value) {<option [value]="item.value">{{item.label}}</option>}</select></label>
          <button class="search" type="button" (click)="load(1)">Apply filters</button>
          <button class="clear" type="button" (click)="reset()">Clear</button>
        </div>
        @if (message()) {<p class="feedback success" role="status">{{message()}}</p>}
        @if (error()) {<p class="feedback error" role="alert">{{error()}}</p>}
        @if (loading()) {<div class="empty">Loading enquiries…</div>}
        @else if (!items().length) {<div class="empty">No enquiries match these filters. Change the search or clear the filters to see all submissions.</div>}
        @else {
          <div class="lead-list">
            @for (item of items(); track item.id) {
              <article class="lead-card">
                <div class="lead-top">
                  <div><span class="type">{{item.enquiry_type_label}}</span><h2>{{item.name}}</h2><small>Received {{item.created_at | date:'dd MMM yyyy, h:mm a'}} · Lead #{{item.id}}</small></div>
                  <span class="status" [class.new]="item.status==='NEW'" [class.qualified]="item.status==='QUALIFIED'" [class.closed]="item.status==='CLOSED'">{{item.status}}</span>
                </div>
                <div class="contact-grid">
                  <div><span>Phone</span><a [href]="'tel:'+item.phone">{{item.phone}}</a></div>
                  <div><span>Email</span><a [href]="'mailto:'+item.email">{{item.email}}</a></div>
                  <div><span>Property</span><strong>{{item.property_name || 'Not linked to a listing'}}</strong><small>{{item.property_reference || item.source_path || 'Website enquiry'}}</small></div>
                </div>
                <div class="message"><span>Customer message</span><p>{{item.message}}</p></div>
                @if (hasDetails(item)) {
                  <div class="details"><span>Requirement details</span><dl>@for (entry of item.details | keyvalue; track entry.key) {<div><dt>{{humanize(entry.key)}}</dt><dd>{{entry.value}}</dd></div>}</dl></div>
                }
                <div class="follow-up">
                  <label>Lead status<select [name]="'status-'+item.id" [(ngModel)]="item.status"><option value="NEW">New</option><option value="CONTACTED">Contacted</option><option value="QUALIFIED">Qualified</option><option value="CLOSED">Closed</option><option value="SPAM">Spam</option></select></label>
                  <label class="notes">Internal follow-up notes<textarea [name]="'notes-'+item.id" [(ngModel)]="item.admin_notes" rows="2" maxlength="5000" placeholder="Record call outcome, next step or site-visit details. These notes are admin-only."></textarea></label>
                  <button type="button" (click)="save(item)" [disabled]="savingIds().has(item.id)">{{savingIds().has(item.id) ? 'Saving…' : 'Save updates'}} <b>↗</b></button>
                </div>
              </article>
            }
          </div>
          <div class="pagination"><span>Showing {{items().length}} of {{count()}} matching records · Page {{page()}}</span><div><button type="button" (click)="load(page()-1)" [disabled]="!hasPrevious()">← Previous</button><button type="button" (click)="load(page()+1)" [disabled]="!hasNext()">Next →</button></div></div>
        }
      </section>
    </section>
  `,
  styles: [`
    :host{display:block;color:#243d34}.leads-page{max-width:1120px}.eyebrow{color:#b78b54;font-size:10px;letter-spacing:.16em;font-weight:700}.title-row{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-top:13px}.title-row h1{margin:0;color:#1b3a33;font:500 clamp(30px,4vw,43px) var(--font-display);letter-spacing:-.04em}.title-row p{max-width:620px;margin:8px 0 0;color:#758178;font-size:12px;line-height:1.7}.export,.search{min-height:40px;padding:0 15px;border:0;background:#23463b;color:#fff;font-size:10px;font-weight:700;white-space:nowrap;cursor:pointer}.export b{margin-left:12px;color:#d4b17b}.export:disabled{opacity:.5;cursor:not-allowed}.summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:25px 0}.summary article{padding:17px 19px;border:1px solid #e4e9e2;background:#fff}.summary span{display:block;color:#7c887f;font-size:10px}.summary strong{display:block;margin-top:9px;color:#26473a;font:500 29px var(--font-display)}.panel{padding:20px;border:1px solid #e2e8e1;background:#fff}.filters{display:grid;grid-template-columns:minmax(180px,1.6fr) minmax(150px,1fr) minmax(135px,.8fr) auto auto;align-items:end;gap:9px;padding-bottom:17px;border-bottom:1px solid #edf0eb}.filters label,.follow-up label{display:grid;gap:6px;color:#5e7064;font-size:9px;font-weight:700}.filters input,.filters select,.follow-up select,.follow-up textarea{width:100%;min-width:0;min-height:39px;padding:8px 10px;border:1px solid #dce4dc;border-radius:0;background:#fcfcf9;color:#33483d;font:400 11px 'DM Sans',sans-serif}.clear{min-height:39px;padding:0 8px;border:0;background:transparent;color:#78847c;text-decoration:underline;font-size:10px;cursor:pointer}.feedback{margin:14px 0;padding:10px 12px;font-size:10px}.feedback.success{background:#edf6ef;color:#276344}.feedback.error{background:#fff1ef;color:#973b34}.empty{padding:38px 16px;text-align:center;color:#829087;font-size:11px;line-height:1.7}.lead-list{display:grid;gap:13px;padding-top:16px}.lead-card{padding:18px;border:1px solid #e7ebe5;background:#fff}.lead-top{display:flex;align-items:flex-start;justify-content:space-between;gap:15px}.type{color:#a17b4d;font-size:8px;font-weight:700;letter-spacing:.13em;text-transform:uppercase}.lead-top h2{margin:6px 0 3px;color:#294438;font:600 19px var(--font-display)}.lead-top small{color:#879188;font-size:9px}.status{padding:6px 8px;background:#f2f3ee;color:#79857c;font-size:8px;font-weight:700;letter-spacing:.1em}.status.new{background:#fbf2e4;color:#946b32}.status.qualified{background:#edf5ef;color:#316c47}.status.closed{background:#edf0f3;color:#526273}.contact-grid{display:grid;grid-template-columns:1fr 1.4fr 1.5fr;gap:12px;margin-top:16px;padding:13px 0;border-top:1px solid #edf0eb;border-bottom:1px solid #edf0eb}.contact-grid div{min-width:0}.contact-grid span,.message>span,.details>span{display:block;margin-bottom:5px;color:#88938b;font-size:8px;font-weight:700;letter-spacing:.09em;text-transform:uppercase}.contact-grid a,.contact-grid strong{display:block;color:#315344;font-size:10px;font-weight:600;text-decoration:none;overflow-wrap:anywhere}.contact-grid small{display:block;margin-top:4px;color:#879188;font-size:9px;overflow-wrap:anywhere}.message,.details{margin-top:13px}.message p{margin:0;color:#586b60;font-size:11px;line-height:1.7;white-space:pre-line}.details dl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:0}.details dl div{padding:9px;background:#f7f8f4}.details dt{color:#8a958c;font-size:8px;text-transform:capitalize}.details dd{margin:4px 0 0;color:#385347;font-size:10px;overflow-wrap:anywhere}.follow-up{display:grid;grid-template-columns:150px minmax(0,1fr) auto;align-items:end;gap:10px;margin-top:16px;padding-top:14px;border-top:1px solid #edf0eb}.follow-up textarea{resize:vertical;min-height:39px}.follow-up button{min-height:39px;padding:0 13px;border:0;background:#23463b;color:#fff;font-size:9px;font-weight:700;white-space:nowrap;cursor:pointer}.follow-up button b{margin-left:8px;color:#d4b17b}.follow-up button:disabled{opacity:.55;cursor:not-allowed}.pagination{display:flex;align-items:center;justify-content:space-between;gap:15px;margin-top:17px;color:#89948c;font-size:9px}.pagination div{display:flex;gap:8px}.pagination button{min-height:33px;padding:0 10px;border:1px solid #dfe6df;background:#fff;color:#355344;font-size:9px}.pagination button:disabled{opacity:.4;cursor:not-allowed}@media(max-width:900px){.filters{grid-template-columns:repeat(2,minmax(0,1fr))}.filters label:first-child{grid-column:1/-1}.follow-up{grid-template-columns:140px minmax(0,1fr)}.follow-up button{grid-column:2;justify-self:end}}@media(max-width:600px){.title-row{align-items:flex-start;flex-direction:column}.summary{grid-template-columns:1fr 1fr}.summary article:last-child{grid-column:1/-1}.panel{padding:12px}.filters{grid-template-columns:1fr 1fr}.filters label:first-child{grid-column:1/-1}.lead-card{padding:13px}.contact-grid{grid-template-columns:1fr 1fr}.contact-grid div:last-child{grid-column:1/-1}.details dl{grid-template-columns:1fr}.follow-up{grid-template-columns:1fr}.follow-up button{grid-column:auto;justify-self:stretch}.pagination{align-items:flex-start;flex-direction:column}}
  `],
})
export class LeadsComponent implements OnInit {
  private readonly api = inject(PropertyEnquiryApi);
  private readonly platformId = inject(PLATFORM_ID);
  readonly items = signal<PropertyEnquiryRecord[]>([]);
  readonly count = signal(0);
  readonly page = signal(1);
  readonly loading = signal(true);
  readonly exporting = signal(false);
  readonly error = signal('');
  readonly message = signal('');
  readonly savingIds = signal<Set<number>>(new Set());

  search = '';
  type: LeadType | '' = '';
  status: LeadStatus | '' = '';

  readonly types: { value: LeadType; label: string }[] = [
    { value: 'GENERAL_ENQUIRY', label: 'General enquiry' },
    { value: 'PROPERTY_ENQUIRY', label: 'Property enquiry' },
    { value: 'BUY_REQUIREMENT', label: 'Buy requirement' },
    { value: 'RENT_REQUIREMENT', label: 'Rent requirement' },
    { value: 'SELL_PROPERTY', label: 'Sell a property' },
    { value: 'PROPERTY_LISTING', label: 'List a property' },
  ];
  readonly statuses: { value: LeadStatus; label: string }[] = [
    { value: 'NEW', label: 'New' },
    { value: 'CONTACTED', label: 'Contacted' },
    { value: 'QUALIFIED', label: 'Qualified' },
    { value: 'CLOSED', label: 'Closed' },
    { value: 'SPAM', label: 'Spam' },
  ];

  ngOnInit(): void { this.load(1); }

  load(page = this.page()): void {
    this.loading.set(true);
    this.error.set('');
    this.message.set('');
    this.api.listAdminEnquiries(20, page, {
      enquiry_type: this.type,
      status: this.status,
      search: this.search,
    }).subscribe({
      next: response => {
        this.items.set(response.results);
        this.count.set(response.count);
        this.page.set(page);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Unable to load submissions. Please refresh or sign in again.');
        this.loading.set(false);
      },
    });
  }

  reset(): void {
    this.search = '';
    this.type = '';
    this.status = '';
    this.load(1);
  }

  newOnPage(): number { return this.items().filter(item => item.status === 'NEW').length; }
  qualifiedOnPage(): number { return this.items().filter(item => item.status === 'QUALIFIED').length; }
  hasPrevious(): boolean { return this.page() > 1; }
  hasNext(): boolean { return this.page() * 20 < this.count(); }
  hasDetails(item: PropertyEnquiryRecord): boolean { return Object.keys(item.details ?? {}).length > 0; }
  humanize(value: string): string { return value.replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase()); }

  save(item: PropertyEnquiryRecord): void {
    const ids = new Set(this.savingIds());
    if (ids.has(item.id)) return;
    ids.add(item.id);
    this.savingIds.set(ids);
    this.message.set('');
    this.error.set('');
    this.api.updateAdminEnquiry(item.id, { status: item.status, admin_notes: item.admin_notes }).subscribe({
      next: updated => {
        this.items.update(items => items.map(current => current.id === updated.id ? updated : current));
        const next = new Set(this.savingIds());
        next.delete(item.id);
        this.savingIds.set(next);
        this.message.set('Lead #' + item.id + ' updated.');
      },
      error: () => {
        const next = new Set(this.savingIds());
        next.delete(item.id);
        this.savingIds.set(next);
        this.error.set('Could not save lead #' + item.id + '. Check your connection and try again.');
      },
    });
  }

  download(): void {
    if (this.exporting() || !isPlatformBrowser(this.platformId)) return;
    this.exporting.set(true);
    this.api.exportAdminEnquiries({ enquiry_type: this.type, status: this.status, search: this.search }).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'swastik-enquiries.csv';
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
        this.exporting.set(false);
      },
      error: () => {
        this.error.set('Unable to export the selected enquiries.');
        this.exporting.set(false);
      },
    });
  }
}
