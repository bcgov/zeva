import uuid
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.http import HttpResponse, HttpResponseForbidden
from rest_framework.response import Response
from rest_framework import mixins, viewsets, status
from rest_framework.decorators import action

from auditable.views import AuditableMixin
from api.models.model_year import ModelYear
from api.models.model_year_report import ModelYearReport
from api.models.model_year_report_confirmation import ModelYearReportConfirmation
from api.models.model_year_report_history import ModelYearReportHistory
from api.models.model_year_report_make import ModelYearReportMake
from api.models.model_year_report_ldv_sales import ModelYearReportLDVSales
from api.models.model_year_report_statuses import ModelYearReportStatuses
from api.models.model_year_report_assessment_comment import (
    ModelYearReportAssessmentComment,
)
from api.models.model_year_report_assessment import ModelYearReportAssessment
from api.models.supplemental_report_sales import SupplementalReportSales
from api.models.supplemental_report_supplier_information import (
    SupplementalReportSupplierInformation,
)
from api.models.supplemental_report_credit_activity import (
    SupplementalReportCreditActivity,
)
from api.models.supplemental_report_attachment import SupplementalReportAttachment
from api.models.supplemental_report import SupplementalReport
from api.models.model_year_report_vehicle import ModelYearReportVehicle
from api.models.supplemental_report_comment import SupplementalReportComment
from api.models.signing_authority_assertion import SigningAuthorityAssertion
from api.models.supplemental_report_history import SupplementalReportHistory
from api.models.supplemental_report_assessment import SupplementalReportAssessment
from api.models.supplemental_report_assessment_comment import (
    SupplementalReportAssessmentComment,
)
from api.models.user_profile import UserProfile
from api.permissions.model_year_report import ModelYearReportPermissions
from api.services.minio import minio_put_object, minio_remove_object
from api.services.model_year_report import (
    get_model_year_report_statuses,
    adjust_credits, adjust_credits_reassessment,
    delete_model_year_report
)
from api.services.model_year_report import check_validation_status_change, get_model_year_report
from api.serializers.organization_ldv_sales import OrganizationLDVSalesSerializer
from api.serializers.model_year_report import (
    ModelYearReportSerializer,
    ModelYearReportListSerializer,
    ModelYearReportSaveSerializer,
)
from api.serializers.model_year_report_history import ModelYearReportHistorySerializer
from api.serializers.model_year_report_make import ModelYearReportMakeSerializer
from api.serializers.organization import OrganizationSerializer
from api.serializers.organization_address import OrganizationAddressSerializer
from api.serializers.vehicle import ModelYearSerializer
from api.serializers.model_year_report_assessment import (
    ModelYearReportAssessmentSerializer,
)
from api.serializers.model_year_report_supplemental import (
    ModelYearReportSupplementalSerializer,
    SupplementalReportAssessmentSerializer,
    SupplementalReportAssessmentCommentSerializer,
)
from api.serializers.model_year_report_noa import (
    ModelYearReportNoaSerializer,
    SupplementalNOASerializer,
    SupplementalReportSerializer,
    SupplementalModelYearReportSerializer,
)
from api.models.organization import Organization
from api.services.supplemental_report import get_ordered_list_of_supplemental_reports


