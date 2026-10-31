import { HttpClient, HttpContext, HttpParams, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injectable,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Meta, Title, provideClientHydration, withHttpTransferCacheOptions } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet, Routes, provideRouter, withInMemoryScrolling } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { API_BASE_URL } from './core/api-base-url.token';
import { SKIP_ADMIN_AUTH } from './core/auth-context';
import { adminGuard } from './admin/core/admin.guard';
import { authInterceptor } from './admin/core/auth.interceptor';
import { LoginComponent } from './admin/features/auth/login.component';
import { PropertiesComponent as AdminPropertiesComponent } from './admin/features/properties/properties.component';
import { AdminLayoutComponent } from './admin/layout/admin-layout.component';

export interface Property {
  id: number;
  property_reference: string;
  name: string;
  slug: string;
  description: string;
  developer_name: string;
  category: string;
  subcategory: string;
  listing_type: string;
  price: string | null;
  currency: string;
  area_value: string | null;
  area_unit: string;
  location_name: string;
  full_address: string;
  locality_name: string | null;
  city_name: string | null;
  district_name: string | null;
  state_name: string | null;
  location_url: string;
  brochure_url: string | null;
  publication_status: string;
  availability_status: string;
}

export interface PropertyPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: Property[];
}

@Injectable({ providedIn: 'root' })
export class PropertyApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);

  list(filters: { search?: string; category?: string; listing_type?: string; page?: number } = {}) {
    let params = new HttpParams();
    if (filters.search?.trim()) params = params.set('search', filters.search.trim());
    if (filters.category) params = params.set('category', filters.category);
    if (filters.listing_type) params = params.set('listing_type', filters.listing_type);
    if (filters.page) params = params.set('page', filters.page);
    return this.http.get<PropertyPage>(this.base + '/properties/', { params, context: new HttpContext().set(SKIP_ADMIN_AUTH, true) });
  }

  detail(slug: string) {
    return this.http.get<Property>(this.base + '/properties/' + encodeURIComponent(slug) + '/', { context: new HttpContext().set(SKIP_ADMIN_AUTH, true) });
  }
}

@Injectable({ providedIn: 'root' })
export class SiteSeo {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  set(title: string, description: string): void {
    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
  }
}

