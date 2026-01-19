import json
import os
import threading

from django.http import HttpResponse
from django.db import connection
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from api.services.icbc_upload import ingest_icbc_spreadsheet, get_upload_progress, set_upload_progress
from api.services.minio import get_minio_object, minio_remove_object
from api.models.icbc_upload_date import IcbcUploadDate
from api.models.icbc_upload_progress import IcbcUploadProgress
from api.serializers.icbc_upload_date import IcbcUploadDateSerializer
from api.serializers.icbc_upload_progress import IcbcUploadProgressSerializer

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
        date_current_to = request.data.get('submission_current_date')
        
        # Create IcbcUploadDate object first
        upload_obj = IcbcUploadDate.objects.create(
            upload_date=date_current_to,
            create_user=user.username,
            update_user=user.username,
        )
        
        # Initialize progress with the upload object
        set_upload_progress(upload_obj, 0, 'Initializing...', 0, 0, False)
        
        # Define the processing function to run in background thread
        def process_upload():
            from django.db import connection
            connection.close()
            
            previous_file = None
            current_file = None
            try:
                try:
                    # get previous upload file so we can compare
                    set_upload_progress(upload_obj, 5, 'Getting previous upload data...', 0, 0, False)
                    last_icbc_date = IcbcUploadDate.objects \
                      .exclude(filename__isnull=True).exclude(id=upload_obj.id).latest('create_timestamp')
                except IcbcUploadDate.DoesNotExist:
                    raise Exception(
                        """ 
                        No previous IcbcUploadDate found with filename. Update previous Date with current filename.
                        """)

                print("Last upload date", last_icbc_date.upload_date)
                
                # get previous file
                previous_filename = last_icbc_date.filename
                print("Downloading previous file", previous_filename)
                set_upload_progress(upload_obj, 10, 'Downloading previous file...', 0, 0, False)
                previous_file = get_minio_object(previous_filename)
                
                # get latest file
                print("Downloading latest file", filename)
                set_upload_progress(upload_obj, 15, 'Downloading latest file...', 0, 0, False)
                current_file = get_minio_object(filename)

                print("Starting Ingest")
                set_upload_progress(upload_obj, 20, 'Starting data processing...', 0, 0, False)
                
                done = ingest_icbc_spreadsheet(
                    current_file, 
                    filename, 
                    user, 
                    date_current_to, 
                    previous_file,
                    upload_obj=upload_obj  # Pass upload_obj for progress tracking
                )

                if done[0]:
                    # We remove the previous file from minio but keep the 
                    # latest one so we can use it for compare on next upload
                    minio_remove_object(previous_filename)
                    print('Done processing')
                    
                    from django.db import connection
                    with connection.cursor() as cursor:
                        cursor.execute("""
                            UPDATE icbc_upload_progress 
                            SET results = %s, update_timestamp = NOW()
                            WHERE upload_id = %s
                        """, [json.dumps({
                            'dateCurrentTo': date_current_to,
                            'createdRecords': done[1],
                            'updatedRecords': done[2]
                        }), upload_obj.id])
                        connection.commit()
                    
                    set_upload_progress(
                        upload_obj, 
                        100, 
                        'Processing complete!', 
                        0, 
                        0, 
                        True,
                        error=None
                    )

            except Exception as error:
                print(f"Upload error: {error}")
                set_upload_progress(
                    upload_obj, 
                    0, 
                    'Error occurred', 
                    0, 
                    0, 
                    True,
                    error=str(error)
                )
            
            finally:
                if previous_file:
                    previous_file.close()
                    previous_file.release_conn()
                if current_file:
                    current_file.close()
                    current_file.release_conn()
                
                from django.db import connection
                connection.close()
        
        # Start processing in background thread
        thread = threading.Thread(target=process_upload)
        thread.daemon = True
        thread.start()
        
        # Return immediately with upload_id for polling
        return HttpResponse(
            status=202,
            content=json.dumps({'upload_id': upload_obj.id}),
            content_type='application/json'
        )
    
    @action(detail=False, methods=['get'])
    def progress(self, request):
        """Endpoint to poll for upload progress"""
        upload_id = request.query_params.get('upload_id')
        if not upload_id:
            return Response({'error': 'upload_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            upload_obj = IcbcUploadDate.objects.get(id=upload_id)
            progress_data = get_upload_progress(upload_obj)
            return Response(progress_data)
        except IcbcUploadDate.DoesNotExist:
            return Response({'error': 'Upload not found'}, status=status.HTTP_404_NOT_FOUND)
