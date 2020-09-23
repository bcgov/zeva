from rest_framework import permissions


class RolePermissions(permissions.BasePermission):
    """Used by Viewset to check permissions for API requests"""

    def has_permission(self, request, view):
        """Check permissions When an object does not yet exist (POST)"""
        # Fallback to has_object_permission unless it's a POST
        if request.method != 'POST':
            return True

        if request.user.is_government:
            return request.user.has_perm('ASSIGN_IDIR_ROLES')

        return request.user.has_perm('ASSIGN_BCEID_ROLES')

    def has_object_permission(self, request, view, obj):
        """Check permissions When an object does exist (PUT, GET)"""
        if request.user.has_perm('ASSIGN_IDIR_ROLES'):
            return True

        if obj.id == request.user.id and \
                request.method in permissions.SAFE_METHODS:
            return True

        if request.method == 'GET' and \
                request.user.has_perm('VIEW_ROLES_AND_PERMISSIONS'):
            return True

        return False
