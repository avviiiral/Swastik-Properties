import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Property, PropertyImage } from '../../core/models/property.models';
import { PropertyApi } from '../../core/services/property-api.service';
import { PublicPropertyState } from '../../core/services/public-property-state.service';

type SearchMode = 'BUY' | 'RENT' | 'LEASE';

@Component({
  standalone: true,
  selector: 'sp-property-marketplace',
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="marketplace">
      <section class="market-hero">
        <div class="market-wrap">
          <div class="eyebrow">SWASTIK PROPERTIES <span></span> PROPERTY MARKETPLACE</div>
          <div class="hero-heading">
            <div><h1>Find a place to <em>move forward.</em></h1><p>Explore published property opportunities across Maharashtra, with clear details and a direct line to our team.</p></div>
            <div class="trust-note"><span class="trust-mark">S.</span><div><strong>Considered property guidance</strong><small>Real listings. Clear information. Human support.</small></div></div>
          </div>
          <section class="search-panel" aria-label="Property search">
            <div class="mode-switch" role="group" aria-label="I want to">
              <button type="button" [class.active]="mode()==='BUY'" [attr.aria-pressed]="mode()==='BUY'" (click)="setMode('BUY')">Buy</button>
              <button type="button" [class.active]="mode()==='RENT'" [attr.aria-pressed]="mode()==='RENT'" (click)="setMode('RENT')">Rent</button>
              <button type="button" [class.active]="mode()==='LEASE'" [attr.aria-pressed]="mode()==='LEASE'" (click)="setMode('LEASE')">Lease</button>
            </div>
            <div class="search-fields">
              <label class="location-field"><span>LOCATION OR KEYWORD</span><input [(ngModel)]="search" (keyup.enter)="applyFilters()" aria-label="Search location or property" placeholder="City, locality or property name"></label>
              <label><span>PROPERTY CATEGORY</span><select [(ngModel)]="category" aria-label="Property category"><option value="">All categories</option><option value="RESIDENTIAL">Residential</option><option value="COMMERCIAL">Commercial / Office</option><option value="LAND">Land &amp; plots</option></select></label>
              <label><span>MINIMUM AREA</span><input type="number" min="0" [(ngModel)]="minArea" aria-label="Minimum area" placeholder="Any"></label>
              <label><span>MAXIMUM AREA</span><input type="number" min="0" [(ngModel)]="maxArea" aria-label="Maximum area" placeholder="Any"></label>
              <button type="button" class="search-submit" (click)="applyFilters()"><span>Search properties</span><b>↗</b></button>
            </div>
            <div class="search-foot"><span>Search by purpose, place and usable area</span><span>Listing-specific pricing and terms are confirmed by our team</span></div>
          </section>
          <div class="hero-meta"><span>BUY / RENT / LEASE</span><span>MAHARASHTRA PROPERTY COLLECTION</span></div>
        </div>
      </section>

      <section class="results-section market-wrap">
        <div class="results-heading">
          <div><div class="section-kicker">DISCOVER YOUR NEXT SPACE</div><h2>{{modeTitle()}} properties</h2><p>Browse current published listings and shortlist the ones worth a closer look.</p></div>
          <div class="results-count"><strong>{{count()}}</strong><span>published listings</span></div>
        </div>

        <div class="filter-toolbar">
          <div class="filter-chips" aria-label="Active filters">
            <span class="filter-chip mode-chip">{{modeLabel()}}</span>
            @if (search.trim()) { <span class="filter-chip">{{search}}</span> }
            @if (category) { <span class="filter-chip">{{categoryLabel()}}</span> }
            @if (minArea || maxArea) { <span class="filter-chip">{{minArea || '0'}}–{{maxArea || 'Any'}} area</span> }
            <button type="button" class="reset-link" (click)="resetFilters()">Reset all</button>
          </div>
          <div class="toolbar-actions">
            <button type="button" [class.active]="savedOnly()" (click)="toggleSaved()">{{savedOnly() ? 'Showing saved' : 'Saved'}} <span>({{publicState.favorites().length}})</span></button>
            <button type="button" [class.active]="mapVisible()" (click)="mapVisible.set(!mapVisible())">{{mapVisible() ? 'Hide map' : 'Show map'}}</button>
            <label class="sort-control"><span>Sort</span><select [(ngModel)]="ordering" (ngModelChange)="applyFilters()" aria-label="Sort listings"><option value="-created_at">Newest</option><option value="name">Name</option><option value="-area_value">Largest area</option><option value="area_value">Smallest area</option></select></label>
          </div>
        </div>

        @if (loading()) {
          <div class="empty-state" role="status">Loading property listings…</div>
        } @else if (error()) {
          <div class="empty-state"><strong>Listings are temporarily unavailable.</strong><p>Please try again in a moment.</p><button type="button" class="solid-button" (click)="load()">Try again</button></div>
        } @else if (!items().length) {
          <div class="empty-state"><strong>No listings match these filters.</strong><p>Try a broader location or reset the filters to see all published opportunities.</p><button type="button" class="solid-button" (click)="resetFilters()">Reset filters</button></div>
        } @else {
          <div class="market-layout" [class.map-hidden]="!mapVisible()">
            @if (mapVisible()) {
              <aside class="map-column" aria-label="Property map">
                <div class="map-sticky">
                  <div class="map-heading"><div><span class="section-kicker">LOCATION EXPLORER</span><h3>{{selectedProperty() ? selectedProperty()!.name : 'Explore the area'}}</h3><p>{{selectedProperty() ? location(selectedProperty()!) : 'Select a listing to preview its mapped location.'}}</p></div><span class="map-pin">⌖</span></div>
                  @if (selectedProperty()) {
                    <iframe title="Map for selected property" [src]="mapUrl(selectedProperty()!)" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                  } @else {
                    <div class="map-placeholder">Map preview will appear when a listing has a location.</div>
                  }
                  <div class="map-list">
                    @for (property of items(); track property.id) {
                      <button type="button" [class.selected]="selectedId()===property.id" (click)="selectedId.set(property.id)">
                        <span class="map-list-name">{{property.name}}</span><span class="map-list-meta">{{property.city_name || property.locality_name || 'Maharashtra'}} · {{area(property)}}</span>
                      </button>
                    }
                  </div>
                  <p class="map-disclaimer">Map position is based on the address supplied with each listing. Confirm exact location with our team.</p>
                </div>
              </aside>
            }
            <div class="feed-column">
              <div class="feed-summary"><span><strong>{{items().length}}</strong> shown on this page · {{count()}} total</span><span>Real published listings</span></div>
              <div class="listing-grid">
                @for (property of items(); track property.id) {
                  <article class="listing-card">
                    <div class="listing-image">
                      <a [routerLink]="['/properties', property.slug]" [attr.aria-label]="'View '+property.name">
                        @if (primaryImage(property); as photo) { <img [src]="photo.image_url" [alt]="photo.alt_text || property.name" loading="lazy"> }
                        @else { <div class="photo-fallback"><span>SWASTIK / PROPERTY</span><b>S.</b></div> }
                      </a>
                      <span class="purpose-tag">{{listingLabel(property.listing_type)}}</span>
                      <button type="button" class="heart-button" [class.saved]="publicState.isFavorite(property.id)" (click)="toggleFavorite(property.id)" [attr.aria-label]="publicState.isFavorite(property.id) ? 'Remove '+property.name+' from saved properties' : 'Save '+property.name" [attr.aria-pressed]="publicState.isFavorite(property.id)"><span aria-hidden="true">{{publicState.isFavorite(property.id) ? '♥' : '♡'}}</span></button>
                    </div>
                    <div class="listing-content">
                      <div class="listing-kicker">{{categoryLabelFor(property.category)}} <span>·</span> {{property.subcategory || 'Property'}}</div>
                      <h3><a [routerLink]="['/properties',property.slug]">{{property.name}}</a></h3>
                      <p class="listing-location"><span aria-hidden="true">⌖</span>{{location(property)}}</p>
                      <div class="listing-specs"><div><span>AREA</span><strong>{{area(property)}}</strong></div><div><span>AVAILABILITY</span><strong>{{availability(property.availability_status)}}</strong></div></div>
                      <div class="price-line"><div><span>{{mode()==='BUY' ? 'PURCHASE PRICE' : mode()==='RENT' ? 'MONTHLY RENT' : 'LEASE RATE'}}</span><strong>Contact for pricing</strong></div><span class="price-note">Terms confirmed directly</span></div>
                      <div class="listing-actions">
                        <label class="compare-control"><input type="checkbox" [checked]="isCompared(property.id)" [disabled]="!isCompared(property.id) && compareIds().length>=3" (change)="toggleCompare(property)"><span>Compare</span></label>
                        <div class="card-ctas"><a class="visit-button" [routerLink]="['/properties',property.slug]" fragment="property-visit-form">Schedule visit <span>↗</span></a><a class="callback-button" [routerLink]="['/properties',property.slug]" fragment="property-enquiry-form">Request callback</a></div>
                      </div>
                    </div>
                  </article>
                }
              </div>
              <div class="pagination"><button type="button" [disabled]="page()<=1" (click)="load(page()-1)">← Previous</button><span>Page <strong>{{page()}}</strong> of {{totalPages()}}</span><button type="button" [disabled]="page()*pageSize>=count()" (click)="load(page()+1)">Next →</button></div>
              @if (compareIds().length) {
                <div class="compare-dock" role="status"><span>{{compareIds().length}} of 3 selected for comparison</span><button type="button" (click)="compareOpen.set(!compareOpen())">{{compareOpen() ? 'Close comparison' : 'Compare selected'}}</button><button type="button" class="clear-compare" (click)="clearComparison()">Clear</button></div>
              }
              @if (compareOpen()) {
                <section class="compare-panel" aria-label="Property comparison"><h3>Compare shortlisted properties</h3><p>Compare the listing details currently supplied by each property record. Pricing and other unprovided terms are not estimated.</p><div class="compare-grid"><div class="compare-labels"><span>Property</span><span>Purpose</span><span>Location</span><span>Category</span><span>Area</span><span>Availability</span></div>@for (property of comparedProperties(); track property.id) {<div class="compare-item"><strong>{{property.name}}</strong><span>{{listingLabel(property.listing_type)}}</span><span>{{location(property)}}</span><span>{{categoryLabelFor(property.category)}}</span><span>{{area(property)}}</span><span>{{availability(property.availability_status)}}</span><button type="button" (click)="toggleCompare(property)">Remove</button></div>}</div></section>
              }
            </div>
          </div>
        }
      </section>
      <div class="mobile-action-bar" aria-label="Listing controls"><button type="button" (click)="filtersExpanded.set(!filtersExpanded())" [attr.aria-expanded]="filtersExpanded()">Filters <span>⌄</span></button><button type="button" (click)="mapVisible.set(!mapVisible())">{{mapVisible() ? 'Hide map' : 'Map view'}} <span>⌖</span></button></div>
      @if (filtersExpanded()) {
        <div class="mobile-filter-sheet" role="dialog" aria-modal="true" aria-label="Property filters">
          <div class="sheet-heading"><strong>Refine your search</strong><button type="button" (click)="filtersExpanded.set(false)" aria-label="Close filters">×</button></div>
          <label>Search location or keyword<input [(ngModel)]="search" placeholder="City, locality or property"></label>
          <label>Property category<select [(ngModel)]="category"><option value="">All categories</option><option value="RESIDENTIAL">Residential</option><option value="COMMERCIAL">Commercial / Office</option><option value="LAND">Land &amp; plots</option></select></label>
          <div class="sheet-range"><label>Minimum area<input type="number" min="0" [(ngModel)]="minArea"></label><label>Maximum area<input type="number" min="0" [(ngModel)]="maxArea"></label></div>
          <button type="button" class="solid-button" (click)="filtersExpanded.set(false);applyFilters()">Apply filters</button>
          <button type="button" class="reset-sheet" (click)="resetFilters();filtersExpanded.set(false)">Reset all</button>
        </div>
      }
    </section>
  `,
})
export class PropertyMarketplaceComponent implements OnInit {
  private readonly api = inject(PropertyApi);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sanitizer = inject(DomSanitizer);
  readonly publicState = inject(PublicPropertyState);
  readonly items = signal<Property[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly count = signal(0);
  readonly page = signal(1);
  readonly pageSize = 20;
  readonly mode = signal<SearchMode>('BUY');
  readonly mapVisible = signal(true);
  readonly selectedId = signal<number | null>(null);
  readonly savedOnly = signal(false);
  readonly filtersExpanded = signal(false);
  readonly compareIds = signal<number[]>([]);
  private readonly compareItems = signal<Property[]>([]);
  readonly compareOpen = signal(false);
  search = '';
  category = '';
  minArea = '';
  maxArea = '';
  ordering = '-created_at';

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.search = params.get('search') ?? '';
      this.category = params.get('category') ?? '';
      const purpose = (params.get('listing_type') ?? 'SALE').toUpperCase();
      this.mode.set(purpose === 'RENT' ? 'RENT' : purpose === 'LEASE' ? 'LEASE' : 'BUY');
      this.load(1);
    });
  }

  setMode(mode: SearchMode): void { this.mode.set(mode); this.load(1); }
  get listingType(): string { return this.mode() === 'BUY' ? 'SALE' : this.mode(); }
  load(nextPage = this.page()): void {
    this.loading.set(true); this.error.set(false);
    this.api.list({search:this.search,category:this.category,listing_type:this.listingType,area_min:this.minArea,area_max:this.maxArea,ordering:this.ordering,page:nextPage}).subscribe({
      next: data => {
        const visible = this.savedOnly() ? data.results.filter(p => this.publicState.isFavorite(p.id)) : data.results;
        this.items.set(visible); this.count.set(this.savedOnly() ? visible.length : data.count); this.page.set(nextPage);
        if (!visible.some(p => p.id === this.selectedId())) this.selectedId.set(visible[0]?.id ?? null);
        this.loading.set(false);
      },
      error: () => { this.error.set(true); this.loading.set(false); }
    });
  }
  applyFilters(): void { this.filtersExpanded.set(false); this.load(1); }
  resetFilters(): void { this.search=''; this.category=''; this.minArea=''; this.maxArea=''; this.ordering='-created_at'; this.savedOnly.set(false); this.applyFilters(); }
  toggleSaved(): void { this.savedOnly.set(!this.savedOnly()); this.load(1); }
  toggleFavorite(id:number): void { this.publicState.toggleFavorite(id); if(this.savedOnly()) this.load(1); }
  selectedProperty(): Property | null { return this.items().find(p => p.id === this.selectedId()) ?? null; }
  mapUrl(p:Property): SafeResourceUrl {
    const query=[p.full_address,p.location_name,p.locality_name,p.city_name,p.state_name].filter(Boolean).join(', ');
    return this.sanitizer.bypassSecurityTrustResourceUrl('https://www.google.com/maps?q='+encodeURIComponent(query)+'&output=embed');
  }
  primaryImage(p:Property): PropertyImage | null { return p.images?.find(i=>i.is_primary) ?? p.images?.[0] ?? null; }
  location(p:Property): string { return [p.location_name||p.locality_name,p.city_name,p.district_name,p.state_name].filter((v,i,a):v is string=>!!v&&a.indexOf(v)===i).join(', ') || 'Maharashtra'; }
  area(p:Property): string {
    if(!p.area_value) return 'Area on request';
    const units:Record<string,string>={SQ_FT:'sq. ft.',SQ_M:'sq. m.',ACRE:'acre',GUNTHA:'guntha'};
    return p.area_value+' '+(units[p.area_unit]||p.area_unit);
  }
  listingLabel(value:string):string { return ({SALE:'FOR SALE',RENT:'FOR RENT',LEASE:'FOR LEASE'} as Record<string,string>)[value] ?? (value||'PROPERTY').replaceAll('_',' '); }
  availability(value:string):string { return (value||'ON REQUEST').replaceAll('_',' ').toLowerCase().replace(/\b\w/g,c=>c.toUpperCase()); }
  categoryLabel():string { return this.categoryLabelFor(this.category); }
  categoryLabelFor(value:string):string { return ({RESIDENTIAL:'RESIDENTIAL',COMMERCIAL:'COMMERCIAL',LAND:'LAND & PLOTS'} as Record<string,string>)[value] ?? 'PROPERTY'; }
  modeTitle():string { return this.mode()==='BUY'?'Buy':this.mode()==='RENT'?'Rent':'Lease'; }
  modeLabel():string { return this.mode()==='BUY'?'For purchase':this.mode()==='RENT'?'For rent':'For lease'; }
  totalPages():number { return Math.max(1,Math.ceil(this.count()/this.pageSize)); }
  isCompared(id:number):boolean { return this.compareIds().includes(id); }
  comparedProperties():Property[] { return this.compareItems(); }
  toggleCompare(p:Property):void {
    const current=this.compareIds();
    if(current.includes(p.id)){this.compareIds.set(current.filter(id=>id!==p.id));this.compareItems.set(this.compareItems().filter(item=>item.id!==p.id));return;}
    if(current.length<3){this.compareIds.set([...current,p.id]);this.compareItems.set([...this.compareItems(),p]);}
  }
  clearComparison():void { this.compareIds.set([]);this.compareItems.set([]);this.compareOpen.set(false); }
}
