from tempfile import TemporaryDirectory

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from rest_framework import status
from rest_framework.test import APIClient

from apps.properties.models import Property

from .models import PropertyEnquiry


MAP_URL = "https://www.google.com/maps/place/19.6565164,75.3296438"


class PropertyEnquiryAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.media_dir = TemporaryDirectory()
        self.override = override_settings(MEDIA_ROOT=self.media_dir.name)
        self.override.enable()
        self.property = Property.objects.create(
            name="Sample Residential Property",
            location_url=MAP_URL,
            brochure=SimpleUploadedFile("enquiry-test.pdf", b"%PDF-1.4\n%%EOF", content_type="application/pdf"),
            publication_status=Property.PublicationStatus.PUBLISHED,
            availability_status=Property.AvailabilityStatus.AVAILABLE,
        )

    def tearDown(self):
        self.override.disable()
        self.media_dir.cleanup()

    def payload(self):
        return {
            "property_slug": self.property.slug,
            "name": "Aviral Goyal",
            "email": "aviral@example.com",
            "phone": "+91 9876543210",
            "message": "Please share the price and site visit details.",
        }

    def test_anonymous_visitor_can_submit_property_enquiry(self):
        response = self.client.post(
            "/api/v1/submissions/property-enquiry/",
            self.payload(),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        enquiry = PropertyEnquiry.objects.get()
        self.assertEqual(enquiry.property, self.property)
        self.assertEqual(enquiry.property_name, self.property.name)
        self.assertEqual(enquiry.property_reference, self.property.property_reference)
        self.assertEqual(enquiry.email, "aviral@example.com")

    def test_enquiry_rejects_unpublished_property(self):
        self.property.publication_status = Property.PublicationStatus.DRAFT
        self.property.save()

        response = self.client.post(
            "/api/v1/submissions/property-enquiry/",
            self.payload(),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(PropertyEnquiry.objects.exists())

    def test_property_deletion_preserves_enquiry_snapshot(self):
        response = self.client.post(
            "/api/v1/submissions/property-enquiry/",
            self.payload(),
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)

        enquiry = PropertyEnquiry.objects.get()
        property_name = enquiry.property_name
        property_reference = enquiry.property_reference
        self.property.delete()
        enquiry.refresh_from_db()

        self.assertIsNone(enquiry.property)
        self.assertEqual(enquiry.property_name, property_name)
        self.assertEqual(enquiry.property_reference, property_reference)
