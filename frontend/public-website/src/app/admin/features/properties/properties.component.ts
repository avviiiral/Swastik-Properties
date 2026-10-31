import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { API_BASE_URL } from '../../../core/api-base-url.token';
import {
  AvailabilityStatus,
  PaginatedResponse,
  Property,
  PublicationStatus
} from '../../core/models/property.models';

@Component({
  selector: 'sp-properties',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './properties.component.html',
  styleUrl: './properties.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PropertiesComponent {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly apiUrl = inject(API_BASE_URL);
  private readonly pageSize = 20;

  readonly properties = signal<Property[]>([]);
  readonly totalCount = signal(0);
  readonly currentPage = signal(1);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly showEditor = signal(false);
  readonly editingProperty = signal<Property | null>(null);
  readonly selectedFile = signal<File | null>(null);
  readonly searchTerm = signal('');
  readonly categoryFilter = signal('');
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly publishedCount = computed(
    () => this.properties().filter((item) => item.publication_status === 'PUBLISHED').length
  );
  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.totalCount() / this.pageSize)));

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    location_url: ['', [Validators.required, Validators.pattern(/^https:\/\/.+/i)]],
    developer_name: [''],
    description: [''],
    category: [''],
    subcategory: [''],
    listing_type: [''],
    price: [''],
    area_value: [''],
    area_unit: [''],
    location_name: [''],
    full_address: [''],
    publication_status: ['DRAFT'],
    availability_status: ['AVAILABLE']
  });

  constructor() {
    this.loadProperties();
  }

  loadProperties(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    let params = new HttpParams().set('page', String(this.currentPage()));
    if (this.searchTerm().trim()) {
      params = params.set('search', this.searchTerm().trim());
    }
    if (this.categoryFilter()) {
      params = params.set('category', this.categoryFilter());
    }

    this.http.get<PaginatedResponse<Property>>(
      this.apiUrl + '/properties/',
      { params }
    ).subscribe({
      next: (response) => {
        this.properties.set(response.results);
        this.totalCount.set(response.count);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(this.describeError(error));
        this.loading.set(false);
      }
    });
  }

  applySearch(value: string): void {
    this.searchTerm.set(value.trim());
    this.currentPage.set(1);
    this.loadProperties();
  }

  setCategory(value: string): void {
    this.categoryFilter.set(value);
    this.currentPage.set(1);
    this.loadProperties();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.pageCount() || page === this.currentPage()) {
      return;
    }
    this.currentPage.set(page);
    this.loadProperties();
  }

  openCreate(): void {
    this.editingProperty.set(null);
    this.selectedFile.set(null);
    this.errorMessage.set('');
    this.form.reset({
      name: '',
      location_url: '',
      developer_name: '',
      description: '',
      category: '',
      subcategory: '',
      listing_type: '',
      price: '',
      area_value: '',
      area_unit: '',
      location_name: '',
      full_address: '',
      publication_status: 'DRAFT',
      availability_status: 'AVAILABLE'
    });
    this.showEditor.set(true);
  }

  openEdit(property: Property): void {
    this.editingProperty.set(property);
    this.selectedFile.set(null);
    this.errorMessage.set('');
    this.form.reset({
      name: property.name,
      location_url: property.location_url,
      developer_name: property.developer_name ?? '',
      description: property.description ?? '',
      category: property.category ?? '',
      subcategory: property.subcategory ?? '',
      listing_type: property.listing_type ?? '',
      price: property.price ?? '',
      area_value: property.area_value ?? '',
      area_unit: property.area_unit ?? '',
      location_name: property.location_name ?? '',
      full_address: property.full_address ?? '',
      publication_status: property.publication_status,
      availability_status: property.availability_status
    });
    this.showEditor.set(true);
  }

  closeEditor(): void {
    if (this.saving()) {
      return;
    }
    this.showEditor.set(false);
    this.editingProperty.set(null);
    this.selectedFile.set(null);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) {
      this.selectedFile.set(null);
      return;
    }
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      this.errorMessage.set('Choose a PDF brochure.');
      input.value = '';
      this.selectedFile.set(null);
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      this.errorMessage.set('The brochure must not exceed 25 MB.');
      input.value = '';
      this.selectedFile.set(null);
      return;
    }
    this.errorMessage.set('');
    this.selectedFile.set(file);
  }

  saveProperty(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.editingProperty() && !this.selectedFile()) {
      this.errorMessage.set('A PDF brochure is required for a new property.');
      return;
    }

    const payload = new FormData();
    const values = this.form.getRawValue();
    for (const [key, value] of Object.entries(values)) {
      payload.append(key, String(value ?? ''));
    }
    const file = this.selectedFile();
    if (file) {
      payload.append('brochure', file, file.name);
    }

    this.saving.set(true);
    const property = this.editingProperty();
    const request = property
      ? this.http.patch<Property>(
          this.apiUrl + '/properties/' + property.slug + '/',
          payload
        )
      : this.http.post<Property>(this.apiUrl + '/properties/', payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.showEditor.set(false);
        this.editingProperty.set(null);
        this.selectedFile.set(null);
        this.successMessage.set(
          property ? 'Property details updated.' : 'Property saved successfully.'
        );
        this.loadProperties();
      },
      error: (error: unknown) => {
        this.errorMessage.set(this.describeError(error));
        this.saving.set(false);
      }
    });
  }

  setPublication(property: Property): void {
    const nextStatus: PublicationStatus =
      property.publication_status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    const action = nextStatus === 'PUBLISHED' ? 'publish' : 'unpublish';
    if (!window.confirm('Are you sure you want to ' + action + ' "' + property.name + '"?')) {
      return;
    }
    this.http.patch<Property>(
      this.apiUrl + '/properties/' + property.slug + '/',
      { publication_status: nextStatus }
    ).subscribe({
      next: () => {
        this.successMessage.set(
          nextStatus === 'PUBLISHED' ? 'Property published.' : 'Property moved to Draft.'
        );
        this.loadProperties();
      },
      error: (error: unknown) => this.errorMessage.set(this.describeError(error))
    });
  }

  setAvailability(property: Property, status: AvailabilityStatus): void {
    this.http.patch<Property>(
      this.apiUrl + '/properties/' + property.slug + '/',
      { availability_status: status }
    ).subscribe({
      next: () => {
        this.successMessage.set('Availability updated.');
        this.loadProperties();
      },
      error: (error: unknown) => this.errorMessage.set(this.describeError(error))
    });
  }

  deleteProperty(property: Property): void {
    const confirmed = window.confirm(
      'Permanently delete "' + property.name + '"? This also removes its uploaded brochure. This action cannot be undone.'
    );
    if (!confirmed) {
      return;
    }
    this.http.delete(
      this.apiUrl + '/properties/' + property.slug + '/'
    ).subscribe({
      next: () => {
        this.successMessage.set('"' + property.name + '" was permanently deleted.');
        if (this.properties().length === 1 && this.currentPage() > 1) {
          this.currentPage.update((page) => page - 1);
        }
        this.loadProperties();
      },
      error: (error: unknown) => this.errorMessage.set(this.describeError(error))
    });
  }

  private describeError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'Cannot reach the backend. Check that Django is running on port 8000.';
      }
      if (error.status === 401) {
        return 'Your session has expired. Sign in again.';
      }
      const data = error.error as Record<string, unknown> | null;
      if (data && typeof data === 'object') {
        const detail = data['detail'];
        if (typeof detail === 'string') {
          return detail;
        }
        const messages = Object.values(data).flatMap((value) =>
          Array.isArray(value) ? value.map(String) : [String(value)]
        );
        if (messages.length) {
          return messages.join(' ');
        }
      }
    }
    return 'The request could not be completed. Please try again.';
  }
}
