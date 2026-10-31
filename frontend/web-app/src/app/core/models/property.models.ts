export interface PropertyImage {
  id: number;
  image: string;
  image_url: string;
  caption: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

export interface Property {
  id: number;
  property_reference: string;
  name: string;
  slug: string;
  description: string;
  developer_name: string;
  category: string;
  subcategory: string;
  listing_type: string;
  area_value: string | null;
  area_unit: string;
  location_name: string;
  full_address: string;
  locality_name: string | null;
  city_name: string | null;
  district_name: string | null;
  state_name: string | null;
  location_url: string;
  brochure_url: string | null;
  images: PropertyImage[];
  publication_status: string;
  availability_status: string;
}

export interface PropertyPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: Property[];
}
