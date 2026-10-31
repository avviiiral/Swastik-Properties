# Swastik Properties — API Specification

The API contract will be finalized alongside each domain implementation and published through OpenAPI.

## Conventions

- Base path: `/api/v1/`
- Format: JSON unless an endpoint explicitly returns a file.
- Authentication: JWT Bearer tokens for protected API routes.
- Pagination: page-number pagination, default page size 20.
- Filtering, search and ordering are supported through DRF backends where applicable.

## Security defaults

Protected endpoints require authentication by default. Public form-submission endpoints must explicitly opt into anonymous access and must validate/rate-limit untrusted input.

## Planned API domains

- `/api/v1/auth/` — token obtain, refresh and current user.
- `/api/v1/properties/` — public property catalogue and protected administration.
- `/api/v1/locations/` — location lookup data.
- `/api/v1/agents/` — administrator agent management and restricted agent profile operations.
- `/api/v1/submissions/` — public form intake and administrator-only review/export.

Endpoint request/response schemas, status codes and permissions will be documented before frontend integration.
