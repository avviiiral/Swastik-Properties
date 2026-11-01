# Swastik Properties — Business Rules

## Roles and permissions

| Capability | SUPER_ADMIN | ADMIN | EDITOR | AGENT |
|---|---:|---:|---:|---:|
| Create/edit/delete/publish properties and images | Yes | Yes | No | Existing Agent rules unchanged |
| Create/edit/delete/publish Blog posts and edit public website sections | Yes | Yes | No | No |
| Manage ADMIN accounts | Yes | No | No | No |
| Manage EDITOR and AGENT accounts | Yes | Yes | No | No |
| Manage SUPER_ADMIN accounts | Yes | No | No | No |
| Permanently delete user accounts | Yes | No | No | No |

- SUPER_ADMIN is the system superuser and has full access.
- ADMIN manages property inventory, publication, property photos, public website content and EDITOR/AGENT users. ADMIN cannot manage Admin/Super Admin accounts.
- EDITOR does not receive Site Content permissions by default. EDITOR cannot access property management or user administration.
- AGENT behaviour and permitted agent workflows remain unchanged.
- Users cannot change their own role or deactivate/delete themselves through user management.
- ADMIN cannot create/promote accounts to ADMIN or SUPER_ADMIN.
- User deactivation is the default removal action; permanent deletion is Super Admin only.
- The last active SUPER_ADMIN cannot be demoted or deactivated.

## Properties

- Property prices are not collected, stored, managed, accepted or displayed anywhere in the property catalogue, Admin interface, APIs or public website. Public property discovery uses location, category, listing purpose, availability and area instead.

- Administrators can add, update and permanently delete properties.
- Property publication and agent-assignment rules are encoded in the property domain.
- Deletion accounts for dependent images and related records; it must not leave orphaned media files.

## Forms and submissions

The website will support these agreed form categories:
1. General Enquiry
2. Property Enquiry
3. Buy Requirement
4. Rent Requirement
5. Sell Property
6. Property Listing

- All agreed forms must be captured by the backend.
- All form submissions must be downloadable by administrators.
- New website submissions record the visitor's explicit contact consent timestamp. Legacy submissions remain available with a null consent timestamp.
- Administrators manage NEW, CONTACTED, QUALIFIED, CLOSED and SPAM statuses and can store private follow-up notes.
- Agents cannot read, update or export any customer submissions.
- Buy/rent forms require a preferred location; sell/list forms require the property location. No price, budget, expected amount or cost fields are collected, accepted or displayed.
- Public intake endpoints must validate submitted data and attachments.
- Only administrators may access submission records and downloadable exports.
- Agents must not access customer submissions or exports.

## Scoped website content editing

- ADMIN and SUPER_ADMIN can edit structured public content for Home, About, Blog and Contact.
- Public visitors can read published content only; public APIs are read-only.
- The editor exposes approved fields and repeatable records, not arbitrary templates, scripts, stylesheets or unrestricted HTML.
- About-page company history, service areas, statistics and team biographies must be verified by the business; do not invent values.
- Blog articles retain draft/published/archived lifecycle rules and are managed by ADMIN/SUPER_ADMIN.
- Rich text is sanitized server-side; uploaded images are validated.
- Content updates retain `updated_at` and `updated_by` audit metadata.
- This scoped editor does not change property CRUD, lead workflows or the no-price/no-budget rule.
