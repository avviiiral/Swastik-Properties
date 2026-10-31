from rest_framework import status
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import User
from .permissions import IsAdminOrSuperAdmin
from .serializers import (
    EmailTokenObtainPairSerializer,
    LogoutSerializer,
    UserCreateSerializer,
    UserReadSerializer,
    UserUpdateSerializer,
)


class LoginView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer
    throttle_classes = (ScopedRateThrottle,)
    throttle_scope = "auth_login"


class RefreshView(TokenRefreshView):
    pass


class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        serializer = LogoutSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Successfully logged out."},
            status=status.HTTP_205_RESET_CONTENT,
        )


class CurrentUserView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        serializer = UserReadSerializer(request.user)
        return Response(serializer.data)


class UserManagementQuerysetMixin:
    def get_queryset(self):
        queryset = User.objects.exclude(
            role=User.Role.SUPER_ADMIN
        ).order_by("id")

        # Admins can only see/manage Agent accounts. Super Admins can see
        # Admin and Agent accounts, but privileged Super Admin accounts remain
        # outside this API's management surface.
        if self.request.user.role == User.Role.ADMIN:
            queryset = queryset.filter(role=User.Role.AGENT)

        return queryset


class UserListCreateView(UserManagementQuerysetMixin, ListCreateAPIView):
    permission_classes = (IsAdminOrSuperAdmin,)

    def get_serializer_class(self):
        if self.request.method == "POST":
            return UserCreateSerializer
        return UserReadSerializer


class UserDetailView(UserManagementQuerysetMixin, RetrieveUpdateAPIView):
    permission_classes = (IsAdminOrSuperAdmin,)
    http_method_names = ("get", "patch", "head", "options")

    def get_serializer_class(self):
        if self.request.method == "PATCH":
            return UserUpdateSerializer
        return UserReadSerializer
