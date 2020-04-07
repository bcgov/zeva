from rest_framework import routers

from .viewsets.credit_transaction import CreditTransactionViewSet
from .viewsets.organization import OrganizationViewSet
from .viewsets.record_of_sale import RecordOfSaleViewset
from .viewsets.role import RoleViewSet
from .viewsets.submissions import SalesSubmissionsViewset
from .viewsets.user import UserViewSet
from .viewsets.vehicle import VehicleViewSet
from .viewsets.icbc_verification import IcbcVerificationViewSet

router = routers.SimpleRouter(trailing_slash=False)
router.register(r'organizations', OrganizationViewSet)
router.register(r'users', UserViewSet)
router.register(r'vehicles', VehicleViewSet)
router.register(r'roles', RoleViewSet, basename='role')
router.register(r'sales', RecordOfSaleViewset, basename='sale')
router.register(r'submissions', SalesSubmissionsViewset, basename='submission')
router.register(r'credit-transactions', CreditTransactionViewSet, basename='credit')
router.register(r'icbc-verification', IcbcVerificationViewSet, basename='upload')

urlpatterns = router.urls
