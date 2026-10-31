from tempfile import TemporaryDirectory

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from .models import Property

MAP_URL = "https://www.google.com/maps/place/Swastik+Properties/"


class PublicPropertyFilterTests(TestCase):
    def setUp(self):
        self.media_dir = TemporaryDirectory()
        self.settings_override = override_settings(MEDIA_ROOT=self.media_dir.name)
        self.settings_override.enable()
        self.client = APIClient()
        self.make_property("Residential Home", "RESIDENTIAL", "RENT", "PUBLISHED")
        self.make_property("Land Plot", "LAND", "SALE", "PUBLISHED")
        self.make_property("Unpublished Land", "LAND", "SALE", "DRAFT")

    def tearDown(self):
        self.settings_override.disable()
        self.media_dir.cleanup()

    def make_property(self, name, category, listing_type, publication_status):
        return Property.objects.create(
            name=name,
            category=category,
            listing_type=listing_type,
            publication_status=publication_status,
            location_url=MAP_URL,
            brochure=SimpleUploadedFile(
                name.replace(" ", "-") + ".pdf",
                b"%PDF-1.4\n% public-filter-test\n%%EOF",
                content_type="application/pdf",
            ),
        )

    def test_public_filters_category_and_listing_purpose_without_exposing_drafts(self):
        response = self.client.get(
            "/api/v1/properties/?category=LAND&listing_type=SALE"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["name"], "Land Plot")

    def test_public_filter_does_not_allow_requesting_drafts(self):
        response = self.client.get(
            "/api/v1/properties/?category=LAND&publication_status=DRAFT"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["name"], "Land Plot")
