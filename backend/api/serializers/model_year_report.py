from api.models.supplemental_report_assessment import (
    SupplementalReportAssessment,
)
from enumfields.drf import EnumField, EnumSupportSerializerMixin
from rest_framework.serializers import (
    ModelSerializer,
    SerializerMethodField,
    SlugRelatedField,
    CharField,
    ListField,
)

from api.models.model_year import ModelYear
from api.models.model_year_report_confirmation import ModelYearReportConfirmation
from api.models.model_year_report import ModelYearReport
from api.models.model_year_report_history import ModelYearReportHistory
from api.models.model_year_report_ldv_sales import ModelYearReportLDVSales
from api.models.model_year_report_address import ModelYearReportAddress
from api.models.model_year_report_make import ModelYearReportMake
from api.models.model_year_report_statuses import ModelYearReportStatuses
from api.serializers.model_year_report_ldv_sales import (
    ModelYearReportLDVSalesSerializer,
)
from api.models.user_profile import UserProfile
from api.models.model_year_report_assessment import ModelYearReportAssessment
from api.models.supplemental_report import SupplementalReport
from api.serializers.model_year_report_address import ModelYearReportAddressSerializer

from api.serializers.model_year_report_make import ModelYearReportMakeSerializer
from api.serializers.model_year_report_history import ModelYearReportHistorySerializer
from api.serializers.user import MemberSerializer
from api.serializers.vehicle import ModelYearSerializer
from api.services.model_year_report import get_model_year_report_statuses
from django.db.models import Q


