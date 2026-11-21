import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SWASTIK_CONTACT } from '../../core/config/business-contact';

@Component({
  selector:'sp-public-layout',standalone:true,imports:[RouterLink,RouterLinkActive,RouterOutlet],
  changeDetection:ChangeDetectionStrategy.OnPush,
  template:`
    <div class="site-shell">
      <div class="site-scroll-progress" aria-hidden="true"><span></span></div>
      <header class="site-header" [class.scrolled]="scrolled()">
        <div class="header-inner">
          <a class="brand" routerLink="/" aria-label="Swastik Properties home"><img class="brand-symbol-image" src="/assets/brand/swastik-symbol.png" alt=""><span class="brand-copy"><strong>SWASTIK</strong><small>PROPERTIES</small></span></a>
          <nav class="desktop-nav" aria-label="Main navigation">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a>
            <a routerLink="/properties" routerLinkActive="active">Properties</a>
            <a routerLink="/about" routerLinkActive="active">About</a>
            <a routerLink="/blog" routerLinkActive="active">Blog</a>
            <a routerLink="/contact" routerLinkActive="active">Contact</a>
          </nav>
          <a class="header-cta" routerLink="/properties">Explore properties <span>↗</span></a>
          <button class="menu-toggle" type="button" aria-label="Toggle navigation" [attr.aria-expanded]="menuOpen()" (click)="menuOpen.set(!menuOpen())"><span></span><span></span></button>
        </div>
        @if(menuOpen()){<nav class="mobile-nav" aria-label="Mobile navigation"><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" (click)="menuOpen.set(false)">Home</a><a routerLink="/properties" routerLinkActive="active" (click)="menuOpen.set(false)">Properties</a><a routerLink="/about" routerLinkActive="active" (click)="menuOpen.set(false)">About</a><a routerLink="/blog" routerLinkActive="active" (click)="menuOpen.set(false)">Blog</a><a routerLink="/contact" routerLinkActive="active" (click)="menuOpen.set(false)">Contact</a></nav>}
      </header>
      <main><router-outlet /></main>
      <footer class="site-footer">
        <div class="footer-main">
          <div class="footer-brand"><a class="brand brand-light" routerLink="/"><img class="brand-symbol-image" src="/assets/brand/swastik-symbol.png" alt=""><span class="brand-copy"><strong>SWASTIK</strong><small>PROPERTIES</small></span></a><p>A considered way to explore property opportunities across Maharashtra.</p></div>
          <div class="footer-links"><span class="footer-label">Explore</span><a routerLink="/properties">All properties</a><a routerLink="/properties" [queryParams]="{category:'RESIDENTIAL'}">Residential</a><a routerLink="/properties" [queryParams]="{category:'COMMERCIAL'}">Commercial</a><a routerLink="/properties" [queryParams]="{category:'LAND'}">Land &amp; plots</a></div>
          <div class="footer-links"><span class="footer-label">Swastik</span><a routerLink="/about">About us</a><a routerLink="/blog">Insights &amp; updates</a><a href="mailto:{{contact.email}}">Contact</a><a routerLink="/admin/login" class="admin-link">Admin sign-in</a></div>
          <div class="footer-contact"><span class="footer-label">Contact</span><strong>{{contact.director}} <small>· {{contact.designation}}</small></strong><a [href]="'tel:'+contact.phoneHref">{{contact.phone}}</a><a [href]="'mailto:'+contact.email">{{contact.email}}</a><p>{{contact.address}}</p></div>
        </div>
        <div class="footer-bottom"><span>© {{year}} Swastik Properties</span><span>Made for better property decisions.</span></div>
      </footer>
    </div>`,
  styles:[`
    :host{display:block}.site-shell{min-height:100vh;display:flex;flex-direction:column}main{flex:1}.site-header{position:sticky;top:0;z-index:20;background:rgba(250,250,247,.91);border-bottom:1px solid rgba(30,59,51,.08);backdrop-filter:blur(20px) saturate(145%);transition:background .25s,box-shadow .25s,border-color .25s}.site-header.scrolled{background:rgba(250,250,247,.98);border-color:rgba(30,59,51,.13);box-shadow:0 8px 28px rgba(20,43,38,.08)}
    .header-inner{width:min(1220px,calc(100% - 56px));height:78px;margin:auto;display:flex;align-items:center;gap:28px}.brand{display:inline-flex;align-items:center;gap:11px;text-decoration:none;color:#1b3932}.brand-symbol-image{display:block;width:42px;height:42px;flex:0 0 auto;object-fit:contain;padding:3px;border-radius:9px;background:#f5f0e6}.brand-copy{display:grid;gap:1px;line-height:1}.brand-copy strong{font:800 15px/1 'Montserrat',sans-serif;letter-spacing:.17em}.brand-copy small{font:600 8px/1.5 'Montserrat',sans-serif;letter-spacing:.32em;color:#8a928b}
    .desktop-nav{display:flex;align-items:center;gap:30px;margin-left:auto}.desktop-nav a{position:relative;color:#64716b;text-decoration:none;font-size:12px;font-weight:600;transition:color .15s}.desktop-nav a:after{position:absolute;bottom:-9px;left:0;right:100%;height:1px;background:#c49b62;content:'';transition:right .2s}.desktop-nav a:hover,.desktop-nav a.active{color:#193c34}.desktop-nav a.active:after,.desktop-nav a:hover:after{right:0}
    .header-cta{min-height:42px;padding:0 16px;display:inline-flex;align-items:center;gap:13px;border-radius:4px;background:#1d4037;color:#fff;text-decoration:none;font-size:12px;font-weight:700}.header-cta{box-shadow:0 7px 16px rgba(24,54,47,.12);transition:transform .2s,background .2s,box-shadow .2s}.header-cta:hover{background:#2e594d;transform:translateY(-2px);box-shadow:0 11px 22px rgba(24,54,47,.2)}.header-cta span{font-size:15px}.menu-toggle,.mobile-nav{display:none}
    .site-footer{position:relative;margin-top:96px;background:linear-gradient(145deg,#18362f 0%,#102a24 100%);color:#e6ece7;overflow:hidden}.site-footer:before{position:absolute;top:-190px;right:-90px;width:440px;height:440px;border:1px solid rgba(208,177,125,.13);border-radius:50%;box-shadow:0 0 0 28px rgba(208,177,125,.025),0 0 0 58px rgba(208,177,125,.02);content:"";pointer-events:none}.footer-main{position:relative;z-index:1;width:min(1220px,calc(100% - 56px));margin:auto;padding:68px 0 52px;display:grid;grid-template-columns:1.1fr .7fr .7fr 1.15fr;gap:38px}.brand-light{color:#fff}.brand-light .brand-copy small{color:#a6b5ad}.footer-brand p,.footer-contact p{max-width:310px;color:#aebdb4;font-size:13px;line-height:1.8}.footer-links,.footer-contact{display:flex;flex-direction:column;align-items:flex-start;gap:13px}.footer-label{display:block;margin-bottom:5px;color:#c59a61;font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase}.footer-links a,.footer-contact a{color:#dce5de;text-decoration:none;font-size:12px}.footer-links a:hover,.footer-contact a:hover{color:#fff}.footer-links .admin-link{color:#91a69a;font-size:10px}.footer-contact strong{color:#f3f3ed;font-size:12px}.footer-contact strong small{color:#aebdb4;font-size:10px;font-weight:500}.footer-bottom{position:relative;z-index:1;width:min(1220px,calc(100% - 56px));min-height:60px;margin:auto;border-top:1px solid rgba(230,236,231,.13);display:flex;justify-content:space-between;align-items:center;color:#9baca3;font-size:11px}
    @media(max-width:800px){.header-inner{width:calc(100% - 34px);height:68px;gap:12px}.desktop-nav{display:none}.header-cta{margin-left:auto;min-height:39px;padding:0 11px;font-size:11px}.menu-toggle{display:flex;flex-direction:column;justify-content:center;gap:5px;width:40px;height:40px;border:1px solid #dfe5dd;background:transparent;border-radius:5px}.menu-toggle span{display:block;width:17px;height:1px;margin:auto;background:#1b3a33}.mobile-nav{display:grid;gap:0;padding:6px 20px 18px;background:#fafaf7;border-top:1px solid #e7ebe5}.mobile-nav a{padding:12px 0;border-bottom:1px solid #e7ebe5;text-decoration:none;font-size:14px;color:#29463d}.footer-main{width:calc(100% - 38px);padding:42px 0 34px;grid-template-columns:1fr 1fr;gap:32px 24px}.footer-brand,.footer-contact{grid-column:1/-1}.footer-bottom{width:calc(100% - 38px);gap:10px;flex-wrap:wrap;padding:15px 0}}
  `]
})
export class PublicLayoutComponent implements AfterViewInit, OnDestroy {
  readonly year=new Date().getFullYear();readonly contact=SWASTIK_CONTACT;
  readonly menuOpen=signal(false);readonly scrolled=signal(false);
  private readonly platformId=inject(PLATFORM_ID);
  private readonly router=inject(Router);
  private scrollFrame=0;
  private readonly updateScrollProgress=()=>{
    if(!isPlatformBrowser(this.platformId))return;
    if(this.scrollFrame)cancelAnimationFrame(this.scrollFrame);
    this.scrollFrame=requestAnimationFrame(()=>{
      const root=document.documentElement;
      const range=root.scrollHeight-window.innerHeight;
      const progress=range>0?Math.min(1,Math.max(0,window.scrollY/range)):0;
      root.style.setProperty('--scroll-progress',String(progress));
    });
  };
  private revealObserver?: IntersectionObserver;
  private revealMutationObserver?: MutationObserver;
  constructor(){if(isPlatformBrowser(this.platformId)){const update=()=>this.scrolled.set(window.scrollY>12);update();this.updateScrollProgress();window.addEventListener('scroll',update,{passive:true});window.addEventListener('scroll',this.updateScrollProgress,{passive:true});window.addEventListener('resize',this.updateScrollProgress,{passive:true});this.router.events.pipe(filter((event):event is NavigationEnd=>event instanceof NavigationEnd)).subscribe(()=>{this.menuOpen.set(false);requestAnimationFrame(()=>{const main=document.querySelector<HTMLElement>('.site-shell main');main?.classList.remove('route-changing');void main?.offsetWidth;main?.classList.add('route-changing');window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});this.updateScrollProgress();});});}}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId) || !('IntersectionObserver' in window)) return;
    const main = document.querySelector<HTMLElement>('.site-shell main');
    if (!main) return;

    main.classList.add('sp-motion-ready');
    this.revealObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        // Reverse the reveal state when the element leaves the viewport.
        // Keeping it observed makes the entrance animation replay on every return.
        entry.target.classList.toggle('sp-in-view', entry.isIntersecting);
      }
    }, { threshold: 0.01, rootMargin: '0px 0px -8% 0px' });

    const observePageContent = () => {
      const targets = main.querySelectorAll<HTMLElement>([
        'section', 'article', 'figure', '[data-scroll-reveal]',
        '.property-card', '.card', '.featured', '.offer-grid > a',
        '.value-grid > article', '.type-card', '.detail-section',
        '.contact-content > *', '.toolbar', '.pagination'
      ].join(','));

      targets.forEach((element) => {
        // The homepage has its own reveal observer and timing.
        if (element.closest('.home-page')) return;
        element.classList.add('sp-motion-target');
        if (!element.classList.contains('sp-in-view')) this.revealObserver?.observe(element);
      });
    };

    observePageContent();
    this.revealMutationObserver = new MutationObserver(observePageContent);
    this.revealMutationObserver.observe(main, { childList: true, subtree: true });
  }

  ngOnDestroy(): void {
    this.revealObserver?.disconnect();
    this.revealMutationObserver?.disconnect();
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('scroll', this.updateScrollProgress);
      window.removeEventListener('resize', this.updateScrollProgress);
      if (this.scrollFrame) cancelAnimationFrame(this.scrollFrame);
    }
  }
}
