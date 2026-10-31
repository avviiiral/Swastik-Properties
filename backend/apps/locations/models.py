from django.db import models
from django.utils.text import slugify


class LocationBaseModel(models.Model):
    """Shared fields for normalized geographic reference data."""

    name = models.CharField(max_length=160)
    slug = models.SlugField(max_length=180, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ("name",)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class State(LocationBaseModel):
    class Meta(LocationBaseModel.Meta):
        abstract = False
        verbose_name_plural = "states"
        constraints = [
            models.UniqueConstraint(fields=("name",), name="uq_location_state_name"),
            models.UniqueConstraint(fields=("slug",), name="uq_location_state_slug"),
        ]
        indexes = [
            models.Index(fields=("is_active", "name"), name="loc_state_active_name"),
        ]


class District(LocationBaseModel):
    state = models.ForeignKey(
        State,
        on_delete=models.PROTECT,
        related_name="districts",
    )

    class Meta(LocationBaseModel.Meta):
        abstract = False
        constraints = [
            models.UniqueConstraint(
                fields=("state", "name"),
                name="uq_location_district_name_state",
            ),
            models.UniqueConstraint(
                fields=("state", "slug"),
                name="uq_location_district_slug_state",
            ),
        ]
        indexes = [
            models.Index(fields=("state", "is_active"), name="loc_dist_state_active"),
        ]


class City(LocationBaseModel):
    district = models.ForeignKey(
        District,
        on_delete=models.PROTECT,
        related_name="cities",
    )

    class Meta(LocationBaseModel.Meta):
        abstract = False
        constraints = [
            models.UniqueConstraint(
                fields=("district", "name"),
                name="uq_location_city_name_district",
            ),
            models.UniqueConstraint(
                fields=("district", "slug"),
                name="uq_location_city_slug_district",
            ),
        ]
        indexes = [
            models.Index(fields=("district", "is_active"), name="loc_city_dist_active"),
        ]


class Locality(LocationBaseModel):
    city = models.ForeignKey(
        City,
        on_delete=models.PROTECT,
        related_name="localities",
    )

    class Meta(LocationBaseModel.Meta):
        abstract = False
        constraints = [
            models.UniqueConstraint(
                fields=("city", "name"),
                name="uq_location_locality_name_city",
            ),
            models.UniqueConstraint(
                fields=("city", "slug"),
                name="uq_location_locality_slug_city",
            ),
        ]
        indexes = [
            models.Index(fields=("city", "is_active"), name="loc_loc_city_active"),
        ]
