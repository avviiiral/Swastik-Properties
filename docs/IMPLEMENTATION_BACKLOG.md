# Swastik Properties — Implementation Backlog

## Foundation

- [x] Create Django project and six domain applications.
- [x] Add custom User model with Super Admin, Admin and Agent roles.
- [x] Add environment-based settings and safe local defaults.
- [x] Implement email-based JWT login, refresh and logout.
- [x] Implement role-based user management and account tests.
- [x] Add GitHub Actions backend CI workflow.
- [x] Implement normalized State → District → City → Locality reference models and public lookup APIs.

## Property catalogue

- [x] Remove property price and currency completely from the property model, Admin interface, API and public website.
- [x] Remove public price display, price filtering and price sorting; use area information and area filters instead.

- [x] Add the initial Property catalogue model and generated property reference/slug.
- [x] Support Admin/Super Admin multipart property creation with required name, Google Maps link and PDF brochure.
- [x] Validate Google Maps destination links and PDF signature/size.
- [x] Extract coordinates from supported Google Maps URLs when embedded.
- [x] Add optional category, listing type, area and normalized locality fields.
- [x] Add separate publication and availability states.
- [x] Restrict public catalogue reads to published properties.
- [x] Restrict create/update/permanent delete operations to Admin and Super Admin.
- [x] Remove the uploaded brochure when its property is permanently deleted.
- [ ] Implement category-specific Residential, Commercial and Land detail tables.
- [x] Implement multi-photo property uploads, primary-image selection, image removal and public property galleries.
- [ ] Add property activity/audit logging.
- [ ] Implement agent-owned property creation, assignment and approval workflow.

## Admin dashboard (integrated into unified frontend)

- [x] Build the initial standalone Angular Admin SPA workspace (superseded by the unified frontend below).
- [x] Add Admin/Super Admin sign-in and JWT refresh handling.
- [x] Add property listing, search and category filtering.
- [x] Add property creation/editing with PDF upload and Google Maps link.
- [x] Add publish/unpublish, availability update and permanent delete actions.
- [ ] Verify unified Angular build and public/Admin navigation and CRUD flows locally on Windows.

## Admin-managed public website content

- [ ] Create Site Content model and migration for Home, About, Blog and Contact sections.
- [ ] Define versioned schemas and validators for each section.
- [ ] Add authenticated ADMIN/SUPER_ADMIN list, retrieve and partial-update APIs.
- [ ] Add public read-only APIs exposing published content only.
- [ ] Build `/admin/site-content` with section navigation, edit forms, repeatable-list controls, media upload, preview and save states.
- [ ] Connect public pages to database-backed content with safe fallback values.
- [ ] Make About story, values, process, service areas, statistics and team entries editable; remove TODO placeholders only after verified data is supplied.
- [ ] Support Blog landing copy and article CRUD/publication under Admin content management.
- [ ] Support Contact page copy and contact display settings without changing lead form validation/storage.
- [ ] Add audit metadata, permission/validation/sanitization/public-visibility tests.
- [ ] Standardize page colors with deep green, warm ivory and champagne gold; verify accessible contrast.

## Website forms and submissions

- [x] Define form-specific submission schemas and validators.
- [x] Implement administrator-only submission access.
- [x] Implement downloadable submission exports for all agreed forms.
- [ ] Preserve customer submissions when a related property is permanently deleted.

## Quality and delivery

- [ ] Verify migrations and tests locally on Windows.
- [ ] Verify migrations and tests against PostgreSQL.
- [ ] Publish and review OpenAPI/Swagger documentation.
- [ ] Add production media storage and delivery configuration.
- [ ] Add deployment configuration and production security checks.
- [x] Build the public-facing Angular SSR website with homepage, property search/filtering, detail routes and public-only API access.
- [x] Integrate Admin login, JWT refresh and property management under protected `/admin` routes in the same Angular app.
- [x] Ensure public property HTTP requests do not inherit the Admin JWT.
- [x] Use one frontend development server and a unified Angular SSR build for public and Admin routes.
- [x] Connect customer enquiry forms to the submissions API.
- [ ] Generate a dynamic sitemap for published property detail routes.
