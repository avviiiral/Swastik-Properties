# Swastik Properties

Swastik Properties is a real-estate listing and enquiry platform with a separate public website, administration dashboard and Django REST API.

## Technology

- Backend: Python 3.12, Django 5.2, Django REST Framework.
- Database: PostgreSQL target; SQLite local fallback.
- Authentication: SimpleJWT with refresh-token rotation and revocation.
- Admin dashboard: Angular 22 standalone SPA.
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

### Admin dashboard

In a second terminal, from the repository root:

```powershell
cd frontend/admin-dashboard
npm install
npm start
```

Open http://localhost:4200. The development proxy forwards /api and /media requests to Django at http://127.0.0.1:8000.

Sign in with a user whose application role is ADMIN or SUPER_ADMIN. Agent accounts cannot access the Admin Dashboard.

Build static files with:

```powershell
npm run build
```

Output: frontend/admin-dashboard/dist/admin-dashboard.

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

A new property requires a name, HTTPS Google Maps URL and PDF brochure. The backend generates its reference and slug, validates the brochure, and saves it as DRAFT by default.

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
