import uuid
from pathlib import Path

from django.conf import settings
from django.core.validators import FileExtensionValidator, MaxValueValidator, MinValueValidator
from django.db import models, transaction
from django.utils import timezone
from django.utils.text import slugify

from .validators import validate_google_maps_url, validate_pdf_upload


def generate_property_reference():
    return f"SWP-{uuid.uuid4().hex[:10].upper()}"


def brochure_upload_path(instance, filename):
    reference = instance.property_reference or "unassigned"
    suffix = Path(filename).suffix.lower() or ".pdf"
    return f"properties/{reference}/brochure/{uuid.uuid4().hex}{suffix}"


class Property(models.Model):
    """A property/project catalogue entry with a brochure and map destination."""

    class Category(models.TextChoices):
        RESIDENTIAL = "RESIDENTIAL", "Residential"
        COMMERCIAL = "COMMERCIAL", "Commercial"
        LAND = "LAND", "Land and plots"

    class ListingType(models.TextChoices):
        SALE = "SALE", "Sale"
        RENT = "RENT", "Rent"
        LEASE = "LEASE", "Lease"

    class AreaUnit(models.TextChoices):
        SQ_FT = "SQ_FT", "Square feet"
        SQ_M = "SQ_M", "Square metres"
        ACRE = "ACRE", "Acre"
        GUNTHA = "GUNTHA", "Guntha"

    class PublicationStatus(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        PENDING_REVIEW = "PENDING_REVIEW", "Pending review"
        CHANGES_REQUESTED = "CHANGES_REQUESTED", "Changes requested"
        APPROVED = "APPROVED", "Approved"
        PUBLISHED = "PUBLISHED", "Published"
        REJECTED = "REJECTED", "Rejected"
        ARCHIVED = "ARCHIVED", "Archived"

    class AvailabilityStatus(models.TextChoices):
        AVAILABLE = "AVAILABLE", "Available"
        SOLD = "SOLD", "Sold"
        RENTED = "RENTED", "Rented"
        LEASED = "LEASED", "Leased"
        UNAVAILABLE = "UNAVAILABLE", "Unavailable"

    property_reference = models.CharField(
        max_length=15,
        unique=True,
        editable=False,
        default=generate_property_reference,
    )
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    description = models.TextField(blank=True, default="")
    developer_name = models.CharField(max_length=160, blank=True, default="")

    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        blank=True,
        default="",
    )
    subcategory = models.CharField(max_length=80, blank=True, default="")
    listing_type = models.CharField(
        max_length=10,
        choices=ListingType.choices,
        blank=True,
        default="",
    )
    price = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
    )
    currency = models.CharField(max_length=3, default="INR")
    area_value = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
    )
    area_unit = models.CharField(
        max_length=10,
        choices=AreaUnit.choices,
        blank=True,
        default="",
    )

    location_name = models.CharField(max_length=200, blank=True, default="")
    full_address = models.TextField(blank=True, default="")
    locality = models.ForeignKey(
        "locations.Locality",
        on_delete=models.PROTECT,
        related_name="properties",
        null=True,
        blank=True,
    )
    location_url = models.URLField(max_length=1000, validators=[validate_google_maps_url])
    latitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True,
        validators=[MinValueValidator(-90), MaxValueValidator(90)],
    )
    longitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True,
        validators=[MinValueValidator(-180), MaxValueValidator(180)],
    )

    brochure = models.FileField(
        upload_to=brochure_upload_path,
        validators=[
            FileExtensionValidator(allowed_extensions=["pdf"]),
            validate_pdf_upload,
        ],
    )

    publication_status = models.CharField(
        max_length=24,
        choices=PublicationStatus.choices,
        default=PublicationStatus.DRAFT,
    )
    availability_status = models.CharField(
        max_length=16,
        choices=AvailabilityStatus.choices,
        default=AvailabilityStatus.AVAILABLE,
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="created_properties",
        null=True,
        blank=True,
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="approved_properties",
        null=True,
        blank=True,
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(
                fields=("publication_status", "category"),
                name="prop_status_category",
            ),
            models.Index(
                fields=("publication_status", "availability_status"),
                name="prop_status_avail",
            ),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name) or "property"
            candidate = base_slug
            suffix = 2
            queryset = type(self).objects.all()
            if self.pk:
                queryset = queryset.exclude(pk=self.pk)
            while queryset.filter(slug=candidate).exists():
                candidate = f"{base_slug}-{suffix}"
                suffix += 1
            self.slug = candidate

        if self.publication_status == self.PublicationStatus.PUBLISHED:
            if not self.published_at:
                self.published_at = timezone.now()
        else:
            self.published_at = None

        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        brochure_name = self.brochure.name if self.brochure else None
        storage = self.brochure.storage if self.brochure else None
        result = super().delete(*args, **kwargs)
        if brochure_name and storage:
            transaction.on_commit(lambda: storage.delete(brochure_name))
        return result

    def __str__(self):
        return f"{self.property_reference} — {self.name}"
