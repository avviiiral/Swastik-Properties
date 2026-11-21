# Swastik Properties — Database Schema Notes

This document describes the implemented domain structures at a functional level. Django models and committed migrations are authoritative for exact field types, constraints and relationships.

## User

The custom user model inherits Django's AbstractUser and includes email-based authentication plus role values used by the application: SUPER_ADMIN, ADMIN, EDITOR and AGENT. Passwords use Django hashing/validators; API serializers must never expose password hashes.

## Property and media

The Property model stores supported listing information, category, location references, brochure, publication state, availability state, creator/approver metadata and timestamps. PropertyImage records support the property gallery and primary-image selection.

The current property contract intentionally excludes price, currency, EMI, budget, bedrooms, bathrooms, deposit, furnishing, lock-in, lease escalation and parking fields unless a later approved migration explicitly introduces them. The marketplace must render only data returned by the API.

Property media lifecycle includes validated brochure and image uploads and cleanup when associated records are removed, according to the model/service implementation.

## Location hierarchy

State → District → City → Locality → optional Property locality. Foreign-key behavior and uniqueness constraints are defined in the locations app migrations/models.

## BlogPost

BlogPost stores editorial content such as title, slug, excerpt, body, cover image, category/tags, publication status, publication timestamp, author and SEO metadata. Public querysets expose published posts only. Exact validators, sanitization and upload limits are defined in the Blog model/serializer/validator code.

## PropertyEnquiry / lead

The submissions domain retains public enquiry records and supports the six public form types. New records can include contact-consent metadata; historical records remain compatible with nullable newer fields.

CRM assignment fields include:
- `assigned_to`: nullable relation to the assigned agent.
- `assigned_by`: nullable relation to the user who made the assignment.
- `assigned_at`: nullable assignment timestamp.

LeadActivity records provide an activity timeline for supported lead events such as notes, status changes and assignment changes. The migration `0004_lead_assignment_and_activity` adds the assignment fields, an assignment/status index and LeadActivity. Existing leads remain valid and can remain unassigned.

## Migration operations

The source-controlled migration is not automatically applied to an existing local database. If runtime logs report `no such column: submissions_propertyenquiry.assigned_to_id`, the likely issue is a database whose migration state is behind the current model code.

From `backend`:

```powershell
python manage.py showmigrations submissions
python manage.py migrate
python manage.py showmigrations submissions
```

Confirm migration `0004_lead_assignment_and_activity` is marked applied. Back up valuable local SQLite data before migration. Do not delete the database or generate a duplicate migration to address a pending migration.

## Site Content status

There is no implemented SiteContentSection model/migration in the shipped branch state documented here. Home/About/Contact public copy is frontend-maintained. Do not treat older proposed SiteContentSection schema descriptions as implemented database facts.

## Privacy and access

Role checks and queryset scoping are enforced in Django. Admin-only submissions, notes and exports must not be exposed to public users or agents. Never connect public clients directly to the production database.
