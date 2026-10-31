# Swastik Properties — Implementation Backlog

## Foundation

- [x] Create Django project and six domain applications.
- [x] Add custom User model with Super Admin, Admin and Agent roles.
- [x] Add environment-based settings and safe local defaults.
- [x] Implement email-based JWT login, refresh and logout.
- [x] Implement role-based user management and account tests.
- [x] Add GitHub Actions backend CI workflow.
- [x] Implement normalized State → District → City → Locality reference models and public lookup APIs.

## Property catalogue

- [x] Add the initial Property catalogue model and generated property reference/slug.
- [x] Support Admin/Super Admin multipart property creation with required name, Google Maps link and PDF brochure.
- [x] Validate Google Maps destination links and PDF signature/size.
- [x] Extract coordinates from supported Google Maps URLs when embedded.
- [x] Add optional category, listing type, price, area and normalized locality fields.
- [x] Add separate publication and availability states.
- [x] Restrict public catalogue reads to published properties.
- [x] Restrict create/update/permanent delete operations to Admin and Super Admin.
- [x] Remove the uploaded brochure when its property is permanently deleted.
- [ ] Implement category-specific Residential, Commercial and Land detail tables.
- [ ] Implement multiple property images and primary image management.
- [ ] Add property activity/audit logging.
- [ ] Implement agent-owned property creation, assignment and approval workflow.

## Website forms and submissions

- [ ] Define form-specific submission schemas and validators.
- [ ] Implement administrator-only submission access.
- [ ] Implement downloadable submission exports for all agreed forms.
- [ ] Preserve customer submissions when a related property is permanently deleted.

## Quality and delivery

- [ ] Verify migrations and tests locally on Windows.
- [ ] Verify migrations and tests against PostgreSQL.
- [ ] Publish and review OpenAPI/Swagger documentation.
- [ ] Add production media storage and delivery configuration.
- [ ] Add deployment configuration and production security checks.
