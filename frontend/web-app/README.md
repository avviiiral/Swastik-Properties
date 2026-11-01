# Swastik Properties — Unified Angular Frontend

One Angular SSR application serves both the public website and the protected Admin workspace. Start this application once; visitors use the public routes and administrators use the `/admin` routes on the same origin.

## Public experience

- Responsive public homepage with Residential, Commercial and Land entry points.
- Property catalogue with search, category and listing-purpose filters.
- Paginated property results and individual property detail pages.
- Property photographs and primary-image gallery from the backend property record, plus brochure and Google Maps links.
- Server-side rendering and dynamic property titles/descriptions.
- Public property requests bypass Admin authorization headers and receive only published catalogue data.

## Admin experience

- Admin/Super Admin sign-in at `/admin/login`.
- Protected property management at `/admin/properties`.
- Existing property inventory, search, category filter and pagination.
- Create/edit properties, upload/replace PDF brochures, upload multiple JPG/PNG/WEBP property photographs, select a primary photo, remove photos, publish/unpublish, change availability and permanently delete properties.
- JWT access-token handling, refresh-token rotation and logout revocation.
- Agent accounts are denied access to the Admin workspace.
- Planned scoped Site Content editor for Home, About, Blog and Contact, restricted to Admin and Super Admin. This is not a general-purpose CMS or page builder.

## Routes

| Route | Access |
|---|---|
| `/` | Public |
| `/properties` | Public |
| `/properties/:slug` | Public |
| `/admin/login` | Public sign-in screen |
| `/admin` | Admin / Super Admin; redirects to properties |
| `/admin/properties` | Admin / Super Admin |
| `/admin/site-content` | Admin / Super Admin (planned) |

## Local development (Windows PowerShell)

Start Django in one terminal:

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py runserver
```

Start the unified frontend once in another terminal:

```powershell
cd frontend/web-app
npm.cmd install
npm.cmd start
```

Open http://localhost:4200. The development proxy forwards `/api` and `/media` to Django at http://127.0.0.1:8000.

## Production SSR

```powershell
npm.cmd run build
$env:BACKEND_API_URL = "https://your-api-host/api/v1"
$env:PORT = "4000"
npm.cmd run serve:ssr
```

Set `BACKEND_API_URL` to the backend API base URL in the deployment environment. Configure the reverse proxy/CDN to route API and media requests appropriately.

The Admin routes are client-rendered so browser session storage is never accessed during server rendering. Public routes remain server-rendered.

## API dependencies

- `GET /api/v1/properties/`
- `GET /api/v1/properties/{slug}/`
- `POST /api/v1/auth/login/`
- `POST /api/v1/auth/token/refresh/`
- `POST /api/v1/auth/logout/`
- Planned: `/api/v1/site-content/` and `/api/v1/site-content/{section}/` for authenticated Admin content management.
- Planned: `/api/v1/public/site-content/{section}/` for public read-only content.
- Admin property CRUD endpoints under `/api/v1/properties/`

The public property API returns published properties only. Customer enquiry forms are connected to the submissions API. Site Content APIs are planned; do not assume Home/About/Blog/Contact are database-backed until implementation and verification are complete. Property price and budget fields are prohibited.


## Source structure

- `src/app/pages/home` — public homepage.
- `src/app/pages/about` — public About page.
- `src/app/pages/contact` — public contact and lead forms.
- Planned: `src/app/admin/features/site-content` — structured content editor for Home, About, Blog and Contact.
- `src/app/pages/properties` — searchable property catalogue.
- `src/app/pages/property-detail` — individual property details and photo gallery.
- `src/app/layout/public-layout` — public header, navigation and contact footer.
- `src/app/admin/features/auth` — Admin sign-in page.
- `src/app/admin/features/properties` — Admin property management page.
- `src/app/core/services` and `src/app/core/models` — shared API services and data contracts.

Both public and Admin routes use this single Angular workspace and one development server.

## Swastik Properties contact details

The public footer displays the supplied business contact details for Sangram Pawar, Director:
- Phone: +91 9403129403
- Email: sangramspawar@gmail.com
- Office: Plot No. 72, Sector F 1, N-4, CIDCO, Chh. Sambhajinagar.
