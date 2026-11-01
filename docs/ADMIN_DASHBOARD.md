# Admin Workspace — Unified Frontend

## Scope

The Admin workspace is part of the single Angular application at `frontend/web-app`. It supports operational administration and a scoped Site Content editor for Home, About, Blog and Contact. It is not a general-purpose CMS or arbitrary page builder.

Admin routes:
- `/admin/login` — administrator sign-in.
- `/admin/properties` — property inventory and management.
- `/admin/leads` — all website enquiries and requirements, with filters, private follow-up notes, status updates and CSV export.
- `/admin/site-content` — edit public website content for Home, About, Blog and Contact (planned).

## Technology

- Angular 22 standalone components and Angular Router.
- Reactive Forms and Angular HttpClient.
- Functional JWT interceptor with refresh-token rotation.
- Admin routes use client rendering because the current authentication flow uses browser session storage.
- Public and Admin routes share one Angular build and development server.

## Authentication

- Login calls POST /api/v1/auth/login/ with email and password.
- Access and refresh tokens are stored in browser session storage for the current tab/session.
- The interceptor attaches the access token to protected API requests.
- On an API 401 response, the interceptor attempts a refresh request; SimpleJWT refresh rotation is supported.
- Only ADMIN and SUPER_ADMIN application roles can enter the Admin workspace and edit public website content.
- Logout calls POST /api/v1/auth/logout/ and clears the local session.

Session storage is still accessible to JavaScript in the page. Production deployment must apply a strong Content Security Policy, avoid unsafe third-party scripts, enforce HTTPS, and consider a backend-for-frontend with HttpOnly cookies if the threat model requires stronger token isolation.

## Property management page

The Admin property page provides:
- Paginated property inventory, search and category filtering.
- Create/edit property forms.
- PDF brochure upload and replacement.
- Multiple JPG/JPEG/PNG/WEBP property photos, primary-image selection and photo removal.
- Publish/unpublish and availability updates.
- Google Maps links and brochure access.
- Permanent property deletion, including uploaded brochures and property images.

## Lead management

The `/admin/leads` workspace is available only to ADMIN and SUPER_ADMIN. It can filter by form type, status and free-text search; review contact details and structured form answers; update the NEW → CONTACTED → QUALIFIED → CLOSED workflow (or mark SPAM); and save private internal notes. The export follows the current filters and includes the structured form payload. Agents cannot view or export customer submissions.

The Django API remains authoritative for input validation and authorization.

## Public website content management

The Site Content workspace is a bounded structured editor, not a free-form page builder. ADMIN and SUPER_ADMIN can edit:

- **Home:** hero heading, eyebrow, description, discovery labels, section copy and calls to action.
- **About:** introduction, story, mission, values, process, service areas, statistics, team profiles and closing copy. Company history, locations, statistics and biographies must be verified; never invent values to replace TODO placeholders.
- **Blog:** landing-page copy/categories and article records (title, slug, excerpt, body, cover image, tags, SEO metadata and publication state).
- **Contact:** headings, instructions, helper text and direct-contact display settings. Existing form validation, consent, submission storage and lead workflow must remain unchanged.

Content is stored in the database. Public routes use read-only published APIs; the Admin editor uses authenticated APIs. Rich text is sanitized server-side, images are validated, and updates record editor and timestamp. Do not permit arbitrary templates, scripts or CSS. Property prices and budget inputs remain prohibited.

## Local development

From repository root, start Django:

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py runserver
```

In a second terminal, start the single frontend:

```powershell
cd frontend/web-app
npm.cmd install
npm.cmd start
```

Open http://localhost:4200. Public pages and Admin routes are served by the same process.

## Production routing

The production web server should serve the Angular SSR application and forward:
- /api/ to Django.
- /media/ to the configured persistent media storage.

Do not use Django's runserver or ephemeral local media storage in production.
