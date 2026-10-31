from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.permissions import AllowAny

from .filters import CityFilter, LocalityFilter
from .models import City, District, Locality, State
from .serializers import (
    CitySerializer,
    DistrictSerializer,
    LocalitySerializer,
    StateSerializer,
)


class PublicLocationViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only location lookup endpoint intended for public website forms."""

    authentication_classes = ()
    permission_classes = (AllowAny,)
    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    search_fields = ("name",)
    ordering_fields = ("name",)
    ordering = ("name",)


class StateViewSet(PublicLocationViewSet):
    queryset = State.objects.filter(is_active=True)
    serializer_class = StateSerializer


class DistrictViewSet(PublicLocationViewSet):
    queryset = District.objects.filter(
        is_active=True,
        state__is_active=True,
    ).select_related("state")
    serializer_class = DistrictSerializer
    filterset_fields = ("state",)


class CityViewSet(PublicLocationViewSet):
    queryset = City.objects.filter(
        is_active=True,
        district__is_active=True,
        district__state__is_active=True,
    ).select_related("district", "district__state")
    serializer_class = CitySerializer
    filterset_class = CityFilter


class LocalityViewSet(PublicLocationViewSet):
    queryset = Locality.objects.filter(
        is_active=True,
        city__is_active=True,
        city__district__is_active=True,
        city__district__state__is_active=True,
    ).select_related(
        "city",
        "city__district",
        "city__district__state",
    )
    serializer_class = LocalitySerializer
    filterset_class = LocalityFilter
