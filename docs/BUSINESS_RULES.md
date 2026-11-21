# Swastik Properties — Business Rules

## Roles

| Capability | SUPER_ADMIN | ADMIN | EDITOR | AGENT |
|---|---:|---:|---:|---:|
| Property administration | Yes | Yes | No | Only explicitly permitted agent scope |
| Blog management | Yes | Yes | No unless separately granted by API policy | No |
| Lead inbox, notes and export | Yes | Yes | No | No |
| Assign/unassign leads | Yes | Yes | No | No |
| View assigned leads through agent APIs | Yes | Admin scope | No | Own assigned leads only |
| Manage ADMIN accounts | Yes | No | No | No |
| Manage EDITOR/AGENT accounts | Yes | Yes | No | No |
| Permanently delete users | Yes | No | No | No |

- SUPER_ADMIN has full system administration rights.
- ADMIN manages property inventory, leads, permitted users and Blog editorial records.
- EDITOR has no assumed access to Admin workspace, property or lead management unless an explicit backend permission grants it.
- AGENT must be scoped to assigned leads in agent APIs and cannot access the Admin lead inbox/export.
- Django permissions and querysets are authoritative; Angular guards are not security controls.
- Users cannot elevate their own role or bypass account deactivation restrictions.
- ADMIN cannot manage ADMIN or SUPER_ADMIN accounts.
- The last active SUPER_ADMIN must remain protected from deactivation/removal.

## Property inventory and marketplace

- Property price, currency, EMI and customer budget values are not collected, stored, accepted or displayed.
- Buy maps to the existing `SALE` listing type; Rent and Lease use their corresponding listing types.
- Public discovery is based on supported fields such as location, category, listing type, availability and area.
- Do not display bedrooms, bathrooms, deposits, furnishing, lock-in, escalation or parking unless those fields are added to and returned by the backend.
- Public users see published properties only.
- Admin publication/availability actions follow backend validation and permissions.
- Saved properties and compare state are browser-side in the current marketplace, not a server-backed customer account feature.
- Map preview is address-based for the selected listing; do not describe it as full multi-pin geospatial search.

## Public forms and submissions

Supported public form categories:
1. General Enquiry
2. Property Enquiry
3. Buy Requirement
4. Rent Requirement
5. Sell Property
6. Property Listing

- Guests can submit forms; account creation is not required.
- New submissions record explicit contact-consent timestamp.
- Historical records remain readable when optional newer fields are null.
- Buy/rent requirements capture location preferences; sell/list forms capture property location as validated by the form schema.
- Do not add price, budget, expected amount or cost inputs.
- Public intake validates data and applies configured throttling/honeypot controls.
- Only ADMIN/SUPER_ADMIN can use the Admin lead inbox and export.
- Internal notes are not public.
- Agent assignment is optional; existing unassigned leads remain valid.
- Agent-facing APIs must scope records to the authenticated agent's assigned leads.

## Visual and content integrity

- Public pages use the shared Quiet Luxury palette and typography.
- Do not invent company history, team biographies, awards, service areas, property facts or listing commercial terms.
- The Site Content CMS is not shipped; Home/About/Contact copy is currently maintained in the Angular frontend.
- Blog articles follow the backend's draft/published/archived rules; only published posts are public.
