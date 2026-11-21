# Property Upload Workflow

## Admin workflow

1. Admin/Super Admin opens Property Management in the unified Angular Admin workspace.
2. Select Add Property.
3. Enter the property/project name and supported descriptive fields.
4. Provide the Google Maps location link and upload the PDF brochure.
5. Optionally add supported category, listing type, area, address and normalized locality data.
6. Backend validates submitted fields and media, creates a reference/slug and stores the record in its initial publication state.
7. Admin reviews the record and publishes it when ready.
8. Public visitors can discover published records in the unified Buy / Rent / Lease marketplace and open the property detail page.
9. Property detail provides the supported gallery, brochure/location links and enquiry/site-visit forms.

## Supported data and limitations

The current property schema/API does not expose listing price, currency, EMI, customer budget, bedrooms, bathrooms, deposit, furnishing, lock-in, lease escalation or parking. The marketplace must not infer these values from brochure text or imagery. “Contact for pricing” is used instead of fabricated pricing.

The marketplace maps Buy to API listing type `SALE`, and Rent / Lease to their matching listing types. Only filters backed by the current API may be applied.

## Media and validation

- Property create/update/delete is restricted to authorized Admin roles.
- Public users can retrieve published property records only.
- Google Maps destination links and brochure uploads are validated by the backend.
- Brochure and image type/size/signature rules are defined in the current serializers/validators; consult those source files before relying on exact limits.
- Property and image deletion must follow the implemented related-media cleanup behavior.
- Production deployment must use persistent media storage and route `MEDIA_URL` through the web server or object storage.

## Related workflows

- Property-specific details and media are managed in Property Management.
- Public enquiries and site visits are captured through the submissions API.
- Home/About/Contact marketing copy remains frontend-maintained; a database-backed Site Content CMS is not currently shipped.
