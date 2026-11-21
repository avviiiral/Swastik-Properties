from django.urls import path

from .agent_views import (
    AdminLeadAssignmentView,
    AgentLeadActivityListCreateView,
    AgentLeadDetailView,
    AgentLeadListView,
)
from .views import (
    AdminPropertyEnquiryDetailView,
    AdminPropertyEnquiryExportView,
    AdminPropertyEnquiryListView,
    BusinessContactSettingsView,
    LeadSubmissionCreateView,
    PropertyEnquiryCreateView,
)

app_name = "submissions"

urlpatterns = [
    path("property-enquiry/", PropertyEnquiryCreateView.as_view(), name="property-enquiry"),
    path("leads/", LeadSubmissionCreateView.as_view(), name="lead-create"),
    path("property-enquiries/", AdminPropertyEnquiryListView.as_view(), name="property-enquiry-list"),
    path("property-enquiries/<int:pk>/", AdminPropertyEnquiryDetailView.as_view(), name="property-enquiry-detail"),
    path("property-enquiries/<int:pk>/assignment/", AdminLeadAssignmentView.as_view(), name="property-enquiry-assignment"),
    path("property-enquiries/export/", AdminPropertyEnquiryExportView.as_view(), name="property-enquiry-export"),
    path("leads/export/", AdminPropertyEnquiryExportView.as_view(), name="lead-export"),
    path("agent/leads/", AgentLeadListView.as_view(), name="agent-lead-list"),
    path("agent/leads/<int:pk>/", AgentLeadDetailView.as_view(), name="agent-lead-detail"),
    path("agent/leads/<int:pk>/activities/", AgentLeadActivityListCreateView.as_view(), name="agent-lead-activities"),
    path("contact-settings/", BusinessContactSettingsView.as_view(), name="contact-settings"),
]
