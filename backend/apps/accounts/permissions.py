from rest_framework.permissions import BasePermission
from .models import User

class RolePermission(BasePermission):
    allowed_roles=()
    message="Your account role does not permit this operation."
    def has_permission(self,request,view):
        user=request.user
        return bool(user and user.is_authenticated and user.is_active and user.role in self.allowed_roles)

class IsSuperAdmin(RolePermission):
    message="Super Admin access is required."
    allowed_roles=(User.Role.SUPER_ADMIN,)

class IsAdminOrSuperAdmin(RolePermission):
    message="Administrator access is required."
    allowed_roles=(User.Role.ADMIN,User.Role.SUPER_ADMIN)

class IsBlogManager(RolePermission):
    message="Blog Editor or Super Admin access is required."
    allowed_roles=(User.Role.EDITOR,User.Role.SUPER_ADMIN)

class IsUserManager(RolePermission):
    message="User management access is required."
    allowed_roles=(User.Role.ADMIN,User.Role.SUPER_ADMIN)

class IsAgent(RolePermission):
    message="Agent access is required."
    allowed_roles=(User.Role.AGENT,)
