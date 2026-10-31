import math,re
from pathlib import Path
from django.conf import settings
from django.db import models,transaction
from django.utils import timezone
from django.utils.text import slugify
import nh3
from .validators import validate_blog_cover
ALLOWED_HTML_TAGS={"h1","h2","h3","h4","p","ul","ol","li","a","blockquote","img","strong","em","b","i","code","pre","br","hr","figure","figcaption"}
ALLOWED_HTML_ATTRIBUTES={"a":{"href","title","target","rel"},"img":{"src","alt","title","width","height","loading"}}
ALLOWED_URL_SCHEMES={"http","https","mailto"}
def blog_cover_upload_to(instance,filename):
 suffix=Path(filename).suffix.lower()
 return f"blog/covers/{instance.slug or 'draft'}/{timezone.now():%Y/%m}/{slugify(Path(filename).stem)[:50]}{suffix}"
class BlogPost(models.Model):
 class Status(models.TextChoices):
  DRAFT="DRAFT","Draft";PUBLISHED="PUBLISHED","Published";ARCHIVED="ARCHIVED","Archived"
 title=models.CharField(max_length=220);slug=models.SlugField(max_length=240,unique=True);excerpt=models.TextField(max_length=500);content=models.TextField(blank=True)
 cover_image=models.ImageField(upload_to=blog_cover_upload_to,validators=[validate_blog_cover],blank=True,null=True)
 category=models.CharField(max_length=100,default="General",db_index=True);tags=models.JSONField(default=list,blank=True)
 status=models.CharField(max_length=12,choices=Status.choices,default=Status.DRAFT,db_index=True);published_at=models.DateTimeField(blank=True,null=True,db_index=True)
 author=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.PROTECT,related_name="blog_posts")
 seo_title=models.CharField(max_length=220,blank=True);seo_description=models.CharField(max_length=320,blank=True);reading_time=models.PositiveSmallIntegerField(default=1)
 created_at=models.DateTimeField(auto_now_add=True);updated_at=models.DateTimeField(auto_now=True)
 class Meta:
  ordering=("-published_at","-created_at");indexes=[models.Index(fields=("status","published_at"),name="blog_blogpo_status_aa5436_idx")]
 def save(self,*args,**kwargs):
  if not self.slug:
   base=slugify(self.title)[:220] or "article";candidate=base;index=2
   while BlogPost.objects.filter(slug=candidate).exclude(pk=self.pk).exists():candidate=f"{base[:210]}-{index}";index+=1
   self.slug=candidate
  if self.content:
   self.content=nh3.clean(self.content,tags=ALLOWED_HTML_TAGS,attributes=ALLOWED_HTML_ATTRIBUTES,url_schemes=ALLOWED_URL_SCHEMES,link_rel="noopener noreferrer",strip_comments=True)
   words=len(re.findall(r"\b[\w'-]+\b",re.sub("<[^>]+>"," ",self.content)));self.reading_time=max(1,math.ceil(words/220))
  else:self.reading_time=1
  if self.status==self.Status.PUBLISHED and self.published_at is None:self.published_at=timezone.now()
  elif self.status!=self.Status.PUBLISHED:self.published_at=None
  super().save(*args,**kwargs)
 def delete(self,*args,**kwargs):
  stored=self.cover_image.name if self.cover_image else None;storage=self.cover_image.storage if self.cover_image else None
  result=super().delete(*args,**kwargs)
  if stored and storage:transaction.on_commit(lambda:storage.delete(stored))
  return result
 def __str__(self):return self.title
