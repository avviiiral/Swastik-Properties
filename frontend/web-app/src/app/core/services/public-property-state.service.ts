import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const FAVORITES_KEY = 'swastik-public-favorites-v1';
const RECENT_KEY = 'swastik-public-recent-v1';

@Injectable({ providedIn: 'root' })
export class PublicPropertyState {
  private readonly platformId = inject(PLATFORM_ID);
  readonly favorites = signal<number[]>(this.readNumberList(FAVORITES_KEY));
  readonly recentlyViewed = signal<string[]>(this.readStringList(RECENT_KEY));

  isFavorite(id: number): boolean { return this.favorites().includes(id); }

  toggleFavorite(id: number): void {
    const next = this.isFavorite(id)
      ? this.favorites().filter(value => value !== id)
      : [...this.favorites(), id];
    this.favorites.set(next);
    this.write(FAVORITES_KEY, next);
  }

  remember(slug: string): void {
    if (!slug) return;
    const next = [slug, ...this.recentlyViewed().filter(value => value !== slug)].slice(0, 8);
    this.recentlyViewed.set(next);
    this.write(RECENT_KEY, next);
  }

  private readNumberList(key: string): number[] {
    if (!isPlatformBrowser(this.platformId)) return [];
    try {
      const value: unknown = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(value) ? value.filter(item => Number.isInteger(item) && item > 0) : [];
    } catch { return []; }
  }

  private readStringList(key: string): string[] {
    if (!isPlatformBrowser(this.platformId)) return [];
    try {
      const value: unknown = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(value) ? value.filter(item => typeof item === 'string').slice(0, 8) : [];
    } catch { return []; }
  }

  private write(key: string, value: unknown): void {
    if (isPlatformBrowser(this.platformId)) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Storage can be unavailable in private browsing. */ }
    }
  }
}
