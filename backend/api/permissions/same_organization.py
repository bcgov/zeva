from rest_framework import permissions
from django.core.exceptions import ImproperlyConfigured


class SameOrganizationPermissions(permissions.BasePermission):
    def has_permission(self, request, view):
        if not hasattr(view, "same_org_permissions_context"):
            raise ImproperlyConfigured(
                """
                A view must have a "same_org_permissions_context" attribute if it uses "SameOrganizationPermissions"
                """
            )
        permissions_context = view.same_org_permissions_context

        object_id = view.kwargs.get("pk")
        user = request.user
        if object_id is None or user.is_government:
            return True

        actions_not_to_check = permissions_context.get("actions_not_to_check", [])
        action = view.action
        if action in actions_not_to_check:
            return True

        user_org = user.organization
        custom_pk_actions = permissions_context.get("custom_pk_actions", {})
        manager = None
        path_to_org = None
        if action in custom_pk_actions:
            manager = custom_pk_actions[action]["manager"]
            path_to_org = custom_pk_actions[action]["path_to_org"]
        else:
            manager = permissions_context["default_manager"]
            path_to_org = permissions_context["default_path_to_org"]

        object = None
        if path_to_org:
            related_path = "__".join(path_to_org)
            object = manager.select_related(related_path).filter(id=object_id).first()
        else:
            object = manager.filter(id=object_id).first()
        if object is not None:
            for step in path_to_org:
                object = getattr(object, step)
            object_org = object
            if user_org != object_org:
                return False

        return True
