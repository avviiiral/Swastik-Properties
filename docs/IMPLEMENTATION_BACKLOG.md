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
- [x] Add GitHub Actions backend CI workflow.
- [x] Implement normalized State, District, City and Locality models.
- [x] Implement public read-only location lookup endpoints.
- [x] Add idempotent Maharashtra and 36-district seed command.
- [ ] Generate and apply the locations migration locally.
- [ ] Run location seed command and location tests locally.
- [ ] Configure local PostgreSQL database and verify migrations against PostgreSQL.

## Domain development

- [ ] Define agent profile and assignment schema/APIs.
- [ ] Finalize category-specific property detail fields.
- [ ] Define property schema, images, lifecycle and CRUD APIs.
- [ ] Define form-specific submission schemas and validators.
- [ ] Implement administrator-only submission access.
- [ ] Implement downloadable submission exports.

## Quality and delivery

- [ ] Publish and review OpenAPI/Swagger documentation.
- [ ] Add deployment configuration and production security checks.
