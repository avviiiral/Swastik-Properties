# Swastik Properties — Unified Angular Frontend

One Angular SSR application serves both the public website and the protected Admin workspace. Start this application once; visitors use the public routes and administrators use the `/admin` routes on the same origin.

## Public experience

- Responsive public homepage with Residential, Commercial and Land entry points.
- Property catalogue with search, category and listing-purpose filters.
- Paginated property results and individual property detail pages.
- Brochure and Google Maps links from the backend property record.
- Server-side rendering and dynamic property titles/descriptions.
- Public property requests bypass Admin authorization headers and receive only published catalogue data.

## Admin experience

- Admin/Super Admin sign-in at `/admin/login`.
- Protected property management at `/admin/properties`.
- Existing property inventory, search, category filter and pagination.
- Create/edit properties, upload/replace PDF brochures, publish/unpublish, change availability and permanently delete properties.
- JWT access-token handling, refresh-token rotation and logout revocation.
- Agent accounts are denied access to the Admin workspace.
- No CMS, page builder or public content-management tools.

## Routes

| Route | Access |
|---|---|
| `/` | Public |
| `/properties` | Public |
| `/properties/:slug` | Public |
| `/admin/login` | Public sign-in screen |
| `/admin` | Admin / Super Admin; redirects to properties |
| `/admin/properties` | Admin / Super Admin |

## Local development (Windows PowerShell)

Start Django in one terminal:

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py runserver
```

Start the unified frontend once in another terminal:

```powershell
cd frontend/public-website
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
- Admin property CRUD endpoints under `/api/v1/properties/`

The public API returns published properties only. Customer enquiry forms will be added when the agreed submissions API is implemented.
