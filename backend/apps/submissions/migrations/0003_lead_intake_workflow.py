from django.db import migrations, models


def backfill_updated_at(apps, schema_editor):
    PropertyEnquiry = apps.get_model("submissions", "PropertyEnquiry")
    for enquiry in PropertyEnquiry.objects.filter(updated_at__isnull=True).only("pk", "created_at").iterator():
        PropertyEnquiry.objects.filter(pk=enquiry.pk).update(updated_at=enquiry.created_at)


class Migration(migrations.Migration):
    dependencies = [
        ("submissions", "0002_businesscontactsettings"),
    ]

    operations = [
        migrations.AddField(
            model_name="propertyenquiry",
            name="enquiry_type",
            field=models.CharField(
                choices=[
                    ("GENERAL_ENQUIRY", "General enquiry"),
                    ("PROPERTY_ENQUIRY", "Property enquiry"),
                    ("BUY_REQUIREMENT", "Buy requirement"),
                    ("RENT_REQUIREMENT", "Rent requirement"),
                    ("SELL_PROPERTY", "Sell a property"),
                    ("PROPERTY_LISTING", "List a property"),
                ],
                default="PROPERTY_ENQUIRY",
                max_length=24,
            ),
        ),
        migrations.AddField(
            model_name="propertyenquiry",
            name="details",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="propertyenquiry",
            name="source_path",
            field=models.CharField(blank=True, default="", max_length=300),
        ),
        migrations.AddField(
            model_name="propertyenquiry",
            name="consented_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="propertyenquiry",
            name="admin_notes",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="propertyenquiry",
            name="updated_at",
            field=models.DateTimeField(auto_now=True, null=True),
            preserve_default=False,
        ),
        migrations.RunPython(backfill_updated_at, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="propertyenquiry",
            name="updated_at",
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AlterField(
            model_name="propertyenquiry",
            name="property_name",
            field=models.CharField(blank=True, default="", max_length=200),
        ),
        migrations.AlterField(
            model_name="propertyenquiry",
            name="status",
            field=models.CharField(
                choices=[
                    ("NEW", "New"),
                    ("CONTACTED", "Contacted"),
                    ("QUALIFIED", "Qualified"),
                    ("CLOSED", "Closed"),
                    ("SPAM", "Spam"),
                ],
                default="NEW",
                max_length=12,
            ),
        ),
        migrations.AddIndex(
            model_name="propertyenquiry",
            index=models.Index(fields=["enquiry_type", "created_at"], name="enquiry_type_date"),
        ),
    ]
