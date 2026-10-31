from rest_framework import serializers

from apps.properties.models import Property
from .models import PropertyEnquiry


class PropertyEnquirySerializer(serializers.ModelSerializer):
    property_slug = serializers.SlugField(write_only=True)

    class Meta:
        model = PropertyEnquiry
        fields = ("id", "property_slug", "name", "email", "phone", "message", "created_at")
        read_only_fields = ("id", "created_at")

    def validate_property_slug(self, value):
        try:
            return Property.objects.get(
                slug=value,
                publication_status=Property.PublicationStatus.PUBLISHED,
                availability_status=Property.AvailabilityStatus.AVAILABLE,
            )
        except Property.DoesNotExist:
            raise serializers.ValidationError("This property is not currently available for enquiries.")

    def validate_name(self, value):
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError("Enter your full name.")
        return value

    def validate_phone(self, value):
        value = value.strip()
        digits = "".join(character for character in value if character.isdigit())
        if len(digits) < 10 or len(digits) > 15:
            raise serializers.ValidationError("Enter a valid phone number.")
        return value

    def validate_message(self, value):
        value = value.strip()
        if len(value) < 10:
            raise serializers.ValidationError("Please add a little more detail to your enquiry.")
        return value

    def create(self, validated_data):
        property_obj = validated_data.pop("property_slug")
        return PropertyEnquiry.objects.create(
            property=property_obj,
            property_name=property_obj.name,
            property_reference=property_obj.property_reference,
            **validated_data,
        )
