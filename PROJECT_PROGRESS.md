# Swastik Properties — Project Progress

## Current baseline

- Backend authentication and custom user roles are implemented.
- Normalized State → District → City → Locality models and read-only lookup APIs are implemented.
- Property catalogue API supports Admin/Super Admin brochure uploads with a Google Maps link.
- Property deletion is permanent and uploaded brochure files are cleaned up.
- Customer submissions, image galleries and category-specific detail tables are not implemented yet.

## Admin dashboard

- [x] Create a separate Angular Admin SPA workspace.
- [x] Add email/password login against the backend JWT endpoint.
- [x] Restrict dashboard access to Admin and Super Admin roles.
- [x] Add bearer-token interceptor and refresh-token rotation support.
- [x] Add property inventory listing, search and category filtering.
- [x] Add property create/edit form with PDF brochure upload and Google Maps URL.
- [x] Add publish/unpublish, availability updates and permanent deletion controls.
- [ ] Verify the Angular installation and production build locally on Windows.
- [ ] Verify upload, update, publish and delete flows against the local Django server.

## Next backend and frontend slices

- [ ] Add property gallery images with a primary image.
- [ ] Implement Residential, Commercial and Land-specific detail models after exact subtype fields are agreed.
- [ ] Add property assignment and approval history for Agents.
- [ ] Implement public forms, Admin-only submission management and exports.
- [ ] Build the separate public-facing Angular SSR application.

## Security and deployment follow-up

- [ ] Configure PostgreSQL verification.
- [ ] Configure persistent production media storage and reverse proxy routes for /api/ and /media/.
- [ ] Add a production Content Security Policy and review dashboard token handling.
- [ ] Complete deployment configuration and production security checks.
