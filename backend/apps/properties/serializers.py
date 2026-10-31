from decimal import Decimal

from rest_framework import serializers

from .models import Property
from .validators import extract_google_maps_coordinates, validate_google_maps_url


class PropertySerializer(serializers.ModelSerializer):
    brochure_url = serializers.SerializerMethodField()
    created_by_email = serializers.EmailField(source="created_by.email", read_only=True)
    approved_by_email = serializers.EmailField(source="approved_by.email", read_only=True)
    locality_name = serializers.CharField(source="locality.name", read_only=True)
    city_name = serializers.CharField(source="locality.city.name", read_only=True)
    district_name = serializers.CharField(
        source="locality.city.district.name",
        read_only=True,
    )
    state_name = serializers.CharField(
        source="locality.city.district.state.name",
        read_only=True,
    )

    class Meta:
        model = Property
        fields = (
            "id",
            "property_reference",
            "name",
            "slug",
            "description",
            "developer_name",
            "category",
            "subcategory",
            "listing_type",
            "price",
            "currency",
            "area_value",
            "area_unit",
            "location_name",
            "full_address",
            "locality",
            "locality_name",
            "city_name",
            "district_name",
            "state_name",
            "location_url",
            "latitude",
            "longitude",
            "brochure",
            "brochure_url",
            "publication_status",
            "availability_status",
            "created_by",
            "created_by_email",
            "approved_by",
            "approved_by_email",
            "approved_at",
            "published_at",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "property_reference",
            "slug",
            "brochure_url",
            "created_by",
            "created_by_email",
            "approved_by",
            "approved_by_email",
            "approved_at",
            "published_at",
            "created_at",
            "updated_at",
        )

    def get_brochure_url(self, obj):
        if not obj.brochure:
            return None
        request = self.context.get("request")
        url = obj.brochure.url
        return request.build_absolute_uri(url) if request else url

    def validate_location_url(self, value):
        validate_google_maps_url(value)
        return value

    def validate(self, attrs):
        locality = attrs.get("locality", getattr(self.instance, "locality", None))
        if locality and not locality.is_active:
            raise serializers.ValidationError(
                {"locality": "Select an active locality."}
            )

        price = attrs.get("price", getattr(self.instance, "price", None))
        if price is not None and price < Decimal("0"):
            raise serializers.ValidationError({"price": "Price cannot be negative."})

        area = attrs.get("area_value", getattr(self.instance, "area_value", None))
        if area is not None and area < Decimal("0"):
            raise serializers.ValidationError(
                {"area_value": "Area cannot be negative."}
            )

        latitude = attrs.get("latitude", getattr(self.instance, "latitude", None))
        longitude = attrs.get("longitude", getattr(self.instance, "longitude", None))
        location_url = attrs.get(
            "location_url",
            getattr(self.instance, "location_url", ""),
        )
        if location_url and (latitude is None or longitude is None):
            extracted_latitude, extracted_longitude = (
                extract_google_maps_coordinates(location_url)
            )
            if latitude is None and extracted_latitude is not None:
                attrs["latitude"] = Decimal(str(extracted_latitude))
            if longitude is None and extracted_longitude is not None:
                attrs["longitude"] = Decimal(str(extracted_longitude))

        return attrs
