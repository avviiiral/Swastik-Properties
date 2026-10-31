from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from .models import BlogPost

User=get_user_model()
class BlogApiPermissionTests(APITestCase):
 def setUp(self):
  self.root=User.objects.create_superuser(username="root",email="root@blog.invalid",password="Valid-test-pass-834!")
  self.editor=User.objects.create_user(username="editor",email="editor@blog.invalid",password="Valid-test-pass-834!",role=User.Role.EDITOR)
  self.admin=User.objects.create_user(username="admin",email="admin@blog.invalid",password="Valid-test-pass-834!",role=User.Role.ADMIN)
  self.agent=User.objects.create_user(username="agent",email="agent@blog.invalid",password="Valid-test-pass-834!",role=User.Role.AGENT)
  self.published=BlogPost.objects.create(title="Public news",excerpt="Available post",content="<p>Hello</p>",author=self.editor,status="PUBLISHED")
  self.draft=BlogPost.objects.create(title="Private draft",excerpt="Internal text",content="<p>Draft</p>",author=self.editor,status="DRAFT")
 def test_anonymous_only_sees_published_posts(self):
  response=self.client.get("/api/v1/blog/posts/")
  self.assertEqual(response.status_code,200);self.assertEqual(response.data["count"],1)
 def test_anonymous_cannot_read_draft_slug(self):
  response=self.client.get(f"/api/v1/blog/posts/{self.draft.slug}/")
  self.assertEqual(response.status_code,404)
 def test_editor_can_manage_posts(self):
  self.client.force_authenticate(self.editor)
  response=self.client.post("/api/v1/blog/manage/posts/",{"title":"New post","excerpt":"A valid excerpt","content":"<p>New content</p>","status":"DRAFT"})
  self.assertEqual(response.status_code,201)
 def test_super_admin_can_manage_posts(self):
  self.client.force_authenticate(self.root)
  response=self.client.post("/api/v1/blog/manage/posts/",{"title":"Root post","excerpt":"Root excerpt","content":"<p>Root content</p>"})
  self.assertEqual(response.status_code,201)
 def test_admin_cannot_manage_blog(self):
  self.client.force_authenticate(self.admin)
  response=self.client.get("/api/v1/blog/manage/posts/")
  self.assertEqual(response.status_code,403)
 def test_agent_cannot_manage_blog(self):
  self.client.force_authenticate(self.agent)
  response=self.client.post("/api/v1/blog/manage/posts/",{"title":"No","excerpt":"No"})
  self.assertEqual(response.status_code,403)
 def test_unsafe_html_is_removed(self):
  post=BlogPost.objects.create(title="Sanitization",excerpt="Testing",content='<p onclick="alert(1)">Safe<script>alert(1)</script><a href="javascript:alert(1)">link</a></p>',author=self.editor)
  self.assertNotIn("<script",post.content.lower());self.assertNotIn("onclick",post.content.lower());self.assertNotIn("javascript:",post.content.lower())
