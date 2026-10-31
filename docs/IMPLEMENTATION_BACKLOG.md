# Swastik Properties — Implementation Backlog

## Foundation and authentication

- [x] Create Django project and six domain applications.
- [x] Register domain applications in Django settings.
- [x] Add custom User model with Super Admin, Admin and Agent roles.
- [x] Add environment-based settings and safe local defaults.
- [x] Generate and apply initial custom User migration locally.
- [x] Implement email-based JWT login and token refresh.
- [x] Implement refresh-token blacklist on logout.
- [x] Implement current-user endpoint.
- [x] Implement role-based user-management API boundaries.
- [x] Add authentication and authorization API tests.
- [ ] Validate the authentication changes locally and push test results.
- [ ] Configure local PostgreSQL database and verify all migrations against PostgreSQL.
- [ ] Add CI checks.

## Domain development

- [ ] Define locations schema and APIs.
- [ ] Define agent profile and assignment schema/APIs.
- [ ] Define property schema, images, lifecycle and CRUD APIs.
- [ ] Define form-specific submission schemas and validators.
- [ ] Implement administrator-only submission access.
- [ ] Implement downloadable submission exports.

## Quality and delivery

- [ ] Publish and review OpenAPI/Swagger documentation.
- [ ] Add deployment configuration and production security checks.
