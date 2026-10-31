# Swastik Properties — Business Rules

## Roles

- Super Admin: complete system access.
- Admin: manage properties, agents and all form submissions.
- Agent: restricted access to permitted property and own profile operations.
- Agents cannot list, read, update, delete or export submissions.

## Properties

- Administrators can add, update and permanently delete properties.
- Property publication and agent-assignment rules will be encoded in the property domain.
- Deletion must account for dependent images and related records; it must not silently leave orphaned files.

## Forms and submissions

- All agreed website forms must be captured by the backend.
- Public intake endpoints must validate submitted data and attachments.
- Only administrators may access submission records and downloadable exports.
- Form-specific fields and validation rules will be defined from the approved project requirements.

## CMS exclusion

No CMS or general-purpose content-management module will be built.
