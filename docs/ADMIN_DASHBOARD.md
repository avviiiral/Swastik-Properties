# Admin Workspace — Unified Angular Application

## Scope and routes

The Admin workspace is part of `frontend/web-app`; it is not a separate SPA.

- `/admin/login` — sign-in for ADMIN and SUPER_ADMIN.
- `/admin` — Admin dashboard/landing route.
- `/admin/properties` — property inventory and publication management.
- `/admin/leads` — enquiry inbox, filters, status, private notes and CSV export.
- `/admin/blog` — Blog article management, subject to route/API role rules.
- `/admin/users` — user management, subject to role rules.

There is no shipped `/admin/site-content` editor in the current route table. Public Home/About/Contact copy remains maintained in the Angular application. Blog articles are managed through the existing Blog management workflow.

## Technology and authentication

- Angular 22 standalone components and Angular Router.
- Reactive Forms and Angular HttpClient.
- JWT interceptor with refresh-token rotation.
- Admin routes use client rendering because authentication currently uses browser session storage.
- Public and Admin routes share one Angular build and development server.
- Django remains authoritative for authorization; route guards are not a security boundary.

Login calls `POST /api/v1/auth/login/`. Access and refresh tokens are held in browser session storage for the current tab/session. Protected API requests attach the access token. A 401 response can trigger refresh; logout calls the backend logout endpoint and clears the local session.

Session storage is accessible to JavaScript running in the page. Production should enforce HTTPS, a restrictive Content Security Policy, minimal third-party scripts and robust secret handling. Evaluate HttpOnly-cookie/BFF architecture if the threat model requires stronger token isolation.

## Property management

The Admin property workflow supports:
- Paginated inventory, search and category filtering.
- Create/edit property records.
- PDF brochure upload/replacement.
- Multiple JPG/JPEG/PNG/WEBP property photos, primary-image selection and removal.
- Publish/unpublish and availability updates.
- Google Maps location links and brochure access.
- Permanent property deletion with related media cleanup.

Property price and customer budget fields are intentionally excluded.

## Lead management

ADMIN and SUPER_ADMIN can review public website submissions, filter by form type/status/search, inspect structured answers, update lead status and save private notes. CSV export follows active filters and includes structured requirement data and consent timestamp where available. Agents are not permitted to access the Admin lead inbox or export customer submissions.

Backend CRM foundation additionally supports nullable lead assignment, assignment history/activity records and agent-scoped APIs. The Angular agent workspace and integrated assignment controls are not yet delivered.

## Blog management

Blog management is a separate editorial workflow. Public readers see published articles only. Draft/publish/unpublish and article CRUD permissions are enforced by Django APIs. Do not assume a general Site Content editor or editable Home/About page content exists.

## Local development

Backend:

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py runserver
```

Frontend in another terminal:

```powershell
cd frontend/web-app
npm.cmd install
npm.cmd start
```

Open http://localhost:4200.

## Production routing

Serve the Angular SSR application and forward:
- `/api/` to Django.
- `/media/` to persistent media storage.

Do not use Django runserver or ephemeral local media storage in production.
