from django.db import models


class PropertyEnquiry(models.Model):
    """A customer lead from any public form on the website."""

    class EnquiryType(models.TextChoices):
        GENERAL_ENQUIRY = "GENERAL_ENQUIRY", "General enquiry"
        PROPERTY_ENQUIRY = "PROPERTY_ENQUIRY", "Property enquiry"
        BUY_REQUIREMENT = "BUY_REQUIREMENT", "Buy requirement"
        RENT_REQUIREMENT = "RENT_REQUIREMENT", "Rent requirement"
        SELL_PROPERTY = "SELL_PROPERTY", "Sell a property"
        PROPERTY_LISTING = "PROPERTY_LISTING", "List a property"

    class Status(models.TextChoices):
        NEW = "NEW", "New"
        CONTACTED = "CONTACTED", "Contacted"
        QUALIFIED = "QUALIFIED", "Qualified"
        CLOSED = "CLOSED", "Closed"
        SPAM = "SPAM", "Spam"

    property = models.ForeignKey(
        "properties.Property",
        on_delete=models.SET_NULL,
        related_name="enquiries",
        null=True,
        blank=True,
    )
    property_name = models.CharField(max_length=200, blank=True, default="")
    property_reference = models.CharField(max_length=32, blank=True, default="")
    enquiry_type = models.CharField(
        max_length=24,
        choices=EnquiryType.choices,
        default=EnquiryType.PROPERTY_ENQUIRY,
    )
    name = models.CharField(max_length=120)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    message = models.TextField(max_length=2000)
    details = models.JSONField(default=dict, blank=True)
    source_path = models.CharField(max_length=300, blank=True, default="")
    consented_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.NEW)
    admin_notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=("status", "created_at"), name="enquiry_status_date"),
            models.Index(fields=("enquiry_type", "created_at"), name="enquiry_type_date"),
        ]

    def __str__(self):
        return f"{self.property_reference or self.property_name or self.get_enquiry_type_display()} — {self.name}"


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
