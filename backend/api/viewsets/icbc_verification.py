import json
import os
import threading

from django.http import HttpResponse
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from api.services.icbc_upload import (
    get_upload_progress,
    set_upload_progress,
    process_upload,
)
from api.models.icbc_upload_date import IcbcUploadDate
from api.serializers.icbc_upload_date import IcbcUploadDateSerializer


class IcbcVerificationViewSet(viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    http_method_names = ["get", "post"]

    serializer_classes = {"default": IcbcUploadDateSerializer}

    def get_serializer_class(self):
        if self.action in list(self.serializer_classes.keys()):
            return self.serializer_classes[self.action]

        return self.serializer_classes["default"]

    @action(detail=False, methods=["get"])
    def date(self, request):
        icbc_date = (
            IcbcUploadDate.objects.filter(filename__isnull=False)
            .order_by("-upload_date")
            .first()
        )
        serializer = self.get_serializer(icbc_date)
        return Response(serializer.data)

    @action(detail=False, methods=["post"])
    def chunk_upload(self, request):
        user = request.user
        if not user.is_government:
            return Response(status=status.HTTP_403_FORBIDDEN)
        try:
            data = request.FILES.get("files")
            os.rename(data.temporary_file_path(), data.name)
        except Exception as error:
            print(error)
            return HttpResponse(status=400, content=error)

        return HttpResponse(
            status=201, content="nothing", content_type="application/json"
        )

    @action(detail=False, methods=["post"])
    def upload(self, request):
        user = request.user
        if not user.is_government:
            return Response(status=status.HTTP_403_FORBIDDEN)

        filename = request.data.get("filename")
        date_current_to = request.data.get("submission_current_date")

        # Create IcbcUploadDate object first
        upload_obj = IcbcUploadDate.objects.create(
            upload_date=date_current_to,
            create_user=user.username,
            update_user=user.username,
        )
        print(type(upload_obj.upload_date))
        print(type(upload_obj.create_user))

        # Initialize progress with the upload object
        set_upload_progress(upload_obj, 0, "Initializing...", 0, 0, False)

        # Start processing in background thread
        thread = threading.Thread(target=process_upload, args=(upload_obj, filename))
        thread.daemon = True
        thread.start()

        # Return immediately with upload_id for polling
        return HttpResponse(
            status=202,
            content=json.dumps({"upload_id": upload_obj.id}),
            content_type="application/json",
        )

    @action(detail=False, methods=["get"])
    def progress(self, request):
        """Endpoint to poll for upload progress"""
        upload_id = request.query_params.get("upload_id")
        if not upload_id:
            return Response(
                {"error": "upload_id required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            upload_obj = IcbcUploadDate.objects.get(id=upload_id)
            progress_data = get_upload_progress(upload_obj)
            return Response(progress_data)
        except IcbcUploadDate.DoesNotExist:
            return Response(
                {"error": "Upload not found"}, status=status.HTTP_404_NOT_FOUND
            )
