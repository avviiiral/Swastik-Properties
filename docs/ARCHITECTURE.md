# Swastik Properties — Backend Architecture

## Architecture style

The backend is a modular Django monolith exposing REST APIs to one Angular SSR frontend. The same Angular application serves both the public property website and protected Admin workspace from one origin and one frontend process. Each Django application owns a business domain while sharing one relational database.

## Frontend application

- Active application: `frontend/web-app`.
- Public routes: `/`, `/properties`, `/properties/:slug`.
- Admin routes: `/admin/login`, `/admin/properties`.
- Public routes are server-rendered; Admin routes use client rendering because Admin authentication currently uses browser session storage.
- The public property API client bypasses the Admin JWT interceptor. This prevents a signed-in administrator's token from widening public catalogue responses beyond PUBLISHED properties.
- Public pages are organized under `src/app/pages`, shared layout/services/models are separated, and Admin pages live under `src/app/admin/features`.
- There is no second Admin SPA workspace; public and Admin routes are part of the same Angular application.

## Applications

| App | Responsibility |
|---|---|
| accounts | User identity, authentication and roles |
| properties | Property inventory, attributes, lifecycle and images |
| locations | States, cities, localities and other reusable location data |
| agents | Agent profiles and property assignments |
| submissions | Website forms, submitted data, attachments and administrator review/export |
| common | Shared abstract models, constants and reusable utilities |
| site_content | Structured public website content for Home, About, Blog and Contact |

## Public website content architecture

A dedicated Site Content domain stores bounded structured content for Home, About, Blog and Contact. ADMIN and SUPER_ADMIN use authenticated management APIs; public routes use read-only APIs that expose published content. This is not a drag-and-drop page builder: only approved fields and repeatable structures are editable. Rich text is sanitized, media uploads are validated, and updates retain editor/timestamp audit metadata. Property inventory remains separate and contains no price or budget fields.

## Access principles

- Super Admin: complete system administration.
- Admin: property, agent, submission and public website content administration.
- Agent: restricted agent/property functions.
- Submission records and downloads are restricted to administrators.
- Public website content editing is restricted to ADMIN and SUPER_ADMIN.
- The backend is the enforcement point; frontend hiding is not authorization.

## Content management boundary

The application includes a scoped Site Content editor, not a general-purpose CMS. ADMIN and SUPER_ADMIN can edit structured content for Home, About, Blog and Contact. Property inventory, lead submissions and user management remain separate domain workflows. Arbitrary page creation, template editing, script/CSS injection and unrestricted page-builder functionality are excluded.
