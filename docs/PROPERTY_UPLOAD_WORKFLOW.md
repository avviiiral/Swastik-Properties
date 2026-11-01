# Property Upload Workflow

## Intended Admin workflow

1. Admin opens Property Management in the unified Admin workspace.
2. Admin selects Add Property.
3. Admin enters the property/project name.
4. Admin pastes its Google Maps location link.
5. Admin uploads the project's PDF brochure.
6. Admin may add a description, developer name, category, listing type, area, address and normalized locality. Price, currency and budget fields are not available.
7. The backend validates the map destination and PDF file, generates a property reference and URL slug, and saves the property as DRAFT.
8. Admin reviews the property details and changes its publication status to PUBLISHED when ready.
9. The public website displays published property records with a View Location link and a View/Download Brochure link.

## Example based on the supplied brochure

- Property name: ABC 3 Signature
- Developer: ABC Group
- Category: Land and plots
- Subcategory: Residential Plot
- Location label: Bidkin, Chhatrapati Sambhajinagar
- Location link: Google Maps link supplied with the example upload
- Brochure: the supplied three-page PDF

The brochure itself provides the project branding, a plot layout/area statement and a location map. The backend stores the original PDF; it does not automatically extract or rewrite brochure text, plot numbers, measurements, approvals or prices.

## Security and validation

- Only Admin and Super Admin can create, update or permanently delete property records.
- Public users can retrieve only records with publication_status=PUBLISHED.
- Only HTTPS Google Maps links are accepted in location_url.
- Brochures must be PDF files, no larger than 25 MB, and begin with the PDF file signature.
- Property deletion removes its brochure file after the database transaction commits.
- Property-specific data and imagery are managed in Property Management. Home/About/Blog/Contact copy is managed separately through Admin Site Content.
- Production deployment must configure persistent media storage and serve MEDIA_URL through the web server or object storage.
