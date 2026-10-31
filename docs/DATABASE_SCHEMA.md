# Swastik Properties — Database Schema

This document will be expanded with the finalized ER diagram before domain migrations are generated.

## Initial identity model

### User

| Field | Purpose |
|---|---|
| id | Primary key inherited from Django |
| email | Required unique email and authentication identifier |
| username | Required unique account/display identifier |
| role | SUPER_ADMIN, ADMIN or AGENT |
| is_active | Account activation |
| is_staff | Django admin-site access |
| is_superuser | Django permission bypass |

Django's standard authentication fields and password hashing are retained through AbstractUser. Email is the login identifier; username remains required but is not used to authenticate.

## Domain model planning

- Property records belong to the properties domain.
- Geographic records belong to locations and are referenced by properties.
- Agent business profiles belong to agents and reference accounts.User.
- Form submissions and uploaded attachments belong to submissions.
- Foreign-key deletion behavior will be specified per relationship. Property deletion is intended to be permanent and must explicitly handle dependent records and media.

No property or submission database schema is considered finalized yet.
