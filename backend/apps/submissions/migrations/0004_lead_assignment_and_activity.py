from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0002_user_editor_role"),
        ("submissions", "0003_lead_intake_workflow"),
    ]

    operations = [
        migrations.AddField(
            model_name="propertyenquiry",
            name="assigned_to",
            field=models.ForeignKey(
                blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL,
                related_name="assigned_property_enquiries", to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name="propertyenquiry",
            name="assigned_by",
            field=models.ForeignKey(
                blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL,
                related_name="distributed_property_enquiries", to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name="propertyenquiry",
            name="assigned_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddIndex(
            model_name="propertyenquiry",
            index=models.Index(fields=["assigned_to", "status"], name="enquiry_agent_status"),
        ),
        migrations.CreateModel(
            name="LeadActivity",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("activity_type", models.CharField(
                    choices=[
                        ("NOTE", "Note"), ("CALL", "Call"), ("EMAIL", "Email"),
                        ("MEETING", "Meeting"), ("STATUS_CHANGE", "Status change"),
                        ("ASSIGNMENT", "Assignment"),
                    ], default="NOTE", max_length=20,
                )),
                ("body", models.TextField(max_length=2000)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("actor", models.ForeignKey(
                    blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL,
                    related_name="lead_activities", to=settings.AUTH_USER_MODEL,
                )),
                ("enquiry", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="activities", to="submissions.propertyenquiry",
                )),
            ],
            options={
                "ordering": ("-created_at",),
                "indexes": [models.Index(fields=["enquiry", "created_at"], name="lead_activity_date")],
            },
        ),
    ]
