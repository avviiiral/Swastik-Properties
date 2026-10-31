from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("properties", "0002_propertyimage"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="property",
            name="price",
        ),
        migrations.RemoveField(
            model_name="property",
            name="currency",
        ),
    ]
