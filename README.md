# Swastik Properties

Swastik Properties is a real-estate listing and enquiry platform. One Angular SSR frontend serves both the public website and the protected Admin workspace, backed by a Django REST API.

## Technology

- Backend: Python 3.12, Django 5.2, Django REST Framework.
- Database: PostgreSQL target; SQLite local fallback.
- Authentication: SimpleJWT with refresh-token rotation and revocation.
- Frontend: one Angular 22 SSR application for public and Admin routes.
- API documentation: drf-spectacular OpenAPI/Swagger.

## Local setup (Windows PowerShell)

### Backend

From the repository root:

```powershell
cd backend
py -3.12 -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit backend/.env and set a unique DJANGO_SECRET_KEY. Generate one with:

```powershell
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

For a first local run, leave DATABASE_URL empty; development settings then use SQLite. Then run:

```powershell
python manage.py check
python manage.py migrate
python manage.py test apps.accounts apps.locations apps.properties
python manage.py seed_maharashtra_locations
python manage.py createsuperuser
python manage.py runserver
```

### Unified frontend (Public + Admin)

In a second terminal, from the repository root:

```powershell
cd frontend/public-website
npm.cmd install
npm.cmd start
```

Open http://localhost:4200. The Angular development proxy forwards `/api` and `/media` to Django at http://127.0.0.1:8000.

Both experiences are served by this single frontend process:

| Route | Purpose | Access |
|---|---|---|
| `/` | Public homepage | Everyone |
| `/properties` | Public property catalogue | Everyone; published listings only |
| `/properties/{slug}` | Public property details | Everyone; published listings only |
| `/admin/login` | Admin sign-in | Admin / Super Admin credentials |
| `/admin/properties` | Property management | Authenticated Admin / Super Admin only |

The public website contains an Admin link in its navigation and footer. Agents cannot access the Admin workspace. Public property API requests explicitly bypass any Admin JWT stored in the browser, preserving the published-only public view even while an Admin is signed in.

Build the unified application with:

```powershell
npm.cmd run build
```

Run the production SSR server with:

```powershell
$env:BACKEND_API_URL = "https://your-api-host/api/v1"
$env:PORT = "4000"
npm.cmd run serve:ssr
```

The former `frontend/admin-dashboard` workspace is retained temporarily for reference. Do not start it separately; all active public and Admin UI development belongs in `frontend/public-website`.

## Authentication API

- POST /api/v1/auth/login/ — email/password login; returns access, refresh and user.
- POST /api/v1/auth/token/refresh/ — rotate refresh token and issue a new access token.
- POST /api/v1/auth/logout/ — revoke the authenticated user's refresh token.
- GET /api/v1/auth/me/ — current user's profile.
- GET/POST /api/v1/auth/users/ — role-limited user management.
- GET/PATCH /api/v1/auth/users/{id}/ — retrieve/update manageable users.

## Property APIs

- GET /api/v1/properties/ — public list of published properties; administrators can list all.
- GET /api/v1/properties/{slug}/ — public detail of a published property; administrators can retrieve all.
- POST /api/v1/properties/ — Admin/Super Admin multipart upload.
- PATCH /api/v1/properties/{slug}/ — Admin/Super Admin update.
- DELETE /api/v1/properties/{slug}/ — permanent Admin/Super Admin deletion.
- GET /api/v1/properties/{slug}/images/ — public photo gallery for published properties.
- POST /api/v1/properties/{slug}/images/ — Admin/Super Admin multi-photo upload.
- PATCH /api/v1/properties/{slug}/images/{image_id}/ — set the primary photo.
- DELETE /api/v1/properties/{slug}/images/{image_id}/ — remove a photo.

A new property requires a name, HTTPS Google Maps URL and PDF brochure. The backend generates its reference and slug, validates the brochure, and saves it as DRAFT by default. Admins can upload up to 20 property photographs per request (JPG, JPEG, PNG or WEBP, maximum 10 MB each), choose a primary image and manage the public gallery. Deleting a property removes its brochure and image files.

## Location APIs

- GET /api/v1/locations/states/
- GET /api/v1/locations/districts/?state={state_id}
- GET /api/v1/locations/cities/?district={district_id}
- GET /api/v1/locations/localities/?city={city_id}

Location lookup endpoints are public and read-only. Super Admins maintain location records through Django Admin; the seed command creates Maharashtra and its 36 districts.

Swagger UI: /api/docs/; OpenAPI schema: /api/schema/.

## Project rules

- There is no CMS.
- Administrators manage property records directly.
- Property deletion is permanent; related customer submissions must be retained when that domain is implemented.
- Agents must not access customer submissions or exports.
- Admins manage Agent accounts; Super Admins manage Admin and Agent accounts.
