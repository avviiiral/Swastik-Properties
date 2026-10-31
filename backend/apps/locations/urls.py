from rest_framework.routers import DefaultRouter

from .views import CityViewSet, DistrictViewSet, LocalityViewSet, StateViewSet

app_name = "locations"

router = DefaultRouter()
router.register("states", StateViewSet, basename="state")
router.register("districts", DistrictViewSet, basename="district")
router.register("cities", CityViewSet, basename="city")
router.register("localities", LocalityViewSet, basename="locality")

urlpatterns = router.urls
