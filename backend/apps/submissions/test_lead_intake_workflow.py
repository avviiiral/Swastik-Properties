from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import User
from .models import PropertyEnquiry


class LeadIntakeAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def payload(self, enquiry_type="GENERAL_ENQUIRY"):
        details = {}
        if enquiry_type in ("BUY_REQUIREMENT", "RENT_REQUIREMENT"):
            details = {"preferred_location": "Nagpur", "budget_min": "2000000", "budget_max": "5000000"}
        elif enquiry_type in ("SELL_PROPERTY", "PROPERTY_LISTING"):
            details = {"property_location": "Nagpur"}
        return {
            "enquiry_type": enquiry_type,
            "name": "Sample Customer",
            "email": "customer@example.com",
            "phone": "+91 9876543210",
            "message": "Please contact me to discuss this property requirement.",
            "details": details,
            "source_path": "/contact",
            "consent": True,
            "website": "",
        }

    def test_all_six_public_form_types_are_saved(self):
        enquiry_types = [
            "GENERAL_ENQUIRY",
            "PROPERTY_ENQUIRY",
            "BUY_REQUIREMENT",
            "RENT_REQUIREMENT",
            "SELL_PROPERTY",
            "PROPERTY_LISTING",
        ]
        for enquiry_type in enquiry_types:
            with self.subTest(enquiry_type=enquiry_type):
                response = self.client.post(
                    "/api/v1/submissions/leads/",
                    self.payload(enquiry_type),
                    format="json",
                )
                self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)

        self.assertEqual(PropertyEnquiry.objects.count(), 6)
        self.assertTrue(all(
            item.consented_at is not None
            for item in PropertyEnquiry.objects.all()
        ))
        self.assertEqual(
            set(PropertyEnquiry.objects.values_list("enquiry_type", flat=True)),
            set(enquiry_types),
        )

    def test_public_submission_requires_contact_consent(self):
        payload = self.payload()
        payload["consent"] = False
        response = self.client.post("/api/v1/submissions/leads/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(PropertyEnquiry.objects.exists())

    def test_honeypot_rejects_automated_submission(self):
        payload = self.payload()
        payload["website"] = "https://spam.example"
        response = self.client.post("/api/v1/submissions/leads/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(PropertyEnquiry.objects.exists())

    def test_buy_requirement_needs_a_preferred_location(self):
        payload = self.payload("BUY_REQUIREMENT")
        payload["details"] = {"budget_max": "5000000"}
        response = self.client.post("/api/v1/submissions/leads/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class LeadAdministrationAPITests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="lead-admin",
            email="lead-admin@example.com",
            password="Test-Only-Strong-Pass-839!",
            role=User.Role.ADMIN,
        )
        self.agent = User.objects.create_user(
            username="lead-agent",
            email="lead-agent@example.com",
            password="Test-Only-Strong-Pass-839!",
            role=User.Role.AGENT,
        )
        self.client = APIClient()
        self.lead = PropertyEnquiry.objects.create(
            enquiry_type=PropertyEnquiry.EnquiryType.BUY_REQUIREMENT,
            name="Interested Buyer",
            email="buyer@example.com",
            phone="+919876543210",
            message="Looking for a residential property in Nagpur.",
            details={"preferred_location": "Nagpur", "budget_max": "8000000"},
            source_path="/contact",
        )

    def test_admin_can_filter_update_and_export_leads(self):
        self.client.force_authenticate(user=self.admin)
        listing = self.client.get(
            "/api/v1/submissions/property-enquiries/?enquiry_type=BUY_REQUIREMENT&status=NEW&search=Nagpur"
        )
        self.assertEqual(listing.status_code, status.HTTP_200_OK, listing.data)
        self.assertEqual(listing.data["count"], 1)
        self.assertEqual(listing.data["results"][0]["details"]["preferred_location"], "Nagpur")

        update = self.client.patch(
            f"/api/v1/submissions/property-enquiries/{self.lead.pk}/",
            {"status": "QUALIFIED", "admin_notes": "Call completed; arrange site visit."},
            format="json",
        )
        self.assertEqual(update.status_code, status.HTTP_200_OK, update.data)
        self.lead.refresh_from_db()
        self.assertEqual(self.lead.status, PropertyEnquiry.Status.QUALIFIED)
        self.assertEqual(self.lead.admin_notes, "Call completed; arrange site visit.")

        export = self.client.get(
            "/api/v1/submissions/property-enquiries/export/?enquiry_type=BUY_REQUIREMENT"
        )
        self.assertEqual(export.status_code, status.HTTP_200_OK)
        csv_text = export.content.decode("utf-8-sig")
        self.assertIn("Buy requirement", csv_text)
        self.assertIn("preferred_location", csv_text)
        self.assertIn("arrange site visit", csv_text)

    def test_agents_cannot_access_customer_leads(self):
        self.client.force_authenticate(user=self.agent)
        listing = self.client.get("/api/v1/submissions/property-enquiries/")
        update = self.client.patch(
            f"/api/v1/submissions/property-enquiries/{self.lead.pk}/",
            {"status": "CLOSED"},
            format="json",
        )
        self.assertEqual(listing.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(update.status_code, status.HTTP_403_FORBIDDEN)
