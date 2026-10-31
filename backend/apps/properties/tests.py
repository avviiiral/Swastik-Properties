from decimal import Decimal
from tempfile import TemporaryDirectory

from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import User

from .models import Property, PropertyImage
from .validators import extract_google_maps_coordinates, validate_google_maps_url


MAP_URL = (
    "https://www.google.com/maps/place/19%C2%B039'23.5%22N+75%C2%B019'46.7%22E/"
    "@19.6565164,75.3270689,17z/data=!3m1!4b1!4m4!3m3!8m2!3d19.6565164!4d75.3296438"
)
VALID_PDF = b"%PDF-1.4\n% Swastik sample brochure\n%%EOF"


def make_pdf(name="brochure.pdf"):
    return SimpleUploadedFile(name, VALID_PDF, content_type="application/pdf")


def make_user(email, role):
    return User.objects.create_user(
        username=email.split("@", 1)[0],
        email=email,
        password="Test-Only-Strong-Pass-839!",
        role=role,
    )


class PropertyValidationTests(TestCase):
    def test_accepts_google_maps_link(self):
        validate_google_maps_url(MAP_URL)

    def test_rejects_non_google_location_url(self):
        with self.assertRaises(ValidationError):
            validate_google_maps_url("https://example.com/location")

    def test_extracts_place_coordinates_from_google_maps_link(self):
        latitude, longitude = extract_google_maps_coordinates(MAP_URL)

        self.assertEqual(latitude, 19.6565164)
        self.assertEqual(longitude, 75.3296438)

    def test_slug_is_unique_for_duplicate_property_names(self):
        first = Property.objects.create(
            name="ABC 3 Signature",
            location_url=MAP_URL,
            brochure=make_pdf(),
        )
        second = Property.objects.create(
            name="ABC 3 Signature",
            location_url=MAP_URL,
            brochure=make_pdf("second.pdf"),
        )

        self.assertEqual(first.slug, "abc-3-signature")
        self.assertEqual(second.slug, "abc-3-signature-2")
        self.assertNotEqual(first.property_reference, second.property_reference)

    def test_coordinates_are_saved_when_parsed_by_serializer(self):
        from .serializers import PropertySerializer

        serializer = PropertySerializer(
            data={
                "name": "ABC 3 Signature",
                "location_url": MAP_URL,
                "brochure": make_pdf(),
            }
        )
        self.assertTrue(serializer.is_valid(), serializer.errors)
        property_obj = serializer.save()

        self.assertEqual(property_obj.latitude, Decimal("19.6565164"))
        self.assertEqual(property_obj.longitude, Decimal("75.3296438"))

    def test_invalid_pdf_signature_is_rejected(self):
        from .validators import validate_pdf_upload

        bad_file = SimpleUploadedFile(
            "not-really-a-pdf.pdf",
            b"plain text",
            content_type="application/pdf",
        )
        with self.assertRaises(ValidationError):
            validate_pdf_upload(bad_file)

    def test_oversized_brochure_is_rejected(self):
        from .validators import validate_pdf_upload

        class OversizedFile:
            name = "large.pdf"
            size = 26 * 1024 * 1024

            def tell(self):
                return 0

            def seek(self, position):
                return None

            def read(self, size):
                return b"%PDF-"

        with self.assertRaises(ValidationError):
            validate_pdf_upload(OversizedFile())


