# Swastik Properties — Implementation Backlog

## Foundation

- [x] Create Django project and six domain applications.
- [x] Register domain applications in Django settings.
- [x] Add custom User model with Super Admin, Admin and Agent roles.
- [x] Add environment-based settings and safe local defaults.
- [ ] Configure local PostgreSQL database.
- [ ] Generate and apply initial migrations.
- [ ] Add JWT login, refresh and current-user endpoints.
- [ ] Add and test role-based API permissions.

## Domain development

- [ ] Define locations schema and APIs.
- [ ] Define agent profile and assignment schema/APIs.
- [ ] Define property schema, images, lifecycle and CRUD APIs.
- [ ] Define form-specific submission schemas and validators.
- [ ] Implement administrator-only submission access.
- [ ] Implement downloadable submission exports.

## Quality and delivery

- [ ] Add automated API and permission tests.
- [ ] Publish OpenAPI/Swagger documentation.
- [ ] Add CI checks and deployment configuration.
