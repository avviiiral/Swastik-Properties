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
The Site Content CMS is planned but is not yet available. Public website copy remains maintained in the Angular application until the CMS workstream is delivered.

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
| /contact | General, property, buy, rent, sell and listing enquiries | Everyone |
| /blog | Published Blog posts | Everyone |
| /blog/{slug} | Published Blog article | Everyone |
| /admin/login | Workspace sign-in | Admin, Super Admin |
| /admin | Admin dashboard | Admin, Super Admin |
| /admin/site-content | Manage public website content (Home, About, Blog, Contact) | Admin, Super Admin |
| /admin/properties | Property management | Admin, Super Admin |
| /admin/blog | Blog management | Editor, Super Admin |
| /admin/users | User management | Admin, Super Admin |

After login, ADMIN and SUPER_ADMIN land on /admin. AGENT accounts do not currently have an interactive agent workspace; assigned-lead API support is being added incrementally. EDITOR access is limited to blog management.

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

CMS endpoints are not yet implemented. See [the delivery roadmap](docs/ALL_IN_ONE_PLATFORM_ROADMAP.md).\n\nBlog article management (ADMIN/SUPER_ADMIN):
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
- POST /api/v1/submissions/leads/ — public intake for all six website form types.
- GET /api/v1/submissions/property-enquiries/ — administrator-only lead inbox with type, status and search filters.
- PATCH /api/v1/submissions/property-enquiries/{id}/ — administrator-only status and internal notes update.
- GET /api/v1/submissions/property-enquiries/export/ — administrator-only CSV export of all lead fields and filters.
- GET /api/v1/locations/states/
- GET /api/v1/locations/districts/?state={id}
- GET /api/v1/locations/cities/?district={id}
- GET /api/v1/locations/localities/?city={id}

## Role matrix

| Capability | SUPER_ADMIN | ADMIN | EDITOR | AGENT |
|---|---|---|---|---|
| Property management | Yes | Yes | No | Existing rules |
| Public website content (Home, About, Blog, Contact) | Yes | Yes | No | No |
| User management | All roles | EDITOR + AGENT | No | No |
| Permanent user deletion | Yes | No | No | No |

The CMS is a planned bounded editor, not yet implemented. Property pages and lead intake intentionally contain no price or budget fields.

Swagger UI: /api/docs/; OpenAPI schema: /api/schema/.
