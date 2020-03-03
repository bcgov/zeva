from rest_framework import routers

from .viewsets.organization import OrganizationViewSet
from .viewsets.record_of_sale import RecordOfSaleViewset
from .viewsets.user import UserViewSet
from .viewsets.vehicle import VehicleViewSet
from .viewsets.role import RoleViewSet

router = routers.SimpleRouter(trailing_slash=False)
router.register(r'organizations', OrganizationViewSet)
router.register(r'users', UserViewSet)
router.register(r'vehicles', VehicleViewSet)
router.register(r'roles', RoleViewSet, basename='role')
router.register(r'sales', RecordOfSaleViewset, basename='sale')

urlpatterns = router.urls
