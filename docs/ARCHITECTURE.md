# Swastik Properties — Application Architecture

## System shape

A modular Django monolith exposes REST APIs to one Angular 22 SSR application. The same Angular application serves public pages and protected Admin routes; there is no separate Admin SPA. Both domains use the same relational database and configured media storage.

## Frontend

- Active workspace: `frontend/web-app`.
- Public routes include Home, About, Contact, Blog, marketplace, property detail, Thank You and branded not-found pages.
- `/properties` is routed to `PropertyMarketplaceComponent`.
- Admin routes are part of the same Angular router.
- Public routes are SSR-capable. Admin routes are client-rendered because the current authentication flow uses browser session storage.
- Public property API requests bypass Admin authorization headers so a signed-in Admin does not accidentally broaden anonymous catalogue behavior.
- Shared visual tokens and cross-route styles live in `src/styles.css`.

## Marketplace flow

1. User chooses Buy, Rent or Lease.
2. Angular maps the selected mode to the supported backend listing type (Buy → `SALE`).
3. Search/category/area/sort criteria are sent through the existing property API service.
4. Results are rendered from published API records; no invented price or property attributes are added.
5. Saved listings and comparison (maximum three) use browser-side public property state.
6. Visit/callback actions navigate to the selected property's detail page and relevant form anchor.
7. The map panel previews the selected listing's address; it is not a geocoded multi-result map.

## Backend domain boundaries

| Django app | Responsibility |
|---|---|
| accounts | User identity, JWT authentication and roles |
| properties | Property inventory, publication/availability lifecycle, brochures and images |
| locations | State, district, city and locality reference data |
| agents | Agent-domain support |
| submissions | Public form intake, lead review/export, assignment and activity history |
| blog | Public published articles and editorial management |
| common | Shared abstract models and utilities |

There is no implemented Site Content domain/API in the shipped architecture described here. Public page copy remains in Angular; Blog article data is served by the Blog API.

## Lead/CRM data flow

- Public visitors submit forms without an account.
- Django validates and stores submissions, including consent metadata for new submissions.
- Admins review leads, update status/notes and export permitted records.
- CRM backend foundation supports optional agent assignment and an activity timeline.
- Agent API querysets are scoped to leads assigned to the authenticated agent.
- An Angular agent workspace and integrated assignment controls remain planned.

## Authorization

Django is the security boundary. Frontend guards and hidden controls improve UX but do not replace backend permission checks. Public endpoints expose published content/listings only. Admin-only lead data and exports are not available to agents or anonymous users.

## Data integrity and privacy

- PostgreSQL is the production target; SQLite is the local development fallback.
- Schema changes are committed as Django migrations.
- Uploaded brochures/images require validation and configured media lifecycle handling.
- Credentials, tokens and private customer data must not be committed.
- No price/budget fields are part of the property or public lead contract.