class PropertyAPITests(TestCase):
    def setUp(self):
        self.admin = make_user("admin@example.com", User.Role.ADMIN)
        self.super_admin = make_user("root@example.com", User.Role.SUPER_ADMIN)
        self.agent = make_user("agent@example.com", User.Role.AGENT)
        self.client = APIClient()
        self.media_dir = TemporaryDirectory()
        self.override = override_settings(MEDIA_ROOT=self.media_dir.name)
        self.override.enable()

    def tearDown(self):
        self.override.disable()
        self.media_dir.cleanup()

    def create_property(self, name, publication_status):
        return Property.objects.create(
            name=name,
            location_url=MAP_URL,
            brochure=make_pdf(f"{name.lower().replace(' ', '-')}.pdf"),
            publication_status=publication_status,
        )

    def test_public_list_contains_only_published_properties(self):
        published = self.create_property(
            "Published project",
            Property.PublicationStatus.PUBLISHED,
        )
        self.create_property("Draft project", Property.PublicationStatus.DRAFT)

        response = self.client.get("/api/v1/properties/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["slug"], published.slug)

    def test_public_detail_hides_unpublished_property(self):
        draft = self.create_property("Private project", Property.PublicationStatus.DRAFT)

        response = self.client.get(f"/api/v1/properties/{draft.slug}/")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_admin_can_upload_a_property_using_multipart_form_data(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            "/api/v1/properties/",
            {
                "name": "ABC 3 Signature",
                "developer_name": "ABC Group",
                "category": "LAND",
                "subcategory": "Residential Plot",
                "location_name": "Bidkin, Chhatrapati Sambhajinagar",
                "location_url": MAP_URL,
                "price": "",
                "area_value": "",
                "brochure": make_pdf(),
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        saved = Property.objects.get(slug="abc-3-signature")
        self.assertEqual(saved.created_by, self.admin)
        self.assertIsNone(saved.price)
        self.assertIsNone(saved.area_value)
        self.assertEqual(saved.publication_status, Property.PublicationStatus.DRAFT)
        self.assertEqual(saved.latitude, Decimal("19.6565164"))
        self.assertIn("brochure_url", response.data)

    def test_admin_can_publish_property(self):
        draft = self.create_property("Publish me", Property.PublicationStatus.DRAFT)
        self.client.force_authenticate(user=self.admin)

        response = self.client.patch(
            f"/api/v1/properties/{draft.slug}/",
            {"publication_status": "PUBLISHED"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        draft.refresh_from_db()
        self.assertEqual(draft.publication_status, Property.PublicationStatus.PUBLISHED)
        self.assertEqual(draft.approved_by, self.admin)
        self.assertIsNotNone(draft.published_at)

    def test_admin_can_replace_brochure_and_old_file_is_removed(self):
        property_obj = self.create_property("Replace brochure", Property.PublicationStatus.DRAFT)
        old_name = property_obj.brochure.name
        storage = property_obj.brochure.storage
        self.client.force_authenticate(user=self.admin)

        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.patch(
                f"/api/v1/properties/{property_obj.slug}/",
                {"brochure": make_pdf("updated-brochure.pdf")},
                format="multipart",
            )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        property_obj.refresh_from_db()
        self.assertNotEqual(property_obj.brochure.name, old_name)
        self.assertFalse(storage.exists(old_name))
        self.assertTrue(storage.exists(property_obj.brochure.name))

    def test_admin_can_permanently_delete_property_and_brochure(self):
        property_obj = self.create_property(
            "Delete me",
            Property.PublicationStatus.DRAFT,
        )
        brochure_name = property_obj.brochure.name
        storage = property_obj.brochure.storage
        self.client.force_authenticate(user=self.admin)

        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.delete(f"/api/v1/properties/{property_obj.slug}/")

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Property.objects.filter(pk=property_obj.pk).exists())
        self.assertFalse(storage.exists(brochure_name))

    def test_agent_cannot_create_properties(self):
        self.client.force_authenticate(user=self.agent)

        response = self.client.post(
            "/api/v1/properties/",
            {
                "name": "Agent project",
                "location_url": MAP_URL,
                "brochure": make_pdf(),
            },
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_view_unpublished_properties(self):
        draft = self.create_property("Admin draft", Property.PublicationStatus.DRAFT)
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(f"/api/v1/properties/{draft.slug}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["publication_status"], "DRAFT")

    def test_public_list_can_search_by_property_name(self):
        self.create_property("ABC 3 Signature", Property.PublicationStatus.PUBLISHED)

        response = self.client.get("/api/v1/properties/?search=Signature")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)

    def test_public_list_can_filter_by_category(self):
        self.create_property("Land project", Property.PublicationStatus.PUBLISHED)
        Property.objects.filter(name="Land project").update(category="LAND")

        response = self.client.get("/api/v1/properties/?category=LAND")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)


class PropertyModelFileTests(TestCase):
    def test_brochure_is_required_by_model_field(self):
        field = Property._meta.get_field("brochure")
        self.assertFalse(field.blank)
        self.assertFalse(field.null)


def make_property_image(name="property-photo.jpg", color=(40, 120, 80)):
    from io import BytesIO

    from PIL import Image

    buffer = BytesIO()
    Image.new("RGB", (32, 24), color).save(buffer, format="JPEG")
    return SimpleUploadedFile(
        name,
        buffer.getvalue(),
        content_type="image/jpeg",
    )


class PropertyImageAPITests(TestCase):
    def setUp(self):
        self.admin = make_user("image-admin@example.com", User.Role.ADMIN)
        self.client = APIClient()
        self.media_dir = TemporaryDirectory()
        self.override = override_settings(MEDIA_ROOT=self.media_dir.name)
        self.override.enable()
        self.property = Property.objects.create(
            name="Photo Gallery Property",
            location_url=MAP_URL,
            brochure=make_pdf("photo-gallery.pdf"),
        )

    def tearDown(self):
        self.override.disable()
        self.media_dir.cleanup()

    def image_url(self):
        return f"/api/v1/properties/{self.property.slug}/images/"

    def test_admin_can_upload_multiple_property_images_and_first_is_primary(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(
            self.image_url(),
            {
                "images": [
                    make_property_image("front.jpg"),
                    make_property_image("lobby.jpg", color=(90, 80, 40)),
                ]
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertEqual(len(response.data), 2)
        self.assertTrue(response.data[0]["is_primary"])
        self.assertFalse(response.data[1]["is_primary"])
        self.assertEqual(self.property.images.count(), 2)

    def test_public_can_read_photos_only_for_published_properties(self):
        self.client.force_authenticate(user=self.admin)
        upload = self.client.post(
            self.image_url(),
            {"images": [make_property_image("public-photo.jpg")]},
            format="multipart",
        )
        self.assertEqual(upload.status_code, status.HTTP_201_CREATED, upload.data)
        self.client.force_authenticate(user=None)

        hidden_response = self.client.get(self.image_url())
        self.assertEqual(hidden_response.status_code, status.HTTP_404_NOT_FOUND)

        self.property.publication_status = Property.PublicationStatus.PUBLISHED
        self.property.save()
        public_response = self.client.get(self.image_url())

        self.assertEqual(public_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(public_response.data), 1)
        self.assertIn("/media/properties/", public_response.data[0]["image_url"])
        self.assertTrue(public_response.data[0]["is_primary"])

        property_response = self.client.get(
            f"/api/v1/properties/{self.property.slug}/"
        )
        self.assertEqual(property_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(property_response.data["images"]), 1)
        self.assertTrue(property_response.data["images"][0]["is_primary"])

    def test_agent_cannot_upload_property_images(self):
        agent = make_user("image-agent@example.com", User.Role.AGENT)
        self.client.force_authenticate(user=agent)
        response = self.client.post(
            self.image_url(),
            {"images": [make_property_image()]},
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_invalid_image_content_is_rejected(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(
            self.image_url(),
            {
                "images": [
                    SimpleUploadedFile(
                        "not-an-image.jpg",
                        b"this is not an image",
                        content_type="image/jpeg",
                    )
                ]
            },
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_admin_can_change_primary_image_and_delete_image(self):
        self.client.force_authenticate(user=self.admin)
        uploaded = self.client.post(
            self.image_url(),
            {
                "images": [
                    make_property_image("primary.jpg"),
                    make_property_image("secondary.jpg", color=(120, 40, 80)),
                ]
            },
            format="multipart",
        )
        self.assertEqual(uploaded.status_code, status.HTTP_201_CREATED, uploaded.data)
        first_id, second_id = [item["id"] for item in uploaded.data]

        change_response = self.client.patch(
            f"{self.image_url()}{second_id}/",
            {"is_primary": True},
            format="json",
        )
        self.assertEqual(change_response.status_code, status.HTTP_200_OK)
        self.assertTrue(change_response.data["is_primary"])
        self.assertFalse(PropertyImage.objects.get(pk=first_id).is_primary)

        image = PropertyImage.objects.get(pk=second_id)
        storage = image.image.storage
        filename = image.image.name
        with self.captureOnCommitCallbacks(execute=True):
            delete_response = self.client.delete(f"{self.image_url()}{second_id}/")

        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(storage.exists(filename))
        self.assertTrue(PropertyImage.objects.get(pk=first_id).is_primary)

    def test_permanent_property_deletion_removes_all_photo_files(self):
        self.client.force_authenticate(user=self.admin)
        uploaded = self.client.post(
            self.image_url(),
            {"images": [make_property_image("delete-photo.jpg")]},
            format="multipart",
        )
        self.assertEqual(uploaded.status_code, status.HTTP_201_CREATED, uploaded.data)
        image = self.property.images.get()
        storage = image.image.storage
        filename = image.image.name

        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.delete(
                f"/api/v1/properties/{self.property.slug}/"
            )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(storage.exists(filename))
