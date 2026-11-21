# Swastik Properties

A real-estate discovery and enquiry platform built with Django 5.2, Django REST Framework and one Angular 22 SSR application.

## Current capabilities

- Public website: Home, About, Contact, Blog, property marketplace and property detail pages.
- Unified Buy / Rent / Lease marketplace at `/properties`, backed by the existing published-property API.
- Search, category, area filters, sorting, active-filter chips and reset.
- Saved properties and comparison (up to three listings) using the existing public property state service.
- Property detail pages with enquiry and site-visit forms.
- Public lead intake for general enquiry, property enquiry, buy requirement, rent requirement, sell property and property listing.
- Admin property management, Blog management, and lead inbox with filtering, status updates, private notes and CSV export.
- CRM backend foundation for lead assignment and activity history, plus scoped agent APIs.
- Shared Quiet Luxury visual system across public pages.

## Technology

- Backend: Python 3.12, Django 5.2, Django REST Framework.
- Database: PostgreSQL target; SQLite local fallback.
- Authentication: SimpleJWT with refresh rotation and blacklist.
- Frontend: Angular 22 standalone application with SSR.
- API documentation: drf-spectacular.

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
```

Set `DJANGO_SECRET_KEY` in `backend/.env`. Leave `DATABASE_URL` empty for local SQLite unless you have configured PostgreSQL.

```powershell
python manage.py check
python manage.py showmigrations
python manage.py migrate
python manage.py test
python manage.py seed_maharashtra_locations
python manage.py createsuperuser
python manage.py runserver
```

Optional editorial demo data (DEBUG only; samples are drafts and labelled DEMO):

```powershell
python manage.py seed_demo_blog
```

If Django reports a missing database column (for example `submissions_propertyenquiry.assigned_to_id`), first inspect and apply the existing migrations. Do not create a duplicate migration merely to repair a local database:

```powershell
python manage.py showmigrations submissions
python manage.py migrate
python manage.py showmigrations submissions
```

Back up a local database before migrating if it contains data that must be retained.

### Angular frontend

In a second terminal:

```powershell
cd frontend/web-app
npm.cmd install
npm.cmd start
```

Open http://localhost:4200. The development proxy forwards `/api` and `/media` to Django at http://127.0.0.1:8000.

## Public routes

| Route | Purpose |
|---|---|
| `/` | Homepage |
| `/properties` | Unified Buy / Rent / Lease marketplace |
| `/properties/:slug` | Property details and enquiry/site-visit forms |
| `/about` | About Swastik |
| `/contact` | Public enquiry forms |
| `/blog` | Published Blog posts |
| `/blog/:slug` | Published Blog article |
| `/thank-you` | Form submission confirmation |
| `/404` | Branded not-found page |

Admin routes are protected by the Angular role guards and, critically, Django API permissions. See [Admin Workspace](docs/ADMIN_DASHBOARD.md).

## Marketplace data contract and limitations

The marketplace maps Buy to the API's `SALE` listing type and Rent / Lease to their corresponding listing types. It uses published records and fields already exposed by the existing property API.

The current API does not expose listing price, EMI, bedrooms, bathrooms, deposits, furnishing, lock-in, lease escalation or parking terms. The UI therefore displays “Contact for pricing” where relevant and does not fabricate commercial or physical attributes. The map panel is an address-based map preview for the selected listing, not a geocoded multi-pin map. See [API specification](docs/API_SPECIFICATION.md).

Saved items and comparison are browser-side state; they are not a server-synchronized customer account feature.

## Backend API overview

- Authentication: `/api/v1/auth/`
- Properties: `/api/v1/properties/`
- Public Blog: `/api/v1/blog/posts/`
- Blog management: `/api/v1/blog/manage/posts/`
- Public lead intake and Admin lead inbox: `/api/v1/submissions/`
- Locations: `/api/v1/locations/`

See [API Specification](docs/API_SPECIFICATION.md). Swagger UI is available at `/api/docs/`; OpenAPI schema at `/api/schema/`.

## Visual system

The public site uses a Quiet Luxury palette: Warm Alabaster `#F9F8F6`, Soft Stone `#EFECE6`, Deep Obsidian `#141413`, Warm Charcoal `#575550`, Brushed Champagne `#B59461` and Burnished Bronze `#967746`. Shared typography, navigation, page bands, cards, forms and footer styles are centralized in `frontend/web-app/src/styles.css`.

## Documentation

- [Project progress](PROJECT_PROGRESS.md)
- [All-in-one platform roadmap](docs/ALL_IN_ONE_PLATFORM_ROADMAP.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Business rules](docs/BUSINESS_RULES.md)
- [Database schema](docs/DATABASE_SCHEMA.md)
- [Admin workspace](docs/ADMIN_DASHBOARD.md)
- [Property upload workflow](docs/PROPERTY_UPLOAD_WORKFLOW.md)
- [Location data model](docs/LOCATION_DATA_MODEL.md)
- [Implementation backlog](docs/IMPLEMENTATION_BACKLOG.md)

## Build

```powershell
cd frontend/web-app
npm.cmd run build
```

Production SSR:

```powershell
$env:BACKEND_API_URL = "https://your-api-host/api/v1"
$env:PORT = "4000"
npm.cmd run serve:ssr
```

Configure HTTPS, persistent media storage, secrets, database backups and API/media reverse-proxy routing in the deployment environment. Never commit credentials or production data.
