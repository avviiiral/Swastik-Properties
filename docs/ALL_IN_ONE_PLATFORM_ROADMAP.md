# Swastik Properties — All-in-One Platform Delivery Plan

## Objective

Extend the existing Angular 22 SSR + Django 5.2 / Django REST Framework application into an integrated real-estate operating platform. This roadmap is the source of truth for phased delivery and verification.

## Architecture constraints

- Preserve the current Angular application and Django project; do not introduce a replacement frontend/backend.
- Keep PostgreSQL as the production target and SQLite as the local fallback.
- Preserve existing public URLs, API contracts, enquiries, property references, images and brochures.
- The current business constraint is **no property price or customer budget fields**. Do not add them to property data, customer preferences, search filters, lead details or analytics.
- Continue accepting anonymous public enquiries; account creation must not be a prerequisite for contact.
- Enforce every role and object-ownership boundary in Django. Angular route guards are a UX layer, not the security boundary.
- AI recommendations and generated content must be grounded in real records and require human approval before publication.
- Keep credentials, tokens, private customer data and production configuration outside Git.

## Existing baseline (verified by repository source inspection)

- Public pages: home, property catalogue/detail, about, contact and blog.
- Property inventory with publication/availability workflow, brochure and image gallery.
- Public six-form lead intake, consent timestamp, anonymous throttling and honeypot.
- Admin lead inbox with status/notes, filters and CSV export.
- JWT authentication and SUPER_ADMIN, ADMIN, EDITOR and AGENT roles.
- Admin property, lead, user and blog areas.
- Local-storage favourites/recently viewed/compare (where implemented).
- Site Content CMS is **not implemented in the current URL config or Angular route table**. README and PROJECT_PROGRESS currently disagree; documentation must be reconciled after implementation.

## Workstreams and acceptance criteria

### 0. Baseline stabilization
- [ ] Run Django system checks, migration consistency, migrations and all existing backend tests.
- [ ] Run Angular production SSR build.
- [ ] Review current CI failures and resolve them without weakening checks.
- [ ] Establish regression tests for existing public submissions, catalogue and role boundaries.

### 1. Property information and media
- [ ] Add only business-approved, category-specific attributes (for example bedrooms, bathrooms, furnishing, parking, amenities, construction/possession state).
- [ ] Validate units, ranges and category applicability.
- [ ] Support additional media/document types with file size, extension and content validation.
- [ ] Preserve publication approval, availability, references and brochure links.
- [ ] Keep price and budget data absent.

### 2. CMS
- [ ] Bounded sections: Home, About, Services, Blog landing, Contact, FAQs and location guides.
- [ ] Structured content validation, safe rich-text sanitization and validated external links/media.
- [ ] Draft/publish, preview, revisions, timestamps and audit history.
- [ ] Admin/Super Admin write APIs and public read-only published APIs.
- [ ] Angular CMS screens and public rendering backed by verified saved content.
- [ ] Seed only verified business facts; do not invent team, awards, statistics or service claims.

### 3. CRM and agent workspace
- [ ] Evolve the existing PropertyEnquiry/lead record without losing historical enquiries.
- [ ] Agent assignment and reassignment, lead stages, source, priority and permitted inventory links.
- [ ] Activity timeline for calls, messages, meetings, notes and status transitions.
- [ ] Follow-up tasks, reminders and site visits.
- [ ] Conversion/loss outcome and reason; duplicate detection with safe merge controls.
- [ ] Agent APIs return only leads assigned to the authenticated agent; admin endpoints remain scoped to admins.
- [ ] Angular agent dashboard, lead queue, follow-up calendar and site visits.
- [ ] Automated tests prove an agent cannot read/update another agent's leads.

### 4. Customer portal
- [ ] Customer identity/profile/preferences and consent-aware communication settings.
- [ ] Server-synced favourites, enquiry history and appointments/site visits.
- [ ] Customer data endpoints scope queries to the authenticated customer.
- [ ] Tests prove one customer cannot access another customer's records.
- [ ] Keep guest enquiries working.

### 5. Search and AI
- [ ] Improve structured filters and metadata quality first.
- [ ] Natural-language parsing must produce auditable structured filters.
- [ ] Recommendations rank published/available inventory only and include match explanations.
- [ ] Semantic retrieval/embeddings are optional and only added after infrastructure and evaluation are ready.
- [ ] AI lead scoring is advisory; no automatic rejection, closure or customer communication.
- [ ] AI content assistance produces drafts only; a human publishes.
- [ ] Never generate fictitious inventory or infer missing listing facts.

### 6. Notifications and automation
- [ ] Background queue for email/WhatsApp/SMS (only configured providers).
- [ ] Consent and opt-out enforcement, approved templates, idempotency keys, delivery logs and retry/backoff.
- [ ] Events: new enquiry, assignment, overdue follow-up, site visit, publication and status change.
- [ ] No credentials or provider secrets committed to Git.

### 7. Analytics / Power BI
- [ ] Define lead, property, customer and agent KPIs precisely.
- [ ] Secure aggregated reporting endpoints or a controlled reporting replica/export.
- [ ] Reconcile aggregate totals with source records and document refresh cadence.
- [ ] Never expose the production database directly to public clients or Power BI consumers.

### 8. Production readiness
- [ ] PostgreSQL migration and deployment verification.
- [ ] Persistent object storage for media and documented lifecycle/backup policy.
- [ ] HTTPS, security headers/CSP, secret management, least-privilege service accounts.
- [ ] Automated backup and restore test, monitoring, error reporting and incident runbook.
- [ ] Responsive browser QA for public and role-specific workspaces.

## Completion gate

A workstream is complete only when:
1. API and UI are integrated.
2. migrations are checked and reversible where feasible;
3. tests include positive and negative permission cases;
4. relevant CI builds pass;
5. docs and API schema match actual routes and fields;
6. no price/budget fields, fake business facts or unverified AI claims are introduced.

## Verification record

Record exact commit SHA, commands, outcomes, CI run URLs, browser coverage and known limitations here before asking the owner for a consolidated review.
