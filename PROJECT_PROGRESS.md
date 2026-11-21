# Swastik Properties — Project Progress

## Verified platform baseline

- Django 5.2 + Django REST Framework backend with JWT login, refresh rotation and blacklist.
- SUPER_ADMIN, ADMIN, EDITOR and AGENT role model.
- Property inventory with publication/availability workflow, brochure uploads, image galleries and normalized location references.
- Public six-form lead intake, consent timestamp, anonymous throttling and honeypot screening.
- Admin lead inbox with filters, status progression, private notes and CSV export.
- Blog public read APIs and Admin/Super Admin article management.
- One Angular 22 SSR application serves public pages and protected Admin routes.

## Public website and visual system

- [x] Public homepage, About, Contact, Blog, property detail, branded 404 and Thank You routes.
- [x] Public form success destinations use `/thank-you`.
- [x] Shared Quiet Luxury palette and typography normalized across public routes in `frontend/web-app/src/styles.css`.
- [x] Shared public header, page hero bands, content surfaces, cards, forms, buttons and footer aligned to the same design system.
- [x] Homepage discovery destinations derive from actual published property records rather than a hardcoded city list.

## Unified Buy / Rent / Lease marketplace

- [x] Route `/properties` uses the dedicated `PropertyMarketplaceComponent`.
- [x] Buy maps to API listing type `SALE`; Rent and Lease map to their matching listing types.
- [x] Search, category, minimum/maximum area, sorting, active filter chips and reset use existing API filters.
- [x] Saved listings use the existing `PublicPropertyState` service.
- [x] Compare up to three listings using fields actually returned by the API.
- [x] Responsive filter sheet and mobile filter/map controls.
- [x] Visit and callback actions navigate to property detail enquiry forms.
- [x] Selected listing has an address-based Google Maps preview.
- [ ] Replace address preview with synchronized multi-property map only after reliable geocoding/coordinates are available.
- [ ] Add richer financial/property filters only after the backend exposes validated fields and business rules.
- [ ] Browser QA across desktop and mobile viewports.

## CRM backend foundation — feature/all-in-one-platform

- [x] Nullable lead assignment fields: assigned agent, assigning user and assignment timestamp.
- [x] Lead activity records for notes, status changes and assignments.
- [x] Admin-only assignment/unassignment endpoint; eligible assignees are active AGENT accounts.
- [x] Agent list/detail/activity API support scoped to leads assigned to the authenticated agent.
- [x] Regression tests for cross-agent isolation, status updates, activity notes and assignment permissions.
- [ ] Angular agent workspace and Admin assignment controls.
- [ ] Follow-up tasks, reminders, site visits and conversion/loss outcomes.
- [ ] Run and review complete backend CI and frontend CI for the latest documentation-aligned head.

## Database migration operations

Migration `submissions.0004_lead_assignment_and_activity` adds lead assignment fields, the assignment/status index and LeadActivity. It is already represented in source control. A local SQLite error such as `no such column: submissions_propertyenquiry.assigned_to_id` indicates that the local database has not applied the existing migration; run `python manage.py showmigrations submissions` and `python manage.py migrate`. Do not generate a duplicate migration for this condition.

## Known marketplace/API limitations

- Current property API does not provide price, EMI, bedrooms, bathrooms, deposit, furnishing, lock-in, lease escalation or parking fields.
- The marketplace does not invent those values; pricing is represented as “Contact for pricing”.
- The map is an address preview for the selected property, not a synchronized map of all result pins.
- Favourites/comparison remain browser-side and are not a customer portal.

## Verification status

- Latest previously inspected branch head before this documentation update: `3dc5f7656fd432cc5ecc752a678a22a72363ea1f`.
- Theme normalization was committed; browser visual regression was not performed.
- Marketplace CI runs were previously observed running; do not treat them as passed without checking the current workflow run results.
- Local developer database migrations have not been run by this repository update.
- Run the commands below after pulling the branch.

## Local verification

Backend:

```powershell
cd backend
python manage.py check
python manage.py makemigrations --check --dry-run
python manage.py showmigrations
python manage.py migrate
python manage.py test
```

Frontend:

```powershell
cd frontend/web-app
npm.cmd install
npm.cmd run build
```

Browser QA should cover public navigation, Buy/Rent/Lease filters, saved/compare state, property details, enquiry/site-visit submission, responsive layouts and Admin permission boundaries.

## Next phase — planned, not implemented

- Angular agent workspace and Admin assignment controls.
- CRM follow-up tasks, reminders, site visits and lifecycle outcomes.
- Customer portal with server-synchronized saved listings and enquiry history.
- Additional property attributes only after business approval and API/schema implementation.
- Admin-managed public Site Content CMS. No `/admin/site-content` route or database-backed Site Content API is currently documented as shipped.
- Notifications, analytics/Power BI and production-readiness hardening.
