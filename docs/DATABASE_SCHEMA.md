# Swastik Properties — Database Schema

## User

| Field | Type | Purpose |
|---|---|---|
| id | BigAutoField | Primary key |
| email | EmailField unique | Authentication identifier |
| username | CharField unique | Django-compatible account identifier |
| role | CharField | SUPER_ADMIN, ADMIN, EDITOR, AGENT |
| is_active | Boolean | Account activation |
| is_staff / is_superuser | Boolean | Django admin access / superuser |

The custom user inherits Django AbstractUser. Email is the login identifier; Django password hashing and password validators are retained. User API serializers never expose password hashes.

## BlogPost

| Field | Type | Purpose |
|---|---|---|
| id | BigAutoField | Primary key |
| title | CharField(220) | Article title |
| slug | SlugField(240), unique | Public article route; auto-generated from title if omitted |
| excerpt | Text(500) | Listing/SEO summary |
| content | Text | Rich text HTML, sanitised with nh3 on save |
| cover_image | ImageField, nullable | Validated JPG/JPEG/PNG/WEBP, max 8 MB |
| category | CharField(100) | Editorial category |
| tags | JSONField | List of tags |
| status | Choice | DRAFT, PUBLISHED, ARCHIVED |
| published_at | DateTime, nullable | Set on publish; cleared on unpublish |
| author_id | FK User, PROTECT | Author/editor |
| seo_title | CharField(220) | Optional SEO title |
| seo_description | CharField(320) | Optional SEO description |
| reading_time | PositiveSmallInteger | Computed at approximately 220 words/minute |
| created_at / updated_at | DateTime | Audit timestamps |

BlogPost has an index on (status, published_at) and default order newest published first. Public APIs query PUBLISHED posts only. Deleting a post removes its cover file after the database transaction commits.

## Property

The Property model remains in apps.properties. Its category/listing/price/location fields, brochure, publication_status, availability_status, created_by/approved_by and timestamps are unchanged. PropertyImage remains related to Property and retains its image cleanup behaviour.

## Location hierarchy

State → District → City → Locality → optional Property locality.

## Role access rules

- SUPER_ADMIN: full system access.
- ADMIN: property management and EDITOR/AGENT user management; no Blog authoring or privileged-account access.
- EDITOR: Blog management only; no property or user management.
- AGENT: unchanged agent access.
- Public Blog reads published posts only; public Property reads published properties only.
