from django.core.management.base import BaseCommand
from django.conf import settings
from django.contrib.auth import get_user_model
from apps.accounts.models import User
from apps.blog.models import BlogPost

class Command(BaseCommand):
    help="Create clearly labelled demo Blog posts for local development only."
    def handle(self,*args,**options):
        if not settings.DEBUG:
            self.stderr.write(self.style.ERROR("seed_demo_blog is dev-only; DJANGO_DEBUG must be True."))
            return
        author=User.objects.filter(is_superuser=True,is_active=True).first() or User.objects.filter(is_active=True,role=User.Role.EDITOR).first()
        if not author:
            self.stderr.write(self.style.ERROR("Create a local Super Admin or Blog Editor first."))
            return
        examples=[
            ("DEMO: A practical property viewing checklist","DEMO CONTENT — Replace this sample article before publishing.","A short checklist for documenting questions, site details and information to verify before making a property decision."),
            ("DEMO: Understanding residential, commercial and land listings","DEMO CONTENT — Replace this sample article before publishing.","An introductory guide to the three broad property categories in the Swastik catalogue."),
        ]
        for title,excerpt,content in examples:
            post,created=BlogPost.objects.get_or_create(slug=title.lower().replace(" ","-").replace(":",""),defaults={"title":title,"excerpt":excerpt,"content":f"<p>{content}</p>","category":"DEMO","status":BlogPost.Status.DRAFT,"author":author})
            self.stdout.write(f"{'Created' if created else 'Exists'}: {post.title} [DRAFT]")
