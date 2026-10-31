from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from rest_framework import filters, viewsets
from rest_framework.permissions import AllowAny

from apps.accounts.models import User
from apps.accounts.permissions import IsAdminOrSuperAdmin

from .models import Property
from .serializers import PropertySerializer


class PropertyViewSet(viewsets.ModelViewSet):
    """Public read access to published properties; administrator-only management."""

    serializer_class = PropertySerializer
    lookup_field = "slug"
    filter_backends = (
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    )
    filterset_fields = (
        "category",
        "listing_type",
        "availability_status",
    )
    search_fields = (
        "name",
        "description",
        "developer_name",
        "location_name",
        "full_address",
        "property_reference",
    )
    ordering_fields = ("created_at", "updated_at", "name", "price", "area_value")
    ordering = ("-created_at",)
    http_method_names = ("get", "post", "patch", "put", "delete", "head", "options")

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAdminOrSuperAdmin()]

    def get_queryset(self):
        queryset = Property.objects.select_related(
            "locality",
            "locality__city",
            "locality__city__district",
            "locality__city__district__state",
            "created_by",
            "approved_by",
        )

        user = self.request.user
        is_admin = (
            user.is_authenticated
            and user.is_active
            and user.role in (User.Role.ADMIN, User.Role.SUPER_ADMIN)
        )
        if not is_admin:
            queryset = queryset.filter(
                publication_status=Property.PublicationStatus.PUBLISHED
            )

        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        extra = {"created_by": user}
        if serializer.validated_data.get("publication_status") in (
            Property.PublicationStatus.APPROVED,
            Property.PublicationStatus.PUBLISHED,
        ):
            extra.update(approved_by=user, approved_at=timezone.now())
        serializer.save(**extra)

    def perform_update(self, serializer):
        user = self.request.user
        status_value = serializer.validated_data.get(
            "publication_status",
            serializer.instance.publication_status,
        )
        extra = {}
        if status_value in (
            Property.PublicationStatus.APPROVED,
            Property.PublicationStatus.PUBLISHED,
        ) and not serializer.instance.approved_at:
            extra.update(approved_by=user, approved_at=timezone.now())
        serializer.save(**extra)
