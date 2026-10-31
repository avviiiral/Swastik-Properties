export type PropertyCategory = 'RESIDENTIAL' | 'COMMERCIAL' | 'LAND';
export type ListingType = 'SALE' | 'RENT' | 'LEASE';
export type PublicationStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'ARCHIVED';
export type AvailabilityStatus =
  | 'AVAILABLE'
  | 'SOLD'
  | 'RENTED'
  | 'LEASED'
  | 'UNAVAILABLE';

export interface Property {
  id: number;
  property_reference: string;
  name: string;
  slug: string;
  description: string;
  developer_name: string;
  category: PropertyCategory | '';
  subcategory: string;
  listing_type: ListingType | '';
  price: string | null;
  currency: string;
  area_value: string | null;
  area_unit: string;
  location_name: string;
  full_address: string;
  locality: number | null;
  locality_name: string | null;
  city_name: string | null;
  district_name: string | null;
  state_name: string | null;
  location_url: string;
  latitude: string | null;
  longitude: string | null;
  brochure: string;
  brochure_url: string | null;
  publication_status: PublicationStatus;
  availability_status: AvailabilityStatus;
  created_by: number | null;
  created_by_email: string | null;
  approved_by: number | null;
  approved_by_email: string | null;
  approved_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
