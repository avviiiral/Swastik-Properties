# Admin Dashboard — Frontend Foundation

## Scope

The Admin Dashboard is a separate Angular single-page application for operational administration. It is not a CMS and does not contain page editing, homepage content editing or a page builder.

Application path: frontend/admin-dashboard/

## Technology

- Angular 22 standalone application.
- Angular Router and Reactive Forms.
- Angular HttpClient with a functional JWT interceptor.
- Separate frontend project; it does not share Django templates.
- Development proxy for Django API and uploaded media.

## Authentication

- Login calls POST /api/v1/auth/login/ with email and password.
- Access and refresh tokens are stored in browser session storage for the current tab/session.
- The interceptor attaches the access token to protected API requests.
- On an API 401 response, the interceptor attempts a refresh request; SimpleJWT refresh rotation is supported.
- Only ADMIN and SUPER_ADMIN application roles can enter the dashboard.
- Logout calls POST /api/v1/auth/logout/ and clears the local session.

Session storage is still accessible to JavaScript in the page. Production deployment must apply a strong Content Security Policy, avoid unsafe third-party scripts, enforce HTTPS, and consider a backend-for-frontend with HttpOnly cookies if the threat model requires stronger token isolation.

## Property management screen

The first dashboard module provides:

- Paginated property inventory.
- Search by property name/reference/location.
- Category filtering.
- Create/edit property forms.
- Required name, Google Maps link and PDF brochure on create.
- Optional developer, category/subcategory, listing type, INR price, area/unit, location label/address and description.
- Replace brochure when editing.
- Save as Draft or publish.
- Change availability status independently.
- Open the Google Maps link and uploaded brochure.
- Permanently delete a property after browser confirmation.

The frontend performs basic PDF extension and size checks. The Django API remains authoritative and validates the HTTPS Google Maps URL, PDF signature and 25 MB maximum file size.

## Local development

From repository root:

```powershell
cd backend
python manage.py runserver
```

In a second terminal:

```powershell
cd frontend/admin-dashboard
npm install
npm start
```

Open http://localhost:4200. The development proxy routes /api and /media to Django on 127.0.0.1:8000.

## Production routing

The production web server should serve the compiled static application and forward:
- /api/ to Django.
- /media/ to the configured persistent media storage.

Do not use Django's runserver or ephemeral local media storage in production.
