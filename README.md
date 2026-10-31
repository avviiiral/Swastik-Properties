# Swastik Properties

Backend API for the Swastik Properties platform.

## Backend stack

- Python 3.12
- Django 5.2 LTS
- Django REST Framework
- PostgreSQL for the target deployment database
- SQLite as a no-configuration local development fallback
- SimpleJWT authentication with refresh-token rotation and revocation
- drf-spectacular OpenAPI/Swagger documentation

## Local setup (Windows PowerShell)

From the repository root:

```powershell
cd backend
py -3.12 -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `backend/.env` and set a unique `DJANGO_SECRET_KEY`. Generate one with:

```powershell
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

For a first local run, leave `DATABASE_URL=` empty; development settings then use SQLite. Once PostgreSQL is installed and the database/user have been created, set `DATABASE_URL` to the PostgreSQL connection string.

Then run:

```powershell
python manage.py check
python manage.py migrate
python manage.py test apps.accounts apps.locations
python manage.py seed_maharashtra_locations
python manage.py createsuperuser
python manage.py runserver
```

## Authentication API

- `POST /api/v1/auth/login/` — email/password login; returns access, refresh and user.
- `POST /api/v1/auth/token/refresh/` — rotate refresh token and issue a new access token.
- `POST /api/v1/auth/logout/` — revoke the authenticated user's refresh token.
- `GET /api/v1/auth/me/` — current user's profile.
- `GET/POST /api/v1/auth/users/` — role-limited user management.
- `GET/PATCH /api/v1/auth/users/{id}/` — retrieve/update manageable users.

## Location APIs

- `GET /api/v1/locations/states/`
- `GET /api/v1/locations/districts/?state={state_id}`
- `GET /api/v1/locations/cities/?district={district_id}`
- `GET /api/v1/locations/localities/?city={city_id}`

Location lookup endpoints are public and read-only. Super Admins maintain location records through Django Admin; the seed command creates Maharashtra and its 36 districts.

Swagger UI: `/api/docs/`; OpenAPI schema: `/api/schema/`.

## Django applications

- `accounts`: authentication, users and access roles.
- `properties`: property inventory and property lifecycle.
- `locations`: normalized State → District → City → Locality reference data.
- `agents`: agent-specific business profile and assignments.
- `submissions`: public form submissions and administrator-only review/export.
- `common`: shared models and utilities.

## Project decisions

- There is no CMS.
- Administrators manage properties directly.
- Property deletion is permanent, subject to explicit handling of dependent records and uploaded files.
- Customer form submissions must be retained when a related property is deleted.
- Agents must not have access to form submissions or exports.
- Admins manage Agent accounts; Super Admins manage Admin and Agent accounts.
