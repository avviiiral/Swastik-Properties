# Swastik Properties — Backend Architecture

## Architecture style

The backend is a modular Django monolith exposing REST APIs for the Angular frontend. Each Django application owns a business domain while sharing one relational database.

## Applications

| App | Responsibility |
|---|---|
| accounts | User identity, authentication and roles |
| properties | Property inventory, attributes, lifecycle and images |
| locations | States, cities, localities and other reusable location data |
| agents | Agent profiles and property assignments |
| submissions | Website forms, submitted data, attachments and administrator review/export |
| common | Shared abstract models, constants and reusable utilities |

## Access principles

- Super Admin: complete system administration.
- Admin: property, agent and submission administration.
- Agent: restricted agent/property functions.
- Submission records and downloads are restricted to administrators.
- The backend is the enforcement point; frontend hiding is not authorization.

## Explicit exclusions

The application does not include a CMS. The admin functionality is limited to operational management of properties, agents and submitted forms.
