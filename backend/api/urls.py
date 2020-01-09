from rest_framework import routers

from .viewsets.organization import OrganizationViewSet
from .viewsets.user import UserViewSet

router = routers.SimpleRouter(trailing_slash=False)
router.register(r'organizations', OrganizationViewSet)
router.register(r'users', UserViewSet)

urlpatterns = router.urls
