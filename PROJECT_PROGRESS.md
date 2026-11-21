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
- [x] Capture contact consent timestamp; validate contact details and type-specific location inputs. Price and budget fields are excluded.
- [x] Add anonymous submission throttling and a honeypot field for basic spam screening.
- [x] Add Admin-only lead inbox with form-type/status/search filters, pagination, private notes and status progression.
- [x] Add filter-aware CSV export including structured requirement details and consent timestamp; protect CSV cells from spreadsheet formula injection.
- [x] Add direct call/email/WhatsApp follow-up links and Admin navigation to the full lead inbox.
- [x] Add public property catalogue locality/city/district search and sort options; no price filters or price sorting.
- [x] Update API, database, admin workspace and setup documentation.
- [ ] Run frontend SSR build and browser QA; backend GitHub Actions is running for the CRM API changes.
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

## CRM foundation — feature/all-in-one-platform (in progress)\n- [x] Extend existing enquiry records with nullable agent assignment, assigning user and assignment timestamp; existing lead rows remain valid and unassigned.\n- [x] Add lead activity timeline records for notes, status changes and assignments.\n- [x] Add admin-only assignment/unassignment endpoint; only active AGENT accounts can be selected.\n- [x] Add agent list/detail/activity APIs with querysets scoped to the authenticated agent's assigned leads.\n- [x] Add regression tests for cross-agent isolation, status updates, activity notes and admin assignment permissions.\n- [ ] Add Angular agent workspace and integrate assignment controls in the Admin lead inbox.\n- [ ] Expand CRM lifecycle, follow-up tasks, site visits and conversion/loss outcomes.\n- [ ] Run all backend tests and inspect CI results for this commit.\n\n## Next phase — Admin-managed public website content (planned; not yet implemented)
- [ ] Add a Site Content workspace for Home, About, Blog and Contact.
- [ ] Persist structured editable copy, headings, calls to action, service areas, statistics, team profiles and contact display settings in the database.
- [ ] Add authenticated ADMIN/SUPER_ADMIN management APIs and public read-only APIs.
- [ ] Validate structured content, sanitize rich text, validate links and image uploads, and retain safe fallbacks.
- [ ] Add preview, save feedback, audit timestamps and permission tests.
- [ ] Replace hard-coded public-page copy and About-page TODO placeholders only when verified business information is supplied.
- [ ] Keep property inventory separate; never add price or budget fields.
- [ ] Apply the shared deep-green, warm-ivory and champagne-gold palette with accessible contrast.

## Deferred recommendations
- Add property-specific subtypes and fields after the business confirms the exact data to capture.
- Customer portal, AI search, notifications, analytics/Power BI and production-readiness work remain future roadmap items.
- Configure production PostgreSQL, persistent media storage, HTTPS, CSP, backups and monitoring before launch.
