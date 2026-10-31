import re

from rest_framework import serializers

from .models import BusinessContactSettings, PropertyEnquiry


class BusinessContactSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessContactSettings
        fields = ("whatsapp_number", "contact_number", "email", "updated_at")
        read_only_fields = ("updated_at",)

    def validate_whatsapp_number(self, value):
        value = value.strip()
        digits = re.sub(r"\D", "", value)
        if not 10 <= len(digits) <= 15:
            raise serializers.ValidationError("Enter a valid WhatsApp number with country code.")
        return value

    def validate_contact_number(self, value):
        value = value.strip()
        digits = re.sub(r"\D", "", value)
        if not 10 <= len(digits) <= 15:
            raise serializers.ValidationError("Enter a valid contact number with country code.")
        return value

    def validate_email(self, value):
        return value.strip().lower()


class PropertyEnquiryAdminSerializer(serializers.ModelSerializer):
    enquiry_type_label = serializers.CharField(
        source="get_enquiry_type_display", read_only=True
    )

    class Meta:
        model = PropertyEnquiry
        fields = (
            "id", "enquiry_type", "enquiry_type_label", "property_name",
            "property_reference", "name", "email", "phone", "message",
            "details", "source_path", "consented_at", "status", "admin_notes",
            "created_at", "updated_at",
        )
        read_only_fields = (
            "id", "enquiry_type", "enquiry_type_label", "property_name",
            "property_reference", "name", "email", "phone", "message",
            "details", "source_path", "consented_at", "created_at", "updated_at",
        )


class PropertyEnquiryUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyEnquiry
        fields = ("status", "admin_notes")
