from rest_framework import serializers
from .models import BlogPost
class BlogAuthorSerializer(serializers.Serializer):
 id=serializers.IntegerField();username=serializers.CharField();first_name=serializers.CharField();last_name=serializers.CharField()
class PublicBlogPostSerializer(serializers.ModelSerializer):
 author=BlogAuthorSerializer(read_only=True);cover_image=serializers.SerializerMethodField()
 class Meta:
  model=BlogPost;fields=("id","title","slug","excerpt","content","cover_image","category","tags","status","published_at","author","seo_title","seo_description","reading_time","created_at","updated_at")
 def get_cover_image(self,obj):
  if not obj.cover_image:return None
  request=self.context.get("request");return request.build_absolute_uri(obj.cover_image.url) if request else obj.cover_image.url
class ManageBlogPostSerializer(serializers.ModelSerializer):
 cover_image=serializers.ImageField(required=False,allow_null=True)
 class Meta:
  model=BlogPost;fields=("id","title","slug","excerpt","content","cover_image","category","tags","status","published_at","author","seo_title","seo_description","reading_time","created_at","updated_at")
  read_only_fields=("id","published_at","author","reading_time","created_at","updated_at")
 def validate_tags(self,value):
  if isinstance(value,str):return [x.strip() for x in value.split(",") if x.strip()]
  if not isinstance(value,list) or any(not isinstance(x,str) for x in value):raise serializers.ValidationError("Tags must be a list or comma separated text.")
  return [x.strip() for x in value if x.strip()]
