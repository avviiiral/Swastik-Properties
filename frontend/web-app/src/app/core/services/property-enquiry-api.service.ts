import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '../api-base-url.token';

export interface PropertyEnquiryPayload {
  property_slug: string;
  name: string;
  email: string;
  phone: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class PropertyEnquiryApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);

  submit(payload: PropertyEnquiryPayload) {
    return this.http.post<{ id: number; created_at: string }>(
      this.base + '/submissions/property-enquiry/',
      payload
    );
  }
}
