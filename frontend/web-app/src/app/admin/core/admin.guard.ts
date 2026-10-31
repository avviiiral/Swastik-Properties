import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const adminGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const roles = (route.data['roles'] as Array<'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'AGENT'> | undefined) ?? ['SUPER_ADMIN', 'ADMIN'];
  if (!auth.user() || !auth.accessToken) return router.createUrlTree(['/admin/login']);
  return auth.hasRole(...roles) ? true : router.createUrlTree(['/admin/forbidden']);
};
