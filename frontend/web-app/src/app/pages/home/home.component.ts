import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Property, PropertyImage } from '../../core/models/property.models';
import { PropertyApi } from '../../core/services/property-api.service';
import { SiteSeo } from '../../core/services/site-seo.service';
import { PublicPropertyState } from '../../core/services/public-property-state.service';
@Component({
  standalone: true,
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="home-page">
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-copy hero-enter">
          <div class="eyebrow"><span></span> PROPERTY, WITH PERSPECTIVE</div>
          <h1>Find a place<br>for what comes <em>next.</em></h1>
          <p class="hero-description">A considered collection of residential, commercial and land opportunities across Maharashtra.</p>
          <div class="hero-search">
            <label><span>LOOKING FOR</span><select name="category" [(ngModel)]="category"><option value="">All property types</option><option value="RESIDENTIAL">Residential</option><option value="COMMERCIAL">Commercial</option><option value="LAND">Land &amp; plots</option></select></label>
            <label><span>KEYWORD OR LOCATION</span><input name="search" [(ngModel)]="search" placeholder="City, project or locality"></label>
            <button type="button" (click)="explore()">Search <b>↗</b></button>
          </div>
          <div class="hero-footnote"><span></span> MADE FOR THE WAY YOU WANT TO LIVE</div>
        </div>
        <div class="hero-art" aria-label="Featured architecture and property photography">
          <img class="hero-photo" src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&amp;fit=crop&amp;w=1400&amp;q=85" alt="Contemporary residence framed by mature landscaping" fetchpriority="high">
          <div class="hero-photo-shade"></div>
          <div class="hero-photo-caption"><span>THE SWASTIK COLLECTION</span><strong>Spaces shaped around possibility.</strong></div>
          <div class="hero-photo-index">01 <span> / </span> 03</div>
        </div>
      </div>
      <div class="hero-bottom"><span>SWASTIK PROPERTIES</span><span>01 — DISCOVER</span></div>
    </section>

    <section class="intro section-wrap" data-reveal="fade-up">
      <div class="section-index">01 / A BETTER STARTING POINT</div>
      <div class="intro-grid"><h2>Property choices<br>should feel <em>clear.</em></h2><div><p>Whether you are looking for a home, planning a business or considering land, begin with a clear view of the opportunities in front of you.</p><a class="underlined" routerLink="/properties">Browse the collection <span>↗</span></a></div></div>
    </section>

    <section class="categories">
      <div class="section-wrap">
        <div class="section-heading" data-reveal="fade-up"><div><div class="section-index">02 / EXPLORE BY CATEGORY</div><h2>Start with what<br>you have in mind.</h2></div><p>Three ways to look at property.<br>One place to begin.</p></div>
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
      <div class="section-heading featured-heading" data-reveal="fade-up"><div><div class="section-index">03 / SELECTED OPPORTUNITIES</div><h2>Worth a closer look.</h2></div><a class="underlined" routerLink="/properties">View all properties <span>↗</span></a></div>
      @if (loading()) { <div class="loading-box">Finding available properties…</div> }
      @else if (error()) { <div class="loading-box">Property listings could not be loaded at the moment. Please try again shortly.</div> }
      @else if (!featured().length) { <div class="loading-box">New opportunities are being prepared. Check back soon.</div> }
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
              <div class="card-info"><small>{{property.listing_type || 'PROPERTY'}} · {{property.availability_status}}</small><h3>{{property.name}}</h3><p>{{location(property)}}</p><div><strong>{{area(property)}}</strong><span>Request details ↗</span></div></div>
            </a>
          }
        </div>
      }
    </section>

    <section class="trust-section">
      <div class="section-wrap">
        <div class="section-index">04 / THE SWASTIK APPROACH</div>
        <div class="trust-heading" data-reveal="fade-up"><h2>Good decisions begin<br>with <em>clear information.</em></h2><p>Property decisions deserve time, context and straightforward conversations. We help you explore the available information and take the next step with confidence.</p></div>
        <div class="trust-grid">
          <article data-reveal="fade-up"><span>01</span><h3>Clarity first</h3><p>Understand the available details before moving forward.</p></article>
          <article data-reveal="fade-up"><span>02</span><h3>Local perspective</h3><p>Explore residential, commercial and land opportunities across Maharashtra.</p></article>
          <article data-reveal="fade-up"><span>03</span><h3>Human guidance</h3><p>Speak with our team about a listing or a requirement of your own.</p></article>
        </div>
      </div>
    </section>
    <section class="area-guides section-wrap" id="area-guides" data-reveal="fade-up"><div class="section-index">06 / EXPLORE BY LOCATION</div><div class="editorial-heading"><h2>Start with a <em>place.</em></h2><p>Explore places drawn from our published property listings. Each location is shown only when it exists in the live catalogue.</p></div>@if(placesLoading()){<div class="loading-box">Finding places from published listings…</div>}@else if(placesError()){<div class="loading-box">Places could not be loaded right now. Please try again shortly.</div>}@else if(!areaGuides().length){<div class="loading-box">Places will appear here as properties are published.</div>}@else{<div class="area-guide-grid">@for(city of areaGuides();track city.name){<a [routerLink]="['/properties']" [queryParams]="{search:city.name}"><span>{{city.region}}</span><strong>{{city.name}}</strong><b>{{city.count}} {{city.count===1?'published listing':'published listings'}} · Explore ↗</b></a>}</div>}</section>
    <section class="client-voices" data-reveal="fade-up"><div class="section-wrap"><div class="section-index">07 / CLIENT EXPERIENCES</div><div class="editorial-heading"><h2>Trust is built through <em>experience.</em></h2><p>We publish client feedback only when it is genuine and approved for sharing. We do not use anonymous or invented testimonials.</p></div><div class="voices-empty"><span>SWASTIK PROPERTIES</span><strong>Have you worked with our team?</strong><p>We welcome your feedback and permission to share your experience with future property seekers.</p><a routerLink="/contact">Share your experience ↗</a></div></div></section>
    <section class="public-faq section-wrap" data-reveal="fade-up"><div class="section-index">08 / COMMON QUESTIONS</div><div class="editorial-heading"><h2>A few things worth <em>knowing.</em></h2><p>Clear answers to help you take the next step with confidence.</p></div><div class="faq-list"><details><summary>How do I enquire about a property?</summary><p>Open a property listing and use its enquiry form, WhatsApp option or callback details. Include the property reference so our team can identify the listing.</p></details><details><summary>Can I arrange a site visit?</summary><p>Yes. Use the site-visit request on an individual property page. Our team will contact you to coordinate and confirm a suitable time.</p></details><details><summary>Are property prices shown on the website?</summary><p>No. Public listings do not display prices. Contact our team for information relevant to a specific property.</p></details><details><summary>How can I verify property documents and approvals?</summary><p>Request the relevant documents from the seller or developer and consult an appropriately qualified property or legal professional before making a decision.</p></details><details><summary>Can I save properties and compare them?</summary><p>Yes. Save listings to your wishlist on this device and compare up to three properties from the property discovery page.</p></details></div></section>
    @if(publicState.recentlyViewed().length){<section class="recently-viewed section-wrap" data-reveal="fade-up"><div class="section-index">09 / PICK UP WHERE YOU LEFT OFF</div><h2>Recently viewed</h2><div class="recent-links">@for(slug of publicState.recentlyViewed();track slug){<a [routerLink]="['/properties',slug]">{{slug.replaceAll('-',' ')}} <span>↗</span></a>}</div></section>}
    <section class="closing" data-reveal="fade-up"><div class="section-wrap"><div class="section-index">05 / TAKE THE NEXT STEP</div><div class="closing-row"><h2>The right place<br>starts with a <em>look.</em></h2><a class="button-light" routerLink="/properties">Browse all properties <span>↗</span></a></div></div></section>
    </div>
  `,
  styles: []
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly api = inject(PropertyApi);
  private readonly router = inject(Router);
  private readonly seo = inject(SiteSeo);
  readonly publicState = inject(PublicPropertyState);
  readonly areaGuides = signal<Array<{name:string;region:string;count:number}>>([]);
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
    const places = new Map<string,{name:string;region:string;count:number}>();
    for (const property of properties) {
      const name = (property.locality_name || property.location_name || property.city_name || property.district_name || '').trim();
      if (!name) continue;
      const key = name.toLocaleLowerCase();
      const region = [property.city_name,property.district_name,property.state_name]
        .filter((value,index,all): value is string => !!value && value.toLocaleLowerCase() !== name.toLocaleLowerCase() && all.indexOf(value)===index)
        .join(' · ') || 'PUBLISHED PROPERTY LOCATION';
      const existing = places.get(key);
      if (existing) existing.count += 1;
      else places.set(key,{name,region,count:1});
    }
    this.areaGuides.set([...places.values()].sort((a,b)=>b.count-a.count || a.name.localeCompare(b.name)));
    this.placesLoading.set(false);
  }

  explore(): void {
    this.router.navigate(['/properties'], {queryParams:{search:this.search || null,category:this.category || null}});
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