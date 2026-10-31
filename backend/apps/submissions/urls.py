from django.urls import path

from .views import (
    AdminPropertyEnquiryExportView,
    AdminPropertyEnquiryListView,
    BusinessContactSettingsView,
    PropertyEnquiryCreateView,
)

app_name = "submissions"

urlpatterns = [
    path("property-enquiry/", PropertyEnquiryCreateView.as_view(), name="property-enquiry"),
    path("property-enquiries/", AdminPropertyEnquiryListView.as_view(), name="property-enquiry-list"),
    path("property-enquiries/export/", AdminPropertyEnquiryExportView.as_view(), name="property-enquiry-export"),
    path("contact-settings/", BusinessContactSettingsView.as_view(), name="contact-settings"),
]
