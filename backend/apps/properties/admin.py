from django.contrib import admin

from .models import Property


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = (
        "property_reference",
        "name",
        "category",
        "publication_status",
        "availability_status",
        "location_name",
        "created_at",
    )
    list_filter = (
        "category",
        "listing_type",
        "publication_status",
        "availability_status",
    )
    search_fields = (
        "property_reference",
        "name",
        "developer_name",
        "location_name",
        "full_address",
    )
    readonly_fields = (
        "property_reference",
        "slug",
        "created_by",
        "approved_by",
        "approved_at",
        "published_at",
        "created_at",
        "updated_at",
    )
    autocomplete_fields = ("locality",)
    fieldsets = (
        (
            "Property details",
            {
                "fields": (
                    "property_reference",
                    "name",
                    "slug",
                    "description",
                    "developer_name",
                    "category",
                    "subcategory",
                    "listing_type",
                    "price",
                    "currency",
                    "area_value",
                    "area_unit",
                )
            },
        ),
        (
            "Location",
            {
                "fields": (
                    "location_name",
                    "full_address",
                    "locality",
                    "location_url",
                    "latitude",
                    "longitude",
                )
            },
        ),
        ("Brochure", {"fields": ("brochure",)}),
        (
            "Publication",
            {
                "fields": (
                    "publication_status",
                    "availability_status",
                    "created_by",
                    "approved_by",
                    "approved_at",
                    "published_at",
                )
            },
        ),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )

    def save_model(self, request, obj, form, change):
        if not change and not obj.created_by_id:
            obj.created_by = request.user
        if obj.publication_status in (
            Property.PublicationStatus.APPROVED,
            Property.PublicationStatus.PUBLISHED,
        ) and not obj.approved_by_id:
            obj.approved_by = request.user
        super().save_model(request, obj, form, change)
