from django.db import transaction
from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver
from django.core.files.storage import default_storage

from .models import Property


@receiver(pre_save, sender=Property)
def delete_replaced_brochure(sender, instance, **kwargs):
    """Delete a replaced brochure only after the record update commits."""
    if not instance.pk:
        return

    old_name = (
        sender.objects.filter(pk=instance.pk)
        .values_list("brochure", flat=True)
        .first()
    )
    new_name = getattr(instance.brochure, "name", None)
    if old_name and old_name != new_name:
        storage = instance.brochure.storage if instance.brochure else default_storage
        transaction.on_commit(lambda: storage.delete(old_name))


@receiver(post_delete, sender=Property)
def delete_property_brochure(sender, instance, **kwargs):
    """Clean up brochure files for API deletion and Django Admin bulk deletion."""
    if not instance.brochure:
        return

    name = instance.brochure.name
    storage = instance.brochure.storage
    transaction.on_commit(lambda: storage.delete(name))
