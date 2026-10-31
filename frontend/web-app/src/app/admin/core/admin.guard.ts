import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const adminGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  let snapshot = state.root;
  let requiredRoles: Array<'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'AGENT'> | undefined;
  while (snapshot) {
    const candidate = snapshot.data['roles'];
    if (Array.isArray(candidate)) requiredRoles = candidate as typeof requiredRoles;
    if (!snapshot.firstChild) break;
    snapshot = snapshot.firstChild;
  }
  if (!auth.user() || !auth.accessToken) return router.createUrlTree(['/admin/login']);
  const roles = requiredRoles ?? ['SUPER_ADMIN', 'ADMIN'];
  return auth.hasRole(...roles) ? true : router.createUrlTree(['/admin/forbidden']);
};

export const workspaceGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.user() || !auth.accessToken) return router.createUrlTree(['/admin/login']);
  if (auth.hasRole('EDITOR')) return router.createUrlTree(['/admin/blog']);
  if (auth.hasRole('ADMIN', 'SUPER_ADMIN')) return router.createUrlTree(['/admin/overview']);
  return router.createUrlTree(['/admin/forbidden']);
};
