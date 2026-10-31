from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()

class EditorRoleAccessTests(APITestCase):
    password = "Test-only-Passphrase-784!"

    def setUp(self):
        self.root = User.objects.create_superuser(username="root", email="root@test.invalid", password=self.password)
        self.admin = User.objects.create_user(username="admin", email="admin@test.invalid", password=self.password, role=User.Role.ADMIN)
        self.editor = User.objects.create_user(username="editor", email="editor@test.invalid", password=self.password, role=User.Role.EDITOR)
        self.agent = User.objects.create_user(username="agent", email="agent@test.invalid", password=self.password, role=User.Role.AGENT)

    def auth(self, user):
        self.client.force_authenticate(user=user)

    def test_admin_can_list_editor_and_agent(self):
        self.auth(self.admin)
        response = self.client.get("/api/v1/auth/users/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual({item["role"] for item in response.data["results"]}, {"EDITOR", "AGENT"})

    def test_editor_and_agent_cannot_manage_users(self):
        for user in (self.editor, self.agent):
            self.client.force_authenticate(user=user)
            self.assertEqual(self.client.get("/api/v1/auth/users/").status_code, 403)

    def test_admin_cannot_create_admin_or_super_admin(self):
        self.auth(self.admin)
        for role in (User.Role.ADMIN, User.Role.SUPER_ADMIN):
            response = self.client.post("/api/v1/auth/users/", {
                "username": "blocked-" + role.lower(),
                "email": "blocked-" + role.lower() + "@test.invalid",
                "password": self.password,
                "role": role,
            })
            self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_cannot_modify_self(self):
        self.auth(self.admin)
        response = self.client.patch(f"/api/v1/auth/users/{self.admin.pk}/", {"first_name": "Changed"})
        self.assertEqual(response.status_code, 403)

    def test_super_admin_can_create_super_admin(self):
        self.auth(self.root)
        response = self.client.post("/api/v1/auth/users/", {
            "username": "second-root",
            "email": "second-root@test.invalid",
            "password": "Another-Valid-Passphrase-283!",
            "role": User.Role.SUPER_ADMIN,
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        created = User.objects.get(email="second-root@test.invalid")
        self.assertTrue(created.is_staff)
        self.assertTrue(created.is_superuser)

    def test_last_super_admin_cannot_be_deactivated(self):
        self.auth(self.root)
        response = self.client.post(f"/api/v1/auth/users/{self.root.pk}/activation/", {"is_active": False})
        self.assertEqual(response.status_code, 400)

    def test_last_super_admin_cannot_be_demoted(self):
        self.auth(self.root)
        response = self.client.patch(f"/api/v1/auth/users/{self.root.pk}/", {"role": User.Role.ADMIN})
        self.assertEqual(response.status_code, 403)

    def test_last_super_admin_cannot_be_deleted(self):
        self.auth(self.root)
        response = self.client.delete(f"/api/v1/auth/users/{self.root.pk}/")
        self.assertEqual(response.status_code, 400)

    def test_deactivated_user_refresh_is_rejected(self):
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = str(RefreshToken.for_user(self.editor))
        self.editor.is_active = False
        self.editor.save()
        response = self.client.post("/api/v1/auth/token/refresh/", {"refresh": refresh})
        self.assertEqual(response.status_code, 401)