@Component({
  selector: 'sp-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {}

@Component({
  selector: 'sp-public-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="site-shell">
      <header class="site-header">
        <div class="header-inner">
          <a class="brand" routerLink="/" aria-label="Swastik Properties home">
            <span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i></span>
            <span class="brand-copy"><strong>SWASTIK</strong><small>PROPERTIES</small></span>
          </a>
          <nav class="desktop-nav" aria-label="Main navigation">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a>
            <a routerLink="/properties" routerLinkActive="active">Properties</a>
            <a href="#about">About</a>
            <a routerLink="/admin/login">Admin</a>
          </nav>
          <a class="header-cta" routerLink="/properties">Explore properties <span>↗</span></a>
        </div>
      </header>
      <main><router-outlet /></main>
      <footer class="site-footer" id="about">
        <div class="footer-main">
          <div class="footer-brand">
            <a class="brand brand-light" routerLink="/">
              <span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i></span>
              <span class="brand-copy"><strong>SWASTIK</strong><small>PROPERTIES</small></span>
            </a>
            <p>A considered way to explore property opportunities across Maharashtra.</p>
          </div>
          <div class="footer-links">
            <span class="footer-label">Explore</span>
            <a routerLink="/properties">All properties</a>
            <a routerLink="/properties" [queryParams]="{category:'RESIDENTIAL'}">Residential</a>
            <a routerLink="/properties" [queryParams]="{category:'COMMERCIAL'}">Commercial</a>
            <a routerLink="/properties" [queryParams]="{category:'LAND'}">Land &amp; plots</a>
            <a routerLink="/admin/login">Admin sign-in</a>
          </div>
          <div class="footer-note">
            <span class="footer-label">A note from Swastik</span>
            <p>Property information is provided for discovery. Review the project brochure and verify details with the relevant seller or developer before making a decision.</p>
          </div>
        </div>
        <div class="footer-bottom"><span>© {{ year }} Swastik Properties</span><span>Made for better property decisions.</span></div>
      </footer>
    </div>
  `,
  styles: [`
    :host{display:block}.site-shell{min-height:100vh;display:flex;flex-direction:column}main{flex:1}
    .site-header{position:sticky;top:0;z-index:20;background:rgba(250,250,247,.95);border-bottom:1px solid rgba(30,59,51,.08);backdrop-filter:blur(16px)}
    .header-inner{width:min(1220px,calc(100% - 56px));height:78px;margin:auto;display:flex;align-items:center;gap:28px}
    .brand{display:inline-flex;align-items:center;gap:11px;text-decoration:none;color:#1b3932}.brand-mark{width:34px;height:34px;border:1px solid #c18b48;border-radius:50%;display:flex;align-items:flex-end;justify-content:center;gap:3px;padding:8px 7px}
    .brand-mark i{display:block;width:4px;border-radius:4px 4px 1px 1px;background:#c18b48}.brand-mark i:nth-child(1){height:9px}.brand-mark i:nth-child(2){height:16px}.brand-mark i:nth-child(3){height:12px}
    .brand-copy{display:grid;gap:1px;line-height:1}.brand-copy strong{font:800 15px/1 'Manrope',sans-serif;letter-spacing:.17em}.brand-copy small{font:600 8px/1.5 'DM Sans',sans-serif;letter-spacing:.32em;color:#8a928b}
    .desktop-nav{display:flex;align-items:center;gap:34px;margin-left:auto}.desktop-nav a{color:#64716b;text-decoration:none;font-size:13px;font-weight:600}.desktop-nav a:hover,.desktop-nav a.active{color:#193c34}
    .header-cta{min-height:42px;padding:0 16px;display:inline-flex;align-items:center;gap:13px;border-radius:4px;background:#1d4037;color:#fff;text-decoration:none;font-size:12px;font-weight:700}.header-cta:hover{background:#2e594d}.header-cta span{font-size:15px}
    .site-footer{margin-top:80px;background:#18362f;color:#e6ece7}.footer-main{width:min(1220px,calc(100% - 56px));margin:auto;padding:58px 0 48px;display:grid;grid-template-columns:1.15fr .7fr 1fr;gap:70px}
    .brand-light{color:#fff}.brand-light .brand-copy small{color:#a6b5ad}.footer-brand p,.footer-note p{max-width:310px;color:#aebdb4;font-size:13px;line-height:1.8}
    .footer-links{display:flex;flex-direction:column;align-items:flex-start;gap:13px}.footer-label{display:block;margin-bottom:5px;color:#c59a61;font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase}
    .footer-links a{color:#dce5de;text-decoration:none;font-size:13px}.footer-links a:hover{color:#fff}.footer-note p{margin-top:5px}
    .footer-bottom{width:min(1220px,calc(100% - 56px));min-height:54px;margin:auto;border-top:1px solid rgba(230,236,231,.13);display:flex;justify-content:space-between;align-items:center;color:#9baca3;font-size:11px}
    @media(max-width:720px){.header-inner{width:calc(100% - 34px);height:68px;gap:12px}.desktop-nav{display:none}.header-cta{margin-left:auto;min-height:39px;padding:0 11px;font-size:11px}.footer-main{width:calc(100% - 38px);padding:42px 0 34px;grid-template-columns:1fr 1fr;gap:32px 24px}.footer-brand,.footer-note{grid-column:1/-1}.footer-bottom{width:calc(100% - 38px);gap:10px;flex-wrap:wrap;padding:15px 0}}
  `]
})
export class PublicLayoutComponent {
  readonly year = new Date().getFullYear();
}

@Component({
  standalone: true,
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-copy">
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
        <div class="hero-art" aria-hidden="true">
          <div class="art-grid"></div><div class="circle circle-one"></div><div class="circle circle-two"></div>
          <div class="art-label top-label">A PLACE TO BEGIN</div>
          <svg viewBox="0 0 500 490" fill="none">
            <path d="M70 360L250 215L430 360V455H70V360Z" stroke="#D7B47D" stroke-width="2"/>
            <path d="M112 360L250 250L388 360M175 455V352H325V455M217 455V377H283V455" stroke="#D7B47D" stroke-width="1.5"/>
            <path d="M85 360H415M250 215V135" stroke="#D7B47D" stroke-width="1.2" stroke-dasharray="4 7"/>
            <path d="M50 455H450M100 310L250 190L400 310" stroke="#D7B47D" stroke-width="1"/>
            <circle cx="250" cy="215" r="5" fill="#D7B47D"/>
          </svg>
          <div class="coordinate">19° 04' N&nbsp;&nbsp; 72° 52' E</div><div class="art-label bottom-label">SPACE TO MAKE YOURS</div>
        </div>
      </div>
      <div class="hero-bottom"><span>SWASTIK PROPERTIES</span><span>01 — DISCOVER</span></div>
    </section>

    <section class="intro section-wrap">
      <div class="section-index">01 / A BETTER STARTING POINT</div>
      <div class="intro-grid"><h2>Property choices<br>should feel <em>clear.</em></h2><div><p>Whether you are looking for a home, planning a business or considering land, begin with a clear view of the opportunities in front of you.</p><a class="underlined" routerLink="/properties">Browse the collection <span>↗</span></a></div></div>
    </section>

    <section class="categories">
      <div class="section-wrap">
        <div class="section-heading"><div><div class="section-index">02 / EXPLORE BY CATEGORY</div><h2>Start with what<br>you have in mind.</h2></div><p>Three ways to look at property.<br>One place to begin.</p></div>
        <div class="category-grid">
          @for (item of categories; track item.key) {
            <a class="category-card" [routerLink]="['/properties']" [queryParams]="{category:item.key}">
              <div class="category-top"><span>{{item.number}}</span><span class="symbol">{{item.symbol}}</span></div>
              <div><h3>{{item.title}}</h3><p>{{item.description}}</p><div class="category-bottom">Explore category <b>↗</b></div></div>
            </a>
          }
        </div>
      </div>
    </section>

    <section class="featured section-wrap">
      <div class="section-heading featured-heading"><div><div class="section-index">03 / SELECTED OPPORTUNITIES</div><h2>Worth a closer look.</h2></div><a class="underlined" routerLink="/properties">View all properties <span>↗</span></a></div>
      @if (loading()) { <div class="loading-box">Finding available properties…</div> }
      @else if (error()) { <div class="loading-box">Property listings could not be loaded at the moment. Please try again shortly.</div> }
      @else if (!featured().length) { <div class="loading-box">New opportunities are being prepared. Check back soon.</div> }
      @else {
        <div class="featured-grid">
          @for (property of featured(); track property.id; let i = $index) {
            <a class="featured-card" [routerLink]="['/properties',property.slug]">
              <div class="property-visual" [class.warm]="i%3===1" [class.sage]="i%3===2"><span class="visual-cat">{{property.category || 'PROPERTY'}}</span><span class="visual-ref">{{property.property_reference}}</span><div>S<span>.</span></div></div>
              <div class="card-info"><small>{{property.listing_type || 'PROPERTY'}} · {{property.availability_status}}</small><h3>{{property.name}}</h3><p>{{location(property)}}</p><div><strong>{{price(property)}}</strong><span>View details ↗</span></div></div>
            </a>
          }
        </div>
      }
    </section>

    <section class="closing"><div class="section-wrap"><div class="section-index">04 / TAKE THE NEXT STEP</div><div class="closing-row"><h2>The right place<br>starts with a <em>look.</em></h2><a class="button-light" routerLink="/properties">Browse all properties <span>↗</span></a></div></div></section>
  `,
  styles: [`
    :host{display:block;color:#243d34}.hero{background:#193a33;color:#f8f7f1;overflow:hidden}.hero-inner{width:min(1220px,calc(100% - 56px));min-height:570px;margin:auto;display:grid;grid-template-columns:1.05fr .95fr;align-items:center;gap:34px;padding:45px 0}
    .eyebrow,.section-index{color:#bc9b6a;font-size:10px;line-height:1.5;font-weight:700;letter-spacing:.19em}.eyebrow{display:flex;align-items:center;gap:10px}.eyebrow span{width:24px;height:1px;background:#c59e66}
    h1{max-width:650px;margin:25px 0 18px;font:500 clamp(48px,6.4vw,80px)/1.08 'Manrope',sans-serif;letter-spacing:-.065em}h1 em,h2 em{color:#d4b17b;font-style:normal}
    .hero-description{max-width:420px;color:#c0cec6;font-size:14px;line-height:1.85}.hero-search{max-width:610px;margin-top:30px;padding:9px;background:#f8f7f0;display:grid;grid-template-columns:1fr 1.15fr auto;gap:8px;color:#243d34}
    .hero-search label{min-width:0;display:flex;flex-direction:column;justify-content:center;gap:5px;padding:4px 11px;border-right:1px solid #e3e5dc}.hero-search label span{color:#9a8a6e;font-size:8px;font-weight:700;letter-spacing:.13em}.hero-search input,.hero-search select{width:100%;min-width:0;border:0;outline:0;background:transparent;color:#294237;font-size:11px}.hero-search button{min-width:86px;padding:0 12px;border:0;background:#1e4137;color:#fff;font-size:11px;font-weight:700}.hero-search button b{padding-left:10px;color:#d4b17b}
    .hero-footnote{display:flex;align-items:center;gap:12px;margin-top:42px;color:#8fa69a;font-size:9px;letter-spacing:.18em}.hero-footnote span{width:36px;height:1px;background:#8fa69a}
    .hero-art{min-height:450px;position:relative;overflow:hidden;border:1px solid rgba(211,181,132,.22);background:radial-gradient(ellipse at 52% 46%,rgba(210,179,129,.14),transparent 48%),linear-gradient(135deg,rgba(255,255,255,.025),transparent 60%)}
    .art-grid{position:absolute;inset:0;opacity:.12;background-image:linear-gradient(rgba(214,183,137,.25) 1px,transparent 1px),linear-gradient(90deg,rgba(214,183,137,.25) 1px,transparent 1px);background-size:46px 46px}
    .circle{position:absolute;width:350px;height:350px;border:1px solid rgba(211,181,132,.22);border-radius:50%;top:53px;left:50%;transform:translateX(-50%)}.circle-two{width:275px;height:275px;top:91px;border-color:rgba(211,181,132,.13)}
    .hero-art svg{position:absolute;width:94%;height:93%;left:3%;top:6%}.art-label{position:absolute;color:#b9a17c;font-size:8px;font-weight:600;letter-spacing:.2em}.top-label{top:25px;left:25px}.bottom-label{bottom:25px;right:25px}.coordinate{position:absolute;bottom:25px;left:25px;color:#8ea398;font-size:9px;letter-spacing:.1em}
    .hero-bottom{width:min(1220px,calc(100% - 56px));height:43px;margin:auto;border-top:1px solid rgba(230,236,231,.13);display:flex;align-items:center;justify-content:space-between;color:#91a69a;font-size:9px;letter-spacing:.16em}
    .section-wrap{width:min(1220px,calc(100% - 56px));margin:auto}.intro{padding-top:96px;padding-bottom:100px}.intro-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:48px;align-items:end;margin-top:25px}
    h2{margin:0;color:#203b34;font:500 clamp(36px,4.3vw,54px)/1.14 'Manrope',sans-serif;letter-spacing:-.055em}.intro-grid h2 em{color:#b88b50}.intro-grid p{max-width:430px;margin:0 0 20px;color:#6e7b73;font-size:13px;line-height:1.9}
    .underlined{display:inline-flex;gap:18px;align-items:center;padding-bottom:8px;border-bottom:1px solid #b6a17f;color:#29463d;text-decoration:none;font-size:12px;font-weight:700}.underlined span{color:#b78c54;font-size:15px}
    .categories{padding:88px 0 94px;background:#f0f1eb}.section-heading{display:flex;justify-content:space-between;align-items:end;gap:25px;margin-bottom:33px}.section-heading h2{margin-top:16px;font-size:clamp(34px,4vw,47px)}.section-heading>p{margin:0 0 4px;color:#738077;font-size:12px;line-height:1.8;text-align:right}
    .category-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:15px}.category-card{min-height:270px;padding:24px 25px;background:#1c3b34;color:#eff1e9;text-decoration:none;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden;transition:transform .18s ease}
    .category-card:nth-child(2){background:#304a41}.category-card:nth-child(3){background:#6b604e}.category-card:after{content:'';position:absolute;width:190px;height:190px;border:1px solid rgba(223,197,155,.18);border-radius:50%;right:-76px;top:-77px;box-shadow:0 0 0 22px rgba(223,197,155,.035),0 0 0 44px rgba(223,197,155,.025)}.category-card:hover{transform:translateY(-4px)}
    .category-top{display:flex;justify-content:space-between;color:#b5c1b8;font-size:10px;letter-spacing:.14em}.symbol{color:#d4b17b;font:400 29px 'Manrope',sans-serif}.category-card h3{margin:0 0 8px;font:600 25px 'Manrope',sans-serif}.category-card p{max-width:225px;margin:0;color:#bdc9c0;font-size:12px;line-height:1.7}
    .category-bottom{display:flex;justify-content:space-between;margin-top:24px;padding-top:13px;border-top:1px solid rgba(234,239,232,.18);color:#dce4dc;font-size:10px}.category-bottom b{color:#d4b17b;font-size:15px}
    .featured{padding-top:90px;padding-bottom:92px}.featured-heading h2{font-size:clamp(34px,4vw,46px)}.featured-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
    .featured-card{min-width:0;border:1px solid #e4e7e0;background:#fff;text-decoration:none;transition:transform .18s ease,box-shadow .18s ease}.featured-card:hover{transform:translateY(-4px);box-shadow:0 15px 32px rgba(25,55,46,.09)}
    .property-visual{height:180px;position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;background:linear-gradient(145deg,#d9ded4,#aebdb0)}.property-visual.warm{background:linear-gradient(145deg,#d9d3c5,#b8ae9b)}.property-visual.sage{background:linear-gradient(145deg,#c5d1ca,#849d91)}
    .property-visual:before{content:'';position:absolute;inset:0;opacity:.34;background:repeating-linear-gradient(135deg,transparent 0 18px,rgba(255,255,255,.3) 19px 20px)}
    .property-visual>div{color:rgba(29,61,51,.72);font:500 72px 'Manrope',sans-serif;letter-spacing:-.1em}.property-visual>div span{color:#a7783e}.visual-cat,.visual-ref{position:absolute;top:15px;color:#33473d;font-size:8px;font-weight:700;letter-spacing:.14em}.visual-cat{left:16px}.visual-ref{right:16px}
    .card-info{padding:17px 18px}.card-info small{color:#a17b4d;font-size:9px;font-weight:700;letter-spacing:.13em}.card-info h3{margin:9px 0 5px;color:#253b33;font:700 17px 'Manrope',sans-serif}.card-info p{margin:0;color:#89928b;font-size:10px}
    .card-info>div{display:flex;justify-content:space-between;gap:8px;margin-top:19px;padding-top:12px;border-top:1px solid #edf0eb}.card-info strong{color:#2c4b40;font-size:12px}.card-info>div span{color:#79857d;font-size:10px}
    .loading-box{min-height:100px;padding:30px;border:1px solid #e3e7df;background:#fafbf8;color:#728077;font-size:13px}
    .closing{padding:72px 0;background:#1c3a33;color:#f5f4ed}.closing .section-index{margin-bottom:20px}.closing-row{display:flex;align-items:end;justify-content:space-between;gap:25px}.closing h2{color:#f5f4ed;font-size:clamp(38px,5vw,59px)}
    .button-light{min-height:47px;padding:0 18px;display:inline-flex;align-items:center;gap:20px;background:#f0e9da;color:#1b3932;text-decoration:none;font-size:11px;font-weight:700}.button-light span{color:#a7783e;font-size:15px}
    @media(max-width:900px){.hero-inner{grid-template-columns:1fr .82fr;gap:18px}.hero-art{min-height:390px}.category-card{min-height:250px;padding:20px}.hero-search{grid-template-columns:1fr 1fr auto}}
    @media(max-width:680px){.hero-inner,.section-wrap,.hero-bottom{width:calc(100% - 38px)}.hero-inner{grid-template-columns:1fr;padding:48px 0 23px}.hero-search{grid-template-columns:1fr 1fr}.hero-search label:first-child{grid-column:1/-1;border-right:0;border-bottom:1px solid #e3e5dc;padding-bottom:9px}.hero-search button{min-height:41px}.hero-art{min-height:300px}.hero-bottom{font-size:8px}.intro{padding:65px 0 70px}.intro-grid{grid-template-columns:1fr;gap:22px}.intro-grid h2{font-size:40px}.categories,.featured{padding:66px 0}.section-heading{align-items:flex-start;flex-direction:column;gap:16px}.section-heading>p{text-align:left}.category-grid,.featured-grid{grid-template-columns:1fr}.category-card{min-height:230px}.closing{padding:55px 0}.closing-row{align-items:flex-start;flex-direction:column;gap:21px}.closing h2{font-size:43px}}
  `]
})
export class HomeComponent implements OnInit {
  private readonly api = inject(PropertyApi);
  private readonly router = inject(Router);
  private readonly seo = inject(SiteSeo);
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
  price(p: Property): string {
    if (!p.price || !Number.isFinite(Number(p.price))) return 'Price on request';
    return new Intl.NumberFormat('en-IN',{style:'currency',currency:p.currency || 'INR',maximumFractionDigits:0}).format(Number(p.price));
  }
}

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
              <div class="visual" [class.warm]="i%3===1" [class.sage]="i%3===2"><span class="visual-cat">{{categoryName(p.category)}}</span><span class="visual-ref">{{p.property_reference}}</span><div>S<span>.</span></div><small [class.unavailable]="p.availability_status!=='AVAILABLE'">{{p.availability_status.replace('_',' ')}}</small></div>
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
    .filters{display:flex;flex-wrap:wrap;gap:8px}.filters input,.filters select{min-height:39px;padding:0 10px;border:1px solid #dfe5de;border-radius:3px;background:#fff;color:#33463c;font-size:11px}.filters input{width:205px}.filters select{min-width:135px}.reset{border:0;background:transparent;color:#758078;text-decoration:underline;font-size:11px}.search-btn,.action{min-height:38px;padding:0 14px;border:0;border-radius:3px;background:#23483c;color:#fff;font-size:11px;font-weight:700}
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
    this.api.list({search:this.search,category:this.category,listing_type:this.listingType,page:nextPage}).subscribe({
      next: data => {this.items.set(data.results);this.count.set(data.count);this.page.set(nextPage);this.loading.set(false);},
      error: () => {this.error.set(true);this.loading.set(false);}
    });
  }
  reset(): void {this.search='';this.category='';this.listingType='';this.load(1);}
  totalPages(): number {return Math.max(1,Math.ceil(this.count()/this.pageSize));}
  categoryName(value: string): string {return ({RESIDENTIAL:'Residential',COMMERCIAL:'Commercial',LAND:'Land & plots'} as Record<string,string>)[value] ?? 'Property';}
  location(p: Property): string {return [p.location_name||p.locality_name,p.city_name,p.district_name,p.state_name].filter((v,i,a):v is string=>!!v&&a.indexOf(v)===i).join(', ')||'Maharashtra';}
  price(p: Property): string {if(!p.price||!Number.isFinite(Number(p.price)))return 'Price on request';return new Intl.NumberFormat('en-IN',{style:'currency',currency:p.currency||'INR',maximumFractionDigits:0}).format(Number(p.price));}
}

@Component({
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) { <div class="detail-message">Loading property details…</div> }
    @else if (!property()) {
      <section class="not-found"><div class="kicker">SWASTIK PROPERTIES / 404</div><h1>This property<br>is no longer <em>available.</em></h1><p>The link may be outdated or the listing may have been removed from the public catalogue.</p><a routerLink="/properties">Browse all properties ↗</a></section>
    } @else {
      <section class="detail-hero"><div class="wrap"><div class="crumb"><a routerLink="/">Home</a><span>/</span><a routerLink="/properties">Properties</a><span>/</span><span>{{property()!.name}}</span></div><div class="detail-label">{{property()!.category || 'PROPERTY'}} · {{property()!.listing_type || 'OPPORTUNITY'}}</div><h1>{{property()!.name}}</h1><p>⌖ &nbsp;{{location(property()!)}}</p><small>PROPERTY REFERENCE&nbsp;&nbsp; {{property()!.property_reference}}</small></div></section>
      <section class="detail-content wrap">
        <div class="detail-main">
          <div class="detail-art"><div>S<span>.</span></div><span class="art-ref">{{property()!.property_reference}}</span><span class="art-cat">{{property()!.category || 'PROPERTY'}}</span></div>
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
    .address-panel strong{display:block;margin-top:11px;color:#2b4338;font:700 15px 'Manrope',sans-serif}.address-panel p{margin:7px 0 0;color:#7c8980;font-size:11px;line-height:1.7}.disclaimer{padding:14px;color:#8a928b;background:#f1f3ed;font-size:10px;line-height:1.7}.back{color:#315344;text-decoration:none;font-size:11px;font-weight:700}
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
  readonly property = signal<Property | null>(null);
  readonly loading = signal(true);

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
  location(p: Property): string {return [p.location_name||p.locality_name,p.city_name,p.district_name,p.state_name].filter((v,i,a):v is string=>!!v&&a.indexOf(v)===i).join(', ')||'Maharashtra';}
  price(p: Property): string {if(!p.price||!Number.isFinite(Number(p.price)))return 'Price on request';return new Intl.NumberFormat('en-IN',{style:'currency',currency:p.currency||'INR',maximumFractionDigits:0}).format(Number(p.price));}
  pretty(value: string): string {return (value||'Not specified').replaceAll('_',' ').toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());}
  area(p: Property): string {if(!p.area_value)return 'Not specified';const units:Record<string,string>={SQ_FT:'sq. ft.',SQ_M:'sq. m.',ACRE:'acre',GUNTHA:'guntha'};return p.area_value+' '+(units[p.area_unit]||p.area_unit);}
}

export const appRoutes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', component: HomeComponent, title: 'Swastik Properties | Find your place in Maharashtra' },
      { path: 'properties', component: PropertyListComponent, title: 'Explore Properties | Swastik Properties' },
      { path: 'properties/:slug', component: PropertyDetailComponent }
    ]
  },
  { path: 'admin/login', component: LoginComponent, title: 'Admin Sign In | Swastik Properties' },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'properties' },
      { path: 'properties', component: AdminPropertiesComponent, title: 'Property Management | Swastik Properties' }
    ]
  },
  { path: '**', redirectTo: '' }
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes,withInMemoryScrolling({scrollPositionRestoration:'top'})),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideClientHydration(withHttpTransferCacheOptions({includePostRequests:false}))
  ]
};

