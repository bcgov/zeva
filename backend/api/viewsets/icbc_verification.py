from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.http import HttpResponse
from api.services.icbc_upload import ingest_icbc_spreadsheet
from api.models.icbc_upload_date import IcbcUploadDate
from api.serializers.icbc_upload_date import IcbcUploadDateSerializer
from auditable.views import AuditableMixin


class IcbcVerificationViewSet(
        viewsets.ViewSet, AuditableMixin,
        viewsets.GenericViewSet, mixins.ListModelMixin
):
    permission_classes = (AllowAny,)
    http_method_names = ['get', 'post', 'put', 'patch']

    serializer_classes = {
        'default': IcbcUploadDateSerializer
    }

    def get_serializer_class(self):
        if self.action in list(self.serializer_classes.keys()):
            return self.serializer_classes[self.action]

        return self.serializer_classes['default']

    @action(detail=False, methods=['get'])
    def date(self, request):
        icbc_date = IcbcUploadDate.objects.last()
        serializer = self.get_serializer(icbc_date)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def upload(self, request):
        user = request.user
        try:
            dateCurrentTo = request.data['submissionCurrentDate']
            data = request.FILES['files']
            result = ingest_icbc_spreadsheet(data.temporary_file_path(), user, dateCurrentTo)
        except Exception as error:
            return HttpResponse(status=400, content=error)

        return HttpResponse(
            status=201, content="nothing", content_type='application/json'
        )
    