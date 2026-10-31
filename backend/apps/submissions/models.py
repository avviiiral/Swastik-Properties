from django.db import models


class PropertyEnquiry(models.Model):
    """A public enquiry tied to a property, retained if that property is deleted."""

    class Status(models.TextChoices):
        NEW = "NEW", "New"
        CONTACTED = "CONTACTED", "Contacted"
        CLOSED = "CLOSED", "Closed"

    property = models.ForeignKey(
        "properties.Property",
        on_delete=models.SET_NULL,
        related_name="enquiries",
        null=True,
        blank=True,
    )
    property_name = models.CharField(max_length=200)
    property_reference = models.CharField(max_length=32, blank=True, default="")
    name = models.CharField(max_length=120)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    message = models.TextField(max_length=2000)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.NEW)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [models.Index(fields=("status", "created_at"), name="enquiry_status_date")]

    def __str__(self):
        return f"{self.property_reference or self.property_name} — {self.name}"


class BusinessContactSettings(models.Model):
    """Single public contact profile managed by administrators."""

    whatsapp_number = models.CharField(max_length=20, default="+919403129403")
    contact_number = models.CharField(max_length=20, default="+919403129403")
    email = models.EmailField(default="sangramspawar@gmail.com")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Business contact settings"
        verbose_name_plural = "Business contact settings"

    def __str__(self):
        return "Swastik Properties contact details"

    @classmethod
    def get_settings(cls):
        settings, _ = cls.objects.get_or_create(pk=1)
        return settings
