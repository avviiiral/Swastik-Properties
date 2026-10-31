import apps.properties.models
import apps.properties.validators
import django.core.validators
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("locations", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Property",
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
                    "property_reference",
                    models.CharField(
                        default=apps.properties.models.generate_property_reference,
                        editable=False,
                        max_length=15,
                        unique=True,
                    ),
                ),
                ("name", models.CharField(max_length=200)),
                ("slug", models.SlugField(blank=True, max_length=220, unique=True)),
                ("description", models.TextField(blank=True, default="")),
                ("developer_name", models.CharField(blank=True, default="", max_length=160)),
                (
                    "category",
                    models.CharField(
                        blank=True,
                        choices=[
                            ("RESIDENTIAL", "Residential"),
                            ("COMMERCIAL", "Commercial"),
                            ("LAND", "Land and plots"),
                        ],
                        default="",
                        max_length=20,
                    ),
                ),
                ("subcategory", models.CharField(blank=True, default="", max_length=80)),
                (
                    "listing_type",
                    models.CharField(
                        blank=True,
                        choices=[
                            ("SALE", "Sale"),
                            ("RENT", "Rent"),
                            ("LEASE", "Lease"),
                        ],
                        default="",
                        max_length=10,
                    ),
                ),
                (
                    "price",
                    models.DecimalField(
                        blank=True,
                        decimal_places=2,
                        max_digits=14,
                        null=True,
                        validators=[django.core.validators.MinValueValidator(0)],
                    ),
                ),
                ("currency", models.CharField(default="INR", max_length=3)),
                (
                    "area_value",
                    models.DecimalField(
                        blank=True,
                        decimal_places=2,
                        max_digits=12,
                        null=True,
                        validators=[django.core.validators.MinValueValidator(0)],
                    ),
                ),
                (
                    "area_unit",
                    models.CharField(
                        blank=True,
                        choices=[
                            ("SQ_FT", "Square feet"),
                            ("SQ_M", "Square metres"),
                            ("ACRE", "Acre"),
                            ("GUNTHA", "Guntha"),
                        ],
                        default="",
                        max_length=10,
                    ),
                ),
                ("location_name", models.CharField(blank=True, default="", max_length=200)),
                ("full_address", models.TextField(blank=True, default="")),
                (
                    "location_url",
                    models.URLField(
                        max_length=1000,
                        validators=[apps.properties.validators.validate_google_maps_url],
                    ),
                ),
                (
                    "latitude",
                    models.DecimalField(
                        blank=True,
                        decimal_places=7,
                        max_digits=10,
                        null=True,
                        validators=[
                            django.core.validators.MinValueValidator(-90),
                            django.core.validators.MaxValueValidator(90),
                        ],
                    ),
                ),
                (
                    "longitude",
                    models.DecimalField(
                        blank=True,
                        decimal_places=7,
                        max_digits=10,
                        null=True,
                        validators=[
                            django.core.validators.MinValueValidator(-180),
                            django.core.validators.MaxValueValidator(180),
                        ],
                    ),
                ),
                (
                    "brochure",
                    models.FileField(
                        upload_to=apps.properties.models.brochure_upload_path,
                        validators=[
                            django.core.validators.FileExtensionValidator(
                                allowed_extensions=["pdf"]
                            ),
                            apps.properties.validators.validate_pdf_upload,
                        ],
                    ),
                ),
                (
                    "publication_status",
                    models.CharField(
                        choices=[
                            ("DRAFT", "Draft"),
                            ("PENDING_REVIEW", "Pending review"),
                            ("CHANGES_REQUESTED", "Changes requested"),
                            ("APPROVED", "Approved"),
                            ("PUBLISHED", "Published"),
                            ("REJECTED", "Rejected"),
                            ("ARCHIVED", "Archived"),
                        ],
                        default="DRAFT",
                        max_length=24,
                    ),
                ),
                (
                    "availability_status",
                    models.CharField(
                        choices=[
                            ("AVAILABLE", "Available"),
                            ("SOLD", "Sold"),
                            ("RENTED", "Rented"),
                            ("LEASED", "Leased"),
                            ("UNAVAILABLE", "Unavailable"),
                        ],
                        default="AVAILABLE",
                        max_length=16,
                    ),
                ),
                ("approved_at", models.DateTimeField(blank=True, null=True)),
                ("published_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "approved_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="approved_properties",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "created_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="created_properties",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "locality",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="properties",
                        to="locations.locality",
                    ),
                ),
            ],
            options={
                "ordering": ("-created_at",),
                "indexes": [
                    models.Index(
                        fields=["publication_status", "category"],
                        name="prop_status_category",
                    ),
                    models.Index(
                        fields=["publication_status", "availability_status"],
                        name="prop_status_avail",
                    ),
                ],
            },
        ),
    ]
