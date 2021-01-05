from rest_framework import routers

from .viewsets.credit_request import CreditRequestViewset
from .viewsets.credit_transaction import CreditTransactionViewSet
from .viewsets.organization import OrganizationViewSet
from .viewsets.notification import NotificationViewSet
from .viewsets.role import RoleViewSet
from .viewsets.user import UserViewSet
from .viewsets.vehicle import VehicleViewSet
from .viewsets.icbc_verification import IcbcVerificationViewSet
from .viewsets.credit_transfer import CreditTransferViewset
from .viewsets.signing_authority_assertion import SigningAuthorityAssertionViewSet

router = routers.SimpleRouter(trailing_slash=False)
router.register(r'organizations', OrganizationViewSet, basename='organization')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'users', UserViewSet)
router.register(r'vehicles', VehicleViewSet)
router.register(r'roles', RoleViewSet, basename='role')
router.register(
    r'credit-requests', CreditRequestViewset, basename='credit-request'
)
router.register(
    r'credit-transactions', CreditTransactionViewSet, basename='credit'
)
router.register(
    r'icbc-verification', IcbcVerificationViewSet, basename='upload'
)
router.register(
    r'credit-transfers', CreditTransferViewset, basename='credit-transfer'
)
router.register(
    r'signing-authority-assertions', SigningAuthorityAssertionViewSet, basename='signing-authority-assertion'
)
urlpatterns = router.urls
