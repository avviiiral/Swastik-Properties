import { DatePipe, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { PropertyApi } from '../../../core/services/property-api.service';
import {
  BusinessContactSettings,
  PropertyEnquiryApi,
  PropertyEnquiryRecord,
} from '../../../core/services/property-enquiry-api.service';

@Component({
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe],
  template: `
    <section class="dashboard">
      <div class="eyebrow">SWASTIK PROPERTIES / OVERVIEW</div>
      <h1>Good day.</h1>
      <p class="intro">A clear view of your property workspace.</p>

      <div class="stats">
        <article><span>Published properties</span><strong>{{published()}}</strong><small>Currently visible in the catalogue</small></article>
        <article><span>Total listed records</span><strong>{{total()}}</strong><small>Across all listing statuses</small></article>
        <article><span>Property enquiries</span><strong>{{enquiryCount()}}</strong><small>Submissions received from the website</small></article>
      </div>

      <section class="panel contact-settings" aria-labelledby="contact-settings-heading">
        <div class="panel-heading">
          <div><div class="eyebrow">PUBLIC WEBSITE</div><h2 id="contact-settings-heading">Business contact details</h2><p>These details appear on every property's WhatsApp, Call and Email actions.</p></div>
          <span class="settings-mark">SITE SETTINGS</span>
        </div>
        <form (ngSubmit)="saveContactSettings()" #contactForm="ngForm">
          <div class="contact-fields">
            <label>WhatsApp number <small>Include country code, e.g. +91</small><input type="tel" name="whatsappNumber" [(ngModel)]="whatsappNumber" required minlength="10" maxlength="20" placeholder="+91 98765 43210"></label>
            <label>Contact number <small>Used by the Call button</small><input type="tel" name="contactNumber" [(ngModel)]="contactNumber" required minlength="10" maxlength="20" placeholder="+91 98765 43210"></label>
            <label>Email address <small>Used by the Email button</small><input type="email" name="contactEmail" [(ngModel)]="contactEmail" required maxlength="254" placeholder="office@example.com"></label>
          </div>
          @if(contactError()){<p class="feedback error" role="alert">{{contactError()}}</p>}
          @if(contactMessage()){<p class="feedback success" role="status">{{contactMessage()}}</p>}
          <div class="form-footer"><span>Changes take effect on the public website after saving.</span><button type="submit" [disabled]="!contactForm.valid || contactSaving()">{{contactSaving() ? 'Saving…' : 'Save contact details'}} <b>↗</b></button></div>
        </form>
      </section>

      <section class="panel enquiries" aria-labelledby="enquiries-heading">
        <div class="panel-heading enquiries-heading">
          <div><div class="eyebrow">LEAD MANAGEMENT</div><h2 id="enquiries-heading">Property enquiries</h2><p>Recent messages submitted from individual property pages.</p></div>
          <button class="export-button" type="button" (click)="downloadEnquiries()" [disabled]="exporting() || enquiryCount()===0">{{exporting() ? 'Preparing…' : 'Download CSV'}} <b>↓</b></button>
        </div>
        @if(enquiryError()){<p class="feedback error" role="alert">{{enquiryError()}}</p>}
        @if(enquiriesLoading()){<div class="empty-state">Loading property enquiries…</div>}
        @else if(enquiries().length===0){<div class="empty-state">No property enquiries have been received yet. New website submissions will appear here.</div>}
        @else {
          <div class="table-wrap">
            <table>
              <thead><tr><th>Enquiry</th><th>Property</th><th>Contact details</th><th>Received</th><th>Status</th></tr></thead>
              <tbody>
                @for(item of enquiries(); track item.id){
                  <tr>
                    <td><strong>{{item.name}}</strong><small>{{item.message}}</small></td>
                    <td><strong>{{item.property_name}}</strong><small>{{item.property_reference || 'No reference'}}</small></td>
                    <td><a [href]="'mailto:'+item.email">{{item.email}}</a><a [href]="'tel:'+item.phone">{{item.phone}}</a></td>
                    <td>{{item.created_at | date:'dd MMM yyyy, h:mm a'}}</td>
                    <td><span class="status" [class.new]="item.status==='NEW'">{{item.status}}</span></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="table-footer">Showing the latest {{enquiries().length}} of {{enquiryCount()}} enquiries.</div>
        }
      </section>

      <div class="actions"><a routerLink="/admin/properties">Manage properties ↗</a></div>
    </section>
  `,
  styles: [`
    :host{display:block}.dashboard{max-width:1100px}.eyebrow{color:#b78b54;font-size:10px;letter-spacing:.16em;font-weight:700}.dashboard h1{font:500 46px var(--font-display);color:#1b3a33;margin:13px 0 0}.intro{color:#758178;margin:8px 0 0;font-size:13px}
    .stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin:30px 0}.stats article{padding:21px;background:#fff;border:1px solid #e5e9e4;min-width:0}.stats span,.stats small{display:block;color:#7b887f;font-size:11px}.stats strong{display:block;margin:13px 0;color:#1b3a33;font:500 37px var(--font-display)}.stats small{line-height:1.5}
    .panel{padding:24px;background:#fff;border:1px solid #e3e8e2;margin:18px 0}.panel-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin-bottom:20px}.panel-heading h2{margin:8px 0 5px;color:#1d3b32;font:600 23px var(--font-display);letter-spacing:-.03em}.panel-heading p{margin:0;color:#78847c;font-size:11px;line-height:1.6}.settings-mark{padding:7px 9px;background:#f3f4ee;color:#8c795d;font-size:8px;font-weight:700;letter-spacing:.12em;white-space:nowrap}
    .contact-fields{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.contact-fields label{display:grid;gap:7px;color:#3a5044;font-size:11px;font-weight:700}.contact-fields label small{color:#89938b;font-size:9px;font-weight:400}.contact-fields input{width:100%;min-width:0;min-height:42px;padding:0 11px;border:1px solid #dce4dc;border-radius:0;background:#fcfcf9;color:#294237;font:400 12px 'DM Sans',sans-serif}.contact-fields input:focus{outline:2px solid rgba(184,140,85,.3);border-color:#ad895c}
    .form-footer{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-top:18px;padding-top:16px;border-top:1px solid #edf0eb}.form-footer>span{color:#89938b;font-size:10px}.form-footer button,.export-button{min-height:39px;padding:0 13px;border:0;background:#23463b;color:white;font-size:10px;font-weight:700;cursor:pointer}.form-footer button b,.export-button b{margin-left:12px;color:#d4b17b}.form-footer button:disabled,.export-button:disabled{opacity:.55;cursor:not-allowed}
    .feedback{margin:14px 0 0;padding:10px 12px;font-size:11px}.feedback.error{background:#fff1ef;color:#973b34}.feedback.success{background:#edf6ef;color:#276344}.enquiries-heading{align-items:center}.export-button{white-space:nowrap}.table-wrap{width:100%;overflow-x:auto}table{width:100%;border-collapse:collapse;text-align:left}th{padding:11px 12px;background:#f7f8f4;color:#859087;font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;white-space:nowrap}td{padding:14px 12px;border-bottom:1px solid #edf0eb;color:#6e7b72;font-size:10px;vertical-align:top}td strong,td small,td a{display:block}td strong{max-width:200px;color:#2b4338;font-size:11px;font-weight:700}td small{max-width:230px;margin-top:5px;color:#879189;line-height:1.5;overflow-wrap:anywhere}td a{margin:0 0 5px;color:#426453;text-decoration:none;white-space:nowrap}.status{display:inline-block;padding:5px 7px;background:#f1f3ee;color:#7c887f;font-size:8px;font-weight:700;letter-spacing:.08em}.status.new{background:#fbf2e4;color:#946b32}.empty-state{padding:28px 16px;background:#f8f9f5;color:#829087;text-align:center;font-size:11px;line-height:1.7}.table-footer{padding-top:12px;color:#8b958d;font-size:10px}.actions{margin-top:25px}.actions a{color:#8f6a3e;font-size:11px;font-weight:700;text-decoration:none}
    @media(max-width:800px){.stats{grid-template-columns:repeat(2,minmax(0,1fr))}.contact-fields{grid-template-columns:1fr 1fr}.contact-fields label:last-child{grid-column:1/-1}}
    @media(max-width:560px){.dashboard h1{font-size:38px}.stats{grid-template-columns:1fr;gap:9px;margin:22px 0}.stats article{padding:16px}.stats strong{margin:8px 0;font-size:31px}.panel{padding:16px}.panel-heading,.enquiries-heading{align-items:flex-start;flex-direction:column}.contact-fields{grid-template-columns:1fr}.contact-fields label:last-child{grid-column:auto}.form-footer{align-items:flex-start;flex-direction:column}.form-footer button{width:100%}}
  `]
})
export class DashboardComponent implements OnInit {
  private readonly api = inject(PropertyApi);
  private readonly enquiryApi = inject(PropertyEnquiryApi);
  private readonly platformId = inject(PLATFORM_ID);

