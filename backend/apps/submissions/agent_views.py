from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import User
from apps.accounts.permissions import IsAgent, IsAdminOrSuperAdmin
from .agent_serializers import (
    AgentLeadSerializer, AgentLeadStatusSerializer, LeadActivitySerializer,
    LeadAssignmentSerializer,
)
from .models import LeadActivity, PropertyEnquiry


class AgentLeadListView(generics.ListAPIView):
    """An agent can see only the leads explicitly assigned to their account."""
    permission_classes = (IsAgent,)
    serializer_class = AgentLeadSerializer

    def get_queryset(self):
        queryset = PropertyEnquiry.objects.filter(assigned_to=self.request.user)
        lead_status = self.request.query_params.get("status")
        if lead_status:
            queryset = queryset.filter(status=lead_status)
        return queryset.select_related("property", "assigned_to")


class AgentLeadDetailView(APIView):
    permission_classes = (IsAgent,)

    def get_object(self, request, pk):
        return get_object_or_404(
            PropertyEnquiry.objects.select_related("property"),
            pk=pk, assigned_to=request.user,
        )

    def get(self, request, pk):
        return Response(AgentLeadSerializer(self.get_object(request, pk)).data)

    def patch(self, request, pk):
        lead = self.get_object(request, pk)
        previous_status = lead.status
        serializer = AgentLeadStatusSerializer(lead, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        if lead.status != previous_status:
            LeadActivity.objects.create(
                enquiry=lead, actor=request.user,
                activity_type=LeadActivity.ActivityType.STATUS_CHANGE,
                body=f"Status changed from {previous_status} to {lead.status}.",
            )
        return Response(AgentLeadSerializer(lead).data)


class AgentLeadActivityListCreateView(generics.ListCreateAPIView):
    permission_classes = (IsAgent,)
    pagination_class = None
    serializer_class = LeadActivitySerializer

    def get_lead(self):
        return get_object_or_404(
            PropertyEnquiry, pk=self.kwargs["pk"], assigned_to=self.request.user,
        )

    def get_queryset(self):
        return LeadActivity.objects.filter(enquiry=self.get_lead()).select_related("actor")

    def perform_create(self, serializer):
        serializer.save(
            enquiry=self.get_lead(), actor=self.request.user,
            activity_type=LeadActivity.ActivityType.NOTE,
        )


class AdminLeadAssignmentView(APIView):
    permission_classes = (IsAdminOrSuperAdmin,)

    def patch(self, request, pk):
        if "assigned_to" not in request.data:
            return Response({"assigned_to": "This field is required; use null to unassign."}, status=400)
        lead = get_object_or_404(PropertyEnquiry, pk=pk)
        old_agent = lead.assigned_to
        serializer = LeadAssignmentSerializer(lead, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        new_agent = serializer.validated_data.get("assigned_to")
        serializer.save(
            assigned_by=request.user,
            assigned_at=timezone.now() if new_agent else None,
        )
        if old_agent != lead.assigned_to:
            label = lead.assigned_to.get_full_name() or lead.assigned_to.email if lead.assigned_to else "Unassigned"
            LeadActivity.objects.create(
                enquiry=lead, actor=request.user,
                activity_type=LeadActivity.ActivityType.ASSIGNMENT,
                body=f"Lead assigned to {label}.",
            )
        return Response({
            "id": lead.pk,
            "assigned_to": lead.assigned_to_id,
            "assigned_agent": (
                lead.assigned_to.get_full_name() or lead.assigned_to.email
                if lead.assigned_to else None
            ),
            "assigned_at": lead.assigned_at,
        })
