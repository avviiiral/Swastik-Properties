import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '../api-base-url.token';

export type LeadType =
  | 'GENERAL_ENQUIRY'
  | 'PROPERTY_ENQUIRY'
  | 'BUY_REQUIREMENT'
  | 'RENT_REQUIREMENT'
  | 'SELL_PROPERTY'
  | 'PROPERTY_LISTING';

export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CLOSED' | 'SPAM';

export interface LeadSubmissionPayload {
  enquiry_type: LeadType;
  name: string;
  email: string;
  phone: string;
  message: string;
  details: Record<string, string>;
  source_path: string;
  consent: boolean;
  website: string;
  property_slug?: string;
}

export interface BusinessContactSettings {
  whatsapp_number: string;
  contact_number: string;
  email: string;
  updated_at?: string;
}

export interface AssignableAgent { id: number; username: string; email: string; first_name: string; last_name: string; role: 'AGENT'; is_active: boolean; }\n\nexport interface PropertyEnquiryRecord {
  id: number;
  enquiry_type: LeadType;
  enquiry_type_label: string;
  property_name: string;
  property_reference: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  details: Record<string, unknown>;
  source_path: string;
  status: LeadStatus;
  admin_notes: string;
  created_at: string;
  updated_at: string;
}

export interface PropertyEnquiryPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: PropertyEnquiryRecord[];
}

export interface LeadFilters {
  enquiry_type?: LeadType | '';
  status?: LeadStatus | '';
  search?: string;
}

@Injectable({ providedIn: 'root' })
export class PropertyEnquiryApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);

  submit(payload: {
    property_slug: string;
    name: string;
    email: string;
    phone: string;
    message: string;
  }) {
    return this.http.post<{ id: number; created_at: string }>(
      this.base + '/submissions/property-enquiry/',
      payload
    );
  }

  submitLead(payload: LeadSubmissionPayload) {
    return this.http.post<{ id: number; created_at: string }>(
      this.base + '/submissions/leads/',
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

  listAdminEnquiries(pageSize = 20, page = 1, filters: LeadFilters = {}) {
    let params = new HttpParams()
      .set('page_size', pageSize)
      .set('page', page);
    if (filters.enquiry_type) params = params.set('enquiry_type', filters.enquiry_type);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.search?.trim()) params = params.set('search', filters.search.trim());
    return this.http.get<PropertyEnquiryPage>(
      this.base + '/submissions/property-enquiries/',
      { params }
    );
  }

  updateAdminEnquiry(id: number, payload: { status: LeadStatus; admin_notes: string }) {
    return this.http.patch<PropertyEnquiryRecord>(
      this.base + '/submissions/property-enquiries/' + id + '/',
      payload
    );
  }

  listAssignableAgents() {\n    return this.http.get<{results: AssignableAgent[]}>(this.base + '/auth/users/');\n  }\n\n  assignAdminEnquiry(id: number, assigned_to: number | null) {\n    return this.http.patch<{id: number; assigned_to: number | null; assigned_agent: string | null; assigned_at: string | null}>(\n      this.base + '/submissions/property-enquiries/' + id + '/assignment/', {assigned_to}\n    );\n  }\n\n  exportAdminEnquiries(filters: LeadFilters = {}) {
    let params = new HttpParams();
    if (filters.enquiry_type) params = params.set('enquiry_type', filters.enquiry_type);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.search?.trim()) params = params.set('search', filters.search.trim());
    return this.http.get(this.base + '/submissions/property-enquiries/export/', {
      params,
      responseType: 'blob'
    });
  }
}
