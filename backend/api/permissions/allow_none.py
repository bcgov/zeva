from rest_framework import permissions


class AllowNone(permissions.BasePermission):
    def has_permission(self, request, view):
        return False
