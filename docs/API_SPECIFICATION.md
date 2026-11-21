# Swastik Properties — API Specification

Base prefix: `/api/v1/`. The Django REST Framework API is authoritative for validation, visibility and permissions. Confirm the live OpenAPI schema at `/api/schema/` and Swagger UI at `/api/docs/` before relying on undocumented request fields.

## Conventions

- JSON unless an endpoint accepts multipart/form-data or returns a file.
- JWT Bearer authentication for protected routes.
- Refresh tokens rotate and are blacklisted after use.
- Page-number pagination follows global DRF settings.
- Public property querysets expose published records only; privileged visibility is role-controlled server-side.

## Authentication and users

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/auth/login/` | Public, throttled | Authenticate email/password |
| POST | `/auth/token/refresh/` | Valid refresh token | Rotate refresh token |
| POST | `/auth/logout/` | Authenticated | Blacklist current user's refresh token |
| GET | `/auth/me/` | Authenticated | Current safe user profile |
| GET/POST | `/auth/users/` | ADMIN, SUPER_ADMIN | List/create manageable users |
| GET/PATCH/DELETE | `/auth/users/{id}/` | ADMIN/SUPER_ADMIN; delete SUPER_ADMIN | Manage users within role scope |
| POST | `/auth/users/{id}/activation/` | ADMIN, SUPER_ADMIN | Activate/deactivate eligible account |

ADMIN cannot manage ADMIN or SUPER_ADMIN accounts. SUPER_ADMIN has broader management rights but cannot remove the last active SUPER_ADMIN or self-deactivate through the user workflow. Password hashes are never returned.

## Properties

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/properties/` | Public published records; privileged roles may have broader visibility | Paginated/searchable/filterable catalogue |
| GET | `/properties/{slug}/` | Public published record; privileged roles may have broader visibility | Property detail |
| POST | `/properties/` | ADMIN, SUPER_ADMIN | Create property with supported fields/media |
| PATCH/PUT | `/properties/{slug}/` | ADMIN, SUPER_ADMIN | Update property |
| DELETE | `/properties/{slug}/` | ADMIN, SUPER_ADMIN | Permanently delete property and related media |
| GET | `/properties/{slug}/images/` | Public published record | List gallery |
| POST | `/properties/{slug}/images/` | ADMIN, SUPER_ADMIN | Upload gallery images |
| PATCH | `/properties/{slug}/images/{image_id}/` | ADMIN, SUPER_ADMIN | Update image metadata/primary selection |
| DELETE | `/properties/{slug}/images/{image_id}/` | ADMIN, SUPER_ADMIN | Remove image |

The marketplace uses existing property fields and filters. Buy is mapped by the frontend to listing type `SALE`; Rent and Lease map to their matching API values. Do not assume price, EMI, bedrooms, bathrooms, deposits, furnishing, lock-in, lease escalation or parking fields exist. Consult serializers and OpenAPI before adding filters.

## Submissions and CRM

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/submissions/leads/` | Public, throttled | Submit the supported public lead/form payload |
| GET | `/submissions/property-enquiries/` | ADMIN, SUPER_ADMIN | Admin lead inbox with supported filters |
| PATCH | `/submissions/property-enquiries/{id}/` | ADMIN, SUPER_ADMIN | Update permitted lead status/notes |
| GET | `/submissions/property-enquiries/export/` | ADMIN, SUPER_ADMIN | CSV export subject to supported filters |

CRM backend foundation includes nullable assignment fields (`assigned_to`, `assigned_by`, `assigned_at`), a lead activity timeline and admin assignment/unassignment plus agent-scoped endpoints. Exact route names and payload shapes should be read from the current `apps.submissions` URL configuration and OpenAPI schema; this document intentionally does not guess them.

Public form categories are General Enquiry, Property Enquiry, Buy Requirement, Rent Requirement, Sell Property and Property Listing. Consent is captured for new submissions. Existing historical enquiries remain valid.

## Blog

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/blog/posts/` | Public | Published, paginated posts; search/category filters |
| GET | `/blog/posts/{slug}/` | Public | Published article detail |
| GET/POST | `/blog/manage/posts/` | ADMIN, SUPER_ADMIN | List/create editorial records |
| GET/PATCH/PUT/DELETE | `/blog/manage/posts/{id}/` | ADMIN, SUPER_ADMIN | Retrieve/update/delete article |
| POST | `/blog/manage/posts/{id}/publish/` | ADMIN, SUPER_ADMIN | Publish article |
| POST | `/blog/manage/posts/{id}/unpublish/` | ADMIN, SUPER_ADMIN | Unpublish/return to draft |

Article fields and upload constraints are defined by the current serializers and validators. Public APIs must not expose drafts or archived content.

## Locations

- `GET /locations/states/`
- `GET /locations/districts/?state={id}`
- `GET /locations/cities/?district={id}`
- `GET /locations/localities/?city={id}`

These are public read-only lookup APIs for the normalized hierarchy.

## Not currently shipped

No public/Admin Site Content API is considered shipped in this branch. No API contract for a database-backed Home/About/Contact CMS should be assumed.

## Schema and compatibility

Swagger UI: `/api/docs/`; OpenAPI schema: `/api/schema/`. The generated schema and current serializers/viewsets are authoritative if this document and runtime differ.
