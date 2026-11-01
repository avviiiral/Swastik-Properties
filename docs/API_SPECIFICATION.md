# Swastik Properties — API Specification

Base URL prefix: /api/v1/

## Conventions
- JSON requests and responses unless an endpoint returns a file or accepts multipart/form-data.
- JWT Bearer authentication for protected endpoints; access tokens live 15 minutes and refresh tokens 7 days.
- Refresh tokens rotate and are blacklisted after use. Inactive accounts are rejected on refresh.
- Page-number pagination, default page size 20.
- Public catalogue endpoints enforce publication visibility server-side.

## Authentication and users

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | /auth/login/ | Public, throttled | Authenticate email/password; returns access, refresh and safe user data including role |
| POST | /auth/token/refresh/ | Valid refresh token and active account | Rotate refresh token and issue access token |
| POST | /auth/logout/ | Authenticated | Blacklist refresh token belonging to current user |
| GET | /auth/me/ | Authenticated | Return safe current-user profile |
| GET | /auth/users/ | ADMIN, SUPER_ADMIN | List manageable accounts |
| POST | /auth/users/ | ADMIN, SUPER_ADMIN | Create manageable EDITOR/AGENT or ADMIN/EDITOR/AGENT accounts according to role |
| GET | /auth/users/{id}/ | ADMIN, SUPER_ADMIN | Retrieve account within management scope |
| PATCH | /auth/users/{id}/ | ADMIN, SUPER_ADMIN | Update permitted account fields, role or is_active |
| DELETE | /auth/users/{id}/ | SUPER_ADMIN | Permanently delete account; blocked for self and last active Super Admin |
| POST | /auth/users/{id}/activation/ | ADMIN, SUPER_ADMIN | Activate/deactivate within management scope |

SUPER_ADMIN can manage all roles through user management, but cannot manage their own role/status; the last active SUPER_ADMIN cannot be deactivated. ADMIN can only manage EDITOR and AGENT users. ADMIN cannot create/promote ADMIN or SUPER_ADMIN. Password values are write-only and validated by Django password validators. Password hashes are never returned. Deactivation is the default removal action.

## Public Blog and public website content

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | /blog/posts/ | Public | Paginated list of PUBLISHED posts; supports search and category |
| GET | /blog/posts/{slug}/ | Public | Retrieve one PUBLISHED post; drafts/archived posts return 404 |
| GET | /public/site-content/{section}/ | Public | Retrieve published `home`, `about`, `blog` or `contact` content; unknown/unpublished sections return 404 |

## Admin website content management

All endpoints require ADMIN or SUPER_ADMIN. AGENT and unauthenticated users are denied.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /site-content/ | List editable sections and version metadata |
| GET | /site-content/{section}/ | Retrieve `home`, `about`, `blog` or `contact` content |
| PATCH | /site-content/{section}/ | Partially update validated structured content |

The public endpoint is read-only. Validate field lengths, URL schemes, repeatable-item limits and image references. Sanitize rich text server-side. Record editor and timestamp. Reject arbitrary templates, scripts, CSS and executable content.

## Blog article management

All management routes require ADMIN or SUPER_ADMIN. AGENT is denied.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /blog/manage/posts/ | List every editorial status |
| POST | /blog/manage/posts/ | Create post; accepts JSON or multipart cover upload |
| GET | /blog/manage/posts/{id}/ | Retrieve editorial record |
| PATCH | /blog/manage/posts/{id}/ | Update editorial record |
| PUT | /blog/manage/posts/{id}/ | Replace editorial record |
| DELETE | /blog/manage/posts/{id}/ | Delete post and cover image |
| POST | /blog/manage/posts/{id}/publish/ | Publish post |
| POST | /blog/manage/posts/{id}/unpublish/ | Return post to draft |

Blog fields include title, slug, excerpt, rich-text HTML content, cover image, category, tags, status, published_at, author, SEO title/description and computed reading time. Blog landing copy and article content are managed from Admin Site Content. The server sanitises content HTML on save with nh3 and a safe tag/attribute/URL allowlist. Cover uploads are limited to JPG/JPEG/PNG/WEBP, maximum 8 MB, and checked as real image files.

## Property catalogue

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | /properties/ | Public published; ADMIN/SUPER_ADMIN can see all | List property entries |
| GET | /properties/{slug}/ | Public published; ADMIN/SUPER_ADMIN can see all | Property details |
| POST | /properties/ | ADMIN/SUPER_ADMIN | Create property and PDF brochure |
| PATCH | /properties/{slug}/ | ADMIN/SUPER_ADMIN | Update property/publication state |
| PUT | /properties/{slug}/ | ADMIN/SUPER_ADMIN | Replace editable property fields |
| DELETE | /properties/{slug}/ | ADMIN/SUPER_ADMIN | Permanently delete property and media |
| GET | /properties/{slug}/images/ | Public published | List property gallery |
| POST | /properties/{slug}/images/ | ADMIN/SUPER_ADMIN | Upload up to 20 images |
| PATCH | /properties/{slug}/images/{image_id}/ | ADMIN/SUPER_ADMIN | Set primary image |
| DELETE | /properties/{slug}/images/{image_id}/ | ADMIN/SUPER_ADMIN | Remove gallery image |

Property visibility remains restricted by the backend queryset. EDITOR and AGENT never receive unpublished property records.

## Existing location APIs
- GET /locations/states/
- GET /locations/districts/?state={id}
- GET /locations/cities/?district={id}
- GET /locations/localities/?city={id}

Swagger UI: /api/docs/; OpenAPI schema: /api/schema/.
