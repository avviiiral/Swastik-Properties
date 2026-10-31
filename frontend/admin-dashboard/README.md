# Swastik Properties — Admin Dashboard

A separate Angular SPA for Admin and Super Admin operations. This is not a CMS and does not provide website page editing.

## Requirements

- Node.js 24.15.0 or newer in the Node 24 line.
- npm installed with Node.js.
- Django backend running at http://127.0.0.1:8000.

## Local setup (Windows PowerShell)

From the repository root:

```powershell
cd frontend/admin-dashboard
npm install
npm start
```

Open http://localhost:4200.

The development proxy forwards /api/* and /media/* to http://127.0.0.1:8000.

Start Django in a second terminal:

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py runserver
```

Sign in with an account whose application role is ADMIN or SUPER_ADMIN. Agent accounts are not permitted to use this dashboard.

## Current functionality

- Email/password login against POST /api/v1/auth/login/.
- Access-token authentication and refresh-token rotation.
- Admin property catalogue listing and search.
- Create a property with the required name, Google Maps URL and PDF brochure.
- Edit property details and replace a brochure.
- Publish/unpublish, update availability, and permanently delete a property.
- View the uploaded brochure and open its Google Maps destination.

New property records default to DRAFT. Only published properties appear to anonymous users of the public API.

## Production

The Admin SPA expects the API at /api/v1 and media files at /media on the same origin. Configure the production reverse proxy to route these paths to Django.

Build with:

```powershell
npm run build
```

Output: dist/admin-dashboard.
