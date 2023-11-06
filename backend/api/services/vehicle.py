import logging

from api.models.vehicle_change_history import VehicleChangeHistory
from api.models.vehicle_statuses import VehicleDefinitionStatuses
from django.core.exceptions import PermissionDenied
from api.models.sales_submission_content import SalesSubmissionContent
from django.db.models import Q
import xlrd
from rest_framework.response import Response
import datetime
from api.models.sales_submission import SalesSubmission
from api.models.model_year import ModelYear
from api.models.vehicle import Vehicle


def change_status(user, vehicle, new_status):
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


def vehicles_sales(model_year, organization):
    report_year = int(model_year.data['name'])
    org_submission = SalesSubmission.objects.filter(
        organization_id=organization)

    to_date = (report_year + 1, 10, 1,)
    to_date_str = str(report_year + 1) + "-10-01"

    sales_to_date = xlrd.xldate.xldate_from_date_tuple(to_date, 0)
    sales = SalesSubmissionContent.objects.values(
        'xls_make', 'xls_model', 'xls_model_year'
    ).filter(
        Q(Q(
            Q(xls_sale_date__lte=sales_to_date) &
            (Q(xls_model_year=str(report_year) + ".0") | Q(xls_model_year=str(report_year))) &
            Q(xls_date_type="3") &
            ~Q(xls_sale_date="")
        ) |
         Q(
            Q(xls_sale_date__lte=to_date_str) &
            (Q(xls_model_year=str(report_year) + ".0") | Q(xls_model_year=str(report_year))) &
            Q(xls_date_type="1") &
            ~Q(xls_sale_date="")
            )
        )
    ).filter(submission__in=org_submission)

    all_sales = sales.values_list('xls_model_year', 'xls_make', 'xls_model')
    unique_sales = list(set(all_sales))

    vehicles = Vehicle.objects.none()
    for sale in unique_sales:
        model_year = ModelYear.objects.get(name=sale[0][0:4])
        vehicles |= Vehicle.objects.filter(
            make__iexact=sale[1],
            model_name=sale[2],
            model_year=model_year)

    return vehicles
