from rest_framework.response import Response
from rest_framework import status
from rest_framework.settings import api_settings


class AuditableCreateMixin:
    def serialize_object(self, request, data):
        user = request.user
        data.update({"create_user": user.username, "update_user": user.username})
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return serializer.data

    def create(self, request, *args, **kwargs):
        objs = []
        if type(request.data) is list:
            for data in request.data:
                objs.append(self.serialize_object(request, data))
        else:
            objs.append(self.serialize_object(request, request.data))

        response = objs[0] if len(objs) == 1 else objs
        headers = self.get_success_headers(response)
        return Response(response, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save()

    def get_success_headers(self, data):
        try:
            return {"Location": str(data[api_settings.URL_FIELD_NAME])}
        except (TypeError, KeyError):
            return {}


class AuditableUpdateMixin:
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        user = request.user
        request.data.update({"update_user": user.id})
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, "_prefetched_objects_cache", None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    def perform_update(self, serializer):
        serializer.save()

    def partial_update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return self.update(request, *args, **kwargs)
