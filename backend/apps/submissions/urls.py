from django.urls import path

from .views import PropertyEnquiryCreateView

app_name = "submissions"

urlpatterns = [
    path("property-enquiry/", PropertyEnquiryCreateView.as_view(), name="property-enquiry"),
]
