from rest_framework import permissions


class UploadPermissions(permissions.BasePermission):
    """Used by Viewset to check permissions for API requests"""

    def has_permission(self, request, view):
        if request.user.is_government:
            return True

        return request.user.has_perm('CREATE_SALES') or \
            request.user.has_perm('SUBMIT_SALES') or \
            request.user.has_perm('EDIT_SALES') or \
            request.user.has_perm('CREATE_ZEV') or \
            request.user.has_perm('EDIT_ZEV') or \
            request.user.has_perm('SUBMIT_ZEV')

    def has_object_permission(self, request, view, obj):
        """Check permissions When an object does exist (PUT, GET)"""
        if request.user.is_government:
            return True

        if request.user.has_perm('CREATE_SALES') or \
                request.user.has_perm('SUBMIT_SALES') or \
                request.user.has_perm('EDIT_SALES') or \
                request.user.has_perm('CREATE_ZEV') or \
                request.user.has_perm('EDIT_ZEV') or \
                request.user.has_perm('SUBMIT_ZEV'):
            return True

        return False
