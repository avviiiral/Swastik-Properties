from django.core.management.base import BaseCommand
from django.utils.text import slugify

from apps.locations.models import District, State


MAHARASHTRA_DISTRICTS = (
    "Ahilyanagar",
    "Akola",
    "Amravati",
    "Beed",
    "Bhandara",
    "Buldhana",
    "Chandrapur",
    "Chhatrapati Sambhajinagar",
    "Dharashiv",
    "Dhule",
    "Gadchiroli",
    "Gondia",
    "Hingoli",
    "Jalgaon",
    "Jalna",
    "Kolhapur",
    "Latur",
    "Mumbai City",
    "Mumbai Suburban",
    "Nagpur",
    "Nanded",
    "Nandurbar",
    "Nashik",
    "Palghar",
    "Parbhani",
    "Pune",
    "Raigad",
    "Ratnagiri",
    "Sangli",
    "Satara",
    "Sindhudurg",
    "Solapur",
    "Thane",
    "Wardha",
    "Washim",
    "Yavatmal",
)


class Command(BaseCommand):
    help = "Create or update Maharashtra and its current 36 districts."

    def handle(self, *args, **options):
        state, state_created = State.objects.update_or_create(
            slug="maharashtra",
            defaults={"name": "Maharashtra", "is_active": True},
        )

        created_count = 0
        updated_count = 0

        for name in MAHARASHTRA_DISTRICTS:
            district, created = District.objects.update_or_create(
                state=state,
                slug=slugify(name),
                defaults={"name": name, "is_active": True},
            )
            if created:
                created_count += 1
            else:
                updated_count += 1

        state_action = "created" if state_created else "verified"
        self.stdout.write(
            self.style.SUCCESS(
                f"Maharashtra {state_action}; districts created: {created_count}, "
                f"updated: {updated_count}, total: {len(MAHARASHTRA_DISTRICTS)}."
            )
        )
