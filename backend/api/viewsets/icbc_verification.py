from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from requests import Response
from django.http import HttpResponse
from api.services.icbc_upload import ingest_icbc_spreadsheet


class IcbcVerificationViewSet(viewsets.ViewSet):
    permission_classes = (AllowAny,)
    http_method_names = ['get', 'post', 'put', 'patch']

    @action(detail=False, methods=['post'])
    def upload(self, request):
        print("********************************************")
        user = request.user
        try:
            data = request.FILES['files'].read()
            result = ingest_icbc_spreadsheet(data, user)
        except:
            return HttpResponse(status=400, content=error)

        return HttpResponse(
            status=201, content="nothing", content_type='application/json'
        )
        