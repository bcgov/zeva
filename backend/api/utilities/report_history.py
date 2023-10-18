from api.models.model_year_report_statuses import ModelYearReportStatuses
from api.models.user_profile import UserProfile


# history should be a queryset
def exclude_from_history(history, user):
    if user.is_government:
        result = history.exclude(
            validation_status__in=[
                ModelYearReportStatuses.DELETED,
            ]
        )
        users = UserProfile.objects.filter(
            organization__is_government=False
        ).values_list("username")
        result = result.exclude(
            validation_status__in=[
                ModelYearReportStatuses.DRAFT,
            ],
            create_user__in=users,
        )
    else:
        result = history.exclude(
            validation_status__in=[
                ModelYearReportStatuses.RECOMMENDED,
                ModelYearReportStatuses.DELETED,
                ModelYearReportStatuses.RETURNED,
            ]
        )
        # Remove submitted by government user (only happens when the IDIR user saves first)
        users = UserProfile.objects.filter(
            organization__is_government=True
        ).values_list("username")
        result = result.exclude(
            validation_status__in=[
                ModelYearReportStatuses.DRAFT, ModelYearReportStatuses.SUBMITTED,
            ],
            create_user__in=users,
        )

    return result