class ModelYearReportSerializer(ModelSerializer):
    create_user = SerializerMethodField()
    model_year = ModelYearSerializer()
    model_year_report_addresses = ModelYearReportAddressSerializer(many=True)
    makes = SerializerMethodField()
    # validation_status = EnumField(ModelYearReportStatuses)
    validation_status = SerializerMethodField()
    model_year_report_history = SerializerMethodField()
    confirmations = SerializerMethodField()
    statuses = SerializerMethodField()
    ldv_sales = SerializerMethodField()
    ldv_sales_previous = SerializerMethodField()
    avg_sales = SerializerMethodField()
    changelog = SerializerMethodField()

    def get_validation_status(self, obj):
        request = self.context.get("request")

        if not request.user.is_government and obj.validation_status in [
            ModelYearReportStatuses.RETURNED,
            ModelYearReportStatuses.RECOMMENDED,
        ]:
            return ModelYearReportStatuses.SUBMITTED.value

        return obj.validation_status.value

    def get_ldv_sales_previous(self, obj):
        year = int(obj.model_year.name)
        ldv_sales = ModelYearReportLDVSales.objects.filter(
            model_year_report=obj,
            model_year__name__in=[str(year - 1), str(year - 2), str(year - 3)],
        )
        serializer = ModelYearReportLDVSalesSerializer(ldv_sales, many=True)
        return serializer.data

    def get_avg_sales(self, obj):
        rows = ModelYearReportLDVSales.objects.filter(
            model_year_report_id=obj.id,
            from_gov=False,
            model_year__name__lt=obj.model_year.name,
        ).values_list("ldv_sales", flat=True)[:3]

        avg_sales = 0
        if rows.count() < 3:
            row = ModelYearReportLDVSales.objects.filter(
                model_year_report_id=obj.id, model_year_id=obj.model_year_id
            ).first()
            if row:
                return row.ldv_sales
            else:
                return None
        avg_sales = sum(list(rows)) / 3
        return avg_sales

    def get_create_user(self, obj):
        user_profile = UserProfile.objects.filter(username=obj.create_user)

        if user_profile.exists():
            serializer = MemberSerializer(user_profile.first(), read_only=True)
            return serializer.data

        return obj.create_user

    def get_confirmations(self, obj):
        confirmations = (
            ModelYearReportConfirmation.objects.filter(model_year_report_id=obj.id)
            .values_list("signing_authority_assertion_id", flat=True)
            .distinct()
        )

        return confirmations

    def get_ldv_sales(self, obj):
        request = self.context.get("request")

        is_assessed = (
            request.user.organization_id == obj.organization_id
            and obj.validation_status == ModelYearReportStatuses.ASSESSED
        ) or request.user.is_government

        if is_assessed:
            return obj.get_ldv_sales(from_gov=True) or obj.ldv_sales

        return obj.ldv_sales

    def get_changelog(self, obj):
        request = self.context.get("request")
        if request.user.is_government:
            from_gov_sales = obj.get_ldv_sales_with_year(from_gov=True)
            sales_changes = ""
            if from_gov_sales:
                not_gov_sales = obj.get_ldv_sales_with_year(from_gov=False)
                sales_changes = {
                    "from_gov": from_gov_sales["sales"],
                    "not_from_gov": not_gov_sales["sales"],
                    "year": from_gov_sales["year"],
                }

            gov_makes = ModelYearReportMake.objects.filter(
                model_year_report_id=obj.id, from_gov=True
            )
            gov_makes_additions_serializer = ModelYearReportMakeSerializer(
                gov_makes, many=True
            )
            return {
                "makes_additions": gov_makes_additions_serializer.data,
                "ldv_changes": sales_changes,
            }
        return obj.ldv_sales

    def get_makes(self, obj):
        request = self.context.get("request")

        makes = ModelYearReportMake.objects.filter(model_year_report_id=obj.id)

        if (
            not request.user.is_government
            and obj.validation_status != ModelYearReportStatuses.ASSESSED
        ):
            makes = makes.filter(from_gov=False)

        serializer = ModelYearReportMakeSerializer(makes, many=True)

        return serializer.data

    def get_statuses(self, obj):
        request = self.context.get("request")

        return get_model_year_report_statuses(obj, request.user)

    def get_model_year_report_history(self, obj):
        request = self.context.get("request")

        history = ModelYearReportHistory.objects.filter(
            model_year_report_id=obj.id
        ).order_by("create_timestamp")

        if not request.user.is_government:
            history = history.exclude(
                validation_status__in=[
                    ModelYearReportStatuses.RECOMMENDED,
                    ModelYearReportStatuses.RETURNED,
                ]
            )

        # Remove submitted by government user (only happens when the IDIR user saves first)
        users = UserProfile.objects.filter(
            organization__is_government=True
        ).values_list("username")
        history = history.exclude(
            validation_status__in=[
                ModelYearReportStatuses.SUBMITTED,
            ],
            create_user__in=users,
        )

        serializer = ModelYearReportHistorySerializer(history, many=True)

        return serializer.data

    class Meta:
        model = ModelYearReport
        fields = (
            "organization_name",
            "supplier_class",
            "model_year",
            "model_year_report_addresses",
            "makes",
            "validation_status",
            "create_user",
            "model_year_report_history",
            "confirmations",
            "statuses",
            "ldv_sales",
            "ldv_sales_previous",
            "avg_sales",
            "credit_reduction_selection",
            "changelog",
            "update_timestamp",
        )


class ModelYearReportsSerializer(ModelSerializer):
    validation_status = EnumField(ModelYearReportStatuses)
    model_year = SlugRelatedField(slug_field="name", queryset=ModelYear.objects.all())

    class Meta:
        model = ModelYearReport
        fields = (
            "organization_name",
            "model_year",
            "validation_status",
            "id",
            "organization_id",
        )


