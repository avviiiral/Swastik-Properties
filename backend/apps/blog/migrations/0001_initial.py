import django.db.models.deletion
from django.conf import settings
from django.db import migrations,models
import apps.blog.models
import apps.blog.validators
class Migration(migrations.Migration):
 initial=True
 dependencies=[migrations.swappable_dependency(settings.AUTH_USER_MODEL)]
 operations=[migrations.CreateModel(name="BlogPost",fields=[
 ("id",models.BigAutoField(auto_created=True,primary_key=True,serialize=False,verbose_name="ID")),
 ("title",models.CharField(max_length=220)),
 ("slug",models.SlugField(max_length=240,unique=True)),
 ("excerpt",models.TextField(max_length=500)),
 ("content",models.TextField(blank=True)),
 ("cover_image",models.ImageField(blank=True,null=True,upload_to=apps.blog.models.blog_cover_upload_to,validators=[apps.blog.validators.validate_blog_cover])),
 ("category",models.CharField(db_index=True,default="General",max_length=100)),
 ("tags",models.JSONField(blank=True,default=list)),
 ("status",models.CharField(choices=[("DRAFT","Draft"),("PUBLISHED","Published"),("ARCHIVED","Archived")],db_index=True,default="DRAFT",max_length=12)),
 ("published_at",models.DateTimeField(blank=True,db_index=True,null=True)),
 ("seo_title",models.CharField(blank=True,max_length=220)),
 ("seo_description",models.CharField(blank=True,max_length=320)),
 ("reading_time",models.PositiveSmallIntegerField(default=1)),
 ("created_at",models.DateTimeField(auto_now_add=True)),
 ("updated_at",models.DateTimeField(auto_now=True)),
 ("author",models.ForeignKey(on_delete=django.db.models.deletion.PROTECT,related_name="blog_posts",to=settings.AUTH_USER_MODEL)),
 ],options={"ordering":("-published_at","-created_at")})]
