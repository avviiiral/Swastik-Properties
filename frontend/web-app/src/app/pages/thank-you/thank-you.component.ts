import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'sp-thank-you',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="status-page status-thank-you">
      <div class="status-mark" aria-hidden="true"><span>✓</span></div>
      <div class="status-copy">
        <p class="status-eyebrow">SWASTIK PROPERTIES / MESSAGE RECEIVED</p>
        <h1>Thank you for<br>getting <em>in touch.</em></h1>
        <p class="status-description">Your request has been submitted successfully. Our team will review the details you shared and contact you using the information provided.</p>
        <div class="status-next">
          <span>WHAT HAPPENS NEXT</span>
          <p>Keep your phone and email accessible in case our team needs to clarify your requirement. For property decisions, remember to verify all documents and material details independently.</p>
        </div>
        <div class="status-actions">
          <a class="status-primary" routerLink="/properties">Continue exploring <span>↗</span></a>
          <a class="status-secondary" routerLink="/">Return home</a>
        </div>
        <p class="status-reference">CLEAR INFORMATION. CONSIDERED PROPERTY CHOICES.</p>
      </div>
    </section>
  `,
})
export class ThankYouComponent {}
