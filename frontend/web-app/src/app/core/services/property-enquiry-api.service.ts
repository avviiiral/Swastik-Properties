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

export interface BusinessContactSettings {
  whatsapp_number: string;
  contact_number: string;
  email: string;
  updated_at?: string;
}

export interface PropertyEnquiryRecord {
  id: number;
  property_name: string;
  property_reference: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'NEW' | 'CONTACTED' | 'CLOSED';
  created_at: string;
}

export interface PropertyEnquiryPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: PropertyEnquiryRecord[];
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

  getContactSettings() {
    return this.http.get<BusinessContactSettings>(this.base + '/submissions/contact-settings/');
  }

  updateContactSettings(payload: Pick<BusinessContactSettings, 'whatsapp_number' | 'contact_number' | 'email'>) {
    return this.http.patch<BusinessContactSettings>(
      this.base + '/submissions/contact-settings/',
      payload
    );
  }

  listAdminEnquiries(pageSize = 8) {
    return this.http.get<PropertyEnquiryPage>(
      this.base + '/submissions/property-enquiries/',
      { params: { page_size: pageSize } }
    );
  }

  exportAdminEnquiries() {
    return this.http.get(this.base + '/submissions/property-enquiries/export/', {
      responseType: 'blob'
    });
  }
}
