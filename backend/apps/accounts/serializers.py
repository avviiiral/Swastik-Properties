from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class UserReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "is_active",
            "date_joined",
        )
        read_only_fields = fields


class RoleAssignmentValidationMixin:
    def validate_role(self, value):
        request = self.context.get("request")
        actor_role = getattr(getattr(request, "user", None), "role", None)

        # Super Admin accounts are bootstrap/system accounts, not API-managed users.
        if value == User.Role.SUPER_ADMIN:
            raise PermissionDenied(
                "Super Admin accounts cannot be created or modified through this API."
            )

        if actor_role == User.Role.ADMIN and value != User.Role.AGENT:
            raise PermissionDenied("Admins can manage Agent accounts only.")

        if actor_role not in (User.Role.ADMIN, User.Role.SUPER_ADMIN):
            raise PermissionDenied("Administrator access is required.")

        return value


class UserCreateSerializer(RoleAssignmentValidationMixin, serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
        style={"input_type": "password"},
    )

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "password",
            "first_name",
            "last_name",
            "role",
        )
        read_only_fields = ("id",)

    def validate_password(self, value):
        user = User(
            username=self.initial_data.get("username", ""),
            email=self.initial_data.get("email", ""),
        )
        validate_password(value, user=user)
        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserUpdateSerializer(RoleAssignmentValidationMixin, serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "is_active",
        )


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
            raise serializers.ValidationError(
                "The refresh token is invalid, expired or already revoked."
            ) from exc

        request = self.context["request"]
        token_user_id = token.get(api_settings.USER_ID_CLAIM)
        if str(token_user_id) != str(request.user.pk):
            raise serializers.ValidationError(
                "The refresh token does not belong to the authenticated user."
            )

        self.refresh_token = token
        return value

    def save(self, **kwargs):
        self.refresh_token.blacklist()
