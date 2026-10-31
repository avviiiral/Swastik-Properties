from django.contrib.auth import get_user_model
from django.test import TestCase


User = get_user_model()


class UserManagerTests(TestCase):
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
