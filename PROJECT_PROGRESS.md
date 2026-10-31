# Swastik Properties — Project Progress

## Current phase

Backend Phase 2 — Foundation, authentication and normalized locations.

## Completed

- Django project created with six domain applications.
- Custom User model with SUPER_ADMIN, ADMIN and AGENT roles.
- Email-based JWT authentication, refresh-token rotation and logout revocation.
- Current-user endpoint and role-limited user-management endpoints.
- Account and authentication API tests.
- Normalized State → District → City → Locality models.
- Public, read-only location lookup APIs with state/district/city filters.
- Inactive locations and descendants are excluded from public responses.
- Idempotent seed command for Maharashtra and its 36 districts.
- Initial accounts and locations migrations added.
- GitHub Actions workflow checks Django, migrations and backend tests.

## Test results

- Local account/authentication tests: 20 passed (reported by developer).
- GitHub Actions backend CI for location-management branch: passed.
- GitHub CI steps: Django system checks, migration consistency, migrations and account/location tests.

## Pending local verification

- Apply the locations migration locally.
- Run `python manage.py seed_maharashtra_locations`.
- Run account and location tests locally.
- Reset the initial Super Admin password: the first password creation bypassed Django's password validation. Use a strong, unique password.

## Known decisions and boundaries

- Location REST APIs are read-only and public.
- Location data maintenance is through Django Admin and the seed command.
- Initial market data seeds Maharashtra and its 36 districts; cities/localities are added as markets are configured.
- PostgreSQL remains the target database. SQLite is currently used as a local fallback.
- No CMS is included.
- Property deletion must be permanent; customer submissions associated with deleted properties must be retained.
- Agents must not access customer submissions or exports.

## Next recommended task

Complete local location verification, then implement the Agent profile and assignment model. Finalize the category-specific Residential, Commercial and Land property detail fields before creating property migrations.

## Latest Git state

- Backend/authentication branch: `feature/backend-foundation`
- Location branch: `feature/location-management`
- Review: PR #1 is the backend/authentication foundation; PR #2 adds normalized location management and targets the foundation branch.
