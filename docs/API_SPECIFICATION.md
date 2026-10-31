# Swastik Properties — API Specification

Base URL prefix: /api/v1/

## Conventions

- JSON request and response bodies unless an endpoint returns a file.
- Property create/update endpoints accept multipart/form-data to support brochure upload.
- JWT Bearer authentication for protected endpoints.
- Access tokens expire after 15 minutes.
- Refresh tokens expire after 7 days and are rotated on refresh.
- Page-number pagination, default page size 20.
- Protected API endpoints require authentication by default.

## Authentication endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | /api/v1/auth/login/ | Public, throttled | Authenticate with email and password; returns access token, refresh token and user details |
| POST | /api/v1/auth/token/refresh/ | Public, refresh token required | Rotate refresh token and issue a new access token |
| POST | /api/v1/auth/logout/ | Authenticated | Blacklist the supplied refresh token belonging to the authenticated user |
| GET | /api/v1/auth/me/ | Authenticated | Return the current user's safe profile |

## User administration endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | /api/v1/auth/users/ | Admin / Super Admin | List manageable accounts |
| POST | /api/v1/auth/users/ | Admin / Super Admin | Create a manageable account |
| GET | /api/v1/auth/users/{id}/ | Admin / Super Admin | Retrieve a manageable account |
| PATCH | /api/v1/auth/users/{id}/ | Admin / Super Admin | Update account details, role or active status |

Admins can manage Agent accounts only. Super Admins can manage Admin and Agent accounts. Super Admin accounts are created through the trusted Django management command. User API deletion is not available; accounts are deactivated with is_active=false.

## Location lookup endpoints

All endpoints are public, read-only and return active locations.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/v1/locations/states/ | List states |
| GET | /api/v1/locations/districts/?state={id} | List districts |
| GET | /api/v1/locations/cities/?district={id} or ?state={id} | List cities |
| GET | /api/v1/locations/localities/?city={id} or ?district={id} or ?state={id} | List localities |

## Property catalogue and brochure upload

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | /api/v1/properties/ | Public | List published property/project entries |
| GET | /api/v1/properties/{slug}/ | Public | View a published property/project |
| POST | /api/v1/properties/ | Admin / Super Admin | Create a property and upload its PDF brochure |
| PATCH | /api/v1/properties/{slug}/ | Admin / Super Admin | Update details, replace brochure or change publication status |
| PUT | /api/v1/properties/{slug}/ | Admin / Super Admin | Replace editable property fields and brochure |
| DELETE | /api/v1/properties/{slug}/ | Admin / Super Admin | Permanently delete the property and its brochure file |

### Property upload request

Send multipart/form-data. Minimum required fields:

- name
- location_url (HTTPS Google Maps URL)
- brochure (PDF file, maximum 25 MB)

Optional fields include description, developer_name, category, subcategory, listing_type, price, area_value, area_unit, location_name, full_address and locality.

Google Maps place coordinates are extracted from supported URL formats when they are embedded in the supplied link. Coordinates can also be provided explicitly.

The brochure is validated by extension, file size and PDF signature. The API returns brochure_url for viewing/downloading the uploaded document. Property uploads are created as DRAFT by default; an Admin or Super Admin can publish them by setting publication_status to PUBLISHED.

Supported publication statuses: DRAFT, PENDING_REVIEW, CHANGES_REQUESTED, APPROVED, PUBLISHED, REJECTED and ARCHIVED.

Availability is separate from publication status: AVAILABLE, SOLD, RENTED, LEASED or UNAVAILABLE.

Public catalogue responses contain only PUBLISHED properties. Admin and Super Admin requests can access all publication states. Property deletion is permanent.\n\nPublic list filtering supports `search` (name, description, developer, location and reference), `category` (RESIDENTIAL, COMMERCIAL, LAND), `listing_type` (SALE, RENT, LEASE), `availability_status` and the documented ordering fields. Public filtering never exposes or accepts publication workflow states; the server always restricts anonymous users to PUBLISHED records.

### Example property payload (multipart/form-data)

| Field | Example |
|---|---|
| name | ABC 3 Signature |
| developer_name | ABC Group |
| category | LAND |
| subcategory | Residential Plot |
| location_name | Bidkin, Chhatrapati Sambhajinagar |
| location_url | https://www.google.com/maps/place/... |
| brochure | 3 Singneture Brochure Dt. 20 07 26.pdf |

The exact brochure URL is returned by the API after upload; the backend does not parse or rewrite the brochure contents.

## API documentation

- OpenAPI schema: /api/schema/
- Swagger UI: /api/docs/

## Planned API domains

- /api/v1/agents/ — agent business profiles and property assignments.
- /api/v1/submissions/ — public form intake and administrator-only review/export.
