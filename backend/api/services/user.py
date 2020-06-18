from api.models.user_role import UserRole


def update_roles(request, instance, roles):
    UserRole.objects.filter(
        user_profile=instance
    ).exclude(
        role__in=roles
    ).delete()

    for role in roles:
        if request.user.has_perm('ASSIGN_BCEID_ROLES') and \
                not role.is_government_role:
            UserRole.objects.get_or_create(
                user_profile=instance,
                role=role,
                defaults={
                    'create_user': request.user.username,
                    'update_user': request.user.username
                }
            )

        if request.user.has_perm('ASSIGN_IDIR_ROLES') and \
                role.is_government_role:
            UserRole.objects.get_or_create(
                user_profile=instance,
                role=role,
                defaults={
                    'create_user': request.user.username,
                    'update_user': request.user.username
                }
            )