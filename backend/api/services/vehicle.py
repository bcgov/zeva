import logging

from api.models.vehicle import VehicleChangeHistory, VehicleDefinitionStates


def change_state(user, vehicle, new_state):
    # @todo tech debt - incorporate this check into permissions
    state_change_permitted = False

    if user.is_government:
        if vehicle.state in [VehicleDefinitionStates.SUBMITTED] and \
                new_state in [
                    VehicleDefinitionStates.REJECTED,
                    VehicleDefinitionStates.VALIDATED
                ]:
            state_change_permitted = True
    else:
        if vehicle.state in [
                VehicleDefinitionStates.NEW, VehicleDefinitionStates.DRAFT
            ] and \
                new_state is VehicleDefinitionStates.SUBMITTED:
            state_change_permitted = True

    if not state_change_permitted:
        raise RuntimeError

    if new_state is not vehicle.state:
        history = VehicleChangeHistory.objects.create(
            vehicle=vehicle,
            actor=user,
            in_roles=user.roles,
            previous_state=vehicle.state,
            current_state=new_state
        )
        logging.debug(
            'creating history record for state change {old}:{new}'.format(
                old=history.previous_state,
                new=history.current_state
            )
        )
        vehicle.state = new_state
        vehicle.save()
