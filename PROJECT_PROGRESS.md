# Swastik Properties — Project Progress

## Existing platform baseline
- Django 5.2 + DRF backend with JWT login, rotation and blacklist.
- Custom SUPER_ADMIN, ADMIN and AGENT roles; EDITOR role added in this branch.
- Maharashtra location hierarchy and public read APIs.
- Property inventory, publication workflow, brochure uploads and image galleries.
- One Angular 22 SSR application serves public and Admin routes.

## This branch — UI, About, Blog and access control
- [x] Establish design tokens, display/body typography and reduced-motion baseline.
- [x] Update public navigation/footer; About is a real route instead of a footer anchor.
- [x] Add About content in pages/about/about.content.ts with TODO placeholders for unknown business facts.
- [x] Add public Blog listing and article detail pages.
- [x] Add role-aware auth helpers/guard and role-specific login destination.
- [x] Add role-filtered Admin sidebar, dashboard route and forbidden page.
- [x] Add Editor role migration and backend permission classes.
- [x] Revise Admin user-management scope to EDITOR and AGENT; add activation and Super Admin-only delete endpoints.
- [x] Add BlogPost model/API, HTML sanitisation, cover image validation and demo seed command.
- [x] Add Blog and account permission test modules.
- [x] Update business rules, API and database documentation.
- [ ] Complete frontend users route/runtime verification.
- [ ] Add automated API test coverage for all role × endpoint combinations and last-Super-Admin demotion/deletion edge cases.
- [ ] Run Django migration checks, system check and full suite locally.
- [ ] Run Angular production SSR build and test 360px/1280px layouts.
- [ ] Confirm property management publication/delete confirmation behaviour in browser.
- [ ] Add/verify BlogPosting JSON-LD, social metadata and canonical on server-rendered HTML.
- [ ] Confirm dynamic sitemap integration if the repository has a sitemap generator.

## Local verification (not yet run in this remote GitHub editing session)
Backend:
- cd backend
- .\venv\Scripts\Activate.ps1
- python manage.py makemigrations --check
- python manage.py check
- python manage.py test

Frontend:
- cd frontend/web-app
- npm.cmd install
- npm.cmd run build

## Follow-up
- Add residential/commercial/land subtypes after exact subtype fields are agreed.
- Implement the six agreed public forms and administrator-only submissions/exports.
- Configure PostgreSQL verification, persistent production media storage, CSP and deployment checks.
