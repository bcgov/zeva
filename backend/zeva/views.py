
from django.http import HttpResponse

from api.models.organization import Organization


def health(request):
    """
    Health check for OpenShift
    """
    return HttpResponse(Organization.objects.count())


def blank(request):
    return HttpResponse('')
