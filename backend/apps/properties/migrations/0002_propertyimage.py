import apps.properties.models
import apps.properties.validators
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("properties", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="PropertyImage",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "image",
                    models.ImageField(
                        upload_to=apps.properties.models.property_image_upload_path,
                        validators=[apps.properties.validators.validate_property_image_upload],
                    ),
                ),
                ("caption", models.CharField(blank=True, default="", max_length=160)),
                ("alt_text", models.CharField(blank=True, default="", max_length=200)),
                ("is_primary", models.BooleanField(default=False)),
                ("sort_order", models.PositiveSmallIntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "property",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="images",
                        to="properties.property",
                    ),
                ),
            ],
            options={
                "ordering": ("sort_order", "created_at", "id"),
                "indexes": [
                    models.Index(
                        fields=["property", "sort_order"],
                        name="prop_image_sort_order",
                    )
                ],
            },
        ),
        migrations.AddConstraint(
            model_name="propertyimage",
            constraint=models.UniqueConstraint(
                condition=models.Q(("is_primary", True)),
                fields=("property",),
                name="one_primary_property_image",
            ),
        ),
    ]
