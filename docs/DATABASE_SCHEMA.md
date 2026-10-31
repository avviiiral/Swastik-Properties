# Swastik Properties — Database Schema

## Identity model

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

## Geographic reference data

The geographic hierarchy is normalized as:

`State → District → City → Locality`

| Entity | Important fields | Constraints / relationships |
|---|---|---|
| State | id, name, slug, is_active, created_at, updated_at | Unique name and slug |
| District | id, state_id, name, slug, is_active, timestamps | FK to State with PROTECT; unique name and slug within state |
| City | id, district_id, name, slug, is_active, timestamps | FK to District with PROTECT; unique name and slug within district |
| Locality | id, city_id, name, slug, is_active, timestamps | FK to City with PROTECT; unique name and slug within city |

The four models share an abstract location base model for name, slug, activation status and timestamps. Parent foreign keys use `PROTECT` so a location cannot be removed while children depend on it. Each model has an index supporting active-child lookup by its parent.

The initial seed command creates Maharashtra and its 36 districts. Cities and localities are added as the covered markets are configured. The public lookup APIs expose active records only and hide descendants of inactive parents.

## Domain model planning

- Property records belong to the properties domain and will reference normalized location records.
- Agent business profiles belong to agents and reference accounts.User.
- Form submissions and uploaded attachments belong to submissions.
- Property deletion must be permanent while retaining customer form submissions associated with that property.
- Property category-specific details will use separate Residential, Commercial and Land detail models.

Property and submission table definitions will be expanded in their domain design before those migrations are generated.
