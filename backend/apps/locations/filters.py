import django_filters

from .models import City, Locality


class CityFilter(django_filters.FilterSet):
    district = django_filters.NumberFilter(field_name="district_id")
    state = django_filters.NumberFilter(field_name="district__state_id")

    class Meta:
        model = City
        fields = ("district",)


class LocalityFilter(django_filters.FilterSet):
    city = django_filters.NumberFilter(field_name="city_id")
    district = django_filters.NumberFilter(field_name="city__district_id")
    state = django_filters.NumberFilter(field_name="city__district__state_id")

    class Meta:
        model = Locality
        fields = ("city",)
