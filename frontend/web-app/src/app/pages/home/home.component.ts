import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Property, PropertyImage } from '../../core/models/property.models';
import { PropertyApi } from '../../core/services/property-api.service';
import { SiteSeo } from '../../core/services/site-seo.service';
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
    <section class="closing" data-reveal="fade-up"><div class="section-wrap"><div class="section-index">05 / TAKE THE NEXT STEP</div><div class="closing-row"><h2>The right place<br>starts with a <em>look.</em></h2><a class="button-light" routerLink="/properties">Browse all properties <span>↗</span></a></div></div></section>
    </div>
  `,
  styles: []
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly api = inject(PropertyApi);
  private readonly router = inject(Router);
  private readonly seo = inject(SiteSeo);
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

    const root = this.host.nativeElement.querySelector('.home-page');
    if (!root) return;

    // Only enable hidden/reveal states after the browser has mounted the page.
    root.classList.add('reveal-ready');
    this.revealObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).classList.add('is-visible');
          this.revealObserver?.unobserve(entry.target);
        }
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });

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
      next: response => {this.featured.set(response.results.slice(0,3));this.loading.set(false);},
      error: () => {this.error.set(true);this.loading.set(false);}
    });
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