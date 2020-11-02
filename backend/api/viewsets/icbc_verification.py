import os

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
    def chunk_upload(self, request):
        try:
            data = request.FILES.get('files')
            os.rename(data.temporary_file_path(), data.name)
        except Exception as error:
            print(error)
            return HttpResponse(status=400, content=error)

        return HttpResponse(
            status=201, content="nothing", content_type='application/json'
        )

    @action(detail=False, methods=['post'])
    def upload(self, request):
        user = request.user
        try:
            date_current_to = request.data.get('submission_current_date')
            filename = request.data.get('filename')
            chunks = request.data.get('chunks')

            with open(filename, "wb") as outfile:
                for chunk in range(chunks):
                    tempfile = filename + '.part.' + str(chunk)
                    with open(tempfile, "rb") as infile:
                        outfile.write(infile.read())

                    # os.remove(tempfile)

            ingest_icbc_spreadsheet(filename, user, date_current_to)
            os.remove(filename)
        except Exception as error:
            print(error)
            return HttpResponse(status=400, content=error)

        return HttpResponse(
            status=201, content="nothing", content_type='application/json'
        )
