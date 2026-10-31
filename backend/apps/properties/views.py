from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.accounts.models import User
from apps.accounts.permissions import IsAdminOrSuperAdmin

from .models import Property, PropertyImage
from .serializers import PropertyImageSerializer, PropertySerializer


class PropertyViewSet(viewsets.ModelViewSet):
    """Public read access to published properties; administrator-only management."""

    serializer_class = PropertySerializer
    lookup_field = "slug"
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
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
        if self.action == "images" and self.request.method == "GET":
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
        ).prefetch_related("images")

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

        # Public filters only narrow the already-published catalogue.
        for field in ("category", "listing_type", "availability_status"):
            value = self.request.query_params.get(field)
            if value:
                queryset = queryset.filter(**{field: value})

        # Publication state is an administrative workflow detail, never a
        # public query parameter.
        if is_admin:
            publication_status = self.request.query_params.get("publication_status")
            if publication_status:
                queryset = queryset.filter(publication_status=publication_status)

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


    @action(
        detail=True,
        methods=("get", "post"),
        url_path="images",
        parser_classes=(MultiPartParser, FormParser),
    )
    def images(self, request, slug=None):
        """List public images or upload a batch of images for an admin-managed property."""
        property_obj = self.get_object()

        if request.method == "GET":
            images = property_obj.images.all()
            serializer = PropertyImageSerializer(
                images,
                many=True,
                context=self.get_serializer_context(),
            )
            return Response(serializer.data)

        uploaded_files = request.FILES.getlist("images") or request.FILES.getlist("image")
        if not uploaded_files:
            return Response(
                {"images": "Select at least one property photo."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if len(uploaded_files) > 20:
            return Response(
                {"images": "Upload no more than 20 photos in one request."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        primary_index = request.data.get("primary_index")
        if primary_index not in (None, ""):
            try:
                primary_index = int(primary_index)
            except (TypeError, ValueError):
                return Response(
                    {"primary_index": "Select a valid primary photo index."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if primary_index < 0 or primary_index >= len(uploaded_files):
                return Response(
                    {"primary_index": "Primary photo index is outside the uploaded image list."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        next_order = (
            property_obj.images.order_by("-sort_order")
            .values_list("sort_order", flat=True)
            .first()
        )
        next_order = (next_order + 1) if next_order is not None else 0
        caption = request.data.get("caption", "")
        alt_text = request.data.get("alt_text", "")

        payload = [
            {
                "image": uploaded_file,
                "caption": caption,
                "alt_text": alt_text or property_obj.name,
                "is_primary": index == primary_index if primary_index is not None else False,
                "sort_order": next_order + index,
            }
            for index, uploaded_file in enumerate(uploaded_files)
        ]
        serializer = PropertyImageSerializer(
            data=payload,
            many=True,
            context=self.get_serializer_context(),
        )
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            serializer.save(property=property_obj)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(
        detail=True,
        methods=("patch", "delete"),
        url_path=r"images/(?P<image_id>[^/.]+)",
    )
    def image_detail(self, request, slug=None, image_id=None):
        """Set a primary photo or permanently remove a property image."""
        property_obj = self.get_object()
        image = get_object_or_404(property_obj.images.all(), pk=image_id)

        if request.method == "DELETE":
            image.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        if request.data.get("is_primary") is not True:
            return Response(
                {"is_primary": "Set is_primary to true to make this the primary photo."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        image.is_primary = True
        image.save(update_fields=("is_primary",))
        serializer = PropertyImageSerializer(
            image,
            context=self.get_serializer_context(),
        )
        return Response(serializer.data)
