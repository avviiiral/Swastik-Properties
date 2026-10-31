import csv
import json

from django.db.models import Q
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView

from apps.accounts.permissions import IsAdminOrSuperAdmin

from .contact_serializers import (
    BusinessContactSettingsSerializer,
    PropertyEnquiryAdminSerializer,
    PropertyEnquiryUpdateSerializer,
)
from .models import BusinessContactSettings, PropertyEnquiry
from .serializers import LeadSubmissionSerializer, PropertyEnquirySerializer


class PropertyEnquiryThrottle(AnonRateThrottle):
    rate = "5/hour"


class LeadSubmissionThrottle(AnonRateThrottle):
    rate = "10/hour"


class PropertyEnquiryCreateView(generics.CreateAPIView):
    serializer_class = PropertyEnquirySerializer
    permission_classes = (AllowAny,)
    throttle_classes = (PropertyEnquiryThrottle,)


class LeadSubmissionCreateView(generics.CreateAPIView):
    """Public endpoint for general, property, buy, rent, sell and listing forms."""

    serializer_class = LeadSubmissionSerializer
    permission_classes = (AllowAny,)
    throttle_classes = (LeadSubmissionThrottle,)


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
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


def filtered_enquiries(params):
    queryset = PropertyEnquiry.objects.all()
    enquiry_type = params.get("enquiry_type")
    lead_status = params.get("status")
    search = params.get("search", "").strip()

    if enquiry_type:
        queryset = queryset.filter(enquiry_type=enquiry_type)
    if lead_status:
        queryset = queryset.filter(status=lead_status)
    if search:
        queryset = queryset.filter(
            Q(name__icontains=search)
            | Q(email__icontains=search)
            | Q(phone__icontains=search)
            | Q(message__icontains=search)
            | Q(property_name__icontains=search)
            | Q(property_reference__icontains=search)
        )
    return queryset


class AdminPropertyEnquiryListView(generics.ListAPIView):
    serializer_class = PropertyEnquiryAdminSerializer
    permission_classes = (IsAdminOrSuperAdmin,)
    pagination_class = PropertyEnquiryPagination

    def get_queryset(self):
        return filtered_enquiries(self.request.query_params)


class AdminPropertyEnquiryDetailView(APIView):
    permission_classes = (IsAdminOrSuperAdmin,)

    def patch(self, request, pk):
        enquiry = get_object_or_404(PropertyEnquiry, pk=pk)
        serializer = PropertyEnquiryUpdateSerializer(
            enquiry, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(PropertyEnquiryAdminSerializer(enquiry).data)


def _safe_csv_cell(value):
    value = "" if value is None else str(value)
    if value.lstrip().startswith(("=", "+", "-", "@", "\t", "\r")):
        return "'" + value
    return value


class AdminPropertyEnquiryExportView(APIView):
    permission_classes = (IsAdminOrSuperAdmin,)

    def get(self, request):
        response = HttpResponse(content_type="text/csv; charset=utf-8")
        response["Content-Disposition"] = 'attachment; filename="swastik-enquiries.csv"'
        response.write("\ufeff")
        writer = csv.writer(response)
        writer.writerow([
            "Submitted At", "Form Type", "Property", "Property Reference",
            "Name", "Email", "Phone", "Message", "Additional Details",
            "Status", "Consent Recorded At", "Admin Notes", "Source Page",
        ])
        for enquiry in filtered_enquiries(request.query_params).iterator():
            consented_at = (
                timezone.localtime(enquiry.consented_at).strftime("%Y-%m-%d %H:%M")
                if enquiry.consented_at else ""
            )
            writer.writerow([
                _safe_csv_cell(timezone.localtime(enquiry.created_at).strftime("%Y-%m-%d %H:%M")),
                _safe_csv_cell(enquiry.get_enquiry_type_display()),
                _safe_csv_cell(enquiry.property_name),
                _safe_csv_cell(enquiry.property_reference),
                _safe_csv_cell(enquiry.name),
                _safe_csv_cell(enquiry.email),
                _safe_csv_cell(enquiry.phone),
                _safe_csv_cell(enquiry.message),
                _safe_csv_cell(json.dumps(enquiry.details, ensure_ascii=False, sort_keys=True)),
                _safe_csv_cell(enquiry.status),
                _safe_csv_cell(consented_at),
                _safe_csv_cell(enquiry.admin_notes),
                _safe_csv_cell(enquiry.source_path),
            ])
        return response
