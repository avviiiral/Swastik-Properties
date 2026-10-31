import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, shareReplay, tap, throwError } from 'rxjs';

import { environment } from '../../environments/environment';
import { AuthUser, LoginResponse, RefreshResponse } from './models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storagePrefix = 'swastik_admin_';
  private refreshRequest: Observable<string> | null = null;

  readonly user = signal<AuthUser | null>(this.readStoredUser());

  get accessToken(): string | null {
    return sessionStorage.getItem(this.storagePrefix + 'access');
  }

  get refreshToken(): string | null {
    return sessionStorage.getItem(this.storagePrefix + 'refresh');
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
      .post<LoginResponse>(environment.apiUrl + '/auth/login/', { email, password })
      .pipe(tap((response) => this.storeSession(response)));
  }

  refreshAccessToken(): Observable<string> {
    if (this.refreshRequest) {
      return this.refreshRequest;
    }

    const refresh = this.refreshToken;
    if (!refresh) {
      this.clearSession();
      return throwError(() => new Error('Your session has expired. Please sign in again.'));
    }

    this.refreshRequest = this.http
      .post<RefreshResponse>(environment.apiUrl + '/auth/token/refresh/', { refresh })
      .pipe(
        tap((response) => {
          sessionStorage.setItem(this.storagePrefix + 'access', response.access);
          if (response.refresh) {
            sessionStorage.setItem(this.storagePrefix + 'refresh', response.refresh);
          }
        }),
        map((response) => response.access),
        catchError((error: unknown) => {
          this.clearSession();
          return throwError(() => error);
        }),
        finalize(() => {
          this.refreshRequest = null;
        }),
        shareReplay({ bufferSize: 1, refCount: false })
      );

    return this.refreshRequest;
  }

  logout(): Observable<unknown> {
    const refresh = this.refreshToken;
    if (!refresh) {
      this.clearSession();
      return new Observable((subscriber) => {
        subscriber.next(null);
        subscriber.complete();
      });
    }

    return this.http
      .post(environment.apiUrl + '/auth/logout/', { refresh })
      .pipe(finalize(() => this.clearSession()));
  }

  clearSession(): void {
    sessionStorage.removeItem(this.storagePrefix + 'access');
    sessionStorage.removeItem(this.storagePrefix + 'refresh');
    sessionStorage.removeItem(this.storagePrefix + 'user');
    this.user.set(null);
    this.refreshRequest = null;
  }

  private storeSession(response: LoginResponse): void {
    sessionStorage.setItem(this.storagePrefix + 'access', response.access);
    sessionStorage.setItem(this.storagePrefix + 'refresh', response.refresh);
    sessionStorage.setItem(this.storagePrefix + 'user', JSON.stringify(response.user));
    this.user.set(response.user);
  }

  private readStoredUser(): AuthUser | null {
    try {
      const stored = sessionStorage.getItem(this.storagePrefix + 'user');
      return stored ? JSON.parse(stored) as AuthUser : null;
    } catch {
      return null;
    }
  }
}
