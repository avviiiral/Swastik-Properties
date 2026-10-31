import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SWASTIK_CONTACT } from '../../core/config/business-contact';
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
            <img class="brand-symbol-image" src="/assets/brand/swastik-symbol.png" alt="">
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
              <img class="brand-symbol-image" src="/assets/brand/swastik-symbol.png" alt="">
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
          <div class="footer-contact">
            <span class="footer-label">Contact the director</span>
            <strong>{{ contact.director }} <small>· {{ contact.designation }}</small></strong>
            <a [href]="'tel:' + contact.phoneHref">{{ contact.phone }}</a>
            <a [href]="'mailto:' + contact.email">{{ contact.email }}</a>
            <p>{{ contact.address }}</p>
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
    .brand{display:inline-flex;align-items:center;gap:11px;text-decoration:none;color:#1b3932}.brand-symbol-image{display:block;width:42px;height:42px;flex:0 0 auto;object-fit:contain;padding:3px;border-radius:9px;background:#f5f0e6}
    .brand-copy{display:grid;gap:1px;line-height:1}.brand-copy strong{font:800 15px/1 'Manrope',sans-serif;letter-spacing:.17em}.brand-copy small{font:600 8px/1.5 'DM Sans',sans-serif;letter-spacing:.32em;color:#8a928b}
    .desktop-nav{display:flex;align-items:center;gap:34px;margin-left:auto}.desktop-nav a{color:#64716b;text-decoration:none;font-size:13px;font-weight:600}.desktop-nav a:hover,.desktop-nav a.active{color:#193c34}
    .header-cta{min-height:42px;padding:0 16px;display:inline-flex;align-items:center;gap:13px;border-radius:4px;background:#1d4037;color:#fff;text-decoration:none;font-size:12px;font-weight:700}.header-cta:hover{background:#2e594d}.header-cta span{font-size:15px}
    .site-footer{margin-top:80px;background:#18362f;color:#e6ece7}.footer-main{width:min(1220px,calc(100% - 56px));margin:auto;padding:58px 0 48px;display:grid;grid-template-columns:1.05fr .65fr 1fr 1.15fr;gap:42px}
    .brand-light{color:#fff}.brand-light .brand-copy small{color:#a6b5ad}.footer-brand p,.footer-note p,.footer-contact p{max-width:310px;color:#aebdb4;font-size:13px;line-height:1.8}
    .footer-links,.footer-contact{display:flex;flex-direction:column;align-items:flex-start;gap:13px}.footer-label{display:block;margin-bottom:5px;color:#c59a61;font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase}
    .footer-links a,.footer-contact a{color:#dce5de;text-decoration:none;font-size:12px}.footer-links a:hover,.footer-contact a:hover{color:#fff}.footer-note p,.footer-contact p{margin-top:5px}.footer-contact strong{color:#f3f3ed;font-size:12px}.footer-contact strong small{color:#aebdb4;font-size:10px;font-weight:500}
    .footer-bottom{width:min(1220px,calc(100% - 56px));min-height:54px;margin:auto;border-top:1px solid rgba(230,236,231,.13);display:flex;justify-content:space-between;align-items:center;color:#9baca3;font-size:11px}
    @media(max-width:720px){.header-inner{width:calc(100% - 34px);height:68px;gap:12px}.desktop-nav{display:none}.header-cta{margin-left:auto;min-height:39px;padding:0 11px;font-size:11px}.footer-main{width:calc(100% - 38px);padding:42px 0 34px;grid-template-columns:1fr 1fr;gap:32px 24px}.footer-brand,.footer-note,.footer-contact{grid-column:1/-1}.footer-bottom{width:calc(100% - 38px);gap:10px;flex-wrap:wrap;padding:15px 0}}
  `]
})
export class PublicLayoutComponent {
  readonly year = new Date().getFullYear();
  readonly contact = SWASTIK_CONTACT;
}