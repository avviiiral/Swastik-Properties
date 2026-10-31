import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, of, shareReplay, tap, throwError } from 'rxjs';

import { API_BASE_URL } from '../../core/api-base-url.token';
import { AuthUser, LoginResponse, RefreshResponse } from './models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly storagePrefix = 'swastik_admin_';
  private refreshRequest: Observable<string> | null = null;

  readonly user = signal<AuthUser | null>(this.readStoredUser());

  get accessToken(): string | null {
    return this.storage()?.getItem(this.storagePrefix + 'access') ?? null;
  }

  get refreshToken(): string | null {
    return this.storage()?.getItem(this.storagePrefix + 'refresh') ?? null;
  }

  isAdmin(): boolean {
    const user = this.user();
    return Boolean(
      user?.is_active &&
      (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') &&
      this.accessToken
    );
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(this.apiUrl + '/auth/login/', { email, password })
      .pipe(tap(response => this.storeSession(response)));
  }

  refreshAccessToken(): Observable<string> {
    if (this.refreshRequest) return this.refreshRequest;

    const refresh = this.refreshToken;
    if (!refresh) {
      this.clearSession();
      return throwError(() => new Error('Your session has expired. Please sign in again.'));
    }

    this.refreshRequest = this.http
      .post<RefreshResponse>(this.apiUrl + '/auth/token/refresh/', { refresh })
      .pipe(
        tap(response => {
          this.storage()?.setItem(this.storagePrefix + 'access', response.access);
          if (response.refresh) {
            this.storage()?.setItem(this.storagePrefix + 'refresh', response.refresh);
          }
        }),
        map(response => response.access),
        catchError((error: unknown) => {
          this.clearSession();
          return throwError(() => error);
        }),
        finalize(() => { this.refreshRequest = null; }),
        shareReplay({ bufferSize: 1, refCount: false })
      );

    return this.refreshRequest;
  }

  logout(): Observable<unknown> {
    const refresh = this.refreshToken;
    if (!refresh) {
      this.clearSession();
      return of(null);
    }

    return this.http
      .post(this.apiUrl + '/auth/logout/', { refresh })
      .pipe(finalize(() => this.clearSession()));
  }

  clearSession(): void {
    const storage = this.storage();
    storage?.removeItem(this.storagePrefix + 'access');
    storage?.removeItem(this.storagePrefix + 'refresh');
    storage?.removeItem(this.storagePrefix + 'user');
    this.user.set(null);
    this.refreshRequest = null;
  }

  private storeSession(response: LoginResponse): void {
    const storage = this.storage();
    storage?.setItem(this.storagePrefix + 'access', response.access);
    storage?.setItem(this.storagePrefix + 'refresh', response.refresh);
    storage?.setItem(this.storagePrefix + 'user', JSON.stringify(response.user));
    this.user.set(response.user);
  }

  private readStoredUser(): AuthUser | null {
    try {
      const stored = this.storage()?.getItem(this.storagePrefix + 'user');
      return stored ? JSON.parse(stored) as AuthUser : null;
    } catch {
      return null;
    }
  }

  private storage(): Storage | null {
    return this.isBrowser ? sessionStorage : null;
  }
}
