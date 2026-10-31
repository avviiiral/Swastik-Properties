from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class UserManagerTests(APITestCase):
    def test_create_user_hashes_password_and_defaults_to_agent(self):
        user = User.objects.create_user(
            username="agent-one",
            email="Agent@One.example",
            password="Strong-test-password-123",
        )

        self.assertEqual(user.email, "Agent@one.example")
        self.assertTrue(user.check_password("Strong-test-password-123"))
        self.assertNotEqual(user.password, "Strong-test-password-123")
        self.assertEqual(user.role, User.Role.AGENT)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

    def test_create_user_requires_email(self):
        with self.assertRaisesMessage(ValueError, "An email address is required."):
            User.objects.create_user(
                username="agent-two",
                email="",
                password="Strong-test-password-123",
            )

    def test_create_superuser_has_super_admin_role_and_flags(self):
        user = User.objects.create_superuser(
            username="root-admin",
            email="root@swastik.example",
            password="Strong-test-password-123",
        )

        self.assertEqual(user.role, User.Role.SUPER_ADMIN)
        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)
        self.assertTrue(user.is_active)

    def test_email_is_the_authentication_identifier(self):
        self.assertEqual(User.USERNAME_FIELD, "email")
        self.assertEqual(User.REQUIRED_FIELDS, ["username"])


class AuthenticationAPITests(APITestCase):
    password = "Local-Test-Password-829!x"

    def setUp(self):
        self.super_admin = User.objects.create_superuser(
            username="root-admin",
            email="root@swastik.example",
            password=self.password,
        )
        self.admin = User.objects.create_user(
            username="office-admin",
            email="admin@swastik.example",
            password=self.password,
            role=User.Role.ADMIN,
        )
        self.agent = User.objects.create_user(
            username="field-agent",
            email="agent@swastik.example",
            password=self.password,
            role=User.Role.AGENT,
        )

    def login(self, email):
        return self.client.post(
            "/api/v1/auth/login/",
            {"email": email, "password": self.password},
            format="json",
        )

    def authenticate_as(self, user):
        self.client.force_authenticate(user=user)

    def test_login_uses_email_and_returns_user_and_tokens(self):
        response = self.login(self.admin.email)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["user"]["email"], self.admin.email)
        self.assertEqual(response.data["user"]["role"], User.Role.ADMIN)

    def test_login_rejects_invalid_password(self):
        response = self.client.post(
            "/api/v1/auth/login/",
            {"email": self.admin.email, "password": "wrong-password"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_current_user_requires_authentication(self):
        response = self.client.get("/api/v1/auth/me/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_current_user_returns_authenticated_account(self):
        self.authenticate_as(self.agent)

        response = self.client.get("/api/v1/auth/me/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.agent.id)
        self.assertEqual(response.data["role"], User.Role.AGENT)
        self.assertNotIn("password", response.data)

    def test_refresh_rotates_refresh_token_and_revokes_previous_token(self):
        login_response = self.login(self.admin.email)
        old_refresh = login_response.data["refresh"]

        response = self.client.post(
            "/api/v1/auth/token/refresh/",
            {"refresh": old_refresh},
            format="json",
        )
        old_token_response = self.client.post(
            "/api/v1/auth/token/refresh/",
            {"refresh": old_refresh},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertNotEqual(response.data["refresh"], old_refresh)
        self.assertEqual(
            old_token_response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_logout_blacklists_refresh_token(self):
        login_response = self.login(self.admin.email)
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {login_response.data['access']}"
        )

        logout_response = self.client.post(
            "/api/v1/auth/logout/",
            {"refresh": login_response.data["refresh"]},
            format="json",
        )
        refresh_response = self.client.post(
            "/api/v1/auth/token/refresh/",
            {"refresh": login_response.data["refresh"]},
            format="json",
        )

        self.assertEqual(logout_response.status_code, status.HTTP_205_RESET_CONTENT)
        self.assertEqual(refresh_response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_rejects_another_users_refresh_token(self):
        refresh = str(RefreshToken.for_user(self.admin))
        self.authenticate_as(self.agent)

        response = self.client.post(
            "/api/v1/auth/logout/",
            {"refresh": refresh},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_agent_cannot_access_user_management(self):
        self.authenticate_as(self.agent)

        response = self.client.get("/api/v1/auth/users/")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_only_list_agent_accounts(self):
        self.authenticate_as(self.admin)

        response = self.client.get("/api/v1/auth/users/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["role"], User.Role.AGENT)

    def test_admin_can_create_agent(self):
        self.authenticate_as(self.admin)

        response = self.client.post(
            "/api/v1/auth/users/",
            {
                "username": "new-agent",
                "email": "new-agent@swastik.example",
                "password": self.password,
                "role": User.Role.AGENT,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        created_user = User.objects.get(email="new-agent@swastik.example")
        self.assertEqual(created_user.role, User.Role.AGENT)
        self.assertFalse(created_user.is_staff)
        self.assertFalse(created_user.is_superuser)

    def test_admin_cannot_create_admin_account(self):
        self.authenticate_as(self.admin)

        response = self.client.post(
            "/api/v1/auth/users/",
            {
                "username": "another-admin",
                "email": "another-admin@swastik.example",
                "password": self.password,
                "role": User.Role.ADMIN,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_super_admin_can_create_admin_account(self):
        self.authenticate_as(self.super_admin)

        response = self.client.post(
            "/api/v1/auth/users/",
            {
                "username": "new-admin",
                "email": "new-admin@swastik.example",
                "password": self.password,
                "role": User.Role.ADMIN,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        created_user = User.objects.get(email="new-admin@swastik.example")
        self.assertEqual(created_user.role, User.Role.ADMIN)
        self.assertFalse(created_user.is_staff)
        self.assertFalse(created_user.is_superuser)

    def test_admin_cannot_create_super_admin_account(self):
        self.authenticate_as(self.admin)

        response = self.client.post(
            "/api/v1/auth/users/",
            {
                "username": "root-two",
                "email": "root-two@swastik.example",
                "password": self.password,
                "role": User.Role.SUPER_ADMIN,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_cannot_retrieve_admin_account(self):
        self.authenticate_as(self.admin)

        response = self.client.get(f"/api/v1/auth/users/{self.admin.id}/")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_admin_can_list_editor_and_agent_accounts(self):
        editor = User.objects.create_user(
            username="blog-editor", email="editor@swastik.example",
            password=self.password, role=User.Role.EDITOR,
        )
        self.authenticate_as(self.admin)
        response = self.client.get("/api/v1/auth/users/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            {item["role"] for item in response.data["results"]},
            {User.Role.AGENT, User.Role.EDITOR},
        )

    def test_admin_can_create_editor_account(self):
        self.authenticate_as(self.admin)
        response = self.client.post(
            "/api/v1/auth/users/",
            {
                "username": "new-editor",
                "email": "new-editor@swastik.example",
                "password": self.password,
                "role": User.Role.EDITOR,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_admin_cannot_promote_agent_to_admin(self):
        self.authenticate_as(self.admin)

        response = self.client.patch(
            f"/api/v1/auth/users/{self.agent.id}/",
            {"role": User.Role.ADMIN},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_super_admin_can_retrieve_admin_account(self):
        self.authenticate_as(self.super_admin)

        response = self.client.get(f"/api/v1/auth/users/{self.admin.id}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["role"], User.Role.ADMIN)
