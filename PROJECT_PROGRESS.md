# Swastik Properties — Project Progress

## Existing platform baseline
- Django 5.2 + DRF backend with JWT login, rotation and blacklist.
- SUPER_ADMIN, ADMIN, EDITOR and AGENT role boundaries.
- Maharashtra location hierarchy and public read APIs.
- Property inventory, approval/publication workflow, brochure uploads and image galleries.
- One Angular 22 SSR application serves public and protected Admin routes.

## New work — feature/property-lead-management
- [x] Add one public Contact page with six guided form types: general enquiry, property enquiry, buy requirement, rent requirement, sell property and list property.
- [x] Store all new form submissions in the existing lead table; preserve historical property enquiries and the original property enquiry API.
- [x] Capture contact consent timestamp; validate contact details and type-specific location/budget inputs.
- [x] Add anonymous submission throttling and a honeypot field for basic spam screening.
- [x] Add Admin-only lead inbox with form-type/status/search filters, pagination, private notes and status progression.
- [x] Add filter-aware CSV export including structured requirement details and consent timestamp; protect CSV cells from spreadsheet formula injection.
- [x] Add direct call/email/WhatsApp follow-up links and Admin navigation to the full lead inbox.
- [x] Add public property catalogue price range filters, locality/city/district search and sort options.
- [x] Update API, database, admin workspace and setup documentation.
- [ ] Run backend and frontend GitHub Actions checks and resolve any failures.
- [ ] Verify migration and SSR build against the deployment database.
- [ ] Browser-check public forms, mobile/desktop layouts, admin lead updates and CSV downloads.

## Local verification commands
Backend (from `backend`):
```powershell
python manage.py makemigrations --check --dry-run
python manage.py check
python manage.py migrate --noinput
python manage.py test apps.submissions apps.properties
```

Frontend (from `frontend/web-app`):
```powershell
npm.cmd install
npm.cmd run build
```

## Deferred recommendations
- Add property-specific subtypes and fields after the business confirms the exact data to capture.
- Consider authenticated agent assignment only if the operating policy changes; customer submissions remain Admin-only in the current scope.
- Configure production PostgreSQL, persistent media storage, HTTPS, CSP, backups and monitoring before launch.
