import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PublicPropertyState } from '../../core/services/public-property-state.service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Property, PropertyImage } from '../../core/models/property.models';
import { PropertyApi } from '../../core/services/property-api.service';
@Component({
  standalone: true,
  imports: [FormsModule,RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="list-hero"><div class="wrap">
      <div class="crumb"><a routerLink="/">Home</a><span>/</span><span>Properties</span></div>
      <div class="eyebrow"><span></span> THE SWASTIK COLLECTION</div>
      <h1>Find the space<br>that <em>fits.</em></h1>
      <p>Explore considered property opportunities. Narrow your search by category, purpose or place.</p>
      <div class="count"><strong>{{count()}}</strong><span>published opportunities</span></div>
    </div></section>
    <section class="list-page wrap">
      <div class="toolbar">
        <div><div class="section-index">DISCOVER / ALL PROPERTIES</div><h2>Available properties</h2><p class="toolbar-note">Filter the collection, save favourites or compare up to three opportunities.</p></div>
        <div class="filters">
          <input aria-label="Search properties" name="search" [(ngModel)]="search" (keyup.enter)="load(1)" placeholder="Search by name or location">
          <select aria-label="Property category" name="category" [(ngModel)]="category" (ngModelChange)="load(1)">
            <option value="">All categories</option><option value="RESIDENTIAL">Residential</option><option value="COMMERCIAL">Commercial</option><option value="LAND">Land &amp; plots</option>
          </select>
          <select aria-label="Listing purpose" name="listingType" [(ngModel)]="listingType" (ngModelChange)="load(1)">
            <option value="">Buy, rent or lease</option><option value="SALE">For sale</option><option value="RENT">For rent</option><option value="LEASE">For lease</option>
          </select>
          <input type="number" inputmode="decimal" aria-label="Minimum area" name="minArea" [(ngModel)]="minArea" min="0" placeholder="Min area">
          <input type="number" inputmode="decimal" aria-label="Maximum area" name="maxArea" [(ngModel)]="maxArea" min="0" placeholder="Max area">
          <select aria-label="Sort properties" name="ordering" [(ngModel)]="ordering" (ngModelChange)="load(1)">
            <option value="-created_at">Newest first</option><option value="name">Name: A to Z</option><option value="-area_value">Largest area</option><option value="area_value">Smallest area</option>
          </select>
          <button type="button" class="reset" (click)="reset()">Reset</button>
          <button type="button" class="search-btn" (click)="load(1)">Search</button>
        </div>
      </div>
      <section class="discovery-tools" aria-label="Property discovery tools">
        <div class="tool-heading"><div><span class="section-index">A MORE CONSIDERED SEARCH</span><h3>Find a property that fits your brief.</h3></div><div class="tool-actions"><button type="button" (click)="showFavorites.set(!showFavorites())" [class.active]="showFavorites()">Saved properties ({{publicState.favorites().length}})</button><button type="button" (click)="mapMode.set(!mapMode())" [class.active]="mapMode()">{{mapMode() ? 'Hide map' : 'Explore map'}}</button></div></div>
        <div class="advisor"><label for="property-advisor-query">Smart property finder</label><div class="advisor-input"><input id="property-advisor-query" [(ngModel)]="advisorQuery" (keyup.enter)="applyAdvisor()" placeholder="Try: residential in Pune, large commercial space, land..."><button type="button" (click)="applyAdvisor()">Find matches</button></div><small>Matches your request against published property details. No property data is generated.</small></div>
        @if (compareIds().length) {<div class="compare-strip"><span>{{compareIds().length}} of 3 selected for comparison</span><button type="button" (click)="compareOpen.set(!compareOpen())">{{compareOpen() ? 'Hide comparison' : 'Compare now'}}</button><button type="button" class="clear-compare" (click)="compareIds.set([]);compareOpen.set(false)">Clear</button></div>}
        @if (compareOpen()) {<div class="comparison" aria-label="Selected property comparison"><div class="comparison-head"><strong>Property comparison</strong><span>Prices are intentionally not displayed.</span></div><div class="comparison-grid"><div class="comparison-labels"><b>Property</b><b>Location</b><b>Category</b><b>Purpose</b><b>Area</b><b>Availability</b></div>@for (p of comparedProperties(); track p.id) {<div class="comparison-item"><strong>{{p.name}}</strong><span>{{location(p)}}</span><span>{{categoryName(p.category)}}</span><span>{{p.listing_type}}</span><span>{{area(p)}}</span><span>{{p.availability_status}}</span><button type="button" (click)="toggleCompare(p.id)">Remove</button></div>}</div></div>}
        @if (mapMode() && items().length) {<div class="map-panel"><div><span class="section-index">LOCATION VIEW</span><h3>{{mapProperty() ? location(mapProperty()!) : 'Explore properties by location'}}</h3><p>Select a listing to preview its location. Map locations use the address details supplied with each published listing.</p><div class="map-list">@for (p of items(); track p.id) {<button type="button" [class.active]="mapPropertyId()===p.id" (click)="mapPropertyId.set(p.id)">{{p.name}} <span>{{p.city_name || p.locality_name || 'Maharashtra'}}</span></button>}</div></div>@if (mapProperty()) {<iframe title="Selected property map" [src]="mapEmbedUrl(mapProperty()!)" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>}</div>}
      </section>
      @if (loading()) { <div class="state-box">Loading property opportunities…</div> }
      @else if (error()) { <div class="state-box"><strong>We could not load the listings.</strong><p>Check your connection and try again.</p><button class="action" (click)="load()">Try again</button></div> }
      @else if (!items().length) { <div class="state-box"><strong>Nothing in this view just yet.</strong><p>Try a different search or remove one of the filters.</p><button class="action" (click)="reset()">Clear filters</button></div> }
      @else {
        <div class="result-line"><span>Showing <b>{{(page()-1)*pageSize+1}}–{{(page()-1)*pageSize+items().length}}</b> of {{count()}}</span><span>Latest additions</span></div>
        <div class="property-grid">
          @for (p of items();track p.id;let i=$index) {
            <article class="property-card"><a class="property-card-link" [routerLink]="['/properties',p.slug]">
              <div class="visual" [class.warm]="i%3===1" [class.sage]="i%3===2">
                @if (primaryImage(p); as photo) {
                  <img class="actual-property-photo" [src]="photo.image_url" [alt]="photo.alt_text || p.name">
                } @else {
                  <span class="visual-cat">{{categoryName(p.category)}}</span><span class="visual-ref">{{p.property_reference}}</span><div>S<span>.</span></div>
                }
                <small [class.unavailable]="p.availability_status!=='AVAILABLE'">{{p.availability_status.replace('_',' ')}}</small>
              </div>
              <div class="card-body"><div class="kind">{{p.listing_type || 'PROPERTY'}} · {{p.subcategory || categoryName(p.category)}}</div><h3>{{p.name}}</h3><p>{{location(p)}}</p><div class="card-bottom"><strong>{{area(p)}}</strong><span>View details <b>↗</b></span></div></div>
            </a><div class="card-tools"><button type="button" [class.saved]="publicState.isFavorite(p.id)" (click)="toggleFavorite(p.id);$event.stopPropagation()" [attr.aria-label]="publicState.isFavorite(p.id) ? 'Remove from saved properties' : 'Save property'">{{publicState.isFavorite(p.id) ? 'Saved' : 'Save'}}</button><button type="button" [class.selected]="isCompared(p.id)" [disabled]="!isCompared(p.id) && compareIds().length>=3" (click)="toggleCompare(p.id)">{{isCompared(p.id) ? 'Selected' : 'Compare'}}</button><a [href]="mapLink(p)" target="_blank" rel="noopener noreferrer">Map ↗</a></div></article>
          }
        </div>
        <div class="pagination"><button [disabled]="page()<=1" (click)="load(page()-1)">← Previous</button><span>Page <b>{{page()}}</b> of {{totalPages()}}</span><button [disabled]="page()*pageSize>=count()" (click)="load(page()+1)">Next →</button></div>
      }
    </section>
  `,
  styles: [`
    :host{display:block;color:#243d34}.wrap{width:min(1220px,calc(100% - 56px));margin:auto}.list-hero{background:#1b3a33;color:#f5f4ed}.list-hero .wrap{position:relative;padding:29px 0 47px}
    .crumb{display:flex;gap:10px;color:#9eafa5;font-size:10px;margin-bottom:43px}.crumb a{color:#d5dfd7;text-decoration:none}.eyebrow,.section-index{color:#bc9b6a;font-size:9px;font-weight:700;letter-spacing:.18em}.eyebrow{display:flex;gap:10px;align-items:center}.eyebrow span{width:22px;height:1px;background:#c29a63}
    .list-hero h1{margin:19px 0 12px;color:#f5f1e8;font:500 clamp(48px,6vw,70px)/1.05 'Manrope',sans-serif;letter-spacing:-.065em}.list-hero h1 em{color:#d6b477;font-style:normal}.list-hero p{max-width:420px;color:#bbc9c0;font-size:13px;line-height:1.8}
    .count{position:absolute;right:0;bottom:46px;display:flex;flex-direction:column;align-items:flex-end;gap:4px;color:#9faf9f;font-size:10px}.count strong{color:#d5b47f;font:500 33px 'Manrope',sans-serif}
    .list-page{padding:60px 0 8px}.toolbar{display:flex;align-items:end;justify-content:space-between;gap:24px;margin-bottom:30px}.toolbar h2{margin:12px 0 0;color:#203b34;font:600 25px 'Manrope',sans-serif;letter-spacing:-.04em}
    .filters{display:flex;flex-wrap:wrap;gap:8px}.filters input,.filters select{min-height:39px;padding:0 10px;border:1px solid #dfe5de;border-radius:3px;background:#fff;color:#33463c;font-size:11px}.filters input{width:155px}.filters select{min-width:135px}.reset{border:0;background:transparent;color:#758078;text-decoration:underline;font-size:11px}.search-btn,.action{min-height:38px;padding:0 14px;border:0;border-radius:3px;background:#23483c;color:#fff;font-size:11px;font-weight:700}
    .result-line{display:flex;justify-content:space-between;margin:0 0 15px;color:#8a958d;font-size:10px}.result-line b{color:#32483d}.property-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:17px}
    .property-card{min-width:0;border:1px solid #e1e7e0;background:#fff;transition:transform .18s ease,box-shadow .18s ease}.property-card:hover{transform:translateY(-4px);box-shadow:0 14px 30px rgba(31,57,47,.09)}.property-card-link{display:block;color:inherit;text-decoration:none}
    .visual{height:190px;position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;background:linear-gradient(145deg,#dce1d7,#b9c6b9)}.visual.warm{background:linear-gradient(145deg,#e2d9c8,#b9ae9b)}.visual.sage{background:linear-gradient(145deg,#c9d5cc,#8da395)}
    .visual:before{content:'';position:absolute;inset:0;opacity:.4;background:repeating-linear-gradient(135deg,transparent 0 17px,rgba(255,255,255,.28) 18px 19px)}
    .visual>div{color:rgba(29,61,51,.7);font:500 72px 'Manrope',sans-serif;letter-spacing:-.1em}.visual>div span{color:#a7783e}.visual-cat,.visual-ref{position:absolute;top:15px;color:#33473d;font-size:8px;font-weight:700;letter-spacing:.14em}.visual-cat{left:16px}.visual-ref{right:16px}
    .visual small{position:absolute;left:14px;bottom:12px;padding:5px 8px;background:rgba(247,250,245,.85);color:#315540;font-size:8px;font-weight:700;letter-spacing:.1em}.visual small.unavailable{color:#875a3b}
    .card-body{padding:17px 18px}.kind{color:#a17c50;font-size:9px;font-weight:700;letter-spacing:.13em}.card-body h3{margin:9px 0 5px;color:#263d34;font:700 17px 'Manrope',sans-serif}.card-body p{margin:0;color:#87928a;font-size:10px;line-height:1.6}
    .card-bottom{display:flex;justify-content:space-between;gap:8px;padding-top:13px;margin-top:16px;border-top:1px solid #edf0eb}.card-bottom strong{color:#294b3e;font-size:12px}.card-bottom span{color:#758178;font-size:10px}.card-bottom b{color:#ae8552}
    .toolbar-note{margin:8px 0 0;color:#849087;font-size:11px}.discovery-tools{margin:0 0 30px;padding:22px;border:1px solid #e0e6de;background:#f8f8f3}.tool-heading,.tool-actions,.compare-strip,.comparison-head{display:flex;align-items:center;justify-content:space-between;gap:12px}.tool-heading h3,.map-panel h3{margin:7px 0 0;color:#1b3a33;font:600 21px 'Manrope',sans-serif}.tool-actions button,.compare-strip button,.advisor-input button{min-height:37px;padding:0 13px;border:1px solid #d7dfd6;background:#fff;color:#29483c;font-size:10px;font-weight:700}.tool-actions button.active,.compare-strip button,.advisor-input button{border-color:#1b3a33;background:#1b3a33;color:#fff}.advisor{margin-top:20px;padding-top:18px;border-top:1px solid #e2e6df}.advisor label{display:block;margin-bottom:8px;color:#43574b;font-size:11px;font-weight:700}.advisor-input{display:flex;gap:8px}.advisor-input input{flex:1;min-width:0;min-height:42px;padding:0 12px;border:1px solid #dce3da;background:#fff;font-size:12px}.advisor small{display:block;margin-top:7px;color:#849087;font-size:10px}.compare-strip{justify-content:flex-start;margin-top:17px;padding-top:15px;border-top:1px solid #e2e6df;color:#536258;font-size:11px}.compare-strip .clear-compare{border:0;background:transparent;color:#7b877e}.comparison{margin-top:15px;padding:15px;background:#fff;border:1px solid #e2e6df;overflow-x:auto}.comparison-head{margin-bottom:12px;color:#28473b;font-size:12px}.comparison-head span{color:#87928a;font-size:10px}.comparison-grid{display:grid;grid-template-columns:110px repeat(3,minmax(130px,1fr));gap:0;min-width:500px}.comparison-labels,.comparison-item{display:grid;grid-template-rows:repeat(6,minmax(34px,auto));gap:0}.comparison-labels b,.comparison-item>*{padding:9px 7px;border-top:1px solid #edf0eb;color:#58675d;font-size:10px}.comparison-labels b{font-weight:700;color:#314b3e}.comparison-item strong{color:#1b3a33}.comparison-item button{margin:6px 7px;padding:6px;border:1px solid #e1e6df;background:#fff;color:#8a5c48;font-size:10px}.map-panel{display:grid;grid-template-columns:minmax(230px,.8fr) 1.2fr;gap:18px;margin-top:18px;padding:16px;background:#fff;border:1px solid #e0e6de}.map-panel p{color:#78857b;font-size:11px;line-height:1.7}.map-panel iframe{width:100%;min-height:290px;border:0;background:#edf0e9}.map-list{display:grid;gap:5px;max-height:180px;overflow:auto}.map-list button{display:flex;justify-content:space-between;gap:10px;padding:9px;border:1px solid #edf0eb;background:#fafbf8;text-align:left;color:#344b3e;font-size:10px}.map-list button.active{border-color:#c49b62;background:#f7f1e6}.map-list span{color:#87928a}.card-tools{display:flex;gap:7px;padding:0 15px 14px}.card-tools button,.card-tools a{padding:7px 9px;border:1px solid #e0e6de;background:#fafbf8;color:#536258;text-decoration:none;font-size:9px;font-weight:700}.card-tools button.saved,.card-tools button.selected{border-color:#c49b62;background:#f6efe3;color:#765a34}.card-tools a{margin-left:auto}
    .state-box{min-height:190px;padding:32px;border:1px solid #e1e7e0;background:#fafbf8;color:#758178;font-size:13px}.state-box strong{color:#264238;font:600 22px 'Manrope',sans-serif}.state-box p{font-size:12px}.pagination{display:flex;justify-content:center;align-items:center;gap:25px;padding:33px 0 10px;color:#7b877e;font-size:11px}.pagination button{border:0;background:transparent;color:#304e41;font-size:11px;font-weight:600}.pagination button:disabled{color:#b9c0ba;cursor:not-allowed}
    @media(max-width:1050px){.toolbar{align-items:flex-start;flex-direction:column}.filters{width:100%}.filters input{flex:1 1 190px}}
    @media(max-width:740px){.wrap{width:calc(100% - 38px)}.list-hero .wrap{padding:24px 0 38px}.crumb{margin-bottom:34px}.count{position:static;align-items:flex-start;margin-top:22px}.list-page{padding-top:43px}.filters{display:grid;grid-template-columns:1fr 1fr}.filters input{grid-column:1/-1;width:100%}.filters select{width:100%;min-width:0}.search-btn{justify-self:start}.property-grid{grid-template-columns:1fr}.visual{height:185px}.pagination{gap:14px}}
  `]
})
export class PropertyListComponent implements OnInit {
  private readonly api = inject(PropertyApi);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  readonly items = signal<Property[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly count = signal(0);
  readonly page = signal(1);
  readonly pageSize = 20;
  readonly publicState = inject(PublicPropertyState);
  private readonly sanitizer = inject(DomSanitizer);
  readonly compareIds = signal<number[]>([]);
  readonly compareOpen = signal(false);
  readonly mapMode = signal(false);
  readonly mapPropertyId = signal<number | null>(null);
  readonly showFavorites = signal(false);
  advisorQuery = '';
  search = '';
  category = '';
  listingType = '';
  minArea = '';
  maxArea = '';
  ordering = '-created_at';

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.search = params.get('search') ?? '';
      this.category = params.get('category') ?? '';
      this.listingType = params.get('listing_type') ?? '';
      this.load(1);
    });
  }

  load(nextPage = this.page()): void {
    this.loading.set(true);
    this.error.set(false);
    this.api.list({search:this.search,category:this.category,listing_type:this.listingType,area_min:this.minArea,area_max:this.maxArea,ordering:this.ordering,page:nextPage}).subscribe({
      next: data => {this.items.set(this.showFavorites() ? data.results.filter(p => this.publicState.isFavorite(p.id)) : data.results);this.count.set(this.showFavorites() ? this.items().length : data.count);this.page.set(nextPage);if(!this.mapPropertyId() && data.results.length)this.mapPropertyId.set(data.results[0].id);this.loading.set(false);},
      error: () => {this.error.set(true);this.loading.set(false);}
    });
  }
  reset(): void {this.search='';this.category='';this.listingType='';this.minArea='';this.maxArea='';this.ordering='-created_at';this.advisorQuery='';this.showFavorites.set(false);this.load(1);}
  toggleFavorite(id:number):void{this.publicState.toggleFavorite(id);if(this.showFavorites())this.load(1);}
  toggleCompare(id:number):void{const current=this.compareIds();this.compareIds.set(current.includes(id)?current.filter(value=>value!==id):current.length<3?[...current,id]:current);}
  isCompared(id:number):boolean{return this.compareIds().includes(id);}
  comparedProperties():Property[]{return this.items().filter(item=>this.compareIds().includes(item.id));}
  mapProperty():Property|null{return this.items().find(item=>item.id===this.mapPropertyId())??null;}
  mapEmbedUrl(p:Property):SafeResourceUrl{return this.sanitizer.bypassSecurityTrustResourceUrl('https://www.google.com/maps?q='+encodeURIComponent([p.full_address,p.location_name,p.locality_name,p.city_name,p.state_name].filter(Boolean).join(', '))+'&output=embed');}
  mapLink(p:Property):string{return p.location_url || 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent([p.full_address,p.location_name,p.city_name,p.state_name].filter(Boolean).join(', '));}
  applyAdvisor():void{const q=this.advisorQuery.trim();if(!q)return;const lower=q.toLowerCase();if(/residential|apartment|flat|home|house/.test(lower))this.category='RESIDENTIAL';else if(/commercial|office|shop|warehouse/.test(lower))this.category='COMMERCIAL';else if(/land|plot|farm/.test(lower))this.category='LAND';if(/rent|rental|lease/.test(lower))this.listingType=lower.includes('lease')?'LEASE':'RENT';else if(/buy|sale|purchase/.test(lower))this.listingType='SALE';this.search=q.replace(/\b(residential|commercial|land|plot|apartment|flat|home|house|office|shop|warehouse|rent|rental|lease|buy|sale|purchase|in|near|looking for|find me)\b/gi,' ').replace(/\s+/g,' ').trim();this.load(1);}
  totalPages(): number {return Math.max(1,Math.ceil(this.count()/this.pageSize));}
  categoryName(value: string): string {return ({RESIDENTIAL:'Residential',COMMERCIAL:'Commercial',LAND:'Land & plots'} as Record<string,string>)[value] ?? 'Property';}
  primaryImage(property: Property): PropertyImage | null {
    return property.images?.find((image) => image.is_primary) ?? property.images?.[0] ?? null;
  }
  location(p: Property): string {return [p.location_name||p.locality_name,p.city_name,p.district_name,p.state_name].filter((v,i,a):v is string=>!!v&&a.indexOf(v)===i).join(', ')||'Maharashtra';}
  area(p: Property): string {if(!p.area_value)return 'Area on request';const units:Record<string,string>={SQ_FT:'sq. ft.',SQ_M:'sq. m.',ACRE:'acre',GUNTHA:'guntha'};return p.area_value+' '+(units[p.area_unit]||p.area_unit);}
}