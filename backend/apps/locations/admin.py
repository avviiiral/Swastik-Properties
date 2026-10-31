from django.contrib import admin

from .models import City, District, Locality, State


@admin.register(State)
class StateAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active", "updated_at")
    list_filter = ("is_active",)
    search_fields = ("name",)
    readonly_fields = ("created_at", "updated_at")


@admin.register(District)
class DistrictAdmin(admin.ModelAdmin):
    list_display = ("name", "state", "is_active", "updated_at")
    list_filter = ("state", "is_active")
    search_fields = ("name", "state__name")
    readonly_fields = ("created_at", "updated_at")
    autocomplete_fields = ("state",)


@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ("name", "district", "is_active", "updated_at")
    list_filter = ("district__state", "is_active")
    search_fields = ("name", "district__name", "district__state__name")
    readonly_fields = ("created_at", "updated_at")
    autocomplete_fields = ("district",)


@admin.register(Locality)
class LocalityAdmin(admin.ModelAdmin):
    list_display = ("name", "city", "is_active", "updated_at")
    list_filter = ("city__district__state", "is_active")
    search_fields = ("name", "city__name", "city__district__name")
    readonly_fields = ("created_at", "updated_at")
    autocomplete_fields = ("city",)