  readonly total = signal(0);
  readonly published = signal(0);
  readonly enquiryCount = signal(0);
  readonly enquiries = signal<PropertyEnquiryRecord[]>([]);
  readonly enquiriesLoading = signal(true);
  readonly enquiryError = signal('');
  readonly contactSaving = signal(false);
  readonly contactMessage = signal('');
  readonly contactError = signal('');
  readonly exporting = signal(false);

  whatsappNumber = '';
  contactNumber = '';
  contactEmail = '';

  ngOnInit(): void {
    this.api.listAdmin({ page: 1, publication_status: 'PUBLISHED' }).subscribe({
      next: response => this.published.set(response.count),
    });
    this.api.listAdmin({ page: 1 }).subscribe({
      next: response => this.total.set(response.count),
    });
    this.loadContactSettings();
    this.loadEnquiries();
  }

  private loadContactSettings(): void {
    this.enquiryApi.getContactSettings().subscribe({
      next: settings => this.setContactFields(settings),
      error: () => this.contactError.set('Unable to load the saved business contact details.'),
    });
  }

  private setContactFields(settings: BusinessContactSettings): void {
    this.whatsappNumber = settings.whatsapp_number;
    this.contactNumber = settings.contact_number;
    this.contactEmail = settings.email;
  }

  saveContactSettings(): void {
    if (this.contactSaving()) return;
    this.contactSaving.set(true);
    this.contactMessage.set('');
    this.contactError.set('');
    this.enquiryApi.updateContactSettings({
      whatsapp_number: this.whatsappNumber.trim(),
      contact_number: this.contactNumber.trim(),
      email: this.contactEmail.trim(),
    }).subscribe({
      next: settings => {
        this.setContactFields(settings);
        this.contactMessage.set('Business contact details saved successfully.');
        this.contactSaving.set(false);
      },
      error: error => {
        const errors = error?.error;
        const first = errors && typeof errors === 'object'
          ? Object.values(errors).flat().find(value => typeof value === 'string')
          : null;
        this.contactError.set(typeof first === 'string' ? first : 'Unable to save contact details. Please try again.');
        this.contactSaving.set(false);
      },
    });
  }

  private loadEnquiries(): void {
    this.enquiriesLoading.set(true);
    this.enquiryApi.listAdminEnquiries().subscribe({
      next: response => {
        this.enquiries.set(response.results);
        this.enquiryCount.set(response.count);
        this.enquiriesLoading.set(false);
      },
      error: () => {
        this.enquiryError.set('Unable to load property enquiries. Please refresh or sign in again.');
        this.enquiriesLoading.set(false);
      },
    });
  }

  downloadEnquiries(): void {
    if (this.exporting() || !isPlatformBrowser(this.platformId)) return;
    this.exporting.set(true);
    this.enquiryApi.exportAdminEnquiries().subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'swastik-property-enquiries.csv';
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
        this.exporting.set(false);
      },
      error: () => {
        this.enquiryError.set('Unable to download enquiries. Please try again.');
        this.exporting.set(false);
      },
    });
  }
}
