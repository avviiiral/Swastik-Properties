from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [("accounts", "0001_initial")]
    operations = [
        migrations.AlterField(
            model_name="user",
            name="role",
            field=models.CharField(
                choices=[
                    ("SUPER_ADMIN", "Super Admin"),
                    ("ADMIN", "Admin"),
                    ("EDITOR", "Blog Editor"),
                    ("AGENT", "Agent"),
                ],
                default="AGENT",
                max_length=20,
            ),
        ),
    ]
