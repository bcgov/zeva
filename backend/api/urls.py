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
from .viewsets.compliance_ratio import ComplianceRatioViewSet
from .viewsets.model_year_report import ModelYearReportViewset
from .viewsets.signing_authority_assertion import SigningAuthorityAssertionViewSet
from .viewsets.upload import UploadViewSet
from .viewsets.model_year_report_consumer_sales import ModelYearReportConsumerSalesViewSet
from .viewsets.model_year_report_compliance_obligation import ModelYearReportComplianceObligationViewset
from .viewsets.credit_agreement import CreditAgreementViewSet
from .viewsets.dashboard import DashboardViewset
from .viewsets.sales_forecast import SalesForecastViewset


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
router.register(
    r'compliance/ratios', ComplianceRatioViewSet, basename='compliance'
)
router.register(
    r'compliance/reports', ModelYearReportViewset, basename='compliance'
)
router.register(
    r'uploads', UploadViewSet, basename='minio'
)
router.register(
    r'compliance/consumer-sales', ModelYearReportConsumerSalesViewSet, basename='consumer-sales'
)
router.register(
    r'compliance/compliance-activity-details', ModelYearReportComplianceObligationViewset, basename='compliance-obligation-activity'
)
router.register(
    r'credit-agreements', CreditAgreementViewSet, basename='credit-agreement'
)
router.register(
    r'dashboard/list', DashboardViewset, basename='list'
)
router.register(
    r'forecasts', SalesForecastViewset, basename='forecast'
)

urlpatterns = router.urls
