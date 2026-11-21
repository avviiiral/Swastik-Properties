from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import User
from .models import LeadActivity, PropertyEnquiry


class AgentLeadAccessTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            username="crm-admin", email="crm-admin@example.com",
            password="Test-Only-Strong-Pass-839!", role=User.Role.ADMIN,
        )
        self.agent = User.objects.create_user(
            username="crm-agent-one", email="crm-agent-one@example.com",
            password="Test-Only-Strong-Pass-839!", role=User.Role.AGENT,
        )
        self.other_agent = User.objects.create_user(
            username="crm-agent-two", email="crm-agent-two@example.com",
            password="Test-Only-Strong-Pass-839!", role=User.Role.AGENT,
        )
        self.owned_lead = self.make_lead("owned@example.com", self.agent)
        self.other_lead = self.make_lead("other@example.com", self.other_agent)
        self.unassigned_lead = self.make_lead("unassigned@example.com", None)

    def make_lead(self, email, assigned_to):
        return PropertyEnquiry.objects.create(
            name="Test Customer", email=email, phone="+919876543210",
            message="Please contact me about a property.",
            assigned_to=assigned_to,
        )

    def test_agent_list_contains_only_assigned_leads(self):
        self.client.force_authenticate(self.agent)
        response = self.client.get("/api/v1/submissions/agent/leads/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        returned_ids = {item["id"] for item in response.data["results"]}
        self.assertEqual(returned_ids, {self.owned_lead.pk})

    def test_agent_cannot_read_or_update_another_agents_lead(self):
        self.client.force_authenticate(self.agent)
        detail = f"/api/v1/submissions/agent/leads/{self.other_lead.pk}/"
        read_response = self.client.get(detail)
        update_response = self.client.patch(detail, {"status": "CLOSED"}, format="json")
        self.assertEqual(read_response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(update_response.status_code, status.HTTP_404_NOT_FOUND)
        self.other_lead.refresh_from_db()
        self.assertEqual(self.other_lead.status, PropertyEnquiry.Status.NEW)

    def test_agent_can_update_owned_lead_and_status_is_recorded(self):
        self.client.force_authenticate(self.agent)
        response = self.client.patch(
            f"/api/v1/submissions/agent/leads/{self.owned_lead.pk}/",
            {"status": "CONTACTED"}, format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertEqual(response.data["status"], "CONTACTED")
        activity = LeadActivity.objects.get(enquiry=self.owned_lead)
        self.assertEqual(activity.actor, self.agent)
        self.assertEqual(activity.activity_type, LeadActivity.ActivityType.STATUS_CHANGE)

    def test_agent_can_add_note_to_owned_lead_only(self):
        self.client.force_authenticate(self.agent)
        url = f"/api/v1/submissions/agent/leads/{self.owned_lead.pk}/activities/"
        response = self.client.post(url, {"body": "Called customer; requested a site visit."}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        activity = LeadActivity.objects.get(enquiry=self.owned_lead)
        self.assertEqual(activity.actor, self.agent)
        self.assertEqual(activity.body, "Called customer; requested a site visit.")

        forbidden = self.client.post(
            f"/api/v1/submissions/agent/leads/{self.other_lead.pk}/activities/",
            {"body": "Attempted access"}, format="json",
        )
        self.assertEqual(forbidden.status_code, status.HTTP_404_NOT_FOUND)

    def test_agent_cannot_mark_lead_as_spam(self):
        self.client.force_authenticate(self.agent)
        response = self.client.patch(
            f"/api/v1/submissions/agent/leads/{self.owned_lead.pk}/",
            {"status": "SPAM"}, format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_admin_can_assign_and_unassign_agent(self):
        self.client.force_authenticate(self.admin)
        url = f"/api/v1/submissions/property-enquiries/{self.unassigned_lead.pk}/assignment/"
        assigned = self.client.patch(url, {"assigned_to": self.agent.pk}, format="json")
        self.assertEqual(assigned.status_code, status.HTTP_200_OK, assigned.data)
        self.assertEqual(assigned.data["assigned_to"], self.agent.pk)
        self.assertTrue(LeadActivity.objects.filter(
            enquiry=self.unassigned_lead,
            activity_type=LeadActivity.ActivityType.ASSIGNMENT,
        ).exists())

        unassigned = self.client.patch(url, {"assigned_to": None}, format="json")
        self.assertEqual(unassigned.status_code, status.HTTP_200_OK, unassigned.data)
        self.assertIsNone(unassigned.data["assigned_to"])

    def test_admin_cannot_assign_lead_to_non_agent(self):
        self.client.force_authenticate(self.admin)
        response = self.client.patch(
            f"/api/v1/submissions/property-enquiries/{self.unassigned_lead.pk}/assignment/",
            {"assigned_to": self.admin.pk}, format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_admin_assignment_endpoint_rejects_agent(self):
        self.client.force_authenticate(self.agent)
        response = self.client.patch(
            f"/api/v1/submissions/property-enquiries/{self.unassigned_lead.pk}/assignment/",
            {"assigned_to": self.agent.pk}, format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
