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


class AdminSubmissionManagementTests(TestCase):
    def setUp(self):
        from apps.accounts.models import User

        self.admin = User.objects.create_user(
            username="contact-admin",
            email="contact-admin@example.com",
            password="Test-Only-Strong-Pass-839!",
            role=User.Role.ADMIN,
        )
        self.agent = User.objects.create_user(
            username="contact-agent",
            email="contact-agent@example.com",
            password="Test-Only-Strong-Pass-839!",
            role=User.Role.AGENT,
        )
        self.client = APIClient()

    def test_contact_settings_are_publicly_readable(self):
        response = self.client.get("/api/v1/submissions/contact-settings/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("whatsapp_number", response.data)
        self.assertIn("contact_number", response.data)
        self.assertIn("email", response.data)

    def test_admin_can_update_business_contact_settings(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.patch(
            "/api/v1/submissions/contact-settings/",
            {
                "whatsapp_number": "+919876543210",
                "contact_number": "+912233445566",
                "email": "office@example.com",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertEqual(response.data["whatsapp_number"], "+919876543210")
        self.assertEqual(response.data["contact_number"], "+912233445566")
        self.assertEqual(response.data["email"], "office@example.com")

    def test_agent_cannot_update_business_contact_settings(self):
        self.client.force_authenticate(user=self.agent)
        response = self.client.patch(
            "/api/v1/submissions/contact-settings/",
            {"email": "agent@example.com"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_user_cannot_list_or_export_enquiries(self):
        listing = self.client.get("/api/v1/submissions/property-enquiries/")
        export = self.client.get("/api/v1/submissions/property-enquiries/export/")
        self.assertEqual(listing.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(export.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_can_list_and_export_enquiries(self):
        PropertyEnquiry.objects.create(
            property_name="Historic property",
            property_reference="SWP-TEST-001",
            name="Test Visitor",
            email="visitor@example.com",
            phone="+919876543210",
            message="Please call me about this property.",
        )
        self.client.force_authenticate(user=self.admin)

        listing = self.client.get("/api/v1/submissions/property-enquiries/")
        export = self.client.get("/api/v1/submissions/property-enquiries/export/")

        self.assertEqual(listing.status_code, status.HTTP_200_OK)
        self.assertEqual(listing.data["count"], 1)
        self.assertEqual(export.status_code, status.HTTP_200_OK)
        self.assertIn("text/csv", export["Content-Type"])
        self.assertIn("SWP-TEST-001", export.content.decode("utf-8-sig"))
