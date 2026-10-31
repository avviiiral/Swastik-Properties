from rest_framework import serializers
from .models import BlogPost

class BlogAuthorSerializer(serializers.Serializer):
    id=serializers.IntegerField()
    username=serializers.CharField()
    first_name=serializers.CharField()
    last_name=serializers.CharField()

class PublicBlogPostSerializer(serializers.ModelSerializer):
    author=BlogAuthorSerializer(read_only=True)
    cover_image=serializers.SerializerMethodField()
    class Meta:
        model=BlogPost
        fields=("id","title","slug","excerpt","content","cover_image","category","tags","status","published_at","author","seo_title","seo_description","reading_time","created_at","updated_at")
    def get_cover_image(self,obj):
        return self.context["request"].build_absolute_uri(obj.cover_image.url) if obj.cover_image and self.context.get("request") else (obj.cover_image.url if obj.cover_image else None)

class ManageBlogPostSerializer(serializers.ModelSerializer):
    cover_image=serializers.ImageField(required=False,allow_null=True)
    class Meta:
        model=BlogPost
        fields=("id","title","slug","excerpt","content","cover_image","category","tags","status","published_at","author","seo_title","seo_description","reading_time","created_at","updated_at")
        read_only_fields=("id","published_at","author","reading_time","created_at","updated_at")
    def validate_tags(self,value):
        if isinstance(value,str):
            return [tag.strip() for tag in value.split(",") if tag.strip()]
        if not isinstance(value,list) or any(not isinstance(tag,str) for tag in value):
            raise serializers.ValidationError("Tags must be a list of text values.")
        return [tag.strip() for tag in value if tag.strip()]
