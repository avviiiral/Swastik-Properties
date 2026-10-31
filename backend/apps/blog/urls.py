from django.urls import include,path
from rest_framework.routers import DefaultRouter
from .views import BlogManagementViewSet,BlogPostViewSet

public_router=DefaultRouter()
public_router.register("posts",BlogPostViewSet,basename="blog-post")
manage_router=DefaultRouter()
manage_router.register("manage/posts",BlogManagementViewSet,basename="blog-manage-post")
urlpatterns=[
    path("",include(public_router.urls)),
    path("",include(manage_router.urls)),
]
