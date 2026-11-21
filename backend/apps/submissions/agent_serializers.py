from rest_framework import serializers

from apps.accounts.models import User
from .models import LeadActivity, PropertyEnquiry


class AgentLeadSerializer(serializers.ModelSerializer):
    property = serializers.IntegerField(source="property_id", read_only=True)

    class Meta:
        model = PropertyEnquiry
        fields = (
            "id", "property", "property_name", "property_reference", "enquiry_type",
            "name", "email", "phone", "message", "details", "source_path",
            "status", "assigned_at", "created_at", "updated_at",
        )
        read_only_fields = fields


class AgentLeadStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyEnquiry
        fields = ("status",)

    def validate_status(self, value):
        if value == PropertyEnquiry.Status.SPAM:
            raise serializers.ValidationError("Agents cannot mark leads as spam.")
        return value


class LeadAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyEnquiry
        fields = ("assigned_to",)

    def validate_assigned_to(self, user):
        if user is not None and (
            user.role != User.Role.AGENT or not user.is_active
        ):
            raise serializers.ValidationError("Select an active Agent account.")
        return user


class LeadActivitySerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source="actor.get_full_name", read_only=True)

    class Meta:
        model = LeadActivity
        fields = ("id", "activity_type", "body", "actor_name", "created_at")
        read_only_fields = ("id", "actor_name", "created_at")

    def validate_body(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Activity details cannot be empty.")
        return value
