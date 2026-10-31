from rest_framework import serializers

from .models import City, District, Locality, State


class StateSerializer(serializers.ModelSerializer):
    class Meta:
        model = State
        fields = ("id", "name", "slug")
        read_only_fields = fields


class DistrictSerializer(serializers.ModelSerializer):
    state_name = serializers.CharField(source="state.name", read_only=True)

    class Meta:
        model = District
        fields = ("id", "name", "slug", "state", "state_name")
        read_only_fields = fields


class CitySerializer(serializers.ModelSerializer):
    district_name = serializers.CharField(source="district.name", read_only=True)
    state_id = serializers.IntegerField(source="district.state_id", read_only=True)
    state_name = serializers.CharField(source="district.state.name", read_only=True)

    class Meta:
        model = City
        fields = (
            "id",
            "name",
            "slug",
            "district",
            "district_name",
            "state_id",
            "state_name",
        )
        read_only_fields = fields


class LocalitySerializer(serializers.ModelSerializer):
    city_name = serializers.CharField(source="city.name", read_only=True)
    district_id = serializers.IntegerField(
        source="city.district_id",
        read_only=True,
    )
    district_name = serializers.CharField(
        source="city.district.name",
        read_only=True,
    )
    state_id = serializers.IntegerField(
        source="city.district.state_id",
        read_only=True,
    )
    state_name = serializers.CharField(
        source="city.district.state.name",
        read_only=True,
    )

    class Meta:
        model = Locality
        fields = (
            "id",
            "name",
            "slug",
            "city",
            "city_name",
            "district_id",
            "district_name",
            "state_id",
            "state_name",
        )
        read_only_fields = fields
