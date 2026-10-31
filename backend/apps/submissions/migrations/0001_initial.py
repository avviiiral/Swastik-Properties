import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("properties", "0002_propertyimage"),
    ]

    operations = [
        migrations.CreateModel(
            name="PropertyEnquiry",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("property_name", models.CharField(max_length=200)),
                ("property_reference", models.CharField(blank=True, default="", max_length=32)),
                ("name", models.CharField(max_length=120)),
                ("email", models.EmailField(max_length=254)),
                ("phone", models.CharField(max_length=20)),
                ("message", models.TextField(max_length=2000)),
                ("status", models.CharField(choices=[("NEW", "New"), ("CONTACTED", "Contacted"), ("CLOSED", "Closed")], default="NEW", max_length=12)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("property", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="enquiries", to="properties.property")),
            ],
            options={
                "ordering": ("-created_at",),
                "indexes": [models.Index(fields=["status", "created_at"], name="enquiry_status_date")],
            },
        ),
    ]
