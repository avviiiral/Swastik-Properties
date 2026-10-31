# Swastik Properties — API Specification

Base URL prefix: `/api/v1/`

## Conventions

- JSON request and response bodies unless an endpoint returns a file.
- JWT Bearer authentication for protected endpoints.
- Access tokens expire after 15 minutes.
- Refresh tokens expire after 7 days and are rotated on refresh.
- Page-number pagination, default page size 20.
- Protected API endpoints require authentication by default.
- Location lookup endpoints are explicitly public and read-only.

## Authentication endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/v1/auth/login/` | Public, throttled | Authenticate with email and password; returns access token, refresh token and user details |
| POST | `/api/v1/auth/token/refresh/` | Public, refresh token required | Rotate refresh token and issue a new access token |
| POST | `/api/v1/auth/logout/` | Authenticated | Blacklist the supplied refresh token belonging to the authenticated user |
| GET | `/api/v1/auth/me/` | Authenticated | Return the current user's safe profile |

### Login request

```json
{
  "email": "agent@swastik.example",
  "password": "your-password"
}
```

Successful login returns `access`, `refresh` and a `user` object containing the user's id, username, email, name, role, active status and join date. Passwords and password hashes are never returned.

### Logout request

```json
{
  "refresh": "<refresh-token>"
}
```

The refresh token must belong to the user authenticated by the access token. Successful logout returns HTTP 205 and blacklists that refresh token. The client must discard both tokens.

## User administration endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/auth/users/` | Admin / Super Admin | List manageable accounts |
| POST | `/api/v1/auth/users/` | Admin / Super Admin | Create a manageable account |
| GET | `/api/v1/auth/users/{id}/` | Admin / Super Admin | Retrieve a manageable account |
| PATCH | `/api/v1/auth/users/{id}/` | Admin / Super Admin | Update account details, role or active status |

### Account-management boundaries

- Admins can list, create, retrieve and update Agent accounts only.
- Super Admins can manage Admin and Agent accounts.
- Super Admin accounts are excluded from this API and are created through the trusted Django management command.
- The API does not expose hard deletion of users; use `is_active=false` to deactivate an account.
- Agents cannot access user-management endpoints.

## Public location lookup endpoints

All location endpoints are public, read-only and return only active records. Inactive parents suppress their descendants.

| Method | Endpoint | Query parameters | Purpose |
|---|---|---|---|
| GET | `/api/v1/locations/states/` | `search`, `ordering`, `page` | List active states |
| GET | `/api/v1/locations/districts/` | `state`, `search`, `ordering`, `page` | List districts; filter by state ID |
| GET | `/api/v1/locations/cities/` | `district`, `district__state`, `search`, `ordering`, `page` | List cities; filter by district or state ID |
| GET | `/api/v1/locations/localities/` | `city`, `city__district`, `city__district__state`, `search`, `ordering`, `page` | List localities; filter by city, district or state ID |

### Example location lookup sequence

1. GET `/api/v1/locations/states/`
2. GET `/api/v1/locations/districts/?state=1`
3. GET `/api/v1/locations/cities/?district=12`
4. GET `/api/v1/locations/localities/?city=85`

Location responses include the parent IDs and names needed to display a complete location path.

Location records are maintained by trusted administrators through Django Admin and the seed management command. The public REST API does not expose location create, update or delete actions.

## API documentation

- OpenAPI schema: `/api/schema/`
- Swagger UI: `/api/docs/`

## Planned API domains

- `/api/v1/properties/` — public property catalogue and protected administration.
- `/api/v1/agents/` — agent business profiles and assignments.
- `/api/v1/submissions/` — public form intake and administrator-only review/export.

Future endpoint request/response schemas and validation rules will be documented as each domain is implemented.