class ModelYearReportViewset(
    AuditableMixin,
    viewsets.GenericViewSet,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin
):
    """
    This viewset automatically provides `list`, `create`, `retrieve`,
    and  `update`  actions.
    """

    permission_classes = (ModelYearReportPermissions,)
    http_method_names = ["get", "post", "put", "patch", "delete"]

    serializer_classes = {
        "default": ModelYearReportSerializer,
        "create": ModelYearReportSaveSerializer,
        "list": ModelYearReportListSerializer,
        "update": ModelYearReportSaveSerializer,
        "partial_update": ModelYearReportSaveSerializer,
    }

    def get_queryset(self):
        request = self.request

        if request.user.organization.is_government:
            queryset = ModelYearReport.objects.exclude(
                validation_status=(ModelYearReportStatuses.DRAFT)
            ).order_by("-model_year")

            organization_id = request.query_params.get("organization_id", None)

            if organization_id:
                queryset = queryset.filter(organization_id=organization_id)
        else:
            queryset = ModelYearReport.objects.filter(
                organization_id=request.user.organization.id
            ).order_by("-model_year")

        return queryset

    def get_serializer_class(self):
        if self.action in list(self.serializer_classes.keys()):
            return self.serializer_classes[self.action]

        return self.serializer_classes["default"]

    def retrieve(self, request, pk=None):
        queryset = self.get_queryset()
        report = get_object_or_404(queryset, pk=pk)
        summary_param = request.GET.get("summary", None)
        summary = True if summary_param == "true" else None

        confirmation = ModelYearReportConfirmation.objects.filter(
            model_year_report_id=pk,
            signing_authority_assertion__module="supplier_information",
        ).first()

        if not confirmation and not summary:
            model_year = ModelYearSerializer(report.model_year)
            model_year_int = int(model_year.data["name"])

            addresses = OrganizationAddressSerializer(
                request.user.organization.organization_address, many=True
            )
            organization = OrganizationSerializer(request.user.organization)

            makes_list = (
                ModelYearReportMake.objects.filter(
                    model_year_report_id=report.id, from_gov=False, display=True
                )
                .values("make")
                .distinct()
            )

            makes = ModelYearReportMakeSerializer(makes_list, many=True)

            history_list = ModelYearReportHistory.objects.filter(
                model_year_report_id=pk
            )

            history = ModelYearReportHistorySerializer(history_list, many=True)

            confirmations = (
                ModelYearReportConfirmation.objects.filter(model_year_report_id=pk)
                .values_list("signing_authority_assertion_id", flat=True)
                .distinct()
            )

            org = request.user.organization

            avg_sales = org.get_avg_ldv_sales(year=model_year_int)

            ldv_sales_previous_list = org.get_ldv_sales(year=model_year_int)
            ldv_sales_previous = OrganizationLDVSalesSerializer(
                ldv_sales_previous_list, many=True
            )

            # if this is empty that means we don't have enough ldv_sales to
            # get the average. our avg_sales at this point should be from the
            # current report ldv_sales
            if not avg_sales:
                report_ldv_sales = (
                    ModelYearReportLDVSales.objects.filter(
                        model_year_report_id=pk, model_year__name=model_year_int, display=True
                    )
                    .order_by("-update_timestamp")
                    .first()
                )

                if report_ldv_sales:
                    avg_sales = report_ldv_sales.ldv_sales

                ldv_sales_previous = None

            validation_status = report.validation_status.value

            if validation_status in ["RECOMMENDED", "RETURNED"]:
                validation_status = ModelYearReportStatuses.SUBMITTED

            return Response(
                {
                    "avg_sales": avg_sales,
                    "organization": organization.data,
                    "organization_name": request.user.organization.name,
                    "model_year_report_addresses": addresses.data,
                    "makes": makes.data,
                    "model_year_report_history": history.data,
                    "validation_status": report.validation_status.value,
                    "supplier_class": org.get_current_class(avg_sales=avg_sales),
                    "model_year": model_year.data,
                    "create_user": report.create_user,
                    "confirmations": confirmations,
                    "ldv_sales": report.ldv_sales,
                    "statuses": get_model_year_report_statuses(report, request.user),
                    "ldv_sales_previous": ldv_sales_previous.data
                    if ldv_sales_previous
                    else [],
                    "credit_reduction_selection": report.credit_reduction_selection,
                }
            )

        serializer = ModelYearReportSerializer(report, context={"request": request})

        return Response(serializer.data)
    
    def perform_destroy(self, instance):
        user_org = self.request.user.organization
        if user_org == instance.organization and instance.validation_status == ModelYearReportStatuses.DRAFT:
            delete_model_year_report(instance)

    @action(detail=True)
    def noa_history(self, request, pk=None):
        queryset = self.get_queryset()
        report = get_object_or_404(queryset, pk=pk)
        # get model year report where id matches and where status is Assessed or Reassessed, along with date
        report_serializer = ModelYearReportNoaSerializer(
            report, context={"request": request}
        )
        report_data = report_serializer.data
        report_dict = {}
        gov_org = Organization.objects.filter(is_government=True).first()

        if report_serializer.data:
            # serializer has returned with some records that are assessed or reassessed
            # get supplementary table, match model year report id, only show drafts created by own org
            supplemental_report_ids = SupplementalReport.objects.filter(
                model_year_report_id=pk,
                status__in=[
                    ModelYearReportStatuses.SUBMITTED,
                    ModelYearReportStatuses.DRAFT,
                    ModelYearReportStatuses.RECOMMENDED,
                    ModelYearReportStatuses.ASSESSED,
                    ModelYearReportStatuses.REASSESSED,
                    ModelYearReportStatuses.RETURNED,
                ],
            ).values_list("id", flat=True)

            if supplemental_report_ids:
                SubQuery = UserProfile.objects.filter(
                    organization__is_government=True
                ).values_list("username", flat=True)
                if request.user.is_government:
                    supplemental_report = (
                        SupplementalReportHistory.objects.filter(
                            supplemental_report_id__in=supplemental_report_ids,
                            validation_status__in=[
                                ModelYearReportStatuses.SUBMITTED,
                                ModelYearReportStatuses.DRAFT,
                                ModelYearReportStatuses.RECOMMENDED,
                                ModelYearReportStatuses.ASSESSED,
                                ModelYearReportStatuses.REASSESSED,
                                ModelYearReportStatuses.RETURNED,
                            ],
                        )
                        .exclude(
                            Q(
                                ~Q(create_user__in=SubQuery)
                                & (Q(validation_status=ModelYearReportStatuses.DRAFT))
                            )
                        )
                        .order_by("update_timestamp")
                    )

                    # Exclude reports returned to suppliers
                    exclude_return = []

                    for index, report in enumerate(supplemental_report):
                        if (
                            report.validation_status.value == "SUBMITTED"
                            and index + 1 < len(supplemental_report)
                        ):
                            if (
                                supplemental_report[index + 1].validation_status.value
                                == "RETURNED"
                            ):
                                exclude_return.append(report.id)
                                exclude_return.append(supplemental_report[index + 1].id)

                    supplemental_report = supplemental_report.exclude(
                        id__in=exclude_return
                    )
                else:
                    supplemental_report = (
                        SupplementalReportHistory.objects.filter(
                            supplemental_report_id__in=supplemental_report_ids,
                            validation_status__in=[
                                ModelYearReportStatuses.SUBMITTED,
                                ModelYearReportStatuses.DRAFT,
                                ModelYearReportStatuses.ASSESSED,
                                ModelYearReportStatuses.REASSESSED,
                                ModelYearReportStatuses.RETURNED,
                            ],
                        )
                        .exclude(
                            Q(
                                Q(create_user__in=SubQuery)
                                & (Q(validation_status=ModelYearReportStatuses.DRAFT))
                            )
                        )
                        .order_by("update_timestamp")
                    )

                supplemental_serializer = SupplementalNOASerializer(
                    supplemental_report, many=True, context={"request": request}
                )

                supplemental_data = supplemental_serializer.data
                ## supplemental needs to be ordered by date
                ## frontend will iterate down array.. first submitted, then recommended..
                ## once a supplemental report is assessed, we will create a row for reassessment on the frontend with that date
                report_dict = {
                    "assessment": report_data,
                    "supplemental": supplemental_data,
                }
        return Response(report_dict)

    @action(detail=True)
    def supplemental_history(self, request, pk=None):
        queryset = self.get_queryset()
        model_year_report = get_object_or_404(queryset, pk=pk)

        supplemental_reports = (
            SupplementalReport.objects.filter(model_year_report=model_year_report.id)
            .exclude(status=ModelYearReportStatuses.DELETED)
            .order_by("-update_timestamp")
        )

        exclude_supplemental_reports = []
        for report in supplemental_reports:
            if report.status.value in ["DRAFT", "RETURNED"] and (
                    request.user.is_government and not report.is_reassessment
                ):
                    exclude_supplemental_reports.append(report.id)

            if report.is_reassessment:
                if (
                    report.status.value not in ["ASSESSED", "REASSESSED"]
                    and not request.user.is_government
                ):
                    exclude_supplemental_reports.append(report.id)
            else:
                if report.status.value == 'SUBMITTED':
                    next_report = SupplementalReport.objects.filter(supplemental_id=report.id).exclude(status=ModelYearReportStatuses.DELETED).first()
                    if next_report and next_report.is_reassessment:
                        if request.user.is_government:
                            exclude_supplemental_reports.append(report.id)
                        elif next_report.status.value in ["ASSESSED", "REASSESSED"]:
                            exclude_supplemental_reports.append(report.id)

        supplemental_reports = supplemental_reports.exclude(
            id__in=exclude_supplemental_reports
        )

        serializer = SupplementalReportSerializer(
            supplemental_reports, many=True, context={"request": request}
        )

        model_year_report_serializer = SupplementalModelYearReportSerializer(
            [model_year_report], many=True, context={"request": request}
        )

        return Response(serializer.data + model_year_report_serializer.data)

    @action(detail=True)
    def makes(self, request, pk=None):
        queryset = self.get_queryset()
        report = get_object_or_404(queryset, pk=pk)
        supplier_makes_list = (
            ModelYearReportMake.objects.filter(
                model_year_report_id=report.id, from_gov=False
            )
            .values("make")
            .distinct()
        )

        supplier_makes = ModelYearReportMakeSerializer(supplier_makes_list, many=True)
        gov_makes_list = (
            ModelYearReportMake.objects.filter(
                model_year_report_id=report.id, from_gov=True
            )
            .values("make")
            .distinct()
        )

        gov_makes = ModelYearReportMakeSerializer(gov_makes_list, many=True)
        return Response(
            {"supplier_makes": supplier_makes.data, "gov_makes": gov_makes.data}
        )

    @action(detail=True)
    def submission_confirmation(self, request, pk=None):
        confirmation = ModelYearReportConfirmation.objects.filter(
            model_year_report_id=pk,
            signing_authority_assertion__module="compliance_summary",
        ).values_list("signing_authority_assertion_id", flat=True)

        return Response({"confirmation": confirmation})

    @action(detail=False, methods=["patch"])
    def submission(self, request):
        validation_status = request.data.get("validation_status")
        model_year_report_id = request.data.get("model_year_report_id")
        confirmations = request.data.get("confirmation", None)
        description = request.data.get("description")
        remove_submission_confirmation = request.data.get("remove_confirmation", None)

        model_year_report_update = ModelYearReport.objects.filter(
            id=model_year_report_id,
        )

        model_year_report_check = ModelYearReport.objects.filter(
            id=model_year_report_id,
        ).first()

        if remove_submission_confirmation:
            assertion_id = SigningAuthorityAssertion.objects.filter(
                module="compliance_summary"
            ).first()
            item = ModelYearReportConfirmation.objects.filter(
                model_year_report_id=model_year_report_id,
                signing_authority_assertion_id=assertion_id,
            )
            item.delete()

        if validation_status:
            if validation_status == "RECOMMENDED" and not description:
                # returning a 200 to bypass the rest of the update
                return HttpResponse(status=200, content="Recommendation is required")

            number_of_updated_records = model_year_report_update.update(validation_status=validation_status, update_user=request.user.username)
            if number_of_updated_records > 0:
                model_year_report = model_year_report_update.first()
                check_validation_status_change(model_year_report_check.validation_status, model_year_report)

            ModelYearReportHistory.objects.create(
                model_year_report_id=model_year_report_id,
                validation_status=validation_status,
                update_user=request.user.username,
                create_user=request.user.username,
            )

            # check for if validation status is recommended
            if (
                validation_status == "RECOMMENDED"
                or (validation_status == "SUBMITTED" and description)
                or (validation_status == "RETURNED" and description)
            ):
                # do "update or create" to create the assessment object
                penalty = request.data.get("penalty")
                ModelYearReportAssessment.objects.update_or_create(
                    model_year_report_id=model_year_report_id,
                    defaults={
                        "update_user": request.user.username,
                        "model_year_report_assessment_description_id": description,
                        "penalty": None if penalty == "" else penalty,
                        "display": True
                    },
                )

            if validation_status == "ASSESSED":
                adjust_credits(model_year_report_id, request)
        
        if validation_status == "DRAFT" and request.user.is_government:
            ModelYearReportLDVSales.objects.filter(
                model_year_report_id=model_year_report_id,
                from_gov=True
            ).update(
                display=False
            )
            ModelYearReportMake.objects.filter(
                model_year_report_id=model_year_report_id,
                from_gov=True
            ).update(
                display=False
            )
            ModelYearReportAssessment.objects.filter(
                model_year_report_id=model_year_report_id
            ).update(
                display=False
            )
            ModelYearReportAssessmentComment.objects.filter(
                model_year_report_id=model_year_report_id,
                to_director=False
            ).update(
                display=False
            )

        if confirmations:
            for confirmation in confirmations:
                summary_confirmation = ModelYearReportConfirmation.objects.create(
                    create_user=request.user.username,
                    model_year_report_id=model_year_report_id,
                    has_accepted=True,
                    title=request.user.title,
                    signing_authority_assertion_id=confirmation,
                )
                summary_confirmation.save()

        return HttpResponse(status=201, content="Report Submitted")

    @action(detail=True, methods=["patch"])
    def assessment_patch(self, request, pk):
        if not request.user.is_government:
            return HttpResponse(status=403, content=None)

        makes = request.data.get("makes", None)
        makes_delete = ModelYearReportMake.objects.filter(from_gov=True)
        makes_delete.delete()
        report = get_object_or_404(ModelYearReport, pk=pk)

        if makes and isinstance(makes, list):
            for make in makes:
                found = report.makes.filter(make__iexact=make)

                if not found:
                    ModelYearReportMake.objects.create(
                        model_year_report=report,
                        make=make,
                        create_user=request.user.username,
                        update_user=request.user.username,
                        from_gov=True,
                    )

        sales = request.data.get("sales", None)

        if sales:
            for key, value in sales.items():
                model_year = ModelYear.objects.filter(name=key).first()
                inputValue = int(value)
                if model_year:
                    # check if theres multiple records for ldv sales
                    # -if theres one (original report) and it matches what is
                    #    being sent, do not do anything
                    # -if theres one and it doesn't match whats being sent, add
                    #     a new record
                    # -if theres two and the updated one doesn't match either
                    #     record, add a new record
                    # -if theres more than one and the number matches the most
                    #     recent, do not do anything
                    # -if theres more than one and the new number matches the
                    #     original, delete the most recent one
                    sales_records = ModelYearReportLDVSales.objects.filter(
                        model_year_id=model_year.id, model_year_report=report
                    )

                    if (
                        sales_records.count() == 2
                        and inputValue != sales_records[0].ldv_sales
                        and inputValue != sales_records[1].ldv_sales
                    ) or (
                        sales_records.count() == 1
                        and inputValue != sales_records[0].ldv_sales
                    ):

                        ModelYearReportLDVSales.objects.update_or_create(
                            model_year_id=model_year.id,
                            model_year_report=report,
                            from_gov=True,
                            defaults={
                                "ldv_sales": value,
                                "create_user": request.user.username,
                                "update_user": request.user.username,
                            },
                        )

                    if (
                        sales_records.count() == 2
                        and (inputValue == sales_records[0].ldv_sales)
                        and (inputValue != sales_records[1].ldv_sales)
                    ):
                        ModelYearReportLDVSales.objects.get(
                            id=sales_records[1].id
                        ).delete()

        report = get_object_or_404(ModelYearReport, pk=pk)

        serializer = ModelYearReportSerializer(report, context={"request": request})

        return Response(serializer.data)

    @action(detail=True, methods=["post", "patch"])
    def comment_save(self, request, pk):
        comment = request.data.get("comment")
        director = request.data.get("director")
        if comment and director:
            ModelYearReportAssessmentComment.objects.create(
                model_year_report_id=pk,
                comment=comment,
                to_director=True,
                create_user=request.user.username,
                update_user=request.user.username,
                display=True
            )
        elif comment and not director:
            assessment_comment = (
                ModelYearReportAssessmentComment.objects.filter(
                    model_year_report_id=pk, to_director=False, display=True
                )
                .order_by("-update_timestamp")
                .first()
            )

            if assessment_comment:
                assessment_comment.comment = comment
                assessment_comment.update_user = request.user.username
                assessment_comment.save()
            else:
                ModelYearReportAssessmentComment.objects.create(
                    model_year_report_id=pk,
                    to_director=False,
                    comment=comment,
                    create_user=request.user.username,
                    update_user=request.user.username,
                )

        report = get_object_or_404(ModelYearReport, pk=pk)

        serializer = ModelYearReportSerializer(report, context={"request": request})

        return Response(serializer.data)

    @action(detail=True, methods=["patch"])
    def comment_patch(self, request, pk):
        # only government users can edit comments
        if not request.user.is_government:
            return HttpResponseForbidden()

        id = request.data.get("id")
        comment = request.data.get("comment")

        modelYearReportAssessmentComment = get_object_or_404(
            ModelYearReportAssessmentComment, pk=id
        )

        # only the original commenter can edit a comment
        if request.user.username != modelYearReportAssessmentComment.create_user:
            return HttpResponseForbidden()

        modelYearReportAssessmentComment.comment = comment
        modelYearReportAssessmentComment.save()

        report = get_object_or_404(ModelYearReport, pk=pk)

        serializer = ModelYearReportSerializer(report, context={"request": request})

        return Response(serializer.data)

    @action(detail=True, methods=["patch"])
    def comment_delete(self, request, pk):
        # only government users can delete comments
        if not request.user.is_government:
            return HttpResponseForbidden()

        id = request.data.get("id")

        modelYearReportAssessmentComment = get_object_or_404(
            ModelYearReportAssessmentComment, pk=id
        )

        # only the original commenter can delete their comment
        if request.user.username != modelYearReportAssessmentComment.create_user:
            return HttpResponseForbidden()

        modelYearReportAssessmentComment.delete()

        report = get_object_or_404(ModelYearReport, pk=pk)

        serializer = ModelYearReportSerializer(report, context={"request": request})

        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def assessment(self, request, pk):
        report = get_object_or_404(ModelYearReport, pk=pk)
        serializer = ModelYearReportAssessmentSerializer(
            report, context={"request": request}
        )
        if (
            not request.user.is_government
            and report.validation_status is not ModelYearReportStatuses.ASSESSED
        ):
            return HttpResponse(status=403, content=None)
        return Response(serializer.data)

    @action(detail=False)
    def years(self, _request):
        """
        Get the years
        """
        years = ModelYear.objects.all().order_by("-name")
        serializer = ModelYearSerializer(years, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def supplemental(self, request, pk):
        report = get_object_or_404(ModelYearReport, pk=pk)

        supplemental_id = request.GET.get("supplemental_id", None)

        if type(supplemental_id) is str and not supplemental_id.isdigit():
            supplemental_id = None

        if supplemental_id:
            data = report.get_supplemental(supplemental_id)

            if not data:
                return HttpResponse(status=404, content=None)

            create_user = UserProfile.objects.get(username=data.create_user)
            if data.status == ModelYearReportStatuses.DELETED:
                return HttpResponse(status=404, content=None)

            if (not request.user.is_government and data.status not in [
                ModelYearReportStatuses.DRAFT,
                ModelYearReportStatuses.SUBMITTED,
                ModelYearReportStatuses.ASSESSED,
                ModelYearReportStatuses.REASSESSED,
                ModelYearReportStatuses.RETURNED,
            ]) or (request.user.is_government and data.status == ModelYearReportStatuses.DRAFT
                   and not create_user.is_government):
                return HttpResponse(status=404, content=None)
        else:
            data = report.get_latest_supplemental(request)

        if not data:
            data = SupplementalReport()
            data.model_year_report_id = report.id

        serializer = ModelYearReportSupplementalSerializer(
            data, context={"request": request}
        )
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def minio_url(self, request, pk=None):
        object_name = uuid.uuid4().hex
        url = minio_put_object(object_name)

        return Response({"url": url, "minio_object_name": object_name})

    @action(detail=True, methods=["get"])
    def supplemental_assessment(self, request, pk):
        report = get_object_or_404(ModelYearReport, pk=pk)
        if report.supplemental is None:
            serializer = SupplementalReportAssessmentSerializer(
                0, context={"request": request}
            )
        else:
            supplemental_id = request.GET.get("supplemental_id", None)

            if not supplemental_id:
                supplemental_id = report.supplemental.id

            # check if we have permission for this
            supplemental_report = SupplementalReport.objects.filter(
                id=supplemental_id
            ).first()

            create_user = UserProfile.objects.filter(
                username=supplemental_report.create_user
            ).first()

            if supplemental_report and request.user.is_government:
                if (
                    supplemental_report.status.value in "DRAFT"
                    and not create_user.is_government
                ):
                    supplemental_id = 0

                if supplemental_report.status.value in ["DELETED"]:
                    supplemental_id = 0
            elif supplemental_report and not request.user.is_government:
                if (
                    supplemental_report.status.value in ["DRAFT", "RETURNED"]
                    and create_user.is_government
                ):
                    supplemental_id = 0

                if supplemental_report.status.value in ["RECOMMENDED", "DELETED"]:
                    supplemental_id = 0

            serializer = SupplementalReportAssessmentSerializer(
                supplemental_id, context={"request": request}
            )

        try:
            return Response(serializer.data)
        except:
            return HttpResponse(status=404, content=None)

    @action(detail=True, methods=["patch"])
    def supplemental_save(self, request, pk):
        report = get_object_or_404(ModelYearReport, pk=pk)
        validation_status = request.data.get("status")
        description = request.data.get("description")
        analyst_action = request.data.get("analyst_action", None)
        new_report = request.data.get("new_report", None)
        return_to_supplier = request.data.get("return_to_supplier", False)

        create_user = None
        supplemental_id = None

        # update the existing supplemental if it exists
        supplemental_report = report.get_latest_supplemental(request)
        if supplemental_report:
            create_user = UserProfile.objects.filter(
                username=supplemental_report.create_user
            ).first()
            supplemental_id = supplemental_report.id
        if validation_status == "RETURNED":
            previous_status = SupplementalReportHistory.objects.filter(
                supplemental_report_id=supplemental_id
            ).order_by('-update_timestamp').first().validation_status
            if previous_status == validation_status:
                SupplementalReportHistory.objects.create(
                    supplemental_report_id=supplemental_id,
                    validation_status=validation_status,
                    update_user=request.user.username,
                    create_user=request.user.username,
                )

                serializer = ModelYearReportSupplementalSerializer(
                    supplemental_report, data=request.data, context={"request": request}
                )
                serializer.is_valid(raise_exception=True)
                serializer.save(
                    model_year_report_id=report.id, update_user=request.user.username
                )

                return Response(serializer.data)
            
        if (
            return_to_supplier and
            supplemental_report and
            supplemental_report.status == ModelYearReportStatuses.SUBMITTED and
            validation_status == "DRAFT"
        ):
            SupplementalReportHistory.objects.create(
                supplemental_report_id=supplemental_id,
                validation_status="DRAFT",
                update_user=request.user.username,
                create_user=request.user.username,
            )
            supplemental_report.status = ModelYearReportStatuses.DRAFT
            supplemental_report.save()
            return HttpResponse(status=200)

        if (
            create_user
            and create_user.is_government == request.user.is_government
            and not new_report
        ):
            if request.data.get("status") == "DELETED":
                report = SupplementalReport.objects.filter(id=supplemental_report.id).first()
                if report.status.value == "ASSESSED" or report.status.value == "REASSESSED":
                    return HttpResponse(status=403, content='Cannot delete an assessed report.')

                SupplementalReportAttachment.objects.filter(
                    supplemental_report_id=supplemental_report.id
                ).delete()
                SupplementalReportSupplierInformation.objects.filter(
                    supplemental_report_id=supplemental_report.id
                ).delete()
                SupplementalReportCreditActivity.objects.filter(
                    supplemental_report_id=supplemental_report.id
                ).delete()
                SupplementalReportSales.objects.filter(
                    supplemental_report_id=supplemental_report.id
                ).delete()
                SupplementalReportHistory.objects.filter(
                    supplemental_report_id=supplemental_report.id
                ).delete()
                SupplementalReportComment.objects.filter(
                    supplemental_report_id=supplemental_report.id
                ).delete()
                SupplementalReportAssessment.objects.filter(
                    supplemental_report_id=supplemental_report.id
                ).delete()
                SupplementalReportAssessmentComment.objects.filter(
                    supplemental_report_id=supplemental_report.id
                ).delete()
                SupplementalReport.objects.filter(id=supplemental_report.id).delete()
                return HttpResponse(status=200)

            if validation_status:
                if (
                    validation_status == "RECOMMENDED"
                    and analyst_action
                    and not description
                ):
                    # returning a 200 to bypass the rest of the update
                    return HttpResponse(
                        status=200, content="Recommendation is required"
                    )

                if not new_report:
                    supplemental_report.status = validation_status
                    supplemental_report.update_user = request.user.username
                    supplemental_report.save()

                # check for if validation status is recommended
                if (
                    validation_status == "RECOMMENDED"
                    and analyst_action
                    or (validation_status in ["DRAFT", "SUBMITTED", "RETURNED"] and description)
                ):
                    # do "update or create" to create the assessment object
                    penalty = request.data.get("penalty")
                    SupplementalReportAssessment.objects.update_or_create(
                        supplemental_report_id=supplemental_report.id,
                        defaults={
                            "update_user": request.user.username,
                            "supplemental_report_assessment_description_id": description,
                            "penalty": None if penalty is "" else penalty,
                        },
                    )
                if validation_status == "SUBMITTED":
                    supplemental_records = SupplementalReport.objects.filter(
                        model_year_report=report, status="DRAFT"
                    ).order_by("-create_timestamp")
                    if supplemental_records:
                        for supplemental_record in supplemental_records:
                            create_user = UserProfile.objects.get(
                                username=supplemental_record.create_user
                            )
                            if create_user.is_government:
                                status = "DELETED"
                                supplemental_record_id = supplemental_record.id
                                SupplementalReportHistory.objects.create(
                                    supplemental_report_id=supplemental_record_id,
                                    validation_status=status,
                                    update_user=request.user.username,
                                    create_user=request.user.username,
                                )
                                update_sup_report = SupplementalReport.objects.filter(
                                    id=supplemental_record_id
                                )
                                update_sup_report.update(status=status)
                                update_sup_report.update(
                                    update_user=request.user.username
                                )

                if validation_status == "ASSESSED":
                    # adjust credits etc the same way as is done with
                    # model year reports excpt pass it the supplemental
                    adjust_credits_reassessment(supplemental_id, request)

                SupplementalReportHistory.objects.create(
                    supplemental_report_id=supplemental_id,
                    validation_status=validation_status,
                    update_user=request.user.username,
                    create_user=request.user.username,
                )

                serializer = ModelYearReportSupplementalSerializer(
                    supplemental_report, data=request.data, context={"request": request}
                )
                serializer.is_valid(raise_exception=True)
                serializer.save(
                    model_year_report_id=report.id, update_user=request.user.username
                )

        # otherwise create a new one
        else:
            serializer = ModelYearReportSupplementalSerializer(
                data=request.data, context={"request": request}
            )
            serializer.is_valid(raise_exception=True)
            serializer.save(
                model_year_report_id=report.id,
                create_user=request.user.username,
                update_user=request.user.username,
                supplemental_id=supplemental_id,
            )

            supplemental_id = serializer.data.get("id")

            SupplementalReportHistory.objects.create(
                supplemental_report_id=supplemental_id,
                validation_status=validation_status,
                update_user=request.user.username,
                create_user=request.user.username,
            )

            if (validation_status == "RECOMMENDED" or validation_status == "DRAFT") and description:
                penalty = request.data.get("penalty")
                SupplementalReportAssessment.objects.create(
                    supplemental_report_id=supplemental_id,
                    update_user=request.user.username,
                    create_user=request.user.username,
                    supplemental_report_assessment_description_id=description,
                    penalty=None if penalty is "" else penalty,
                )

        report = get_object_or_404(ModelYearReport, pk=pk)

        if not supplemental_id:
            supplemental_id = supplemental_report.id

        supplier_information = request.data.get("supplier_info")
  
        if supplier_information:
            SupplementalReportSupplierInformation.objects.filter(
                supplemental_report_id=supplemental_id
            ).delete()

            for k, v in supplier_information.items():
                category = k.upper()

                if category == "LDV_SALES":
                    SupplementalReport.objects.filter(id=supplemental_id).update(
                        ldv_sales=v
                    )
                else:
                    SupplementalReportSupplierInformation.objects.create(
                        update_user=request.user.username,
                        create_user=request.user.username,
                        supplemental_report_id=supplemental_id,
                        category=category,
                        value=v,
                    )

        supplemental_attachments = request.data.get("evidence_attachments", None)
        if supplemental_attachments:
            attachments = supplemental_attachments.get("attachments", None)
            if attachments:
                for attachment in attachments:
                    SupplementalReportAttachment.objects.create(
                        create_user=request.user.username,
                        supplemental_report_id=supplemental_id,
                        **attachment
                    )
        files_to_be_removed = request.data.get("delete_files", [])
        if files_to_be_removed:
            for file_id in files_to_be_removed:
                attachment = SupplementalReportAttachment.objects.filter(
                    id=file_id, supplemental_report_id=supplemental_id
                ).first()

                if attachment:
                    minio_remove_object(attachment.minio_object_name)

                    attachment.is_removed = True
                    attachment.update_user = request.user.username
                    attachment.save()

        credit_activity = request.data.get("credit_activity")
        if credit_activity:
            SupplementalReportCreditActivity.objects.filter(
                supplemental_report_id=supplemental_id
            ).delete()

            for activity in credit_activity:
                model_year_name = activity.get("model_year")
                model_year = ModelYear.objects.filter(name=model_year_name).first()
                category = activity.get("category")
                credit_a_value = activity.get("credit_a_value")
                credit_b_value = activity.get("credit_b_value")

                if credit_a_value:
                    try:
                        float(credit_a_value)
                    except ValueError:
                        credit_a_value = None

                if credit_b_value:
                    try:
                        float(credit_b_value)
                    except ValueError:
                        credit_b_value = None

                if model_year:
                    SupplementalReportCreditActivity.objects.create(
                        update_user=request.user.username,
                        create_user=request.user.username,
                        supplemental_report_id=supplemental_id,
                        category=category,
                        credit_a_value=credit_a_value,
                        credit_b_value=credit_b_value,
                        model_year=model_year,
                    )

        zev_sales = request.data.get("zev_sales")
        if zev_sales:
            SupplementalReportSales.objects.filter(
                supplemental_report_id=supplemental_id
            ).delete()
            for v in zev_sales:
                model_year_report_vehicle_id = None
                supplemental_origin_zev_sale_id = None
                if v.get("model_year_report_vehicle"):
                    model_year_report_vehicle = ModelYearReportVehicle.objects.filter(
                        id=v.get("model_year_report_vehicle")
                    ).first()
                    if model_year_report_vehicle:
                        model_year_report_vehicle_id = model_year_report_vehicle.id
                if v.get("supplemental_origin_zev_sale_id"):
                    supplemental_origin_zev_sale = (
                        SupplementalReportSales.objects.filter(
                            id=v.get("supplemental_origin_zev_sale_id")
                        ).first()
                    )
                    if supplemental_origin_zev_sale:
                        supplemental_origin_zev_sale_id = (
                            supplemental_origin_zev_sale.id
                        )
                SupplementalReportSales.objects.create(
                    update_user=request.user.username,
                    create_user=request.user.username,
                    supplemental_report_id=supplemental_id,
                    model_year_report_vehicle_id=model_year_report_vehicle_id,
                    supplemental_origin_zev_sale_id=supplemental_origin_zev_sale_id,
                    sales=v.get("sales"),
                    make=v.get("make"),
                    model_name=v.get("model_name"),
                    model_year=v.get("model_year"),
                    vehicle_zev_type=v.get("vehicle_zev_type"),
                    range=v.get("range"),
                    zev_class=v.get("zev_class"),
                )

        from_supplier_comment = request.data.get("from_supplier_comment")
        if from_supplier_comment:
            SupplementalReportComment.objects.filter(
                supplemental_report_id=supplemental_id, to_govt=True
            ).delete()
            SupplementalReportComment.objects.create(
                create_user=request.user.username,
                supplemental_report_id=supplemental_id,
                comment=from_supplier_comment,
                to_govt=True,
            )

        return Response(serializer.data)

    @action(detail=True, methods=["post", "patch"])
    def supplemental_comment_save(self, request, pk):
        report = get_object_or_404(ModelYearReport, pk=pk)
        comment = request.data.get("from_govt_comment")
        director = request.data.get("director")
        supplemental_id = request.data.get("supplemental_id", report.supplemental.id)
        if comment and director:
            SupplementalReportAssessmentComment.objects.create(
                supplemental_report_id=supplemental_id,
                comment=comment,
                to_director=True,
                create_user=request.user.username,
                update_user=request.user.username,
            )
        elif comment and not director:
            assessment_comment = (
                SupplementalReportAssessmentComment.objects.filter(
                    supplemental_report_id=supplemental_id, to_director=False
                )
                .order_by("-update_timestamp")
                .first()
            )

            if assessment_comment:
                assessment_comment.comment = comment
                assessment_comment.update_user = request.user.username
                assessment_comment.save()
            else:
                SupplementalReportAssessmentComment.objects.create(
                    supplemental_report_id=supplemental_id,
                    to_director=False,
                    comment=comment,
                    create_user=request.user.username,
                    update_user=request.user.username,
                )

        return Response({"status": "Saved"})

    @action(detail=True, methods=["patch"])
    def supplemental_comment_edit(self, request, pk):
        comment_id = request.data.get("comment_id")
        comment_text = request.data.get("comment")
        username = request.user.username
        comment = SupplementalReportAssessmentComment.objects.get(
            id=comment_id
        )
        if username == comment.create_user:
            serializer = SupplementalReportAssessmentCommentSerializer(comment, data={'comment': comment_text}, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        return Response(status=status.HTTP_403_FORBIDDEN)

    @action(detail=True, methods=["patch"])
    def supplemental_comment_delete(self, request, pk):
        comment_id = request.data.get("comment_id")
        username = request.user.username
        comment = SupplementalReportAssessmentComment.objects.get(
            id=comment_id
        )
        if username == comment.create_user:
            comment.delete()
            return Response(status=status.HTTP_200_OK)
        return Response(status=status.HTTP_403_FORBIDDEN)


    @action(detail=True, methods=["get"])
    def assessed_supplementals(self, request, pk):
        report = get_object_or_404(ModelYearReport, pk=pk)
        data = report.get_assessed_supplementals()
        serializer = ModelYearReportSupplementalSerializer(
            data, context={"request": request}, many=True
        )
        return Response(serializer.data)
    
    @action(detail=True, methods=["get"])
    def statuses_allow_reassessment(self, request, pk):
        result = False
        model_year_report = get_model_year_report(pk, "validation_status")
        if model_year_report.validation_status in [ModelYearReportStatuses.ASSESSED, ModelYearReportStatuses.REASSESSED]:
            supplementals = get_ordered_list_of_supplemental_reports(pk, "status")
            if supplementals:
                latest_supplemental_status = supplementals[-1].status
                if latest_supplemental_status in [ModelYearReportStatuses.ASSESSED, ModelYearReportStatuses.REASSESSED]:
                    result = True
            else:
                result = True
        return Response(result)

