import logging

from api.models.vehicle_change_history import VehicleChangeHistory
from api.models.vehicle_statuses import VehicleDefinitionStatuses
from django.core.exceptions import PermissionDenied


def change_status(user, vehicle, new_status):
    # @todo tech debt - incorporate this check into permissions
    status_change_permitted = False

    if user.is_government:
        if vehicle.validation_status in [
            VehicleDefinitionStatuses.SUBMITTED
        ] and new_status in [
            VehicleDefinitionStatuses.REJECTED,
            VehicleDefinitionStatuses.VALIDATED
        ]:
            status_change_permitted = True
    else:
        if vehicle.validation_status in [
            VehicleDefinitionStatuses.NEW,
            VehicleDefinitionStatuses.DRAFT
        ] and new_status is VehicleDefinitionStatuses.SUBMITTED:
            status_change_permitted = True

    if not status_change_permitted:
        raise PermissionDenied()

    if new_status is not vehicle.validation_status:
        user_roles = []
        for role in user.roles:
            user_roles.append(role.role_code)

        history = VehicleChangeHistory.objects.create(
            create_user=user.username,
            model_year_id=vehicle.model_year_id,
            organization_id=vehicle.organization_id,
            range=vehicle.range,
            weight_kg=vehicle.weight_kg,
            user_role=user_roles,
            validation_status=new_status,
            vehicle_class_code_id=vehicle.vehicle_class_code_id,
            vehicle_zev_type_id=vehicle.vehicle_zev_type_id,
            vehicle=vehicle
        )
        vehicle.validation_status = new_status
        vehicle.save()
