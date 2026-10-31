from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class UserReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "role", "is_active", "date_joined")
        read_only_fields = fields

class RoleAssignmentValidationMixin:
    def validate_role(self, value):
        actor = getattr(self.context.get("request"), "user", None)
        actor_role = getattr(actor, "role", None)
        if actor_role == User.Role.ADMIN and value not in (User.Role.EDITOR, User.Role.AGENT):
            raise PermissionDenied("Admins can manage Editor and Agent accounts only.")
        if actor_role not in (User.Role.ADMIN, User.Role.SUPER_ADMIN):
            raise PermissionDenied("Administrator access is required.")
        return value

class UserCreateSerializer(RoleAssignmentValidationMixin, serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, trim_whitespace=False, style={"input_type": "password"})

    class Meta:
        model = User
        fields = ("id", "username", "email", "password", "first_name", "last_name", "role")
        read_only_fields = ("id",)

    def validate_password(self, value):
        candidate = User(username=self.initial_data.get("username", ""), email=self.initial_data.get("email", ""))
        validate_password(value, user=candidate)
        return value

    def create(self, validated_data):
        role = validated_data["role"]
        is_superuser = role == User.Role.SUPER_ADMIN
        return User.objects.create_user(
            **validated_data,
            is_staff=is_superuser,
            is_superuser=is_superuser,
        )

class UserUpdateSerializer(RoleAssignmentValidationMixin, serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("username", "email", "first_name", "last_name", "role", "is_active")

    def validate(self, attrs):
        actor = self.context["request"].user
        target = self.instance
        if target.pk == actor.pk:
            raise PermissionDenied("You cannot change your own account role or status.")

        target_will_be_super = attrs.get("role", target.role) == User.Role.SUPER_ADMIN
        target_will_be_inactive = attrs.get("is_active", target.is_active) is False
        demoting_super = target.role == User.Role.SUPER_ADMIN and not target_will_be_super
        deactivating_super = target.role == User.Role.SUPER_ADMIN and target.is_active and target_will_be_inactive
        if target.role == User.Role.SUPER_ADMIN and (demoting_super or deactivating_super):
            active_super_count = User.objects.filter(role=User.Role.SUPER_ADMIN, is_active=True).count()
            if active_super_count <= 1:
                raise ValidationError("The last active Super Admin cannot be demoted or deactivated.")
        return attrs

    def update(self, instance, validated_data):
        role = validated_data.get("role", instance.role)
        is_superuser = role == User.Role.SUPER_ADMIN
        validated_data["is_staff"] = is_superuser
        validated_data["is_superuser"] = is_superuser
        return super().update(instance, validated_data)

class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserReadSerializer(self.user).data
        return data

class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField(write_only=True)

    def validate_refresh(self, value):
        try:
            token = RefreshToken(value)
        except TokenError as exc:
            raise serializers.ValidationError("The refresh token is invalid, expired or already revoked.") from exc
        if str(token.get(api_settings.USER_ID_CLAIM)) != str(self.context["request"].user.pk):
            raise serializers.ValidationError("The refresh token does not belong to the authenticated user.")
        self.refresh_token = token
        return value

    def save(self, **kwargs):
        self.refresh_token.blacklist()
