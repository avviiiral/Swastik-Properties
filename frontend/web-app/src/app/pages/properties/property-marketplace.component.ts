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
    <main class="marketplace">
      <section class="market-hero">
        <div class="market-wrap">
          <div class="eyebrow">SWASTIK PROPERTIES <span></span> PROPERTY MARKETPLACE</div>
          <div class="hero-heading">
            <div><h1>Find a place to <em>move forward.</em></h1><p>Explore verified property opportunities across Maharashtra, with clear details and a direct line to our team.</p></div>
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
            <button type="button" [class.active]="savedOnly()" (click)="toggleSaved()">{{savedOnly() ? 'Showing saved' : 'Saved'} } <span>({{publicState.favorites().length}})</span></button>
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
                        <a class="visit-button" [routerLink]="['/properties',property.slug]" fragment="property-enquiry-form">Request a visit <span>↗</span></a>
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
    </main>
  `,
  styles: [`
    :host{display:block;color:var(--brand-text);font-family:var(--brand-font-body)}
    .marketplace{--forest:#202d28;--warm:#b59461;--line:#e5e7eb;--muted:#686b66;background:#f9f8f6;min-height:70vh;padding-bottom:72px}
    .market-wrap{width:min(1280px,calc(100% - 56px));margin:0 auto}
    .market-hero{background:#141413;color:#f9f8f6;padding:30px 0 26px}
    .eyebrow,.section-kicker{font-size:9px;font-weight:800;letter-spacing:.17em;color:#c2a16f}.eyebrow{display:flex;align-items:center;gap:12px}.eyebrow span{width:26px;height:1px;background:#b59461}
    .hero-heading{display:flex;align-items:end;justify-content:space-between;gap:30px;padding:35px 0 30px}
    .hero-heading h1{max-width:720px;margin:0;color:#f9f8f6;font:600 clamp(42px,5.5vw,68px)/1.04 var(--brand-font-display);letter-spacing:-.06em}
    .hero-heading h1 em{color:#d8bd91;font-style:normal}.hero-heading p{max-width:550px;margin:16px 0 0;color:#c9c5bd;font-size:13px;line-height:1.8}
    .trust-note{display:flex;align-items:center;gap:12px;min-width:260px;padding:14px 16px;border:1px solid rgba(181,148,97,.28);background:rgba(255,255,255,.035)}
    .trust-mark{display:grid;place-items:center;width:38px;height:38px;border:1px solid #b59461;color:#d8bd91;font:600 17px var(--brand-font-display)}
    .trust-note strong,.trust-note small{display:block}.trust-note strong{color:#f9f8f6;font-size:10px}.trust-note small{margin-top:4px;color:#c9c5bd;font-size:9px}
    .search-panel{padding:18px;background:#fff;color:#141413;box-shadow:0 16px 45px rgba(0,0,0,.14)}
    .mode-switch{display:flex;gap:4px;width:max-content;margin-bottom:16px;padding:4px;background:#f0eee9}
    .mode-switch button{min-width:94px;min-height:35px;border:0;background:transparent;color:#575550;font-size:11px;font-weight:700;cursor:pointer}
    .mode-switch button.active{background:#202d28;color:#fff;box-shadow:0 2px 7px rgba(20,20,19,.14)}
    .search-fields{display:grid;grid-template-columns:2fr 1.2fr .75fr .75fr auto;gap:10px;align-items:end}
    .search-fields label,.mobile-filter-sheet label{display:grid;gap:7px;min-width:0;color:#575550;font-size:9px;font-weight:800;letter-spacing:.08em}
    .search-fields input,.search-fields select,.mobile-filter-sheet input,.mobile-filter-sheet select{width:100%;min-width:0;min-height:43px;padding:0 11px;border:1px solid #e5e7eb;border-radius:2px;background:#fff;color:#141413;font-size:11px;letter-spacing:0}
    .search-submit,.solid-button{min-height:43px;padding:0 16px;display:flex;align-items:center;justify-content:space-between;gap:18px;border:1px solid #202d28;background:#202d28;color:#fff;font-size:10px;font-weight:700;cursor:pointer}
    .search-submit b{color:#d8bd91;font-size:16px}.search-foot{display:flex;justify-content:space-between;gap:15px;margin-top:13px;color:#8b8982;font-size:9px}
    .hero-meta{display:flex;justify-content:space-between;padding-top:24px;color:#a6a198;font-size:8px;font-weight:700;letter-spacing:.15em}
    .results-section{padding-top:55px}.results-heading{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:25px}
    .results-heading h2{margin:9px 0 7px;color:#141413;font:600 clamp(27px,3vw,36px)/1.15 var(--brand-font-display);letter-spacing:-.045em}
    .results-heading p{margin:0;color:#686b66;font-size:12px;line-height:1.7}.results-count{display:flex;flex-direction:column;align-items:flex-end;gap:2px}.results-count strong{font:600 27px var(--brand-font-display);font-variant-numeric:tabular-nums;color:#967746}.results-count span{font-size:9px;color:#77766f}
    .filter-toolbar{display:flex;justify-content:space-between;align-items:center;gap:18px;padding:13px 0;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;margin-bottom:20px}
    .filter-chips,.toolbar-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.filter-chip{padding:7px 9px;border:1px solid #e5e7eb;background:#fff;color:#575550;font-size:9px}.mode-chip{border-color:#d8c7aa;background:#f6f0e6;color:#765d37;font-weight:700}
    .reset-link{padding:6px;border:0;background:transparent;color:#80653d;text-decoration:underline;font-size:9px;font-weight:700;cursor:pointer}
    .toolbar-actions>button{min-height:33px;padding:0 10px;border:1px solid #e5e7eb;background:#fff;color:#575550;font-size:9px;cursor:pointer}.toolbar-actions>button.active{border-color:#b59461;background:#f6f0e6;color:#765d37}
    .sort-control{display:flex;align-items:center;gap:6px;color:#77766f;font-size:9px}.sort-control select{min-height:33px;border:1px solid #e5e7eb;background:#fff;color:#575550;font-size:9px}
    .market-layout{display:grid;grid-template-columns:minmax(260px,.82fr) minmax(0,1.5fr);align-items:start;gap:22px}.market-layout.map-hidden{grid-template-columns:1fr}
    .map-sticky{position:sticky;top:95px;padding:15px;border:1px solid #e5e7eb;background:#fff;box-shadow:0 5px 22px rgba(20,20,19,.04)}
    .map-heading{display:flex;justify-content:space-between;gap:10px;align-items:start}.map-heading h3{margin:7px 0 4px;color:#202d28;font:600 17px var(--brand-font-display)}.map-heading p{margin:0;color:#77766f;font-size:10px;line-height:1.6}.map-pin{color:#b59461;font-size:23px}
    .map-sticky iframe{display:block;width:100%;height:260px;margin-top:13px;border:0;background:#efeee9}.map-placeholder{display:grid;place-items:center;height:220px;margin-top:13px;background:#efeee9;color:#77766f;font-size:10px;text-align:center}
    .map-list{display:grid;gap:5px;max-height:190px;overflow:auto;margin-top:12px}.map-list button{display:grid;gap:3px;padding:9px 10px;border:1px solid #ecebe6;background:#faf9f6;text-align:left;cursor:pointer}.map-list button.selected{border-color:#b59461;background:#f7f1e7}.map-list-name{color:#292a26;font-size:10px;font-weight:700}.map-list-meta{color:#77766f;font-size:9px}.map-disclaimer{margin:10px 0 0;color:#96928a;font-size:8px;line-height:1.6}
    .feed-summary{display:flex;justify-content:space-between;gap:12px;margin:0 0 12px;color:#85847d;font-size:9px}.feed-summary strong{color:#292a26;font-variant-numeric:tabular-nums}
    .listing-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.listing-card{min-width:0;border:1px solid #e5e7eb;background:#fff;transition:transform .18s,box-shadow .18s}.listing-card:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(20,20,19,.08)}
    .listing-image{position:relative;height:178px;background:#e9e7df;overflow:hidden}.listing-image>a,.listing-image img{display:block;width:100%;height:100%}.listing-image img{object-fit:cover;transition:transform .35s}.listing-card:hover .listing-image img{transform:scale(1.025)}
    .photo-fallback{display:flex;align-items:center;justify-content:space-between;height:100%;padding:20px;background:linear-gradient(140deg,#e7e4da,#b9c0b3);color:#596359}.photo-fallback span{font-size:8px;font-weight:800;letter-spacing:.15em}.photo-fallback b{font:600 62px var(--brand-font-display);color:#8d7b5c}
    .purpose-tag{position:absolute;left:12px;top:12px;padding:6px 8px;background:rgba(249,248,246,.94);color:#4d5c51;font-size:8px;font-weight:800;letter-spacing:.1em}
    .heart-button{position:absolute;top:10px;right:10px;display:grid;place-items:center;width:35px;height:35px;border:1px solid rgba(255,255,255,.8);border-radius:50%;background:rgba(255,255,255,.94);color:#343a34;font-size:19px;cursor:pointer}.heart-button.saved{color:#9d5148}
    .listing-content{padding:15px}.listing-kicker{color:#967746;font-size:8px;font-weight:800;letter-spacing:.12em}.listing-kicker span{padding:0 3px;color:#b8b4ab}
    .listing-content h3{margin:8px 0 5px;font:600 16px/1.25 var(--brand-font-display);letter-spacing:-.02em}.listing-content h3 a{color:#20231f;text-decoration:none}.listing-content h3 a:hover{text-decoration:underline;text-decoration-color:#b59461;text-underline-offset:4px}
    .listing-location{display:flex;gap:6px;align-items:center;min-height:30px;margin:0;color:#77766f;font-size:9px;line-height:1.5}.listing-location span{color:#b59461;font-size:14px}
    .listing-specs{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px;padding:11px 0;border-top:1px solid #efeee9;border-bottom:1px solid #efeee9}.listing-specs>div{display:grid;gap:4px}.listing-specs span,.price-line>div>span{color:#99958c;font-size:7px;font-weight:800;letter-spacing:.12em}.listing-specs strong{color:#383a34;font-size:10px;font-variant-numeric:tabular-nums}
    .price-line{display:flex;justify-content:space-between;align-items:end;gap:8px;padding:12px 0 10px}.price-line>div{display:grid;gap:4px}.price-line strong{color:#202d28;font-size:12px}.price-note{max-width:105px;color:#8d8980;font-size:8px;line-height:1.4;text-align:right}
    .listing-actions{display:flex;align-items:center;justify-content:space-between;gap:8px;padding-top:10px;border-top:1px solid #efeee9}.compare-control{display:flex;align-items:center;gap:6px;color:#686b66;font-size:9px;cursor:pointer}.compare-control input{width:14px;height:14px;accent-color:#202d28}
    .visit-button{min-height:34px;padding:0 11px;display:inline-flex;align-items:center;gap:12px;background:#202d28;color:#fff;text-decoration:none;font-size:9px;font-weight:700}.visit-button span{color:#d8bd91;font-size:13px}
    .pagination{display:flex;justify-content:center;align-items:center;gap:22px;padding:25px 0;color:#77766f;font-size:10px}.pagination button{min-height:34px;padding:0 10px;border:1px solid #e5e7eb;background:#fff;color:#343a34;font-size:9px}.pagination button:disabled{opacity:.4;cursor:not-allowed}
    .compare-dock{position:sticky;bottom:12px;z-index:5;display:flex;align-items:center;gap:12px;margin-top:8px;padding:12px 14px;border:1px solid #d9d1c3;background:#fff;box-shadow:0 8px 28px rgba(20,20,19,.12);font-size:10px}.compare-dock span{margin-right:auto;color:#575550}.compare-dock button{min-height:32px;padding:0 10px;border:1px solid #202d28;background:#202d28;color:#fff;font-size:9px}.compare-dock .clear-compare{border-color:#e5e7eb;background:#fff;color:#575550}
    .compare-panel{margin:10px 0 20px;padding:17px;border:1px solid #e5e7eb;background:#fff;overflow:auto}.compare-panel h3{margin:0;color:#202d28;font:600 18px var(--brand-font-display)}.compare-panel>p{color:#77766f;font-size:10px;line-height:1.6}.compare-grid{display:grid;grid-template-columns:100px repeat(3,minmax(130px,1fr));min-width:500px}.compare-labels,.compare-item{display:grid;grid-template-rows:repeat(6,minmax(34px,auto))}.compare-labels span,.compare-item>*{padding:8px;border-top:1px solid #efeee9;color:#575550;font-size:9px}.compare-labels span{font-weight:700}.compare-item strong{color:#202d28}.compare-item button{margin:5px;padding:5px;border:1px solid #e5e7eb;background:#fff;color:#765d37;font-size:9px}
    .empty-state{display:grid;justify-items:start;align-content:center;min-height:230px;padding:28px;border:1px solid #e5e7eb;background:#fff;color:#686b66;font-size:12px}.empty-state strong{color:#202d28;font:600 21px var(--brand-font-display)}.empty-state p{max-width:450px;line-height:1.7}.empty-state .solid-button{display:inline-flex}
    .mobile-action-bar,.mobile-filter-sheet{display:none}
    @media(max-width:1050px){.search-fields{grid-template-columns:1.5fr 1fr 1fr 1fr}.search-submit{grid-column:1/-1;justify-content:center}.market-layout{grid-template-columns:minmax(220px,.75fr) minmax(0,1.35fr)}.listing-grid{grid-template-columns:1fr}}
    @media(max-width:760px){.market-wrap{width:calc(100% - 36px)}.market-hero{padding-top:23px}.hero-heading{display:block;padding:28px 0 22px}.trust-note{margin-top:20px;min-width:0}.hero-heading h1{font-size:clamp(39px,11vw,56px)}.search-panel{padding:13px}.mode-switch{width:100%}.mode-switch button{flex:1;min-width:0}.search-fields{grid-template-columns:1fr 1fr}.search-fields .location-field{grid-column:1/-1}.search-submit{grid-column:1/-1}.search-foot{display:grid;gap:5px}.hero-meta{font-size:7px}.results-section{padding-top:38px}.results-heading{align-items:start}.results-heading p{max-width:300px}.filter-toolbar{align-items:start;flex-direction:column}.toolbar-actions{width:100%}.market-layout,.market-layout.map-hidden{grid-template-columns:1fr}.map-column{order:0}.map-sticky{position:static}.map-sticky iframe{height:210px}.map-list{display:none}.feed-column{order:1}.listing-grid{grid-template-columns:1fr 1fr}.listing-image{height:145px}.listing-content{padding:12px}.listing-content h3{font-size:14px}.price-line{align-items:start;flex-direction:column}.price-note{text-align:left}.mobile-action-bar{position:fixed;z-index:20;right:0;bottom:0;left:0;display:grid;grid-template-columns:1fr 1fr;gap:1px;padding:8px 12px calc(8px + env(safe-area-inset-bottom));border-top:1px solid #e5e7eb;background:rgba(249,248,246,.97);backdrop-filter:blur(12px)}.mobile-action-bar button{min-height:42px;border:1px solid #d8d6cf;background:#fff;color:#202d28;font-size:11px;font-weight:700}.mobile-action-bar button span{margin-left:8px;color:#967746}.mobile-filter-sheet{position:fixed;z-index:30;right:0;bottom:0;left:0;display:grid;gap:15px;padding:20px 19px calc(22px + env(safe-area-inset-bottom));border:1px solid #e5e7eb;background:#fff;box-shadow:0 -12px 40px rgba(20,20,19,.18)}.sheet-heading{display:flex;justify-content:space-between;align-items:center;color:#202d28}.sheet-heading button{width:32px;height:32px;border:1px solid #e5e7eb;background:#fff;font-size:20px}.mobile-filter-sheet label{font-size:9px}.sheet-range{display:grid;grid-template-columns:1fr 1fr;gap:10px}.mobile-filter-sheet .solid-button{justify-content:center}.reset-sheet{border:0;background:transparent;color:#765d37;text-decoration:underline;font-size:10px}.compare-dock{bottom:70px}.compare-dock span{font-size:9px}}
    @media(max-width:420px){.listing-grid{grid-template-columns:1fr}.listing-image{height:185px}.results-count strong{font-size:23px}.hero-meta{letter-spacing:.08em}}
    @media(prefers-reduced-motion:reduce){.listing-card,.listing-image img{transition:none}}
  `]
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