class ModelYearReportListSerializer(ModelSerializer, EnumSupportSerializerMixin):
    def to_representation(self, instance):
        request = self.context.get("request")
        consider_supplemental = (
            True if request.GET.get("consider-supplemental") == "Y" else False
        )
        latest_supplemental = None
        latest_assessed_supplemental = None
        latest_supplemental_assessment = None
        supplementals = (
            SupplementalReport.objects.filter(model_year_report=instance)
            .filter(~Q(status=ModelYearReportStatuses.DELETED))
            .order_by("-create_timestamp")
        )
        SubQuery = UserProfile.objects.filter(organization__is_government=True).values_list('username', flat=True)
        if not request.user.is_government:
            supplementals = supplementals.exclude(Q(status__in=[
                ModelYearReportStatuses.DRAFT, ModelYearReportStatuses.RECOMMENDED, ModelYearReportStatuses.RETURNED
            ] ) & Q(create_user__in=SubQuery) )
        supplementals_length = len(supplementals)
        if supplementals_length > 0:
            latest_supplemental = supplementals[0]
        for supplemental in supplementals:
            if supplemental.status == ModelYearReportStatuses.ASSESSED:
                latest_assessed_supplemental = supplemental
                break
        for supplemental in supplementals:
            if supplemental.status == ModelYearReportStatuses.ASSESSED:
                supplemental_assessment = supplemental.supplemental_assessment.order_by(
                    "-create_timestamp"
                ).first()
                if supplemental_assessment:
                    latest_supplemental_assessment = supplemental_assessment
                    break

        def get_ldv_sales(obj):
            if (
                latest_assessed_supplemental
                and latest_assessed_supplemental.ldv_sales
            ):
                return latest_assessed_supplemental.ldv_sales
            else:
                is_assessed = (
                    request.user.organization_id == obj.organization_id
                    and obj.validation_status == ModelYearReportStatuses.ASSESSED
                ) or request.user.is_government

                if is_assessed:
                    return obj.get_ldv_sales(from_gov=True) or obj.ldv_sales

                return obj.ldv_sales

        def get_compliant(obj):
            if consider_supplemental and latest_supplemental_assessment:
                found = latest_supplemental_assessment.supplemental_report_assessment_description.description.find(
                    "has complied"
                )
                if found >= 0:
                    return "Yes"
                return "No"
            else:
                if obj.validation_status != ModelYearReportStatuses.ASSESSED:
                    return "-"

                assessment = ModelYearReportAssessment.objects.filter(
                    model_year_report_id=obj.id
                ).first()

                if assessment:
                    found = assessment.model_year_report_assessment_description.description.find(
                        "has complied"
                    )

                    if found >= 0:
                        return "Yes"
                    else:
                        return "No"

                return "No"

        def get_validation_status(obj):
            if not request.user.is_government and obj.validation_status in [
                ModelYearReportStatuses.RECOMMENDED,
                ModelYearReportStatuses.RETURNED,
            ]:
                return ModelYearReportStatuses.SUBMITTED.value
            return obj.get_validation_status_display()

        def get_supplemental_status(obj):
            if latest_supplemental:
                # get information on who created the record
                create_user = UserProfile.objects.get(
                    username=latest_supplemental.create_user
                )
                sup_status = latest_supplemental.status.value

                if create_user.is_government:
                    if sup_status == "RETURNED":
                        return ("REASSESSMENT {}").format(sup_status)

                    if sup_status == "REASSESSED" or sup_status == "ASSESSED":
                        # bceid and idir can see just 'reassessed' as status
                        return "REASSESSED"
                    if request.user.is_government and sup_status in [
                        "DRAFT",
                        "RECOMMENDED",
                    ]:
                        # created by idir and viewed by idir, they can see
                        # draft or recommended status
                        return ("REASSESSMENT {}").format(sup_status)
                    if not request.user.is_government and sup_status in [
                        "SUBMITTED",
                        "DRAFT",
                        "RECOMMENDED",
                    ]:
                        # if it is being viewed by bceid, they shouldnt see it
                        # show the last assessed report
                        if supplementals.count() > 1:
                            for each in supplementals:
                                # find the newest record that is either created by bceid or one that they are allowed to see
                                item_create_user = UserProfile.objects.get(
                                    username=each.create_user
                                )
                                # bceid are allowed to see any created by them or
                                # if the status is REASSESSED
                                if (
                                    item_create_user.is_government
                                    and each.status.value == "ASSESSED"
                                ):
                                    return ("SUPPLEMENTARY {}").format(
                                        each.status.value
                                    )
                                if (
                                    not item_create_user.is_government
                                    and each.status.value == "SUBMITTED"
                                ):
                                    return ("SUPPLEMENTARY {}").format(
                                        each.status.value
                                    )
                else:
                    # if created by bceid its a supplemental report
                    if sup_status == "SUBMITTED":
                        return ("SUPPLEMENTARY {}").format(sup_status)
                    if sup_status == "DRAFT":
                        if not request.user.is_government:
                            return ("SUPPLEMENTARY {}").format(sup_status)
                        else:
                            # same logic for bceid to check if theres another record
                            if supplementals.count() > 1:
                                for each in supplementals:
                                    # find the newest record that is either
                                    # created by bceid or they are able to see
                                    item_create_user = UserProfile.objects.get(
                                        username=each.create_user
                                    )
                                    # they are allowed to see any created by idir
                                    # or if it is submitted
                                    if item_create_user.is_government:
                                        return ("REASSESSMENT {}").format(
                                            each.status.value
                                        )
                                    if each.status.value == "SUBMITTED":
                                        return ("SUPPLEMENTARY {}").format(
                                            each.status.value
                                        )

            # no supplemental report, just return the status from the assessment
            if not request.user.is_government and obj.validation_status in [
                ModelYearReportStatuses.RECOMMENDED,
                ModelYearReportStatuses.RETURNED,
            ]:
                return ModelYearReportStatuses.SUBMITTED.value
            return obj.get_validation_status_display()

        def get_supplemental_id(obj):
            if latest_supplemental:
                create_user = UserProfile.objects.filter(
                        username=latest_supplemental.create_user
                    ).first()
                if request.user.is_government:
                    if  latest_supplemental.status.value == 'DRAFT' and not create_user.is_government:
                        return None
                if not request.user.is_government:
                    if (
                        create_user
                        and not create_user.is_government
                        and latest_supplemental.status.value == "ASSESSED"
                    ) or (
                        create_user
                        and create_user.is_government
                        and latest_supplemental.status.value != "ASSESSED"
                    ):
                        for supplemental in supplementals:
                            if supplemental.id == latest_supplemental.supplemental_id:
                                return supplemental.id

                return latest_supplemental.id
            return None

        def get_supplier_class(obj):
            if consider_supplemental and latest_assessed_supplemental:
                supplemental_supplier_information = (
                    latest_assessed_supplemental.supplemental_report_supplier_information.filter(
                        category="SUPPLIER_CLASS"
                    )
                    .order_by("-create_timestamp")
                    .first()
                )
                if supplemental_supplier_information:
                    return supplemental_supplier_information.value
                return obj.supplier_class
            return obj.supplier_class

        return {
            "id": instance.id,
            "organization_name": instance.organization_name,
            "organization_short_name": instance.organization.short_name,
            "model_year": ModelYearSerializer(instance.model_year).data,
            "validation_status": get_validation_status(instance),
            "ldv_sales": get_ldv_sales(instance),
            "supplier_class": get_supplier_class(instance),
            "compliant": get_compliant(instance),
            "obligation_total": 0,
            "obligation_credits": 0,
            "supplemental_status": get_supplemental_status(instance),
            "supplemental_id": get_supplemental_id(instance),
        }

    class Meta:
        model = ModelYearReport


