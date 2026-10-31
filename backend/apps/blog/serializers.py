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
 tags=serializers.JSONField(required=False)
 class Meta:
  model=BlogPost;fields=("id","title","slug","excerpt","content","cover_image","category","tags","status","published_at","author","seo_title","seo_description","reading_time","created_at","updated_at")
  read_only_fields=("id","slug","published_at","author","reading_time","created_at","updated_at")
 def to_internal_value(self,data):
  # FormData sends tags as a JSON array string; accept it while preserving JSON API lists.
  mutable=data.copy() if hasattr(data,"copy") else data
  if hasattr(mutable,"get"):
   value=mutable.get("tags")
   if isinstance(value,str):
    import json
    try:mutable["tags"]=json.loads(value)
    except (ValueError,TypeError):mutable["tags"]=[tag.strip() for tag in value.split(",") if tag.strip()]
  return super().to_internal_value(mutable)
 def validate_tags(self,value):
  if isinstance(value,str):return [x.strip() for x in value.split(",") if x.strip()]
  if not isinstance(value,list) or any(not isinstance(x,str) for x in value):raise serializers.ValidationError("Tags must be a list of text values.")
  return [x.strip() for x in value if x.strip()]
