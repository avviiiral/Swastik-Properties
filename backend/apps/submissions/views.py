import csv
import re

from django.http import HttpResponse
from django.utils import timezone
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination

from apps.accounts.permissions import IsAdminOrSuperAdmin

from .contact_serializers import (
    BusinessContactSettingsSerializer,
    PropertyEnquiryAdminSerializer,
)
from .models import BusinessContactSettings, PropertyEnquiry
from .serializers import PropertyEnquirySerializer


class PropertyEnquiryThrottle(AnonRateThrottle):
    rate = "5/hour"


class PropertyEnquiryCreateView(generics.CreateAPIView):
    serializer_class = PropertyEnquirySerializer
    permission_classes = (AllowAny,)
    throttle_classes = (PropertyEnquiryThrottle,)


class BusinessContactSettingsView(APIView):
    """Public read access; only Admin and Super Admin can update contact details."""

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAdminOrSuperAdmin()]

    def get(self, request):
        settings = BusinessContactSettings.get_settings()
        return Response(BusinessContactSettingsSerializer(settings).data)

    def patch(self, request):
        settings = BusinessContactSettings.get_settings()
        serializer = BusinessContactSettingsSerializer(
            settings, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class PropertyEnquiryPagination(PageNumberPagination):
    page_size = 8
    page_size_query_param = "page_size"
    max_page_size = 100


class AdminPropertyEnquiryListView(generics.ListAPIView):
    serializer_class = PropertyEnquiryAdminSerializer
    permission_classes = (IsAdminOrSuperAdmin,)
    pagination_class = PropertyEnquiryPagination
    queryset = PropertyEnquiry.objects.all()


def _safe_csv_cell(value):
    value = "" if value is None else str(value)
    if value.lstrip().startswith(("=", "+", "-", "@", "\t", "\r")):
        return "'" + value
    return value


class AdminPropertyEnquiryExportView(APIView):
    permission_classes = (IsAdminOrSuperAdmin,)

    def get(self, request):
        response = HttpResponse(content_type="text/csv; charset=utf-8")
        response["Content-Disposition"] = 'attachment; filename="swastik-property-enquiries.csv"'
        response.write("\ufeff")
        writer = csv.writer(response)
        writer.writerow([
            "Submitted At", "Property", "Property Reference", "Name",
            "Email", "Phone", "Message", "Status",
        ])
        for enquiry in PropertyEnquiry.objects.all().iterator():
            writer.writerow([
                _safe_csv_cell(timezone.localtime(enquiry.created_at).strftime("%Y-%m-%d %H:%M")),
                _safe_csv_cell(enquiry.property_name),
                _safe_csv_cell(enquiry.property_reference),
                _safe_csv_cell(enquiry.name),
                _safe_csv_cell(enquiry.email),
                _safe_csv_cell(enquiry.phone),
                _safe_csv_cell(enquiry.message),
                _safe_csv_cell(enquiry.status),
            ])
        return response
