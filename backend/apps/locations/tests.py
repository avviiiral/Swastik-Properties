from io import StringIO

from django.core.management import call_command
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase

from apps.locations.models import City, District, Locality, State


class LocationModelTests(TestCase):
    def test_location_slugs_are_generated(self):
        state = State.objects.create(name="Maharashtra")
        district = District.objects.create(state=state, name="Chhatrapati Sambhajinagar")
        city = City.objects.create(district=district, name="Chhatrapati Sambhajinagar")
        locality = Locality.objects.create(city=city, name="CIDCO")

        self.assertEqual(state.slug, "maharashtra")
        self.assertEqual(district.slug, "chhatrapati-sambhajinagar")
        self.assertEqual(city.slug, "chhatrapati-sambhajinagar")
        self.assertEqual(locality.slug, "cidco")

    def test_seed_command_is_idempotent_and_seeds_36_districts(self):
        first_output = StringIO()
        call_command("seed_maharashtra_locations", stdout=first_output)

        state = State.objects.get(slug="maharashtra")
        self.assertEqual(state.districts.count(), 36)

        second_output = StringIO()
        call_command("seed_maharashtra_locations", stdout=second_output)

        self.assertEqual(State.objects.count(), 1)
        self.assertEqual(state.districts.count(), 36)
        self.assertIn("districts created: 0", second_output.getvalue())


class PublicLocationAPITests(APITestCase):
    def setUp(self):
        self.state = State.objects.create(name="Maharashtra")
        self.other_state = State.objects.create(name="Goa")

        self.district = District.objects.create(
            state=self.state,
            name="Nagpur",
        )
        self.other_district = District.objects.create(
            state=self.other_state,
            name="North Goa",
        )
        self.city = City.objects.create(
            district=self.district,
            name="Nagpur",
        )
        self.other_city = City.objects.create(
            district=self.other_district,
            name="Mapusa",
        )
        self.locality = Locality.objects.create(
            city=self.city,
            name="Civil Lines",
        )
        self.other_locality = Locality.objects.create(
            city=self.other_city,
            name="Assagao",
        )

    def test_state_lookup_is_public(self):
        response = self.client.get("/api/v1/locations/states/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)

    def test_districts_can_be_filtered_by_state(self):
        response = self.client.get(
            "/api/v1/locations/districts/",
            {"state": self.state.id},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["name"], "Nagpur")
        self.assertEqual(response.data["results"][0]["state_name"], "Maharashtra")

    def test_cities_can_be_filtered_by_district_or_state(self):
        for params in ({"district": self.district.id}, {"state": self.state.id}):
            response = self.client.get(
                "/api/v1/locations/cities/",
                params,
            )

            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(response.data["count"], 1)
            self.assertEqual(response.data["results"][0]["name"], "Nagpur")
            self.assertEqual(response.data["results"][0]["state_name"], "Maharashtra")

    def test_localities_can_be_filtered_by_city_district_or_state(self):
        filter_params = (
            {"city": self.city.id},
            {"district": self.district.id},
            {"state": self.state.id},
        )
        for params in filter_params:
            response = self.client.get(
                "/api/v1/locations/localities/",
                params,
            )

            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(response.data["count"], 1)
            self.assertEqual(response.data["results"][0]["name"], "Civil Lines")

    def test_localities_include_the_full_parent_path(self):
        response = self.client.get(
            "/api/v1/locations/localities/",
            {"city": self.city.id},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        locality = response.data["results"][0]
        self.assertEqual(locality["name"], "Civil Lines")
        self.assertEqual(locality["city_name"], "Nagpur")
        self.assertEqual(locality["district_name"], "Nagpur")
        self.assertEqual(locality["state_name"], "Maharashtra")

    def test_inactive_parent_hides_descendant_locations(self):
        self.state.is_active = False
        self.state.save(update_fields=("is_active", "updated_at"))

        response = self.client.get("/api/v1/locations/districts/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["name"], "North Goa")

        response = self.client.get("/api/v1/locations/localities/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["name"], "Assagao")

    def test_public_location_endpoints_are_read_only(self):
        response = self.client.post(
            "/api/v1/locations/states/",
            {"name": "New State"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
