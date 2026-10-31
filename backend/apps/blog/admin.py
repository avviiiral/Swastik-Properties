from django.contrib import admin
from .models import BlogPost

@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display=("title","category","status","author","published_at","updated_at")
    list_filter=("status","category")
    search_fields=("title","excerpt","content","slug")
    prepopulated_fields={"slug":("title",)}
