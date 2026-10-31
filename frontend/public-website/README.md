# Swastik Properties — Public Website

A separate Angular SSR website for visitors browsing published property listings.

## Included
- Responsive public homepage with Residential, Commercial and Land entry points.
- Property catalogue with search, category and listing-purpose filters.
- Paginated property results and individual property detail pages.
- Brochure and Google Maps links from the backend property record.
- Server-side rendering, dynamic property titles/descriptions, robots.txt and a starter sitemap.
- No Admin sign-in, CMS or access to unpublished inventory.

## Run locally (Windows PowerShell)

Start Django in one terminal:

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py runserver
```

Start the website in another:

```powershell
cd frontend/public-website
npm.cmd install
npm.cmd start
```

Open http://localhost:4200. The development proxy forwards /api and /media to Django at http://127.0.0.1:8000.

## Production SSR

```powershell
npm.cmd run build
$env:BACKEND_API_URL = "https://your-api-host/api/v1"
$env:PORT = "4000"
npm.cmd run serve:ssr
```

Set BACKEND_API_URL to the backend API base URL in the deployment environment. Configure the reverse proxy/CDN to route API and media requests appropriately.

## API dependencies

- GET /api/v1/properties/
- GET /api/v1/properties/{slug}/

The public API returns published properties only. Search uses DRF's search parameter. Category, listing-purpose and availability filters are supported. Customer enquiry forms are not included in this initial public UI because the agreed submissions API is not yet implemented.
