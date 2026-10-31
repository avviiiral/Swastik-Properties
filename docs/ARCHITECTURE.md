# Swastik Properties — Backend Architecture

## Architecture style

The backend is a modular Django monolith exposing REST APIs to one Angular SSR frontend. The same Angular application serves both the public property website and protected Admin workspace from one origin and one frontend process. Each Django application owns a business domain while sharing one relational database.

## Frontend application

- Active application: `frontend/public-website`.
- Public routes: `/`, `/properties`, `/properties/:slug`.
- Admin routes: `/admin/login`, `/admin/properties`.
- Public routes are server-rendered; Admin routes use client rendering because Admin authentication currently uses browser session storage.
- The public property API client bypasses the Admin JWT interceptor. This prevents a signed-in administrator's token from widening public catalogue responses beyond PUBLISHED properties.
- The former `frontend/admin-dashboard` standalone workspace is retained temporarily as a reference only; it is not started separately.

## Applications

| App | Responsibility |
|---|---|
| accounts | User identity, authentication and roles |
| properties | Property inventory, attributes, lifecycle and images |
| locations | States, cities, localities and other reusable location data |
| agents | Agent profiles and property assignments |
| submissions | Website forms, submitted data, attachments and administrator review/export |
| common | Shared abstract models, constants and reusable utilities |

## Access principles

- Super Admin: complete system administration.
- Admin: property, agent and submission administration.
- Agent: restricted agent/property functions.
- Submission records and downloads are restricted to administrators.
- The backend is the enforcement point; frontend hiding is not authorization.

## Explicit exclusions

The application does not include a CMS. The admin functionality is limited to operational management of properties, agents and submitted forms.
