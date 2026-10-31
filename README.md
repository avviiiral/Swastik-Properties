# Swastik Properties

Real-estate listing and enquiry platform. One Angular 22 SSR frontend serves the public website and protected Admin workspace, backed by Django 5.2 + Django REST Framework.

## Technology
- Backend: Python 3.12, Django 5.2, Django REST Framework.
- Database: PostgreSQL target; SQLite local fallback.
- Authentication: SimpleJWT with refresh rotation and blacklist.
- Frontend: one Angular 22 SSR application.
- API docs: drf-spectacular.

## Local setup — Windows PowerShell

### Backend
From repository root:
```powershell
cd backend
py -3.12 -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```
Set DJANGO_SECRET_KEY in backend/.env. Leave DATABASE_URL empty for local SQLite. Then:
```powershell
python manage.py check
python manage.py migrate
python manage.py test
python manage.py seed_maharashtra_locations
python manage.py createsuperuser
python manage.py runserver
```
Optional demo editorial data (DEBUG only; all samples are DRAFT and labelled DEMO):
```powershell
python manage.py seed_demo_blog
```
To add a Blog Editor, create a user with role EDITOR through Super Admin user management (or a trusted local Django shell).

### Unified Angular app
In a second terminal:
```powershell
cd frontend/web-app
npm.cmd install
npm.cmd start
```
Open http://localhost:4200. The development proxy forwards /api and /media to Django at http://127.0.0.1:8000.

### Routes
| Route | Purpose | Access |
|---|---|---|
| / | Public homepage | Everyone |
| /properties | Published property catalogue | Everyone |
| /properties/{slug} | Published property details | Everyone |
| /about | About Swastik | Everyone |
| /blog | Published Blog posts | Everyone |
| /blog/{slug} | Published Blog article | Everyone |
| /admin/login | Workspace sign-in | Admin, Super Admin, Editor |
| /admin | Admin dashboard | Admin, Super Admin |
| /admin/properties | Property management | Admin, Super Admin |
| /admin/blog | Blog management | Editor, Super Admin |
| /admin/users | User management | Admin, Super Admin |

After login, EDITOR lands on /admin/blog; ADMIN and SUPER_ADMIN land on /admin. AGENT accounts retain their existing restricted access and cannot enter the workspace.

Build the SSR application:
```powershell
npm.cmd run build
```
Run production SSR:
```powershell
$env:BACKEND_API_URL = "https://your-api-host/api/v1"
$env:PORT = "4000"
npm.cmd run serve:ssr
```

## APIs

Authentication/user endpoints:
- POST /api/v1/auth/login/
- POST /api/v1/auth/token/refresh/
- POST /api/v1/auth/logout/
- GET /api/v1/auth/me/
- GET/POST /api/v1/auth/users/
- GET/PATCH/DELETE /api/v1/auth/users/{id}/
- POST /api/v1/auth/users/{id}/activation/

Public Blog:
- GET /api/v1/blog/posts/ (search, category, pagination)
- GET /api/v1/blog/posts/{slug}/

Blog management (EDITOR/SUPER_ADMIN):
- GET/POST /api/v1/blog/manage/posts/
- GET/PATCH/PUT/DELETE /api/v1/blog/manage/posts/{id}/
- POST /api/v1/blog/manage/posts/{id}/publish/
- POST /api/v1/blog/manage/posts/{id}/unpublish/

Property APIs:
- GET/POST /api/v1/properties/
- GET/PATCH/PUT/DELETE /api/v1/properties/{slug}/
- GET/POST /api/v1/properties/{slug}/images/
- PATCH/DELETE /api/v1/properties/{slug}/images/{image_id}/

Location APIs:
- GET /api/v1/locations/states/
- GET /api/v1/locations/districts/?state={id}
- GET /api/v1/locations/cities/?district={id}
- GET /api/v1/locations/localities/?city={id}

## Role matrix

| Capability | SUPER_ADMIN | ADMIN | EDITOR | AGENT |
|---|---|---|---|---|
| Property management | Yes | Yes | No | Existing rules |
| Blog management | Yes | No | Yes | No |
| User management | All roles | EDITOR + AGENT | No | No |
| Permanent user deletion | Yes | No | No | No |

The Blog module is a scoped exception to the no-CMS rule; it is not a general-purpose CMS. Public Blog reads only PUBLISHED articles. Public property reads only PUBLISHED properties. Admin deactivation is preferred to deletion; only Super Admin can permanently delete user accounts.

Swagger UI: /api/docs/; OpenAPI schema: /api/schema/.
