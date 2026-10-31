import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
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
        <div><div class="section-index">DISCOVER / ALL PROPERTIES</div><h2>Available properties</h2></div>
        <div class="filters">
          <input aria-label="Search properties" name="search" [(ngModel)]="search" (keyup.enter)="load(1)" placeholder="Search by name or location">
          <select aria-label="Property category" name="category" [(ngModel)]="category" (ngModelChange)="load(1)">
            <option value="">All categories</option><option value="RESIDENTIAL">Residential</option><option value="COMMERCIAL">Commercial</option><option value="LAND">Land &amp; plots</option>
          </select>
          <select aria-label="Listing purpose" name="listingType" [(ngModel)]="listingType" (ngModelChange)="load(1)">
            <option value="">Buy, rent or lease</option><option value="SALE">For sale</option><option value="RENT">For rent</option><option value="LEASE">For lease</option>
          </select>
          <input type="text" inputmode="decimal" aria-label="Minimum price" name="minPrice" [(ngModel)]="minPrice" min="0" placeholder="Min price (₹)">
          <input type="text" inputmode="decimal" aria-label="Maximum price" name="maxPrice" [(ngModel)]="maxPrice" min="0" placeholder="Max price (₹)">
          <select aria-label="Sort properties" name="ordering" [(ngModel)]="ordering" (ngModelChange)="load(1)">
            <option value="-created_at">Newest first</option><option value="price">Price: low to high</option><option value="-price">Price: high to low</option><option value="name">Name: A to Z</option>
          </select>
          <button type="button" class="reset" (click)="reset()">Reset</button>
          <button type="button" class="search-btn" (click)="load(1)">Search</button>
        </div>
      </div>
      @if (loading()) { <div class="state-box">Loading property opportunities…</div> }
      @else if (error()) { <div class="state-box"><strong>We could not load the listings.</strong><p>Check your connection and try again.</p><button class="action" (click)="load()">Try again</button></div> }
      @else if (!items().length) { <div class="state-box"><strong>Nothing in this view just yet.</strong><p>Try a different search or remove one of the filters.</p><button class="action" (click)="reset()">Clear filters</button></div> }
      @else {
        <div class="result-line"><span>Showing <b>{{(page()-1)*pageSize+1}}–{{(page()-1)*pageSize+items().length}}</b> of {{count()}}</span><span>Latest additions</span></div>
        <div class="property-grid">
          @for (p of items();track p.id;let i=$index) {
            <a class="property-card" [routerLink]="['/properties',p.slug]">
              <div class="visual" [class.warm]="i%3===1" [class.sage]="i%3===2">
                @if (primaryImage(p); as photo) {
                  <img class="actual-property-photo" [src]="photo.image_url" [alt]="photo.alt_text || p.name">
                } @else {
                  <span class="visual-cat">{{categoryName(p.category)}}</span><span class="visual-ref">{{p.property_reference}}</span><div>S<span>.</span></div>
                }
                <small [class.unavailable]="p.availability_status!=='AVAILABLE'">{{p.availability_status.replace('_',' ')}}</small>
              </div>
              <div class="card-body"><div class="kind">{{p.listing_type || 'PROPERTY'}} · {{p.subcategory || categoryName(p.category)}}</div><h3>{{p.name}}</h3><p>⌖ &nbsp;{{location(p)}}</p><div class="card-bottom"><strong>{{price(p)}}</strong><span>View details <b>↗</b></span></div></div>
            </a>
          }
        </div>
        <div class="pagination"><button [disabled]="page()<=1" (click)="load(page()-1)">← Previous</button><span>Page <b>{{page()}}</b> of {{totalPages()}}</span><button [disabled]="page()*pageSize>=count()" (click)="load(page()+1)">Next →</button></div>
      }
    </section>
  `,
  styles: [`
    :host{display:block;color:#243d34}.wrap{width:min(1220px,calc(100% - 56px));margin:auto}.list-hero{background:#1b3a33;color:#f5f4ed}.list-hero .wrap{position:relative;padding:29px 0 47px}
    .crumb{display:flex;gap:10px;color:#9eafa5;font-size:10px;margin-bottom:43px}.crumb a{color:#d5dfd7;text-decoration:none}.eyebrow,.section-index{color:#bc9b6a;font-size:9px;font-weight:700;letter-spacing:.18em}.eyebrow{display:flex;gap:10px;align-items:center}.eyebrow span{width:22px;height:1px;background:#c29a63}
    .list-hero h1{margin:19px 0 12px;font:500 clamp(48px,6vw,70px)/1.05 'Manrope',sans-serif;letter-spacing:-.065em}.list-hero h1 em{color:#d3b17d;font-style:normal}.list-hero p{max-width:420px;color:#bbc9c0;font-size:13px;line-height:1.8}
    .count{position:absolute;right:0;bottom:46px;display:flex;flex-direction:column;align-items:flex-end;gap:4px;color:#9faf9f;font-size:10px}.count strong{color:#d5b47f;font:500 33px 'Manrope',sans-serif}
    .list-page{padding:60px 0 8px}.toolbar{display:flex;align-items:end;justify-content:space-between;gap:24px;margin-bottom:30px}.toolbar h2{margin:12px 0 0;color:#203b34;font:600 25px 'Manrope',sans-serif;letter-spacing:-.04em}
    .filters{display:flex;flex-wrap:wrap;gap:8px}.filters input,.filters select{min-height:39px;padding:0 10px;border:1px solid #dfe5de;border-radius:3px;background:#fff;color:#33463c;font-size:11px}.filters input{width:155px}.filters select{min-width:135px}.reset{border:0;background:transparent;color:#758078;text-decoration:underline;font-size:11px}.search-btn,.action{min-height:38px;padding:0 14px;border:0;border-radius:3px;background:#23483c;color:#fff;font-size:11px;font-weight:700}
    .result-line{display:flex;justify-content:space-between;margin:0 0 15px;color:#8a958d;font-size:10px}.result-line b{color:#32483d}.property-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:17px}
    .property-card{border:1px solid #e1e7e0;background:#fff;text-decoration:none;transition:transform .18s ease,box-shadow .18s ease}.property-card:hover{transform:translateY(-4px);box-shadow:0 14px 30px rgba(31,57,47,.09)}
    .visual{height:190px;position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;background:linear-gradient(145deg,#dce1d7,#b9c6b9)}.visual.warm{background:linear-gradient(145deg,#e2d9c8,#b9ae9b)}.visual.sage{background:linear-gradient(145deg,#c9d5cc,#8da395)}
    .visual:before{content:'';position:absolute;inset:0;opacity:.4;background:repeating-linear-gradient(135deg,transparent 0 17px,rgba(255,255,255,.28) 18px 19px)}
    .visual>div{color:rgba(29,61,51,.7);font:500 72px 'Manrope',sans-serif;letter-spacing:-.1em}.visual>div span{color:#a7783e}.visual-cat,.visual-ref{position:absolute;top:15px;color:#33473d;font-size:8px;font-weight:700;letter-spacing:.14em}.visual-cat{left:16px}.visual-ref{right:16px}
    .visual small{position:absolute;left:14px;bottom:12px;padding:5px 8px;background:rgba(247,250,245,.85);color:#315540;font-size:8px;font-weight:700;letter-spacing:.1em}.visual small.unavailable{color:#875a3b}
    .card-body{padding:17px 18px}.kind{color:#a17c50;font-size:9px;font-weight:700;letter-spacing:.13em}.card-body h3{margin:9px 0 5px;color:#263d34;font:700 17px 'Manrope',sans-serif}.card-body p{margin:0;color:#87928a;font-size:10px;line-height:1.6}
    .card-bottom{display:flex;justify-content:space-between;gap:8px;padding-top:13px;margin-top:16px;border-top:1px solid #edf0eb}.card-bottom strong{color:#294b3e;font-size:12px}.card-bottom span{color:#758178;font-size:10px}.card-bottom b{color:#ae8552}
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
  search = '';
  category = '';
  listingType = '';
  minPrice = '';
  maxPrice = '';
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
    this.api.list({search:this.search,category:this.category,listing_type:this.listingType,price_min:this.minPrice,price_max:this.maxPrice,ordering:this.ordering,page:nextPage}).subscribe({
      next: data => {this.items.set(data.results);this.count.set(data.count);this.page.set(nextPage);this.loading.set(false);},
      error: () => {this.error.set(true);this.loading.set(false);}
    });
  }
  reset(): void {this.search='';this.category='';this.listingType='';this.minPrice='';this.maxPrice='';this.ordering='-created_at';this.load(1);}
  totalPages(): number {return Math.max(1,Math.ceil(this.count()/this.pageSize));}
  categoryName(value: string): string {return ({RESIDENTIAL:'Residential',COMMERCIAL:'Commercial',LAND:'Land & plots'} as Record<string,string>)[value] ?? 'Property';}
  primaryImage(property: Property): PropertyImage | null {
    return property.images?.find((image) => image.is_primary) ?? property.images?.[0] ?? null;
  }
  location(p: Property): string {return [p.location_name||p.locality_name,p.city_name,p.district_name,p.state_name].filter((v,i,a):v is string=>!!v&&a.indexOf(v)===i).join(', ')||'Maharashtra';}
  price(p: Property): string {if(!p.price||!Number.isFinite(Number(p.price)))return 'Price on request';return new Intl.NumberFormat('en-IN',{style:'currency',currency:p.currency||'INR',maximumFractionDigits:0}).format(Number(p.price));}
}