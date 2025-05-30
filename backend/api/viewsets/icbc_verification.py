import json
import os

from django.http import HttpResponse
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from api.services.icbc_upload import ingest_icbc_spreadsheet
from api.services.minio import get_minio_object, minio_remove_object
from api.models.icbc_upload_date import IcbcUploadDate
from api.serializers.icbc_upload_date import IcbcUploadDateSerializer


class IcbcVerificationViewSet(viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    http_method_names = ['get', 'post']

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
        user = request.user
        if not user.is_government:
            return Response(status=status.HTTP_403_FORBIDDEN)
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
        if not user.is_government:
            return Response(status=status.HTTP_403_FORBIDDEN)
        
        filename = request.data.get('filename')
        try:
            try:
                # get previous upload file so we can compare
                last_icbc_date = IcbcUploadDate.objects \
                  .exclude(filename__isnull=True).latest('create_timestamp')
            except IcbcUploadDate.DoesNotExist:
              raise Exception(
                """ 
                No previous IcbcUploadDate found with filename. Update previous Date with current filename.
                """)

            print("Last upload date", last_icbc_date.upload_date)
            
            # get previous file
            previous_filename = last_icbc_date.filename
            print("Downloading previous file", previous_filename)
            previous_file = get_minio_object(previous_filename)
            
            # get latest file
            print("Downloading latest file", filename)
            current_file = get_minio_object(filename)

            print("Starting Ingest")
            date_current_to = request.data.get('submission_current_date')
            try:
                done = ingest_icbc_spreadsheet(current_file, filename, user, date_current_to, previous_file)
            except:
                return HttpResponse(status=400, content='Error processing data file. Please contact your administrator for assistance.')

            if done[0]:
                # We remove the previous file from minio but keep the 
                # latest one so we can use it for compare on next upload
                minio_remove_object(previous_filename)
                print('Done processing')

        except Exception as error:
            return HttpResponse(status=400, content=error)
        
        finally:
            previous_file.close()
            previous_file.release_conn()
            current_file.close()
            current_file.release_conn()

        return HttpResponse(
            status=201,
            content=json.dumps({
                'dateCurrentTo': date_current_to,
                'createdRecords': done[1],
                'updatedRecords': done[2]
            }),
            content_type='application/json'
        )
