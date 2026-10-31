# Admin Workspace — Unified Frontend

## Scope

The Admin workspace is part of the single Angular application at `frontend/web-app`. It is used for operational administration only; it is not a CMS and does not contain page editing, homepage content editing or a page builder.

Admin routes:
- `/admin/login` — administrator sign-in.
- `/admin/properties` — property inventory and management.

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
- Only ADMIN and SUPER_ADMIN application roles can enter the Admin workspace.
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

The Django API remains authoritative for input validation and authorization.

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
