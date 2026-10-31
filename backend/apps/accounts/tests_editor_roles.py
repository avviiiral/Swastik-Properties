from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model

User=get_user_model()

class EditorRoleAccessTests(APITestCase):
    password="Test-only-Passphrase-784!"
    def setUp(self):
        self.root=User.objects.create_superuser(username="root",email="root@test.invalid",password=self.password)
        self.admin=User.objects.create_user(username="admin",email="admin@test.invalid",password=self.password,role=User.Role.ADMIN)
        self.editor=User.objects.create_user(username="editor",email="editor@test.invalid",password=self.password,role=User.Role.EDITOR)
        self.agent=User.objects.create_user(username="agent",email="agent@test.invalid",password=self.password,role=User.Role.AGENT)
    def auth(self,user): self.client.force_authenticate(user=user)
    def test_admin_can_list_editor_and_agent(self):
        self.auth(self.admin); response=self.client.get("/api/v1/auth/users/")
        self.assertEqual(response.status_code,200)
        self.assertEqual({item["role"] for item in response.data["results"]},{"EDITOR","AGENT"})
    def test_editor_and_agent_cannot_manage_users(self):
        for user in (self.editor,self.agent):
            self.auth(user)
            self.assertEqual(self.client.get("/api/v1/auth/users/").status_code,403)
    def test_admin_cannot_create_admin(self):
        self.auth(self.admin)
        response=self.client.post("/api/v1/auth/users/",{"username":"x","email":"x@test.invalid","password":self.password,"role":"ADMIN"})
        self.assertEqual(response.status_code,status.HTTP_403_FORBIDDEN)
    def test_admin_cannot_modify_self(self):
        self.auth(self.admin)
        response=self.client.patch(f"/api/v1/auth/users/{self.admin.pk}/",{"first_name":"Changed"})
        self.assertEqual(response.status_code,403)
    def test_last_super_admin_cannot_be_deactivated(self):
        self.auth(self.root)
        response=self.client.post(f"/api/v1/auth/users/{self.root.pk}/activation/",{"is_active":False})
        self.assertEqual(response.status_code,400)
    def test_deactivated_user_refresh_is_rejected(self):
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh=str(RefreshToken.for_user(self.editor))
        self.editor.is_active=False;self.editor.save()
        response=self.client.post("/api/v1/auth/token/refresh/",{"refresh":refresh})
        self.assertEqual(response.status_code,401)
