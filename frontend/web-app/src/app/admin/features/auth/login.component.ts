import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'sp-login', standalone: true, imports: [ReactiveFormsModule],
  templateUrl: './login.component.html', styleUrl: './login.component.css', changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly submitting = signal(false);
  readonly errorMessage = signal('');
  readonly form = this.fb.group({ email: ['', [Validators.required, Validators.email]], password: ['', [Validators.required]] });

  submit(): void {
    this.errorMessage.set('');
    if (this.form.invalid || this.submitting()) { this.form.markAllAsTouched(); return; }
    const { email, password } = this.form.getRawValue();
    this.submitting.set(true);
    this.auth.login(email ?? '', password ?? '').subscribe({
      next: response => {
        const destination = response.user.role === 'EDITOR' ? '/admin/blog' : '/admin';
        if (response.user.role === 'AGENT') {
          this.auth.clearSession();
          this.errorMessage.set('Agent accounts do not have access to this workspace.');
          this.submitting.set(false);
          return;
        }
        void this.router.navigateByUrl(destination);
      },
      error: (error: unknown) => { this.errorMessage.set(this.describeError(error)); this.submitting.set(false); },
      complete: () => this.submitting.set(false)
    });
  }
  private describeError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) return 'Cannot reach the backend. Start Django at http://127.0.0.1:8000 and try again.';
      if (error.status === 401) return 'Email or password is incorrect.';
      const detail = error.error?.detail;
      if (typeof detail === 'string') return detail;
    }
    return 'Sign-in failed. Please try again.';
  }
}
