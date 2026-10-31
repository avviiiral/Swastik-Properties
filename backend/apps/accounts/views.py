from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.generics import ListCreateAPIView,RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView,TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken,TokenError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer

from .models import User
from .permissions import IsUserManager,IsSuperAdmin
from .serializers import EmailTokenObtainPairSerializer,LogoutSerializer,UserCreateSerializer,UserReadSerializer,UserUpdateSerializer

class LoginView(TokenObtainPairView):
    serializer_class=EmailTokenObtainPairSerializer
    throttle_classes=(ScopedRateThrottle,);throttle_scope="auth_login"

class RefreshView(TokenRefreshView):
    """Reject refresh tokens for users deactivated after the token was issued."""
    def post(self,request,*args,**kwargs):
        raw=request.data.get("refresh")
        try:
            from rest_framework_simplejwt.tokens import RefreshToken
            token=RefreshToken(raw)
            user_id=token.get("user_id")
            user=User.objects.filter(pk=user_id,is_active=True).first()
            if user is None:return Response({"detail":"User account is inactive."},status=status.HTTP_401_UNAUTHORIZED)
        except (TokenError,TypeError):return Response({"detail":"Token is invalid or expired."},status=status.HTTP_401_UNAUTHORIZED)
        return super().post(request,*args,**kwargs)

class LogoutView(APIView):
    permission_classes=(IsAuthenticated,)
    def post(self,request):
        serializer=LogoutSerializer(data=request.data,context={"request":request});serializer.is_valid(raise_exception=True);serializer.save()
        return Response({"detail":"Successfully logged out."},status=status.HTTP_205_RESET_CONTENT)

class CurrentUserView(APIView):
    permission_classes=(IsAuthenticated,)
    def get(self,request):return Response(UserReadSerializer(request.user).data)

class UserManagementQuerysetMixin:
    def get_queryset(self):
        qs=User.objects.all().order_by("id")
        if self.request.user.role==User.Role.ADMIN:qs=qs.filter(role__in=(User.Role.EDITOR,User.Role.AGENT))
        return qs
    def get_object(self):
        queryset=self.filter_queryset(self.get_queryset())
        obj=get_object_or_404(queryset,pk=self.kwargs["pk"])
        self.check_object_permissions(self.request,obj)
        return obj

class UserListCreateView(UserManagementQuerysetMixin,ListCreateAPIView):
    permission_classes=(IsUserManager,)
    def get_serializer_class(self):return UserCreateSerializer if self.request.method=="POST" else UserReadSerializer
    def perform_create(self,serializer):serializer.save()

class UserDetailView(UserManagementQuerysetMixin,RetrieveUpdateAPIView):
    permission_classes=(IsUserManager,)
    http_method_names=("get","patch","delete","head","options")
    def get_serializer_class(self):return UserUpdateSerializer if self.request.method=="PATCH" else UserReadSerializer
    def perform_update(self,serializer):
        actor=self.request.user;target=serializer.instance
        if actor.role==User.Role.ADMIN and target.role not in (User.Role.EDITOR,User.Role.AGENT):from rest_framework.exceptions import PermissionDenied;raise PermissionDenied("Admins can manage Editor and Agent accounts only.")
        serializer.save()
    def delete(self,request,*args,**kwargs):
        target=self.get_object()
        if request.user.role!=User.Role.SUPER_ADMIN:return Response({"detail":"Only Super Admins can permanently delete user accounts."},status=status.HTTP_403_FORBIDDEN)
        if target.pk==request.user.pk:return Response({"detail":"You cannot delete your own account."},status=status.HTTP_400_BAD_REQUEST)
        if target.role==User.Role.SUPER_ADMIN and target.is_active and User.objects.filter(role=User.Role.SUPER_ADMIN,is_active=True).count()<=1:return Response({"detail":"The last active Super Admin cannot be deleted."},status=status.HTTP_400_BAD_REQUEST)
        target.delete();return Response(status=status.HTTP_204_NO_CONTENT)

class UserActivationView(APIView):
    permission_classes=(IsUserManager,)
    def post(self,request,pk):
        target=get_object_or_404(User,pk=pk)
        if request.user.pk==target.pk:return Response({"detail":"You cannot deactivate yourself."},status=status.HTTP_400_BAD_REQUEST)
        if request.user.role==User.Role.ADMIN and target.role not in (User.Role.EDITOR,User.Role.AGENT):return Response({"detail":"Admins can manage Editor and Agent accounts only."},status=status.HTTP_403_FORBIDDEN)
        active=request.data.get("is_active")
        if not isinstance(active,bool):return Response({"is_active":"Provide a boolean value."},status=status.HTTP_400_BAD_REQUEST)
        if not active and target.role==User.Role.SUPER_ADMIN and target.is_active and User.objects.filter(role=User.Role.SUPER_ADMIN,is_active=True).count()<=1:return Response({"detail":"The last active Super Admin cannot be deactivated."},status=status.HTTP_400_BAD_REQUEST)
        target.is_active=active;target.save(update_fields=("is_active",));return Response(UserReadSerializer(target).data)
