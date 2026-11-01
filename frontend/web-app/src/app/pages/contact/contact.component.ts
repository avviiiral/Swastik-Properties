import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  BusinessContactSettings,
  LeadSubmissionPayload,
  LeadType,
  PropertyEnquiryApi,
} from '../../core/services/property-enquiry-api.service';
import { SWASTIK_CONTACT } from '../../core/config/business-contact';
import { SiteSeo } from '../../core/services/site-seo.service';

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="contact-hero">
      <div class="wrap">
        <div class="crumb"><a routerLink="/">Home</a><span>/</span><span>Contact</span></div>
        <div class="eyebrow">SWASTIK PROPERTIES / LET'S BEGIN</div>
        <h1>Tell us what<br>you have <em>in mind.</em></h1>
        <p>Looking to buy, rent, sell or list a property? Share a few details and our team will get back to you.</p>
      </div>
    </section>

    <section class="contact-content wrap">
      <div class="form-column">
        <div class="section-kicker">01 / YOUR REQUIREMENT</div>
        <h2>How can we help?</h2>
        <div class="type-grid" role="group" aria-label="Choose enquiry type">
          @for (type of formTypes; track type.value) {
            <button type="button" class="type-card" [class.selected]="selectedType() === type.value"
              [attr.aria-pressed]="selectedType() === type.value" (click)="selectType(type.value)">
              <span>{{type.number}}</span><strong>{{type.label}}</strong><small>{{type.description}}</small>
            </button>
          }
        </div>

        <form class="lead-form" (ngSubmit)="submit()" #leadForm="ngForm">
          <div class="form-heading">
            <div><div class="section-kicker">02 / YOUR DETAILS</div><h2>{{selectedLabel()}}</h2></div>
            <span class="required-note">* Required fields</span>
          </div>

          @if (selectedType() === 'BUY_REQUIREMENT' || selectedType() === 'RENT_REQUIREMENT') {
            <div class="field-grid">
              <label>Preferred location <span>*</span><input name="preferredLocation" [(ngModel)]="details['preferred_location']" required maxlength="160" placeholder="City, locality or area"></label>
              <label>Property category<select name="propertyCategory" [(ngModel)]="details['property_category']"><option value="">Any category</option><option value="RESIDENTIAL">Residential</option><option value="COMMERCIAL">Commercial</option><option value="LAND">Land & plots</option></select></label>
              <label>Bedrooms / configuration<input name="configuration" [(ngModel)]="details['configuration']" maxlength="100" placeholder="e.g. 2 BHK, office space"></label>
              <label>Preferred area / size<input name="preferredArea" [(ngModel)]="details['preferred_area']" maxlength="100" placeholder="e.g. 1,000 sq. ft."></label>
              <label>When do you need it?<select name="timeline" [(ngModel)]="details['timeline']"><option value="">Select timeline</option><option>Immediately</option><option>Within 1 month</option><option>Within 3 months</option><option>Within 6 months</option><option>Exploring options</option></select></label>
            </div>
          } @else if (selectedType() === 'SELL_PROPERTY' || selectedType() === 'PROPERTY_LISTING') {
            <div class="field-grid">
              <label>Property location <span>*</span><input name="propertyLocation" [(ngModel)]="details['property_location']" required maxlength="180" placeholder="City, locality or full address"></label>
              <label>Property category<select name="propertyCategory" [(ngModel)]="details['property_category']"><option value="">Select category</option><option value="RESIDENTIAL">Residential</option><option value="COMMERCIAL">Commercial</option><option value="LAND">Land & plots</option></select></label>
              <label>Property availability<select name="propertyAvailability" [(ngModel)]="details['property_availability']"><option value="">Select status</option><option>Vacant</option><option>Currently occupied</option><option>Available soon</option></select></label>
              <label>Property area<input name="propertyArea" [(ngModel)]="details['property_area']" maxlength="100" placeholder="e.g. 1,200 sq. ft."></label>
              <label class="full">Ownership / additional information<textarea name="ownership" [(ngModel)]="details['ownership_details']" rows="3" maxlength="1000" placeholder="Share ownership, property condition or other relevant details."></textarea></label>
            </div>
          } @else if (selectedType() === 'PROPERTY_ENQUIRY') {
            <div class="field-grid">
              <label>Property reference or name<input name="propertyReference" [(ngModel)]="details['property_reference']" maxlength="100" placeholder="If you have a specific listing in mind"></label>
              <label>Preferred time to contact<select name="preferredTime" [(ngModel)]="details['preferred_contact_time']"><option value="">Any time</option><option>Morning</option><option>Afternoon</option><option>Evening</option></select></label>
            </div>
          } @else {
            <div class="field-grid">
              <label>What would you like to discuss?<select name="topic" [(ngModel)]="details['topic']"><option value="">Select a topic</option><option>Property services</option><option>Existing listing</option><option>Business partnership</option><option>Other</option></select></label>
              <label>Preferred time to contact<select name="preferredTime" [(ngModel)]="details['preferred_contact_time']"><option value="">Any time</option><option>Morning</option><option>Afternoon</option><option>Evening</option></select></label>
            </div>
          }

          <div class="field-grid contact-fields">
            <label>Your full name <span>*</span><input name="name" [(ngModel)]="name" required minlength="2" maxlength="120" autocomplete="name" placeholder="Full name"></label>
            <label>Email address <span>*</span><input type="email" name="email" [(ngModel)]="email" required maxlength="254" autocomplete="email" placeholder="you@example.com"></label>
            <label>Phone number <span>*</span><input type="tel" name="phone" [(ngModel)]="phone" required minlength="10" maxlength="20" autocomplete="tel" placeholder="+91 98765 43210"></label>
            <label class="full">Message <span>*</span><textarea name="message" [(ngModel)]="message" required minlength="10" maxlength="2000" rows="4" placeholder="Add any details that will help us understand your requirement."></textarea></label>
          </div>

          <label class="honeypot" aria-hidden="true">Leave this field empty<input name="website" [(ngModel)]="website" tabindex="-1" autocomplete="off"></label>
          <label class="consent"><input type="checkbox" name="consent" [(ngModel)]="consent" required><span>I agree that Swastik Properties may contact me about this request. My details will be used only to respond to this enquiry.</span></label>
          @if (error()) { <p class="feedback error" role="alert">{{error()}}</p> }
          @if (success()) { <p class="feedback success" role="status">Thank you. Your request has been received. Our team will contact you shortly.</p> }
          <button class="submit" type="submit" [disabled]="sending() || !leadForm.valid">{{sending() ? 'Sending your request…' : 'Submit enquiry'}} <b>↗</b></button>
          <p class="privacy">We do not publish your contact details. Please avoid sharing sensitive financial or identity documents in this form.</p>
        </form>
      </div>

      <aside class="contact-aside">
        <div class="section-kicker">DIRECT CONTACT</div><h2>Prefer a conversation?</h2>
        <p>Reach the Swastik Properties team using the contact details configured by the administrator.</p>
        <a class="contact-link" [href]="whatsappUrl()" target="_blank" rel="noopener noreferrer"><span>WhatsApp</span><b>↗</b></a>
        <a class="contact-link" [href]="'tel:' + contact().contact_number"><span>Call {{contact().contact_number}}</span><b>↗</b></a>
        <a class="contact-link" [href]="'mailto:' + contact().email"><span>{{contact().email}}</span><b>↗</b></a>
        <div class="aside-note"><span>SWASTIK PROPERTIES</span><p>Clear information. Considered property choices. A straightforward conversation to get started.</p></div>
      </aside>
    </section>
  `,
  styles: [`
    :host{display:block;color:#243d34}.wrap{width:min(1160px,calc(100% - 56px));margin:auto}.contact-hero{background:#1b3a33;color:#f6f5ef}.contact-hero .wrap{padding:28px 0 58px}.crumb{display:flex;gap:10px;margin-bottom:48px;color:#9eafa5;font-size:10px}.crumb a{color:#d5dfd7;text-decoration:none}.eyebrow,.section-kicker{color:#b99361;font-size:9px;font-weight:700;letter-spacing:.17em}.contact-hero h1{margin:16px 0 13px;color:#f5f1e8;font:600 clamp(44px,6vw,68px)/1.05 'Manrope',sans-serif;letter-spacing:-.06em}.contact-hero h1 em{color:#d6b477;font-style:normal}.contact-hero p{max-width:520px;color:#bdc9c1;font-size:13px;line-height:1.8}.contact-content{display:grid;grid-template-columns:minmax(0,1fr) 290px;align-items:start;gap:52px;padding:58px 0 90px}.form-column h2,.contact-aside h2{margin:10px 0 18px;color:#203d33;font:600 25px 'Manrope',sans-serif;letter-spacing:-.04em}.type-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.type-card{min-height:118px;padding:14px;text-align:left;border:1px solid #e0e6df;background:#fff;display:flex;flex-direction:column;align-items:flex-start;gap:7px;cursor:pointer}.type-card.selected{border-color:#a9824f;background:#f6f5ef;box-shadow:inset 0 0 0 1px #a9824f}.type-card>span{color:#b08a58;font-size:9px;font-weight:700;letter-spacing:.12em}.type-card strong{color:#29463a;font-size:12px}.type-card small{color:#879189;font-size:9px;line-height:1.5}.lead-form{margin-top:34px;padding-top:28px;border-top:1px solid #e5e9e3}.form-heading{display:flex;align-items:end;justify-content:space-between;gap:15px;margin-bottom:20px}.form-heading h2{margin-bottom:0}.required-note{color:#89958c;font-size:9px}.field-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px;margin-bottom:17px}.field-grid label{display:grid;gap:7px;color:#56695e;font-size:10px;font-weight:700}.field-grid label span{display:inline;color:#ae714a}.field-grid input,.field-grid select,.field-grid textarea{width:100%;min-width:0;min-height:43px;padding:11px 12px;border:1px solid #dce4dc;border-radius:0;background:#fcfcf9;color:#263d34;font:400 12px 'DM Sans',sans-serif}.field-grid textarea{resize:vertical;min-height:90px}.field-grid input:focus,.field-grid select:focus,.field-grid textarea:focus{outline:2px solid rgba(184,140,85,.3);border-color:#ad895c}.field-grid .full{grid-column:1/-1}.contact-fields{padding-top:16px;border-top:1px solid #edf0eb}.consent{display:flex;align-items:flex-start;gap:9px;color:#7e8a81;font-size:10px;line-height:1.6}.consent input{margin-top:2px;accent-color:#23483c}.submit{width:100%;min-height:46px;margin-top:17px;padding:0 15px;display:flex;align-items:center;justify-content:space-between;border:0;background:#23463b;color:#fff;font-size:11px;font-weight:700;cursor:pointer}.submit b{color:#d4b17b;font-size:15px}.submit:disabled{opacity:.55;cursor:not-allowed}.privacy{color:#929b93;font-size:9px;line-height:1.6}.feedback{margin:13px 0;padding:11px;font-size:10px}.feedback.error{background:#fff1ef;color:#973b34}.feedback.success{background:#edf6ef;color:#276344}.honeypot{position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden}.contact-aside{position:sticky;top:105px;padding:24px;border:1px solid #e3e8e1;background:#fff}.contact-aside h2{font-size:22px;margin-bottom:8px}.contact-aside>p{margin:0 0 19px;color:#7d8981;font-size:11px;line-height:1.8}.contact-link{min-height:46px;margin-top:8px;padding:0 12px;display:flex;align-items:center;justify-content:space-between;border:1px solid #e0e7df;color:#2d4b3f;text-decoration:none;font-size:10px;font-weight:700;overflow-wrap:anywhere}.contact-link b{margin-left:9px;color:#b18a56}.aside-note{margin-top:26px;padding-top:19px;border-top:1px solid #e8ece7}.aside-note span{color:#b18a56;font-size:8px;font-weight:700;letter-spacing:.14em}.aside-note p{margin:8px 0 0;color:#829087;font-size:10px;line-height:1.8}@media(max-width:850px){.contact-content{grid-template-columns:minmax(0,1fr) 250px;gap:25px}.type-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:650px){.wrap{width:calc(100% - 38px)}.contact-hero .wrap{padding:23px 0 42px}.crumb{margin-bottom:35px}.contact-content{grid-template-columns:1fr;padding:38px 0 60px}.contact-aside{position:static;grid-row:1}.type-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.type-card{min-height:108px;padding:11px}.field-grid{grid-template-columns:1fr}.field-grid .full{grid-column:auto}.form-heading{align-items:flex-start;flex-direction:column}}
  `],
})
export class ContactComponent implements OnInit {
  private readonly api = inject(PropertyEnquiryApi);
  private readonly router = inject(Router);
  private readonly seo = inject(SiteSeo);

  readonly formTypes: { value: LeadType; number: string; label: string; description: string }[] = [
    { value: 'GENERAL_ENQUIRY', number: '01', label: 'General enquiry', description: 'Ask us a question or discuss our services.' },
    { value: 'PROPERTY_ENQUIRY', number: '02', label: 'Property enquiry', description: 'Get information about a specific listing.' },
    { value: 'BUY_REQUIREMENT', number: '03', label: 'Buy a property', description: 'Tell us what you are looking to purchase.' },
    { value: 'RENT_REQUIREMENT', number: '04', label: 'Rent a property', description: 'Share your rental requirements.' },
    { value: 'SELL_PROPERTY', number: '05', label: 'Sell a property', description: 'Discuss a property you want to sell.' },
    { value: 'PROPERTY_LISTING', number: '06', label: 'List a property', description: 'Ask us to list and market your property.' },
  ];

  readonly selectedType = signal<LeadType>('GENERAL_ENQUIRY');
  readonly sending = signal(false);
  readonly success = signal(false);
  readonly error = signal('');
  readonly contact = signal<BusinessContactSettings>({
    whatsapp_number: SWASTIK_CONTACT.phoneHref,
    contact_number: SWASTIK_CONTACT.phoneHref,
    email: SWASTIK_CONTACT.email,
  });

  name = '';
  email = '';
  phone = '';
  message = '';
  consent = false;
  website = '';
  details: Record<string, string> = {};

  ngOnInit(): void {
    this.seo.set('Contact Swastik Properties | Property Enquiries', 'Contact Swastik Properties for property enquiries, buying, renting, selling and property listing requirements across Maharashtra.');
    this.api.getContactSettings().subscribe({
      next: settings => this.contact.set(settings),
      error: () => undefined,
    });
  }

  selectType(type: LeadType): void {
    if (this.selectedType() === type) return;
    this.selectedType.set(type);
    this.details = {};
    this.message = '';
    this.success.set(false);
    this.error.set('');
  }

  selectedLabel(): string {
    return this.formTypes.find(item => item.value === this.selectedType())?.label ?? 'Your enquiry';
  }

  whatsappUrl(): string {
    const number = this.contact().whatsapp_number.replace(/\D/g, '');
    const text = 'Hello Swastik Properties, I would like to discuss a property requirement.';
    return 'https://wa.me/' + number + '?text=' + encodeURIComponent(text);
  }

  submit(): void {
    if (this.sending() || !this.consent) return;
    this.sending.set(true);
    this.success.set(false);
    this.error.set('');

    const payload: LeadSubmissionPayload = {
      enquiry_type: this.selectedType(),
      name: this.name.trim(),
      email: this.email.trim(),
      phone: this.phone.trim(),
      message: this.message.trim(),
      details: Object.entries(this.details).reduce((result, [key, value]) => {
        const normalized = String(value ?? '').trim();
        if (normalized) result[key] = normalized;
        return result;
      }, {} as Record<string, string>),
      source_path: this.router.url.slice(0, 300),
      consent: this.consent,
      website: this.website,
    };

    this.api.submitLead(payload).subscribe({
      next: () => {
        this.sending.set(false);
        this.success.set(true);
        this.name = '';
        this.email = '';
        this.phone = '';
        this.message = '';
        this.details = {};
        this.consent = false;
        this.website = '';
      },
      error: error => {
        this.sending.set(false);
        const body = error?.error;
        const first = body && typeof body === 'object'
          ? Object.values(body).flat().find(value => typeof value === 'string')
          : null;
        this.error.set(typeof first === 'string' ? first : 'We could not send your request. Please try again or contact us directly.');
      },
    });
  }
}
