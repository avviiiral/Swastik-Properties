from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from .models import User
from .permissions import IsUserManager
from .serializers import (
    EmailTokenObtainPairSerializer, LogoutSerializer, UserCreateSerializer,
    UserReadSerializer, UserUpdateSerializer,
)

class LoginView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer
    throttle_classes = (ScopedRateThrottle,)
    throttle_scope = "auth_login"

class RefreshView(TokenRefreshView):
    """Reject refresh tokens for accounts deactivated after token issuance."""
    def post(self, request, *args, **kwargs):
        try:
            token = RefreshToken(request.data.get("refresh"))
            if not User.objects.filter(pk=token.get("user_id"), is_active=True).exists():
                return Response({"detail": "User account is inactive."}, status=status.HTTP_401_UNAUTHORIZED)
        except (TokenError, TypeError):
            return Response({"detail": "Token is invalid or expired."}, status=status.HTTP_401_UNAUTHORIZED)
        return super().post(request, *args, **kwargs)

class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)
    def post(self, request):
        serializer = LogoutSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Successfully logged out."}, status=status.HTTP_205_RESET_CONTENT)

class CurrentUserView(APIView):
    permission_classes = (IsAuthenticated,)
    def get(self, request):
        return Response(UserReadSerializer(request.user).data)

class UserManagementQuerysetMixin:
    def get_queryset(self):
        queryset = User.objects.all().order_by("id")
        if self.request.user.role == User.Role.ADMIN:
            queryset = queryset.filter(role__in=(User.Role.EDITOR, User.Role.AGENT))
        return queryset
    def get_object(self):
        obj = get_object_or_404(self.get_queryset(), pk=self.kwargs["pk"])
        self.check_object_permissions(self.request, obj)
        return obj

class UserListCreateView(UserManagementQuerysetMixin, ListCreateAPIView):
    permission_classes = (IsUserManager,)
    def get_serializer_class(self):
        return UserCreateSerializer if self.request.method == "POST" else UserReadSerializer

class UserDetailView(UserManagementQuerysetMixin, RetrieveUpdateAPIView):
    permission_classes = (IsUserManager,)

    def get_object(self):
        if (
            self.request.user.role == User.Role.ADMIN
            and str(self.kwargs["pk"]) == str(self.request.user.pk)
        ):
            raise PermissionDenied("Admins cannot modify their own account.")
        return super().get_object()
    http_method_names = ("get", "patch", "delete", "head", "options")
    def get_serializer_class(self):
        return UserUpdateSerializer if self.request.method == "PATCH" else UserReadSerializer
    def perform_update(self, serializer):
        serializer.save()
    def delete(self, request, *args, **kwargs):
        target = self.get_object()
        if request.user.role != User.Role.SUPER_ADMIN:
            return Response({"detail": "Only Super Admins can permanently delete user accounts."}, status=status.HTTP_403_FORBIDDEN)
        if target.pk == request.user.pk:
            return Response({"detail": "You cannot delete your own account."}, status=status.HTTP_400_BAD_REQUEST)
        if target.role == User.Role.SUPER_ADMIN and target.is_active and User.objects.filter(role=User.Role.SUPER_ADMIN, is_active=True).count() <= 1:
            return Response({"detail": "The last active Super Admin cannot be deleted."}, status=status.HTTP_400_BAD_REQUEST)
        target.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class UserActivationView(APIView):
    permission_classes = (IsUserManager,)
    def post(self, request, pk):
        with transaction.atomic():
            target_queryset = User.objects.select_for_update()
            if request.user.role == User.Role.ADMIN:
                target_queryset = target_queryset.filter(role__in=(User.Role.EDITOR, User.Role.AGENT))
            target = get_object_or_404(target_queryset, pk=pk)
            if request.user.pk == target.pk:
                return Response({"detail": "You cannot change your own active status."}, status=status.HTTP_400_BAD_REQUEST)
            if request.user.role == User.Role.ADMIN and target.role not in (User.Role.EDITOR, User.Role.AGENT):
                return Response({"detail": "Admins can manage Editor and Agent accounts only."}, status=status.HTTP_403_FORBIDDEN)
            active = request.data.get("is_active")
            if not isinstance(active, bool):
                return Response({"is_active": "Provide a boolean value."}, status=status.HTTP_400_BAD_REQUEST)
            if not active and target.role == User.Role.SUPER_ADMIN and target.is_active:
                remaining = User.objects.select_for_update().filter(role=User.Role.SUPER_ADMIN, is_active=True).exclude(pk=target.pk).count()
                if remaining == 0:
                    return Response({"detail": "The last active Super Admin cannot be deactivated."}, status=status.HTTP_400_BAD_REQUEST)
            target.is_active = active
            target.save(update_fields=("is_active",))
        return Response(UserReadSerializer(target).data)
