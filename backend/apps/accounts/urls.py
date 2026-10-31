from django.urls import path
from .views import CurrentUserView,LoginView,LogoutView,RefreshView,UserActivationView,UserDetailView,UserListCreateView
app_name="accounts"
urlpatterns=[path("login/",LoginView.as_view(),name="login"),path("token/refresh/",RefreshView.as_view(),name="token-refresh"),path("logout/",LogoutView.as_view(),name="logout"),path("me/",CurrentUserView.as_view(),name="current-user"),path("users/",UserListCreateView.as_view(),name="user-list-create"),path("users/<int:pk>/",UserDetailView.as_view(),name="user-detail"),path("users/<int:pk>/activation/",UserActivationView.as_view(),name="user-activation")]
