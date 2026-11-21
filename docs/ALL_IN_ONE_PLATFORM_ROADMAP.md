# Swastik Properties — All-in-One Platform Roadmap

## Objective

Evolve the existing Angular 22 SSR + Django 5.2 / Django REST Framework application into a reliable real-estate operating platform without replacing its frontend, backend or existing business workflows.

## Non-negotiable constraints

- Preserve existing public URLs, API contracts, enquiries, property references, images and brochures unless a versioned change is explicitly approved.
- No property price, currency, customer budget or expected-amount fields are to be introduced into property data, forms, filters, lead details or analytics.
- Public enquiries remain available to guests; account creation is not required.
- Django enforces authorization and object ownership. Angular guards are only a UX layer.
- AI output must be grounded in real records, clearly advisory and human-approved before publication or customer communication.
- Keep credentials, tokens, customer PII and production configuration outside Git.

## Delivered baseline

- Public Home, About, Contact, Blog, property marketplace and property detail pages.
- Shared Quiet Luxury design system applied through the global stylesheet.
- Unified Buy / Rent / Lease marketplace at `/properties`, using existing published-property API data.
- Search, category, area bounds, sort, filter chips/reset, saved listings and comparison up to three records.
- Responsive filter controls and selected-listing address map preview.
- Property visit/callback actions linked to property detail forms.
- Property inventory, publication/availability workflow, PDF brochure and photo gallery.
- Six public lead form types, consent capture, anonymous throttling and honeypot.
- Admin lead inbox, status/notes, filters and CSV export.
- JWT roles: SUPER_ADMIN, ADMIN, EDITOR and AGENT.
- CRM backend foundation: nullable lead assignment, activity history and agent-scoped API support.
- Blog public read and Admin/Super Admin article management.

## Current marketplace contract and limitations

Buy is translated to the existing API listing type `SALE`; Rent and Lease use the corresponding listing types. Filters are restricted to fields currently supported by the API. Saved/compare state is browser-side. The map is an address-based preview of the selected listing, not a multi-pin synchronized geographic search.

The API does not currently expose price, EMI, bedrooms, bathrooms, deposits, furnishing, lock-in, lease escalation or parking terms. The UI must not infer or fabricate these fields. Add such filters only after business-approved model fields, validation, migrations, serializers, query filters and tests are implemented.

## Workstreams

### 0. Stabilization and release verification
- [ ] Run backend system checks, migration consistency checks, migrations and full tests.
- [ ] Run Angular production SSR build.
- [ ] Review CI runs for the exact release commit; do not infer pass status from an earlier commit.
- [ ] Browser-test public routes, marketplace modes, forms and responsive breakpoints.
- [ ] Verify PostgreSQL deployment migrations and media persistence.

### 1. Marketplace data and discovery
- [x] Unified Buy / Rent / Lease route and mode-aware API listing type.
- [x] Search, category, area bounds and sort using supported API fields.
- [x] Saved listings and up-to-three comparison in browser state.
- [x] Property detail visit and callback navigation.
- [ ] Introduce reliable geocoding and synchronized map/feed only after coordinates are consistently available.
- [ ] Add business-approved listing attributes and filters only after API/schema work.
- [ ] Consider server-synchronized saved searches/favourites as part of customer identity work.

### 2. CRM and agent workspace
- [x] Lead assignment fields and assignment/activity migration.
- [x] Admin assignment/unassignment API and active-agent eligibility.
- [x] Agent-scoped lead list/detail/activity API foundation.
- [ ] Angular agent workspace and Admin assignment UI.
- [ ] Follow-up tasks, reminders, call/meeting records and site visits.
- [ ] Conversion/loss outcomes, reasons and safe duplicate handling.
- [ ] Permission tests for every agent-owned object and admin-only action.

### 3. Customer portal
- [ ] Customer identity/profile and consent-aware preferences.
- [ ] Server-synced favourites, enquiry history and site visits.
- [ ] Querysets scoped to the authenticated customer with cross-customer isolation tests.
- [ ] Keep guest enquiry workflows operational.

### 4. Public content management
- [ ] Define bounded structured sections and versioned schemas.
- [ ] Implement Django models, migrations, admin write APIs and public read-only published APIs.
- [ ] Implement an Angular Admin editor and connect public pages to verified persisted content.
- [ ] Sanitize rich text and validate URLs, images and repeatable collections.
- [ ] Add audit metadata, preview, revision and permission tests.
- [ ] Do not claim a Site Content CMS is shipped until route, APIs, migrations and UI are present and tested.

### 5. Search and AI
- [ ] Improve listing metadata and structured filters before adding semantic search.
- [ ] Parse natural language into auditable structured filters.
- [ ] Rank only published/available inventory and explain matches using stored facts.
- [ ] Keep AI lead scoring advisory; never automatically reject or close leads.
- [ ] AI content assistance creates drafts only; a human publishes.

### 6. Notifications and automation
- [ ] Configure approved email/WhatsApp/SMS providers and background processing.
- [ ] Enforce consent/opt-out, idempotency, retry/backoff and delivery audit logs.
- [ ] Support events for new leads, assignments, due follow-ups, site visits and publication.
- [ ] Store provider secrets outside source control.

### 7. Analytics / Power BI
- [ ] Define lead, inventory, agent and conversion metrics.
- [ ] Provide secured aggregate endpoints or controlled reporting exports.
- [ ] Reconcile aggregate values to source records and document refresh cadence.
- [ ] Never expose the production database directly to public clients or Power BI consumers.

### 8. Production readiness
- [ ] PostgreSQL migration/deployment verification.
- [ ] Persistent object storage, backups and restore testing.
- [ ] HTTPS, CSP/security headers, secrets management and least privilege.
- [ ] Monitoring, error reporting and incident runbook.
- [ ] Responsive and accessibility QA for public and role-specific workspaces.

## Completion gate

A workstream is complete only when API and UI are integrated, migrations are checked, positive and negative permission tests pass, relevant CI passes for the exact commit, documentation matches the shipped routes/fields, and no unsupported property facts or commercial values are invented.

## Verification record

Record the exact commit SHA, commands, CI run URLs, browser coverage and known limitations before release approval.
