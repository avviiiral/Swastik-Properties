from django.utils import timezone
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
            enquiry_type=PropertyEnquiry.EnquiryType.PROPERTY_ENQUIRY,
            **validated_data,
        )


class LeadSubmissionSerializer(serializers.ModelSerializer):
    """Validated public intake for all six website form types."""

    property_slug = serializers.SlugField(
        write_only=True, required=False, allow_blank=True
    )
    consent = serializers.BooleanField(write_only=True, required=True)
    website = serializers.CharField(write_only=True, required=False, allow_blank=True)
    details = serializers.JSONField(required=False, default=dict)

    class Meta:
        model = PropertyEnquiry
        fields = (
            "id", "enquiry_type", "property_slug", "name", "email", "phone",
            "message", "details", "source_path", "consent", "website", "created_at",
        )
        read_only_fields = ("id", "created_at")

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
        if not value:
            raise serializers.ValidationError("Please enter a message.")
        return value

    def validate_details(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("Additional details must be an object.")
        if len(str(value)) > 8000:
            raise serializers.ValidationError("Additional details are too long.")
        return value

    def validate_website(self, value):
        if value.strip():
            raise serializers.ValidationError("Unable to accept this submission.")
        return value

    def validate_consent(self, value):
        if not value:
            raise serializers.ValidationError("Please agree to be contacted about this request.")
        return value

    def validate(self, attrs):
        property_slug = attrs.pop("property_slug", "")
        if property_slug:
            try:
                attrs["_property"] = Property.objects.get(
                    slug=property_slug,
                    publication_status=Property.PublicationStatus.PUBLISHED,
                    availability_status=Property.AvailabilityStatus.AVAILABLE,
                )
            except Property.DoesNotExist:
                raise serializers.ValidationError({
                    "property_slug": "This property is not currently available for enquiries."
                })

        enquiry_type = attrs.get("enquiry_type")
        details = attrs.get("details") or {}
        required_key = {
            PropertyEnquiry.EnquiryType.BUY_REQUIREMENT: "preferred_location",
            PropertyEnquiry.EnquiryType.RENT_REQUIREMENT: "preferred_location",
            PropertyEnquiry.EnquiryType.SELL_PROPERTY: "property_location",
            PropertyEnquiry.EnquiryType.PROPERTY_LISTING: "property_location",
        }.get(enquiry_type)
        if required_key and not str(details.get(required_key, "")).strip():
            raise serializers.ValidationError({
                "details": f"Provide {required_key.replace('_', ' ')} for this form type."
            })

        # Property prices and customer budgets are intentionally not collected.
        # Reject price-like keys instead of silently persisting arbitrary JSON.
        forbidden_keys = {
            key for key in details
            if any(token in str(key).lower() for token in ("price", "budget", "amount", "cost"))
        }
        if forbidden_keys:
            raise serializers.ValidationError({
                "details": "Price and budget information must not be submitted."
            })

        return attrs

    def create(self, validated_data):
        validated_data.pop("consent", None)
        validated_data.pop("website", None)
        property_obj = validated_data.pop("_property", None)
        return PropertyEnquiry.objects.create(
            property=property_obj,
            property_name=property_obj.name if property_obj else "",
            property_reference=property_obj.property_reference if property_obj else "",
            consented_at=timezone.now(),
            **validated_data,
        )
