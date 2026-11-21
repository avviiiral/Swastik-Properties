# Swastik Properties — Unified Angular Frontend

One Angular 22 SSR application serves the public website and protected Admin workspace. Start the frontend once; public routes and `/admin` routes share the same origin and build.

## Public experience

- Responsive homepage with Residential, Commercial and Land discovery entry points.
- Unified property marketplace at `/properties` with Buy, Rent and Lease modes.
- Search, category, min/max area, sorting, filter chips and reset using existing API-supported fields.
- Mode-aware listing cards, browser-side saved properties and compare (up to three listings).
- Selected-property address map preview; not a synchronized geospatial map with pins for every result.
- Property detail pages with photographs, brochure/location links and enquiry/site-visit forms.
- About, Contact, Blog, Thank You and branded not-found pages.
- Public property requests use the public API path and return published listings only.

## Marketplace data contract

Buy maps to the API listing type `SALE`; Rent and Lease use their corresponding listing types. Current API data does not include price, EMI, bedrooms, bathrooms, deposits, furnishing, lock-in, lease escalation or parking terms. The UI does not fabricate these values and displays “Contact for pricing” as appropriate.

Saved listings and compare state use the existing browser-side `PublicPropertyState` service; they are not synchronized to a customer account.

Visit and callback actions navigate to the property detail page and its enquiry/site-visit form anchors.

## Visual system

The public site uses the Quiet Luxury palette:
- Warm Alabaster `#F9F8F6`
- Soft Stone `#EFECE6`
- Deep Obsidian `#141413`
- Warm Charcoal `#575550`
- Brushed Champagne `#B59461`
- Burnished Bronze `#967746`

Global tokens and cross-route typography, navigation, hero bands, cards, forms and footer styling are maintained in `src/styles.css`.

## Admin experience

- Admin/Super Admin sign-in at `/admin/login`.
- Protected property management, lead inbox, Blog management and user management routes according to current route/role configuration.
- Property CRUD, brochure/gallery uploads, publication and availability controls.
- Lead review, filters, private notes, status updates and CSV export.
- CRM backend assignment/activity support exists; a complete Angular agent workspace and assignment controls are not yet delivered.
- No `/admin/site-content` CMS route is currently shipped.

## Routes

| Route | Access |
|---|---|
| `/` | Public |
| `/properties` | Public |
| `/properties/:slug` | Public |
| `/about`, `/contact`, `/blog`, `/blog/:slug` | Public |
| `/thank-you`, `/404` | Public |
| `/admin/login` | Public sign-in |
| `/admin/**` | Role-guarded; Django APIs enforce permissions |

## Local development — Windows PowerShell

Backend terminal:

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py runserver
```

Frontend terminal:

```powershell
cd frontend/web-app
npm.cmd install
npm.cmd start
```

Open http://localhost:4200. The development proxy forwards `/api` and `/media` to Django at http://127.0.0.1:8000.

## SSR build and production

```powershell
npm.cmd run build
$env:BACKEND_API_URL = "https://your-api-host/api/v1"
$env:PORT = "4000"
npm.cmd run serve:ssr
```

Admin routes are client-rendered because browser session storage is used for authentication. Public routes remain SSR-capable. Configure reverse-proxy routing, HTTPS and persistent media storage in the deployment environment.

## API dependencies

- `GET /api/v1/properties/`
- `GET /api/v1/properties/{slug}/`
- `POST /api/v1/submissions/leads/` and the related Admin lead endpoints
- Public Blog endpoints under `/api/v1/blog/posts/`
- Authentication endpoints under `/api/v1/auth/`

See the repository-level API specification and generated OpenAPI schema for exact query parameters and payload fields.

## Source structure

- `src/app/pages/home` — homepage.
- `src/app/pages/about` — About page.
- `src/app/pages/contact` — public lead forms.
- `src/app/pages/properties` — catalogue and marketplace.
- `src/app/pages/property-detail` — property detail and enquiry forms.
- `src/app/pages/blog` — Blog list/detail.
- `src/app/layout/public-layout` — shared public header/footer.
- `src/app/admin` — protected Admin features.
- `src/app/core/services` and `src/app/core/models` — API clients and shared contracts.

The backend and generated OpenAPI schema remain authoritative when a documentation summary differs from implementation.
