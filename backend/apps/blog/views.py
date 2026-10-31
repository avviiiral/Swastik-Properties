from rest_framework import filters,viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.parsers import JSONParser,MultiPartParser,FormParser
from rest_framework.exceptions import PermissionDenied
from apps.accounts.permissions import IsBlogManager
from .models import BlogPost
from .serializers import PublicBlogPostSerializer,ManageBlogPostSerializer

class BlogPostViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class=PublicBlogPostSerializer
    lookup_field="slug"
    permission_classes=(AllowAny,)
    filter_backends=(filters.SearchFilter,)
    search_fields=("title","excerpt","content","category","tags")
    def get_queryset(self):
        qs=BlogPost.objects.filter(status=BlogPost.Status.PUBLISHED).select_related("author")
        category=self.request.query_params.get("category")
        if category:qs=qs.filter(category__iexact=category)
        return qs
    def get_object(self):
        obj=super().get_object()
        if obj.status!=BlogPost.Status.PUBLISHED:from rest_framework.exceptions import NotFound;raise NotFound()
        return obj

class BlogManagementViewSet(viewsets.ModelViewSet):
    serializer_class=ManageBlogPostSerializer
    permission_classes=(IsBlogManager,)
    parser_classes=(JSONParser,MultiPartParser,FormParser)
    queryset=BlogPost.objects.select_related("author").all()
    def perform_create(self,serializer):
        serializer.save(author=self.request.user)
    def perform_update(self,serializer):
        serializer.save()
    @action(detail=True,methods=("post",),url_path="publish")
    def publish(self,request,pk=None):
        post=self.get_object();post.status=BlogPost.Status.PUBLISHED;post.published_at=None;post.save()
        return Response(self.get_serializer(post).data)
    @action(detail=True,methods=("post",),url_path="unpublish")
    def unpublish(self,request,pk=None):
        post=self.get_object();post.status=BlogPost.Status.DRAFT;post.published_at=None;post.save()
        return Response(self.get_serializer(post).data)
