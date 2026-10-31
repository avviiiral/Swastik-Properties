import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const isAuthenticationRequest =
    request.url.includes('/auth/login/') ||
    request.url.includes('/auth/token/refresh/');
  const token = auth.accessToken;

  const authenticatedRequest =
    token && !isAuthenticationRequest
      ? request.clone({ setHeaders: { Authorization: 'Bearer ' + token } })
      : request;

  return next(authenticatedRequest).pipe(
    catchError((error: unknown) => {
      if (
        !(error instanceof HttpErrorResponse) ||
        error.status !== 401 ||
        isAuthenticationRequest ||
        !token
      ) {
        return throwError(() => error);
      }

      return auth.refreshAccessToken().pipe(
        switchMap((newToken) =>
          next(request.clone({ setHeaders: { Authorization: 'Bearer ' + newToken } }))
        ),
        catchError((refreshError: unknown) => {
          auth.clearSession();
          return throwError(() => refreshError);
        })
      );
    })
  );
};
