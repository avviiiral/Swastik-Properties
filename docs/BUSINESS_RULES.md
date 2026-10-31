# Swastik Properties — Business Rules

## Roles and permissions

| Capability | SUPER_ADMIN | ADMIN | EDITOR | AGENT |
|---|---:|---:|---:|---:|
| Create/edit/delete/publish properties and images | Yes | Yes | No | Existing Agent rules unchanged |
| Create/edit/delete/publish Blog posts | Yes | No | Yes | No |
| Manage ADMIN accounts | Yes | No | No | No |
| Manage EDITOR and AGENT accounts | Yes | Yes | No | No |
| Manage SUPER_ADMIN accounts | Yes | No | No | No |
| Permanently delete user accounts | Yes | No | No | No |

- SUPER_ADMIN is the system superuser and has full access.
- ADMIN manages property inventory, publication, property photos and EDITOR/AGENT users. ADMIN cannot access blog write endpoints or Admin/Super Admin accounts.
- EDITOR manages Blog posts only. EDITOR cannot access property management or user administration. Public property queries remain published-only for EDITOR.
- AGENT behaviour and permitted agent workflows remain unchanged.
- Users cannot change their own role or deactivate/delete themselves through user management.
- ADMIN cannot create/promote accounts to ADMIN or SUPER_ADMIN.
- User deactivation is the default removal action; permanent deletion is Super Admin only.
- The last active SUPER_ADMIN cannot be demoted or deactivated.

## Properties

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
- Buy/rent forms require a preferred location; sell/list forms require the property location. Optional budget and price values must be non-negative and the minimum budget cannot exceed the maximum.
- Public intake endpoints must validate submitted data and attachments.
- Only administrators may access submission records and downloadable exports.
- Agents must not access customer submissions or exports.

## Scoped content exception: Blog

A scoped Blog module is the only exception to the previous no-CMS decision. This is not a general-purpose CMS. It supports editorial articles only, with drafts, publication and archive states. EDITOR and SUPER_ADMIN manage posts; ADMIN and AGENT have no Blog write access.

- Public Blog endpoints expose PUBLISHED posts only.
- Rich text HTML is sanitised server-side with an explicit allowlist.
- Blog cover images are validated uploads and removed when their post is deleted.
- Demo content is clearly labelled and seeded only with DEBUG enabled.
