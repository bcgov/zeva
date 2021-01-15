from rest_framework import permissions


class CreditRequestPermissions(permissions.BasePermission):
    """Used by Viewset to check permissions for API requests"""

    def has_permission(self, request, view):
        """Check permissions When an object does not yet exist (POST)"""
        # Fallback to has_object_permission unless it's a POST
        if request.method != 'POST':
            return True

        if request.user.is_government:
            return request.user.has_perm('SIGN_SALES') or \
                request.user.has_perm('RECOMMEND_SALES') or \
                request.user.has_perm('DECLINE_SALES') or \
                request.user.has_perm('VALIDATE_SALES')

        return request.user.has_perm('CREATE_SALES') or \
            request.user.has_perm('SUBMIT_SALES') or \
            request.user.has_perm('EDIT_SALES')

    def has_object_permission(self, request, view, obj):
        """Check permissions When an object does exist (PUT, GET)"""
        if request.user.has_perm('SIGN_SALES') or \
                request.user.has_perm('RECOMMEND_SALES') or \
                request.user.has_perm('DECLINE_SALES') or \
                request.user.has_perm('VALIDATE_SALES'):
            return True

        if obj.organization_id == request.user.organization_id:
            if request.method in permissions.SAFE_METHODS:
                return True

            if request.user.has_perm('CREATE_SALES') or \
                    request.user.has_perm('SUBMIT_SALES') or \
                    request.user.has_perm('EDIT_SALES'):
                return True

        if request.method == 'GET' and \
                request.user.has_perm('VIEW_SALES'):
            return True

        return False
