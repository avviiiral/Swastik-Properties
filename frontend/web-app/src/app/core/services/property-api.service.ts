import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '../api-base-url.token';
import { SKIP_ADMIN_AUTH } from '../auth-context';
import { Property, PropertyPage } from '../models/property.models';

export interface PropertyFilters {
  search?: string;
  category?: string;
  listing_type?: string;
  area_min?: string;
  area_max?: string;
  ordering?: string;
  page?: number;
}

@Injectable({ providedIn: 'root' })
export class PropertyApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);

  list(filters: PropertyFilters = {}) {
    let params = new HttpParams();
    if (filters.search?.trim()) params = params.set('search', filters.search.trim());
    if (filters.category) params = params.set('category', filters.category);
    if (filters.listing_type) params = params.set('listing_type', filters.listing_type);
    if (filters.area_min) params = params.set('area_min', filters.area_min);
    if (filters.area_max) params = params.set('area_max', filters.area_max);
    if (filters.ordering) params = params.set('ordering', filters.ordering);
    if (filters.page) params = params.set('page', filters.page);
    return this.http.get<PropertyPage>(this.base + '/properties/', {
      params,
      context: new HttpContext().set(SKIP_ADMIN_AUTH, true)
    });
  }

  listAdmin(filters: {
    search?: string;
    category?: string;
    listing_type?: string;
    publication_status?: string;
    page?: number;
  } = {}) {
    let params = new HttpParams();
    if (filters.search?.trim()) params = params.set('search', filters.search.trim());
    if (filters.category) params = params.set('category', filters.category);
    if (filters.listing_type) params = params.set('listing_type', filters.listing_type);
    if (filters.publication_status) params = params.set('publication_status', filters.publication_status);
    if (filters.page) params = params.set('page', filters.page);
    return this.http.get<PropertyPage>(this.base + '/properties/', { params });
  }

  detail(slug: string) {
    return this.http.get<Property>(this.base + '/properties/' + encodeURIComponent(slug) + '/', {
      context: new HttpContext().set(SKIP_ADMIN_AUTH, true)
    });
  }
}
