import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'sp-not-found',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="status-page status-not-found">
      <div class="status-orbit" aria-hidden="true"><span>404</span></div>
      <div class="status-copy">
        <p class="status-eyebrow">SWASTIK PROPERTIES / PAGE NOT FOUND</p>
        <h1>This page seems<br>to have <em>moved.</em></h1>
        <p class="status-description">The address may be incorrect, or the page may no longer be available. Let’s get you back to exploring property with clarity.</p>
        <div class="status-actions">
          <a class="status-primary" routerLink="/">Back to homepage <span>↗</span></a>
          <a class="status-secondary" routerLink="/properties">Explore properties</a>
        </div>
        <p class="status-reference">SWASTIK PROPERTIES · MAHARASHTRA</p>
      </div>
    </main>
  `,
})
export class NotFoundComponent {}
