from rest_framework import permissions


class CreditTransferPermissions(permissions.BasePermission):
    """Used by Viewset to check permissions for API requests"""

    def has_permission(self, request, view):
        """Check permissions When an object does not yet exist (POST)"""
        # Fallback to has_object_permission unless it's a POST
        if request.method != 'POST':
            return True

        if request.user.is_government:
            return request.user.has_perm('SIGN_CREDIT_TRANSFERS') or \
                request.user.has_perm('RECOMMEND_CREDIT_TRANSFER') or \
                request.user.has_perm('DECLINE_CREDIT_TRANSFERS')

        return request.user.has_perm('CREATE_CREDIT_TRANSFERS') or \
            request.user.has_perm('SUBMIT_CREDIT_TRANSFER_PROPOSAL') or \
            request.user.has_perm('EDIT_CREDIT_TRANSFERS') or \
            request.user.has_perm('REJECT_CREDIT_TRANSFER')

    def has_object_permission(self, request, view, obj):
        """Check permissions When an object does exist (PUT, GET)"""
        if request.user.has_perm('SIGN_CREDIT_TRANSFERS') or \
                request.user.has_perm('RECOMMEND_CREDIT_TRANSFER') or \
                request.user.has_perm('DECLINE_CREDIT_TRANSFERS'):
            return True

        if obj.id == request.user.id and \
                request.method in permissions.SAFE_METHODS:
            return True

        if request.method == 'GET' and \
                request.user.has_perm('VIEW_CREDIT_TRANSFERS'):
            return True

        return False
