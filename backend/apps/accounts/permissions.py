from rest_framework.permissions import BasePermission

from .models import User


class IsSuperAdmin(BasePermission):
    """Allow only users assigned the Super Admin application role."""

    message = "Super Admin access is required."

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and user.is_active
            and user.role == User.Role.SUPER_ADMIN
        )


class IsAdminOrSuperAdmin(BasePermission):
    """Allow administrators and Super Admins."""

    message = "Administrator access is required."

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and user.is_active
            and user.role in (User.Role.ADMIN, User.Role.SUPER_ADMIN)
        )


class IsAgent(BasePermission):
    """Allow only users assigned the Agent application role."""

    message = "Agent access is required."

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and user.is_active
            and user.role == User.Role.AGENT
        )
