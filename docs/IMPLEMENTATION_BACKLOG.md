# Swastik Properties — Implementation Backlog

Status reflects the documented branch capabilities; verify source and CI before release.

## Platform foundation

- [x] Django project and domain applications.
- [x] Custom User model and role model.
- [x] Environment-based settings and safe local defaults.
- [x] Email-based JWT login, refresh rotation and logout.
- [x] Role-aware user management and account tests.
- [x] Backend GitHub Actions workflow.
- [x] Normalized State → District → City → Locality reference models and lookup APIs.

## Property inventory and media

- [x] Property catalogue and generated references/slugs.
- [x] Admin/Super Admin property create/edit/delete workflow.
- [x] Google Maps link and PDF brochure validation.
- [x] Publication and availability states.
- [x] Public published-only property visibility.
- [x] Multiple property photos, primary image selection and removal.
- [x] No price/currency/budget fields in the property contract.
- [ ] Business-approved Residential, Commercial and Land subtype attributes.
- [ ] Property activity/audit logging.
- [ ] Agent-owned property creation and approval workflow.
- [ ] Verify deletion behavior for all related submission references and media.

## Public website and unified marketplace

- [x] Angular SSR public website and shared public layout.
- [x] Homepage, About, Contact, Blog, property detail, Thank You and branded not-found routes.
- [x] Unified Buy / Rent / Lease marketplace at `/properties`.
- [x] Search, category, area bounds, sort and active filter/reset behavior using supported API fields.
- [x] Saved properties and comparison up to three records in browser-side state.
- [x] Responsive filter controls and selected-property address map preview.
- [x] Visit/callback actions linked to property detail forms.
- [x] Shared Quiet Luxury palette and typography normalized across public routes.
- [ ] Full browser QA for desktop/mobile, accessibility and visual regressions.
- [ ] Synchronized multi-pin map after reliable geocoding is available.
- [ ] Richer property/commercial filters after approved API fields exist.

## Lead intake and CRM

- [x] Six public lead form categories and server-side validation.
- [x] Consent timestamp, anonymous throttling and honeypot screening.
- [x] Admin lead inbox, filters, status changes, private notes and CSV export.
- [x] Nullable agent assignment and assignment metadata.
- [x] Lead activity timeline.
- [x] Admin assignment/unassignment API and active-agent validation.
- [x] Agent-scoped lead API foundation and isolation tests.
- [ ] Angular agent workspace and Admin assignment UI.
- [ ] Follow-up tasks, reminders, site visits and conversion/loss outcomes.

## Blog

- [x] Public published-only Blog API.
- [x] Admin/Super Admin article management and publication lifecycle.
- [ ] Verify editorial UI/API coverage against all supported Blog fields and upload constraints.

## Site Content CMS (not shipped)

- [ ] Define bounded structured sections and versioned schemas.
- [ ] Add Django model and migration.
- [ ] Add ADMIN/SUPER_ADMIN management APIs and public published-only APIs.
- [ ] Build Admin editor for Home/About/Blog landing/Contact.
- [ ] Connect public routes to verified persisted content.
- [ ] Add sanitization, upload validation, preview, audit and permission tests.
- [ ] Remove CMS route/API references from documentation until implementation is verified.

## Quality and release

- [ ] Run `python manage.py check`, migration consistency check and full backend tests.
- [ ] Apply migrations on local development database and verify migration state.
- [ ] Run Angular production SSR build.
- [ ] Review CI for the exact release commit.
- [ ] Browser QA public forms, property detail, marketplace modes, mobile layouts and Admin permission boundaries.
- [ ] Verify PostgreSQL deployment, persistent media, backups, HTTPS/CSP and monitoring.
- [ ] Generate/verify dynamic sitemap for published property routes.
