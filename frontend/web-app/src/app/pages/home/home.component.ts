import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
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

    <section class="closing"><div class="section-wrap"><div class="section-index">04 / TAKE THE NEXT STEP</div><div class="closing-row"><h2>The right place<br>starts with a <em>look.</em></h2><a class="button-light" routerLink="/properties">Browse all properties <span>↗</span></a></div></div></section>
  `,
  styles: [`
    :host{display:block;color:#243d34}.hero{background:#193a33;color:#f8f7f1;overflow:hidden}.hero-inner{width:min(1220px,calc(100% - 56px));min-height:570px;margin:auto;display:grid;grid-template-columns:1.05fr .95fr;align-items:center;gap:34px;padding:45px 0}
    .eyebrow,.section-index{color:#bc9b6a;font-size:10px;line-height:1.5;font-weight:700;letter-spacing:.19em}.eyebrow{display:flex;align-items:center;gap:10px}.eyebrow span{width:24px;height:1px;background:#c59e66}
    h1{max-width:650px;margin:25px 0 18px;color:#f8f7f1;font:500 clamp(48px,6.4vw,80px)/1.08 'Manrope',sans-serif;letter-spacing:-.065em}h1 em,h2 em{color:#d4b17b;font-style:normal}
    .hero-description{max-width:420px;color:#c0cec6;font-size:14px;line-height:1.85}.hero-search{max-width:610px;margin-top:30px;padding:9px;background:#f8f7f0;display:grid;grid-template-columns:1fr 1.15fr auto;gap:8px;color:#243d34}
    .hero-search label{min-width:0;display:flex;flex-direction:column;justify-content:center;gap:5px;padding:4px 11px;border-right:1px solid #e3e5dc}.hero-search label span{color:#9a8a6e;font-size:8px;font-weight:700;letter-spacing:.13em}.hero-search input,.hero-search select{width:100%;min-width:0;min-height:30px;border:0;border-radius:0;outline:0;background-color:transparent;color:#294237;font-size:11px}.hero-search select{appearance:none;-webkit-appearance:none;padding:4px 25px 4px 0;cursor:pointer;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none' stroke='%23294337' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m2 4 4 4 4-4'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 5px center}.hero-search select:focus-visible,.hero-search input:focus-visible{outline:2px solid #b88c55;outline-offset:3px}.hero-search select option{background:#faf9f4;color:#243d34;padding:9px}.hero-search button{min-width:86px;padding:0 12px;border:0;background:#1e4137;color:#fff;font-size:11px;font-weight:700}.hero-search button b{padding-left:10px;color:#d4b17b}
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
    .category-top{display:flex;justify-content:space-between;color:#b5c1b8;font-size:10px;letter-spacing:.14em}.symbol{color:#d4b17b;font:400 29px 'Manrope',sans-serif}.category-card h3{margin:0 0 8px;color:#f4f1e8;font:600 25px 'Manrope',sans-serif}.category-card p{max-width:225px;margin:0;color:#d4ddd5;font-size:12px;line-height:1.7}
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
  primaryImage(property: Property): PropertyImage | null {
    return property.images?.find((image) => image.is_primary) ?? property.images?.[0] ?? null;
  }

  area(p: Property): string {
    if (!p.area_value) return 'Area on request';
    const units: Record<string,string> = {SQ_FT:'sq. ft.',SQ_M:'sq. m.',ACRE:'acre',GUNTHA:'guntha'};
    return p.area_value + ' ' + (units[p.area_unit] || p.area_unit);
  }
}