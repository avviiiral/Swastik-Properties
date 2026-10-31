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
    class Meta:
        model = PropertyEnquiry
        fields = (
            "id", "property_name", "property_reference", "name",
            "email", "phone", "message", "status", "created_at",
        )
        read_only_fields = fields