class ModelYearReportSaveSerializer(ModelSerializer, EnumSupportSerializerMixin):
    model_year = SlugRelatedField(slug_field="name", queryset=ModelYear.objects.all())
    validation_status = EnumField(ModelYearReportStatuses, required=False)
    makes = ListField(child=CharField())

    def create(self, validated_data):
        request = self.context.get("request")
        organization = request.user.organization
        makes = validated_data.pop("makes")
        model_year = validated_data.pop("model_year")
        confirmations = request.data.get("confirmations")
        ldv_sales = request.data.get("ldv_sales")

        report = ModelYearReport.objects.create(
            model_year_id=model_year.id,
            organization_id=organization.id,
            organization_name=organization.name,
            **validated_data,
            create_user=request.user.username,
            update_user=request.user.username,
            supplier_class=request.user.organization.supplier_class
        )
        for each in ldv_sales:
            model_year = ModelYear.objects.filter(name=each.get("model_year")).first()

            if model_year:
                ModelYearReportLDVSales.objects.create(
                    model_year=model_year,
                    ldv_sales=each.get("ldv_sales"),
                    model_year_report_id=report.id,
                )
        for confirmation in confirmations:
            ModelYearReportConfirmation.objects.create(
                create_user=request.user.username,
                model_year_report=report,
                has_accepted=True,
                title=request.user.title,
                signing_authority_assertion_id=confirmation,
            )

        for make in makes:
            ModelYearReportMake.objects.create(
                model_year_report=report,
                make=make,
                create_user=request.user.username,
                update_user=request.user.username,
            )

        for address in request.user.organization.organization_address:
            ModelYearReportAddress.objects.create(
                model_year_report=report,
                representative_name=address.representative_name,
                address_type=address.address_type,
                address_line_1=address.address_line_1,
                address_line_2=address.address_line_2,
                address_line_3=address.address_line_3,
                city=address.city,
                postal_code=address.postal_code,
                state=address.state,
                county=address.county,
                country=address.country,
                other=address.other,
            )

        ModelYearReportHistory.objects.create(
            create_user=request.user.username,
            update_user=request.user.username,
            model_year_report_id=report.id,
            validation_status=ModelYearReportStatuses.DRAFT,
        )

        return report

    def update(self, instance, validated_data):
        request = self.context.get("request")
        organization = request.user.organization

        delete_confirmations = request.data.get("delete_confirmations", False)

        if delete_confirmations:
            module = request.data.get("module", None)
            if isinstance(module, list):
                for each in module:
                    ModelYearReportConfirmation.objects.filter(
                        model_year_report=instance,
                        signing_authority_assertion__module=each,
                    ).delete()
            else:
                ModelYearReportConfirmation.objects.filter(
                    model_year_report=instance,
                    signing_authority_assertion__module=module,
                ).delete()
            return instance

        makes = validated_data.pop("makes")
        model_year = validated_data.pop("model_year")
        confirmations = request.data.get("confirmations")

        confirmation = ModelYearReportConfirmation.objects.filter(
            model_year_report=instance,
            signing_authority_assertion__module="supplier_information",
        ).first()

        if confirmation:
            return instance

        instance.model_year_id = model_year.id
        instance.organization_name = organization.name
        instance.update_user = request.user.username

        instance.save()

        if makes:
            ModelYearReportMake.objects.filter(
                model_year_report=instance,
            ).delete()

            for make in makes:
                ModelYearReportMake.objects.create(
                    model_year_report=instance,
                    make=make,
                    create_user=request.user.username,
                    update_user=request.user.username,
                )

        ModelYearReportAddress.objects.filter(
            model_year_report=instance,
        ).delete()

        for address in request.user.organization.organization_address:
            ModelYearReportAddress.objects.create(
                model_year_report=instance,
                representative_name=address.representative_name,
                address_type=address.address_type,
                address_line_1=address.address_line_1,
                address_line_2=address.address_line_2,
                address_line_3=address.address_line_3,
                city=address.city,
                postal_code=address.postal_code,
                state=address.state,
                county=address.county,
                country=address.country,
                other=address.other,
            )

        ldv_sales = request.data.get("ldv_sales", None)

        if "ldv_sales" in request.data:
            ModelYearReportLDVSales.objects.filter(
                model_year_report_id=instance.id
            ).exclude(model_year_id=instance.model_year_id).delete()

            for each in ldv_sales:
                model_year = ModelYear.objects.filter(
                    name=each.get("model_year")
                ).first()

                if model_year:
                    ModelYearReportLDVSales.objects.create(
                        model_year_id=model_year.id,
                        ldv_sales=each.get("ldv_sales"),
                        model_year_report_id=instance.id,
                    )

        if instance.get_avg_sales():
            instance.supplier_class = request.user.organization.get_current_class(
                avg_sales=instance.get_avg_sales()
            )
            instance.save()

        for confirmation in confirmations:
            ModelYearReportConfirmation.objects.update_or_create(
                model_year_report=instance,
                has_accepted=True,
                title=request.user.title,
                signing_authority_assertion_id=confirmation,
                defaults={"create_user": request.user.username},
            )

        ModelYearReportHistory.objects.create(
            create_user=request.user.username,
            update_user=request.user.username,
            model_year_report_id=instance.id,
            validation_status=ModelYearReportStatuses.DRAFT,
        )

        return instance

    class Meta:
        model = ModelYearReport
        fields = (
            "id",
            "model_year",
            "validation_status",
            "makes",
        )
