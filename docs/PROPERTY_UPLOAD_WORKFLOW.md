# Property Upload Workflow

## Intended Admin workflow

1. Admin opens Property Management in the separate dashboard.
2. Admin selects Add Property.
3. Admin enters the property/project name.
4. Admin pastes its Google Maps location link.
5. Admin uploads the project's PDF brochure.
6. Admin may add a description, developer name, category, listing type, price, area, address and normalized locality.
7. The backend validates the map destination and PDF file, generates a property reference and URL slug, and saves the property as DRAFT.
8. Admin reviews the property details and changes its publication status to PUBLISHED when ready.
9. The public website displays published property records with a View Location link and a View/Download Brochure link.

## Example based on the supplied brochure

- Property name: ABC 3 Signature
- Developer: ABC Group
- Category: Land and plots
- Subcategory: Residential Plot
- Location label: Bidkin, Chhatrapati Sambhajinagar
- Location link: entered by Admin from the Google Maps URL supplied with the upload
- Brochure: the supplied three-page PDF

The brochure on page 1 identifies the project as ABC 3 Signature and advertises NA-44 plots starting at 1,050 sq. ft. Page 2 contains the plot layout and plot-area statements. Page 3 contains the location map and nearby distance references. The backend stores the original PDF; it does not automatically extract or rewrite brochure text, plot numbers, measurements, approvals or prices.

## Security and validation

- Only Admin and Super Admin can create, update or permanently delete property records.
- Public users can retrieve only records with publication_status=PUBLISHED.
- Only HTTPS Google Maps links are accepted in location_url.
- Brochures must be PDF files, no larger than 25 MB, and begin with the PDF file signature.
- Replacing a brochure or deleting its property removes the old media file after the database transaction commits.
- Production deployment must configure persistent media storage and serve MEDIA_URL through the web server or object storage.
