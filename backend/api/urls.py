from rest_framework import routers

from .viewsets.organization import OrganizationViewSet
from .viewsets.record_of_sale import RecordOfSaleViewset
from .viewsets.role import RoleViewSet
from .viewsets.submissions import SalesSubmissionsViewset
from .viewsets.user import UserViewSet
from .viewsets.vehicle import VehicleViewSet

router = routers.SimpleRouter(trailing_slash=False)
router.register(r'organizations', OrganizationViewSet)
router.register(r'users', UserViewSet)
router.register(r'vehicles', VehicleViewSet)
router.register(r'roles', RoleViewSet, basename='role')
router.register(r'sales', RecordOfSaleViewset, basename='sale')
router.register(r'submissions', SalesSubmissionsViewset, basename='submission')

urlpatterns = router.urls
