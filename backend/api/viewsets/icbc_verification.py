import json
import os
import threading
import uuid

from django.http import HttpResponse
from django.db import connection
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from api.services.icbc_upload import ingest_icbc_spreadsheet
from api.services.minio import get_minio_object, minio_remove_object
from api.models.icbc_upload_date import IcbcUploadDate
from api.models.icbc_upload_progress import IcbcUploadProgress
from api.serializers.icbc_upload_date import IcbcUploadDateSerializer
from api.serializers.icbc_upload_progress import IcbcUploadProgressSerializer


def get_upload_progress(upload_id):
    try:
        progress_obj = IcbcUploadProgress.objects.get(upload_id=upload_id)
        serializer = IcbcUploadProgressSerializer(progress_obj)
        return serializer.data
    except IcbcUploadProgress.DoesNotExist:
        return {'progress': 0, 'status': 'Upload not found', 'complete': False, 'error': 'Upload ID not found'}


def set_upload_progress(upload_id, progress, status_text, current_page=0, total_pages=0, complete=False, error=None):
    try:
        from django.conf import settings
        import psycopg2
        
        db_settings = settings.DATABASES['default']
        
        conn = psycopg2.connect(
            dbname=db_settings['NAME'],
            user=db_settings['USER'],
            password=db_settings['PASSWORD'],
            host=db_settings['HOST'],
            port=db_settings.get('PORT', 5432)
        )
        conn.autocommit = True
        
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO icbc_upload_progress 
            (upload_id, progress, status_text, current_page, total_pages, complete, error, results, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            ON CONFLICT (upload_id) 
            DO UPDATE SET 
                progress = EXCLUDED.progress,
                status_text = EXCLUDED.status_text,
                current_page = EXCLUDED.current_page,
                total_pages = EXCLUDED.total_pages,
                complete = EXCLUDED.complete,
                error = EXCLUDED.error,
                updated_at = NOW()
        """, [upload_id, progress, status_text, current_page, total_pages, complete, error, None])
        
        cursor.close()
        conn.close()
        
        print(f"Progress updated: {upload_id} - {progress}% - {status_text} - Page {current_page}/{total_pages}")
        return True
    except Exception as e:
        print(f"Error updating progress for {upload_id}: {e}")
        import traceback
        traceback.print_exc()
        return None


def clear_upload_progress(upload_id):
    try:
        IcbcUploadProgress.objects.filter(upload_id=upload_id).delete()
    except Exception as e:
        print(f"Error clearing progress for {upload_id}: {e}")


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
        
        # Generate unique upload ID
        upload_id = str(uuid.uuid4())
        
        # Initialize progress
        set_upload_progress(upload_id, 0, 'Initializing...', 0, 0, False)
        
        # Define the processing function to run in background thread
        def process_upload():
            from django.db import connection
            connection.close()
            
            previous_file = None
            current_file = None
            try:
                try:
                    # get previous upload file so we can compare
                    set_upload_progress(upload_id, 5, 'Getting previous upload data...', 0, 0, False)
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
                set_upload_progress(upload_id, 10, 'Downloading previous file...', 0, 0, False)
                previous_file = get_minio_object(previous_filename)
                
                # get latest file
                print("Downloading latest file", filename)
                set_upload_progress(upload_id, 15, 'Downloading latest file...', 0, 0, False)
                current_file = get_minio_object(filename)

                print("Starting Ingest")
                set_upload_progress(upload_id, 20, 'Starting data processing...', 0, 0, False)
                
                done = ingest_icbc_spreadsheet(
                    current_file, 
                    filename, 
                    user, 
                    date_current_to, 
                    previous_file,
                    upload_id=upload_id  # Pass upload_id for progress tracking
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
                            SET results = %s, updated_at = NOW()
                            WHERE upload_id = %s
                        """, [json.dumps({
                            'dateCurrentTo': date_current_to,
                            'createdRecords': done[1],
                            'updatedRecords': done[2]
                        }), upload_id])
                        connection.commit()
                    
                    set_upload_progress(
                        upload_id, 
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
                    upload_id, 
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
            content=json.dumps({'upload_id': upload_id}),
            content_type='application/json'
        )
    
    @action(detail=False, methods=['get'])
    def progress(self, request):
        """Endpoint to poll for upload progress"""
        upload_id = request.query_params.get('upload_id')
        if not upload_id:
            return Response({'error': 'upload_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        progress_data = get_upload_progress(upload_id)
        return Response(progress_data)
