from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("submissions", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="BusinessContactSettings",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("whatsapp_number", models.CharField(default="+919403129403", max_length=20)),
                ("contact_number", models.CharField(default="+919403129403", max_length=20)),
                ("email", models.EmailField(default="sangramspawar@gmail.com", max_length=254)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name": "Business contact settings",
                "verbose_name_plural": "Business contact settings",
            },
        ),
    ]
