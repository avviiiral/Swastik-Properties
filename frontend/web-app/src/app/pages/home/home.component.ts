import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Property, PropertyImage } from '../../core/models/property.models';
import { PropertyApi } from '../../core/services/property-api.service';
import { SiteSeo } from '../../core/services/site-seo.service';
import { PublicPropertyState } from '../../core/services/public-property-state.service';
import { SWASTIK_CONTACT } from '../../core/config/business-contact';
@Component({
  standalone: true,
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="home-page">
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-copy hero-enter">
          <div class="eyebrow"><span></span> SWASTIK PROPERTIES · MAHARASHTRA</div>
          <h1>Find your next<br>place with <em>clarity.</em></h1>
          <p class="hero-description">Explore published residential, commercial and land opportunities. Compare the details, ask informed questions and take the next step with a real conversation.</p>
          <div class="hero-search-wrap">
            <div class="home-mode-switch" role="group" aria-label="I want to">
              <button type="button" [class.active]="mode==='BUY'" [attr.aria-pressed]="mode==='BUY'" (click)="mode='BUY'">Buy</button>
              <button type="button" [class.active]="mode==='RENT'" [attr.aria-pressed]="mode==='RENT'" (click)="mode='RENT'">Rent</button>
              <button type="button" [class.active]="mode==='LEASE'" [attr.aria-pressed]="mode==='LEASE'" (click)="mode='LEASE'">Lease</button>
            </div>
            <div class="hero-search">
            <label><span>PROPERTY TYPE</span><select name="category" [(ngModel)]="category"><option value="">All property types</option><option value="RESIDENTIAL">Residential</option><option value="COMMERCIAL">Commercial</option><option value="LAND">Land &amp; plots</option></select></label>
            <label><span>LOCATION OR KEYWORD</span><input name="search" [(ngModel)]="search" placeholder="City, project or locality"></label>
            <button type="button" (click)="explore()">Explore <b>↗</b></button>
            </div>
          </div>
          <div class="hero-proof"><span>01</span><div><strong>Clarity before commitment</strong><small>Review listing information and ask what matters.</small></div></div>
          <div class="hero-footnote"><span></span> RESIDENTIAL · COMMERCIAL · LAND</div>
        </div>
        <div class="hero-art" aria-label="Architecture and property photography">
          <img class="hero-photo" src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&amp;fit=crop&amp;w=1400&amp;q=85" alt="Contemporary residence framed by mature landscaping" fetchpriority="high">
          <div class="hero-photo-shade"></div>
          <div class="hero-photo-caption"><span>THE SWASTIK APPROACH</span><strong>A clearer way to explore property.</strong></div>
          <div class="hero-photo-index">SWASTIK <span> / </span> PROPERTIES</div>
        </div>
      </div>
      <div class="hero-bottom"><span>ROOTED IN MAHARASHTRA</span><a routerLink="/about">OUR APPROACH ↗</a></div>
    </section>

    <section class="intro section-wrap" data-reveal="fade-up">
      <div class="section-index">01 / A BETTER STARTING POINT</div>
      <div class="intro-grid"><h2>Property choices<br>should feel <em>clear.</em></h2><div><p>Whether you are looking for a home, planning a business or considering land, begin with a clear view of the opportunities in front of you. Every public listing comes from the live property catalogue.</p><a class="underlined" routerLink="/properties">Browse published properties <span>↗</span></a></div></div>
    </section>

    <section class="categories">
      <div class="section-wrap">
        <div class="section-heading" data-reveal="fade-up"><div><div class="section-index">02 / EXPLORE BY CATEGORY</div><h2>Start with what<br>you have in mind.</h2></div><p>Choose a property type<br>to narrow your search.</p></div>
        <div class="category-grid">
          @for (item of categories; track item.key) {
            <a class="category-card" data-reveal="fade-up" [routerLink]="['/properties']" [queryParams]="{category:item.key}">
              <div class="category-top"><span>{{item.number}}</span><span class="symbol">{{item.symbol}}</span></div>
              <div><h3>{{item.title}}</h3><p>{{item.description}}</p><div class="category-bottom">Explore category <b>↗</b></div></div>
            </a>
          }
        </div>
      </div>
    </section>

    <section class="featured section-wrap">
      <div class="section-heading featured-heading" data-reveal="fade-up"><div><div class="section-index">03 / FROM THE LIVE CATALOGUE</div><h2>Explore current opportunities.</h2></div><a class="underlined" routerLink="/properties">View all properties <span>↗</span></a></div>
      @if (loading()) { <div class="loading-box">Finding available properties…</div> }
      @else if (error()) { <div class="loading-box">Property listings could not be loaded at the moment. Please try again shortly.</div> }
      @else if (!featured().length) { <div class="loading-box">New opportunities will appear here as listings are published. <a routerLink="/properties">Browse the catalogue ↗</a></div> }
      @else {
        <div class="featured-grid">
          @for (property of featured(); track property.id; let i = $index) {
            <a class="featured-card" data-reveal="fade-up" [routerLink]="['/properties',property.slug]">
              <div class="property-visual" [class.warm]="i%3===1" [class.sage]="i%3===2">
                @if (primaryImage(property); as photo) {
                  <img class="actual-property-photo" [src]="photo.image_url" [alt]="photo.alt_text || property.name">
                } @else {
                  <span class="visual-cat">{{property.category || 'PROPERTY'}}</span><span class="visual-ref">{{property.property_reference}}</span><div>S<span>.</span></div>
                }
              </div>
              <div class="card-info"><small>{{property.listing_type || 'PROPERTY'}} · {{property.availability_status}}</small><h3>{{property.name}}</h3><p>{{location(property)}}</p><div><strong>{{area(property)}}</strong><span>View details ↗</span></div></div>
            </a>
          }
        </div>
      }
    </section>

    <section class="trust-section">
      <div class="section-wrap">
        <div class="section-index">04 / THE SWASTIK APPROACH</div>
        <div class="trust-heading" data-reveal="fade-up"><h2>Good decisions begin<br>with <em>clear information.</em></h2><p>We want every property conversation to start with the facts available, the questions that matter and a clear understanding of what still needs independent verification.</p></div>
        <div class="trust-grid">
          <article data-reveal="fade-up"><span>01</span><h3>Understand</h3><p>Start with your purpose, preferred location and practical requirements.</p></article>
          <article data-reveal="fade-up"><span>02</span><h3>Explore</h3><p>Review published listing details and compare the available information.</p></article>
          <article data-reveal="fade-up"><span>03</span><h3>Verify</h3><p>Ask questions and independently verify documents, approvals and material claims.</p></article>
        </div>
        <a class="trust-link" routerLink="/about">Read how we work <span>↗</span></a>
      </div>
    </section>

    <section class="area-guides section-wrap" id="area-guides" data-reveal="fade-up"><div class="section-index">05 / EXPLORE BY LOCATION</div><div class="editorial-heading"><h2>Begin with a <em>place.</em></h2><p>Locations and listing counts below are derived from published properties in the live catalogue.</p></div>@if(placesLoading()){<div class="loading-box">Finding places from published listings…</div>}@else if(placesError()){<div class="loading-box">Places could not be loaded right now. Please try again shortly.</div>}@else if(!areaGuides().length){<div class="loading-box">Location guides will appear when properties with published location details are available.</div>}@else{<div class="area-guide-grid">@for(city of areaGuides();track city.name){<article class="area-guide-card">@if(city.imageUrl){<img [src]="city.imageUrl" [alt]="'Published property in '+city.name" loading="lazy">}<div class="area-guide-copy"><span>{{city.region}}</span><strong>{{city.name}}</strong><b>{{city.count}} {{city.count===1?'published listing':'published listings'}}</b><div><a [routerLink]="['/properties']" [queryParams]="{search:city.name}">Explore listings ↗</a><button type="button" (click)="selectedPlace.set(city.name)">View map</button></div></div></article>}</div><div class="maharashtra-map" aria-label="Interactive map of published property locations"><div class="map-intro"><span class="section-index">MAHARASHTRA / LIVE LOCATIONS</span><h3>{{selectedPlace() || 'Choose a published location'}}</h3><p>Select a location to view its map and explore matching published listings.</p><div class="map-place-pills">@for(city of areaGuides();track city.name){<button type="button" [class.active]="selectedPlace()===city.name" (click)="selectedPlace.set(city.name)">{{city.name}} <span>{{city.count}}</span></button>}</div></div>@if(selectedPlace()){<iframe title="Map of selected published property location" [src]="mapEmbedUrl(selectedPlace()!)" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>}@else{<div class="map-placeholder"><span>MAHARASHTRA</span><strong>Explore published destinations</strong><p>Select a location to open its map</p></div>}</div>}</section>

    <section class="buyer-journey">
      <div class="section-wrap">
        <div class="section-index">06 / FROM SEARCH TO SITE VISIT</div>
        <div class="buyer-heading"><h2>A straightforward<br>way to move <em>forward.</em></h2><p>Property decisions take care. This is a practical path for exploring an opportunity and deciding what to do next.</p></div>
        <div class="buyer-steps">
          <article><span>01</span><h3>Share your requirement</h3><p>Tell us the property type, location and details that matter to you.</p></article>
          <article><span>02</span><h3>Review the listing</h3><p>Read the published details and note any questions or missing information.</p></article>
          <article><span>03</span><h3>Talk to the team</h3><p>Use the enquiry form or direct contact details to discuss the property.</p></article>
          <article><span>04</span><h3>Verify and visit</h3><p>Independently verify documents and coordinate a visit before making a decision.</p></article>
        </div>
        <a class="buyer-cta" routerLink="/contact">Tell us what you are looking for <span>↗</span></a>
      </div>
    </section>

    <section class="contact-proof">
      <div class="section-wrap contact-proof-grid">
        <div><div class="section-index">07 / A REAL CONVERSATION</div><h2>Talk to the people<br>behind <em>Swastik.</em></h2><p>Reach our team directly or share your requirement through the enquiry form. We will use the details you provide to understand the conversation you need.</p><a routerLink="/contact" class="proof-button">Contact Swastik Properties <span>↗</span></a></div>
        <div class="proof-details"><span>DIRECTOR</span><strong>{{businessContact.director}}</strong><small>{{businessContact.designation}}</small><a [href]="'tel:'+businessContact.phoneHref">{{businessContact.phone}}</a><a [href]="'mailto:'+businessContact.email">{{businessContact.email}}</a><p>{{businessContact.address}}</p></div>
      </div>
    </section>

    <section class="public-faq section-wrap" data-reveal="fade-up"><div class="section-index">08 / BEFORE YOU PROCEED</div><div class="editorial-heading"><h2>Questions worth <em>asking.</em></h2><p>Some useful points to consider while exploring a property.</p></div><div class="faq-list"><details><summary>How do I enquire about a property?</summary><p>Open a property listing and use its enquiry form, WhatsApp option or callback details. Include the property reference so our team can identify the listing.</p></details><details><summary>Can I arrange a site visit?</summary><p>Use the site-visit request on an individual property page or contact our team. A suitable time needs to be coordinated and confirmed.</p></details><details><summary>Are property prices shown on the website?</summary><p>Public listings do not display prices. Contact our team for information about a specific property.</p></details><details><summary>How can I verify property documents and approvals?</summary><p>Request the relevant documents from the seller or developer and consult an appropriately qualified property or legal professional. Verify title, approvals, encumbrances and applicable registrations independently before committing.</p></details><details><summary>Can I save properties and compare them?</summary><p>Yes. Save listings to your wishlist on this device and compare up to three properties from the property discovery page.</p></details></div></section>
    @if(publicState.recentlyViewed().length){<section class="recently-viewed section-wrap" data-reveal="fade-up"><div class="section-index">09 / PICK UP WHERE YOU LEFT OFF</div><h2>Recently viewed</h2><div class="recent-links">@for(slug of publicState.recentlyViewed();track slug){<a [routerLink]="['/properties',slug]">{{slug.replaceAll('-',' ')}} <span>↗</span></a>}</div></section>}
    <section class="closing" data-reveal="fade-up"><div class="section-wrap"><div class="section-index">10 / TAKE THE NEXT STEP</div><div class="closing-row"><h2>Start with the right<br><em>conversation.</em></h2><a class="button-light" routerLink="/properties">Browse properties <span>↗</span></a></div></div></section>
    </div>
  `,
  styles: []
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly businessContact = SWASTIK_CONTACT;
  private readonly api = inject(PropertyApi);
  private readonly router = inject(Router);
  private readonly seo = inject(SiteSeo);
  readonly publicState = inject(PublicPropertyState);
  readonly areaGuides = signal<Array<{name:string;region:string;count:number;imageUrl:string|null}>>([]);
  readonly selectedPlace = signal<string | null>(null);
  private readonly sanitizer = inject(DomSanitizer);
  readonly placesLoading = signal(true);
  readonly placesError = signal(false);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private revealObserver?: IntersectionObserver;
  private revealMutationObserver?: MutationObserver;
  readonly featured = signal<Property[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  search = '';
  category = '';
  mode: 'BUY' | 'RENT' | 'LEASE' = 'BUY';

  readonly categories = [
    {key:'RESIDENTIAL',number:'01',title:'Residential',description:'Homes, apartments and spaces to settle into.',symbol:'⌂'},
    {key:'COMMERCIAL',number:'02',title:'Commercial',description:'Workspaces and places built for business.',symbol:'▥'},
    {key:'LAND',number:'03',title:'Land & plots',description:'Room to plan, build and grow.',symbol:'⌁'}
  ];

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId) || !('IntersectionObserver' in window)) return;

    const root = this.host.nativeElement.querySelector('.home-page') as HTMLElement | null;
    if (!root) return;

    // Only enable hidden/reveal states after the browser has mounted the page.
    root.classList.add('reveal-ready');
    this.revealObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        // Toggle the reveal state in both directions so the animation replays
        // every time the element re-enters the viewport.
        (entry.target as HTMLElement).classList.toggle('is-visible', entry.isIntersecting);
      }
    }, { threshold: 0.01, rootMargin: '0px 0px -5% 0px' });

    const observeRevealTargets = () => {
      root.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-visible)').forEach((element) => {
        this.revealObserver?.observe(element);
      });
    };

    observeRevealTargets();
    // Featured properties arrive asynchronously; observe their cards when Angular renders them.
    this.revealMutationObserver = new MutationObserver(observeRevealTargets);
    this.revealMutationObserver.observe(root, { childList: true, subtree: true });
  }

  ngOnDestroy(): void {
    this.revealObserver?.disconnect();
    this.revealMutationObserver?.disconnect();
  }

  ngOnInit(): void {
    this.seo.set('Swastik Properties | Find your place in Maharashtra','Explore residential, commercial and land property listings across Maharashtra.');
    this.api.list({page:1}).subscribe({
      next: response => {this.featured.set(response.results.slice(0,3));this.loading.set(false);this.collectPlaces(response.results,response.next,2);},
      error: () => {this.error.set(true);this.loading.set(false);this.placesError.set(true);this.placesLoading.set(false);}
    });
  }

  private collectPlaces(properties: Property[], nextUrl: string | null, page: number): void {
    if (nextUrl) {
      this.api.list({page}).subscribe({
        next: response => this.collectPlaces([...properties,...response.results],response.next,page+1),
        error: () => {this.placesError.set(true);this.placesLoading.set(false);}
      });
      return;
    }
    const places = new Map<string,{name:string;region:string;count:number;imageUrl:string|null}>();
    for (const property of properties) {
      const name = (property.locality_name || property.location_name || property.city_name || property.district_name || '').trim();
      if (!name) continue;
      const key = name.toLocaleLowerCase();
      const region = [property.city_name,property.district_name,property.state_name]
        .filter((value,index,all): value is string => !!value && value.toLocaleLowerCase() !== name.toLocaleLowerCase() && all.indexOf(value)===index)
        .join(' · ') || 'PUBLISHED PROPERTY LOCATION';
      const existing = places.get(key);
      if (existing) { existing.count += 1; if (!existing.imageUrl && property.images?.length) existing.imageUrl = (property.images.find(image => image.is_primary) ?? property.images[0]).image_url; }
      else places.set(key,{name,region,count:1,imageUrl:property.images?.length ? (property.images.find(image => image.is_primary) ?? property.images[0]).image_url : null});
    }
    const sortedPlaces = [...places.values()].sort((a,b)=>b.count-a.count || a.name.localeCompare(b.name));
    this.areaGuides.set(sortedPlaces);
    this.selectedPlace.set(sortedPlaces[0]?.name ?? null);
    this.placesLoading.set(false);
  }

  mapEmbedUrl(place: string): SafeResourceUrl {
    const query = encodeURIComponent(`${place}, Maharashtra, India`);
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.google.com/maps?q=${query}&output=embed`);
  }

  explore(): void {
    this.router.navigate(['/properties'], {queryParams:{search:this.search || null,category:this.category || null,listing_type:this.mode === 'BUY' ? 'SALE' : this.mode}});
  }
  location(p: Property): string {
    return [p.location_name || p.locality_name,p.city_name,p.district_name,p.state_name]
      .filter((v,i,a): v is string => !!v && a.indexOf(v)===i).join(', ') || 'Maharashtra';
  }
  primaryImage(property: Property): PropertyImage | null {
    return property.images?.find((image) => image.is_primary) ?? property.images?.[0] ?? null;
  }

  area(p: Property): string {
    if (!p.area_value) return 'Area on request';
    const units: Record<string,string> = {SQ_FT:'sq. ft.',SQ_M:'sq. m.',ACRE:'acre',GUNTHA:'guntha'};
    return p.area_value + ' ' + (units[p.area_unit] || p.area_unit);
  }
}