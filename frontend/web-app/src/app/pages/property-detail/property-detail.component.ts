import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Property } from '../../core/models/property.models';
import { PropertyApi } from '../../core/services/property-api.service';
import { SiteSeo } from '../../core/services/site-seo.service';
import { PropertyEnquiryApi } from '../../core/services/property-enquiry-api.service';
import { SWASTIK_CONTACT } from '../../core/config/business-contact';
@Component({
  standalone: true,
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) { <div class="detail-message">Loading property details…</div> }
    @else if (!property()) {
      <section class="not-found"><div class="kicker">SWASTIK PROPERTIES / 404</div><h1>This property<br>is no longer <em>available.</em></h1><p>The link may be outdated or the listing may have been removed from the public catalogue.</p><a routerLink="/properties">Browse all properties ↗</a></section>
    } @else {
      <section class="detail-hero"><div class="wrap"><div class="crumb"><a routerLink="/">Home</a><span>/</span><a routerLink="/properties">Properties</a><span>/</span><span>{{property()!.name}}</span></div><div class="detail-label">{{property()!.category || 'PROPERTY'}} · {{property()!.listing_type || 'OPPORTUNITY'}}</div><h1>{{property()!.name}}</h1><p>⌖ &nbsp;{{location(property()!)}}</p><small>PROPERTY REFERENCE&nbsp;&nbsp; {{property()!.property_reference}}</small></div></section>
      <section class="detail-content wrap">
        <div class="detail-main">
          @if (galleryImages().length) {
            <div class="property-gallery">
              @for (image of galleryImages(); track image.id; let i = $index) {
                <figure class="gallery-image" [class.gallery-primary]="i === 0">
                  <img [src]="image.image_url" [alt]="image.alt_text || property()!.name">
                  @if (image.caption) { <figcaption>{{ image.caption }}</figcaption> }
                </figure>
              }
            </div>
          } @else {
            <div class="detail-art"><div>S<span>.</span></div><span class="art-ref">{{property()!.property_reference}}</span><span class="art-cat">{{property()!.category || 'PROPERTY'}}</span></div>
          }
          <section class="detail-section"><div class="kicker">01 / OVERVIEW</div><h2>About this property</h2><p>{{property()!.description || 'A detailed description has not been provided for this listing. Please refer to the project brochure or verify particulars with the seller or developer.'}}</p></section>
          <section class="detail-section"><div class="kicker">02 / PROPERTY DETAILS</div><h2>At a glance</h2><div class="facts">
            <div><span>Category</span><strong>{{property()!.category || 'Not specified'}}</strong></div>
            <div><span>Property type</span><strong>{{property()!.subcategory || 'Not specified'}}</strong></div>
            <div><span>Purpose</span><strong>{{pretty(property()!.listing_type)}}</strong></div>
            <div><span>Area</span><strong>{{area(property()!)}}</strong></div>
            <div><span>Availability</span><strong>{{pretty(property()!.availability_status)}}</strong></div>
            <div><span>Developer</span><strong>{{property()!.developer_name || 'Not specified'}}</strong></div>
          </div></section>
        </div>
        <aside class="aside">
          <div class="price-panel"><span class="aside-label">INDICATIVE PRICE</span><strong>{{price(property()!)}}</strong><span class="availability" [class.no]="property()!.availability_status!=='AVAILABLE'">{{pretty(property()!.availability_status)}}</span><hr>
            @if(property()!.brochure_url){<a class="primary" [href]="property()!.brochure_url" target="_blank" rel="noopener noreferrer">View project brochure <b>↗</b></a>} @else {<span class="no-brochure">Brochure not available</span>}
            <a class="secondary" [href]="property()!.location_url" target="_blank" rel="noopener noreferrer">Open in Google Maps <b>↗</b></a>
          </div>
          <section class="contact-panel" aria-labelledby="property-enquiry-heading">
            <span class="aside-label">PERSONAL ASSISTANCE</span>
            <h2 id="property-enquiry-heading">Interested in this property?</h2>
            <p class="contact-intro">Speak with our team or send an enquiry about this specific listing.</p>
            <div class="contact-actions">
              <a class="contact-action whatsapp" [href]="whatsappUrl(property()!)" target="_blank" rel="noopener noreferrer"><span>WhatsApp</span><b>↗</b></a>
              <a class="contact-action" [href]="'tel:' + contact.phoneHref"><span>Call us</span><b>↗</b></a>
              <a class="contact-action" [href]="emailUrl(property()!)"><span>Email</span><b>↗</b></a>
            </div>
            <form class="enquiry-form" (ngSubmit)="submitEnquiry()" #enquiryForm="ngForm">
              <label>Your name<input type="text" name="enquiryName" [(ngModel)]="enquiryName" required minlength="2" maxlength="120" autocomplete="name" placeholder="Full name"></label>
              <label>Email address<input type="email" name="enquiryEmail" [(ngModel)]="enquiryEmail" required maxlength="254" autocomplete="email" placeholder="you@example.com"></label>
              <label>Phone number<input type="tel" name="enquiryPhone" [(ngModel)]="enquiryPhone" required minlength="10" maxlength="20" autocomplete="tel" placeholder="+91"></label>
              <label>Your message<textarea name="enquiryMessage" [(ngModel)]="enquiryMessage" required minlength="10" maxlength="2000" rows="4" placeholder="I would like to know more about this property..."></textarea></label>
              @if (enquiryError()) { <p class="form-feedback error" role="alert">{{enquiryError()}}</p> }
              @if (enquirySuccess()) { <p class="form-feedback success" role="status">Thank you. Your enquiry has been received. Our team will contact you.</p> }
              <button class="enquiry-submit" type="submit" [disabled]="enquirySending() || !enquiryForm.valid">{{enquirySending() ? 'Sending…' : 'Send property enquiry'}} <b>↗</b></button>
              <small class="privacy-note">Your details will only be used to respond to this property enquiry.</small>
            </form>
          </section>
          <div class="address-panel"><span class="aside-label">LOCATION</span><strong>{{property()!.location_name || property()!.locality_name || property()!.city_name || 'Location details'}}</strong><p>{{property()!.full_address || location(property()!)}}</p></div>
          <div class="disclaimer">Please verify price, availability, approvals and property particulars directly with the seller or developer before proceeding.</div>
          <a class="back" routerLink="/properties">← Back to all properties</a>
        </aside>
      </section>
    }
  `,
  styles: [`
    :host{display:block;color:#243d34}.wrap{width:min(1220px,calc(100% - 56px));margin:auto}.detail-hero{background:#1b3a33;color:#f6f5ef}.detail-hero .wrap{padding:28px 0 45px}
    .crumb{display:flex;flex-wrap:wrap;gap:10px;color:#94a99e;font-size:10px;margin-bottom:47px}.crumb a{color:#d4ded6;text-decoration:none}.detail-label,.kicker{color:#c5a575;font-size:9px;font-weight:700;letter-spacing:.17em}
    .detail-hero h1{margin:13px 0 7px;font:600 clamp(37px,5.5vw,63px)/1.08 'Manrope',sans-serif;letter-spacing:-.055em}.detail-hero p{color:#bdc9c1;font-size:12px}.detail-hero small{display:block;margin-top:26px;color:#8da49a;font-size:8px;font-weight:700;letter-spacing:.17em}
    .detail-content{padding:50px 0 8px;display:grid;grid-template-columns:minmax(0,1.6fr) minmax(280px,.75fr);align-items:start;gap:48px}
    .detail-art{height:325px;position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;background:linear-gradient(145deg,#dce1d7,#aebdaf)}.detail-art:before{content:'';position:absolute;inset:20px;border:1px solid rgba(40,74,59,.22)}.detail-art>div{color:rgba(29,61,51,.7);font:500 125px 'Manrope',sans-serif;letter-spacing:-.1em}.detail-art>div span{color:#a7783e}
    .art-ref,.art-cat{position:absolute;top:18px;color:#33473d;font-size:8px;font-weight:700;letter-spacing:.13em}.art-ref{right:22px}.art-cat{left:22px}
    .detail-section{padding:39px 0 33px;border-bottom:1px solid #e3e8e1}.detail-section h2{margin:12px 0 14px;color:#253e34;font:600 26px 'Manrope',sans-serif;letter-spacing:-.04em}.detail-section p{max-width:700px;color:#6e7c72;font-size:13px;line-height:1.95;white-space:pre-line}
    .facts{display:grid;grid-template-columns:repeat(2,1fr);gap:0 28px}.facts>div{padding:14px 0;border-top:1px solid #edf0eb;display:flex;flex-direction:column;gap:6px}.facts span{color:#8a958c;font-size:10px}.facts strong{color:#2b4439;font-size:12px}
    .aside{position:sticky;top:105px;display:flex;flex-direction:column;gap:13px}.price-panel,.address-panel{padding:23px;border:1px solid #e2e8e1;background:#fff}.aside-label{display:block;color:#a78354;font-size:9px;font-weight:700;letter-spacing:.16em}
    .price-panel>strong{display:block;margin-top:11px;color:#254638;font:700 24px 'Manrope',sans-serif;letter-spacing:-.04em}.availability{display:inline-block;margin-top:12px;padding:6px 8px;color:#315d40;background:#edf4ec;font-size:8px;font-weight:700;letter-spacing:.1em}.availability.no{color:#875e3d;background:#f5f0e8}
    hr{height:1px;margin:20px 0 16px;border:0;background:#e8ece7}.primary,.secondary{min-height:42px;padding:0 12px;display:flex;align-items:center;justify-content:space-between;text-decoration:none;font-size:10px;font-weight:700}.primary{background:#23463b;color:#fff}.primary b{color:#d4b17b;font-size:15px}.secondary{margin-top:8px;border:1px solid #dce5dc;color:#2d4c3e}.secondary b{color:#ae8552;font-size:15px}.no-brochure{font-size:11px;color:#9aa39d}
    .contact-panel{padding:23px;border:1px solid #e2e8e1;background:#fff}.contact-panel h2{margin:11px 0 6px;color:#284438;font:700 18px 'Manrope',sans-serif;letter-spacing:-.03em}.contact-intro{margin:0;color:#7c8980;font-size:11px;line-height:1.7}.contact-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:16px}.contact-action{min-height:39px;padding:0 9px;display:flex;align-items:center;justify-content:space-between;gap:4px;border:1px solid #dce5dc;color:#29483d;text-decoration:none;font-size:10px;font-weight:700}.contact-action b{color:#ad8552}.contact-action.whatsapp{border-color:#d4e5d8;background:#edf5ef;color:#236342}.enquiry-form{display:grid;gap:12px;margin-top:19px;padding-top:17px;border-top:1px solid #e8ece7}.enquiry-form label{display:grid;gap:6px;color:#596a60;font-size:10px;font-weight:700}.enquiry-form input,.enquiry-form textarea{width:100%;min-width:0;padding:11px 12px;border:1px solid #dce4dc;border-radius:0;background:#fcfcf9;color:#263d34;font:400 12px 'DM Sans',sans-serif}.enquiry-form input:focus,.enquiry-form textarea:focus{outline:2px solid rgba(184,140,85,.35);border-color:#ad895c}.enquiry-form textarea{resize:vertical;min-height:85px}.enquiry-submit{min-height:43px;padding:0 13px;display:flex;align-items:center;justify-content:space-between;border:0;background:#23463b;color:#fff;font-size:11px;font-weight:700;cursor:pointer}.enquiry-submit b{color:#d4b17b;font-size:15px}.enquiry-submit:disabled{opacity:.55;cursor:not-allowed}.privacy-note{color:#929b93;font-size:9px;line-height:1.5}.form-feedback{margin:0;padding:10px;font-size:10px;line-height:1.5}.form-feedback.error{background:#fff1ef;color:#973b34}.form-feedback.success{background:#edf6ef;color:#276344}
    .address-panel strong{display:block;margin-top:11px;color:#2b4338;font:700 15px 'Manrope',sans-serif}.address-panel p{margin:7px 0 0;color:#7c8980;font-size:11px;line-height:1.7}.disclaimer{padding:14px;color:#8a928b;background:#f1f3ed;font-size:10px;line-height:1.7}.back{color:#315344;text-decoration:none;font-size:11px;font-weight:700}
    @media(max-width:680px){.contact-actions{gap:6px}.contact-action{padding:0 7px;font-size:9px}}

    .detail-message{min-height:350px;display:grid;place-items:center;color:#758279;font-size:13px}.not-found{width:min(1220px,calc(100% - 56px));min-height:460px;margin:auto;padding:75px 0}.not-found h1{color:#203e34;font:600 clamp(42px,6vw,64px)/1.08 'Manrope',sans-serif;letter-spacing:-.06em}.not-found h1 em{color:#b78c54;font-style:normal}.not-found p{max-width:430px;color:#748077;font-size:13px;line-height:1.8}.not-found a{display:inline-block;margin-top:14px;padding:13px 16px;background:#23463b;color:white;text-decoration:none;font-size:11px;font-weight:700}
    @media(max-width:850px){.detail-content{grid-template-columns:minmax(0,1fr) 270px;gap:22px}.detail-art{height:270px}}
    @media(max-width:680px){.wrap,.not-found{width:calc(100% - 38px)}.detail-hero .wrap{padding:23px 0 36px}.crumb{margin-bottom:32px}.detail-content{grid-template-columns:1fr;padding-top:28px}.detail-art{height:230px}.aside{position:static;grid-row:1}.facts{gap:0 16px}.facts strong{font-size:11px}}
  `]
})
export class PropertyDetailComponent implements OnInit {
  private readonly api = inject(PropertyApi);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly seo = inject(SiteSeo);
  private readonly enquiryApi = inject(PropertyEnquiryApi);
  readonly contact = SWASTIK_CONTACT;
  readonly enquirySending = signal(false);
  readonly enquirySuccess = signal(false);
  readonly enquiryError = signal('');
  enquiryName = '';
  enquiryEmail = '';
  enquiryPhone = '';
  enquiryMessage = '';
  readonly property = signal<Property | null>(null);
  readonly loading = signal(true);
  readonly galleryImages = computed(() => {
    const property = this.property();
    return property?.images
      ? [...property.images].sort((left, right) =>
          Number(right.is_primary) - Number(left.is_primary) ||
          left.sort_order - right.sort_order
        )
      : [];
  });

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const slug = params.get('slug');
      if (!slug) {this.property.set(null);this.loading.set(false);return;}
      this.loading.set(true);
      this.api.detail(slug).subscribe({
        next: p => {
          this.property.set(p);this.loading.set(false);
          this.seo.set(p.name+' | Swastik Properties',p.description?.trim() || 'View property information, location and brochure for '+p.name+'.');
        },
        error: () => {this.property.set(null);this.loading.set(false);this.seo.set('Property not found | Swastik Properties','This property listing could not be found.');}
      });
    });
  }
  whatsappUrl(p: Property): string {
    const message = `Hello, I am interested in ${p.name} (Reference: ${p.property_reference}). Please share more details.`;
    return 'https://wa.me/' + this.contact.phoneHref.replace(/\\D/g, '') + '?text=' + encodeURIComponent(message);
  }
  emailUrl(p: Property): string {
    const subject = 'Enquiry about ' + p.name + ' (' + p.property_reference + ')';
    const body = 'Hello Swastik Properties,\\n\\nI am interested in ' + p.name + ' (' + p.property_reference + '). Please share more details.\\n\\nThank you.';
    return 'mailto:' + this.contact.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  }
  submitEnquiry(): void {
    const p = this.property();
    if (!p || this.enquirySending()) return;
    this.enquirySending.set(true);
    this.enquirySuccess.set(false);
    this.enquiryError.set('');
    this.enquiryApi.submit({
      property_slug: p.slug,
      name: this.enquiryName.trim(),
      email: this.enquiryEmail.trim(),
      phone: this.enquiryPhone.trim(),
      message: this.enquiryMessage.trim(),
    }).subscribe({
      next: () => {
        this.enquirySending.set(false);
        this.enquirySuccess.set(true);
        this.enquiryName = '';
        this.enquiryEmail = '';
        this.enquiryPhone = '';
        this.enquiryMessage = '';
      },
      error: error => {
        this.enquirySending.set(false);
        this.enquiryError.set(error?.error?.detail || 'We could not send your enquiry. Please try again or contact us directly.');
      }
    });
  }
  location(p: Property): string {return [p.location_name||p.locality_name,p.city_name,p.district_name,p.state_name].filter((v,i,a):v is string=>!!v&&a.indexOf(v)===i).join(', ')||'Maharashtra';}
  price(p: Property): string {if(!p.price||!Number.isFinite(Number(p.price)))return 'Price on request';return new Intl.NumberFormat('en-IN',{style:'currency',currency:p.currency||'INR',maximumFractionDigits:0}).format(Number(p.price));}
  pretty(value: string): string {return (value||'Not specified').replaceAll('_',' ').toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());}
  area(p: Property): string {if(!p.area_value)return 'Not specified';const units:Record<string,string>={SQ_FT:'sq. ft.',SQ_M:'sq. m.',ACRE:'acre',GUNTHA:'guntha'};return p.area_value+' '+(units[p.area_unit]||p.area_unit);}
}