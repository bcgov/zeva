from django.core.exceptions import PermissionDenied
from enumfields.drf import EnumField, EnumSupportSerializerMixin
from rest_framework.serializers import ModelSerializer, \
    SerializerMethodField, SlugRelatedField, ValidationError

from api.models.model_year import ModelYear
from api.models.credit_class import CreditClass
from api.models.organization import Organization
from api.models.vehicle import Vehicle
from api.models.vehicle_attachment import VehicleAttachment
from api.models.vehicle_change_history import VehicleChangeHistory
from api.models.vehicle_statuses import VehicleDefinitionStatuses
from api.models.vehicle_zev_type import ZevType
from api.models.sales_submission_content import SalesSubmissionContent
from api.models.record_of_sale import RecordOfSale
from api.serializers.user import MemberSerializer
from api.serializers.organization import OrganizationSerializer
from api.models.user_profile import UserProfile
from api.models.vehicle_comment import VehicleComment
from api.serializers.vehicle_attachment import VehicleAttachmentSerializer
from api.serializers.vehicle_comment import VehicleCommentSerializer
from api.services.minio import minio_remove_object
from api.services.vehicle import change_status
from api.services.send_email import notifications_zev_model
from api.models.vehicle_class import VehicleClass


class ModelYearSerializer(ModelSerializer):
    class Meta:
        model = ModelYear
        fields = (
            'name', 'effective_date', 'expiration_date'
        )


class VehicleClassSerializer(ModelSerializer):
    class Meta:
        model = VehicleClass
        fields = (	
            'vehicle_class_code', 'description'
        )


class VehicleZevTypeSerializer(ModelSerializer):
    class Meta:
        model = ZevType
        fields = (
            'vehicle_zev_code', 'description'
        )


class VehicleIsActiveChangeSerializer(ModelSerializer):
    def update(self, obj, validated_data):
        request = self.context.get('request')
        is_active = validated_data.get('is_active')
        obj.is_active = is_active
        obj.save()
        return obj

    class Meta:
        model = Vehicle
        fields = (
            'is_active',
        )


class VehicleStatusChangeSerializer(ModelSerializer):
    validation_status = EnumField(VehicleDefinitionStatuses)

    def validate_validation_status(self, value):
        request = self.context.get('request')

        if value == VehicleDefinitionStatuses.SUBMITTED:
            if self.instance.validation_status not in [
                VehicleDefinitionStatuses.DRAFT,
                VehicleDefinitionStatuses.CHANGES_REQUESTED
            ]:
                raise ValidationError(
                    "Model cannot be submitted at this time."
                )

            if not request.user.has_perm('SUBMIT_ZEV'):
                raise PermissionDenied(
                    "You do not have the permission to submit this vehicle."
                )

        if value in [
            VehicleDefinitionStatuses.VALIDATED,
            VehicleDefinitionStatuses.REJECTED
        ]:
            if self.instance.validation_status is not \
                    VehicleDefinitionStatuses.SUBMITTED:
                raise ValidationError(
                    "Model cannot be validated at this time."
                )

            if not request.user.has_perm('VALIDATE_ZEV'):
                raise PermissionDenied(
                    "You do not have the permission to validate this model."
                )

        return value

    def update(self, instance, validated_data):
        request = self.context.get('request')
        status = validated_data.get('validation_status')

        change_status(
            self.context['request'].user,
            instance,
            status
        )

        if status == VehicleDefinitionStatuses.VALIDATED:
            instance.credit_class = CreditClass.objects.filter(
                credit_class=instance.get_credit_class()
            ).first()
            instance.credit_value = instance.get_credit_value()
            instance.update_user = request.user.username
            instance.save()

        if status:
            notifications_zev_model(instance, status)

        return instance

    class Meta:
        model = Vehicle
        fields = (
            'validation_status', 'create_user', 'update_user',
        )


class VehicleHistorySerializer(
    ModelSerializer, EnumSupportSerializerMixin
):
    create_user = SerializerMethodField()
    validation_status = EnumField(VehicleDefinitionStatuses, read_only=True)

    def get_create_user(self, obj):
        user_profile = UserProfile.objects.filter(username=obj.create_user)

        if user_profile.exists():
            serializer = MemberSerializer(user_profile.first(), read_only=True)
            return serializer.data

        return obj.create_user

    class Meta:
        model = VehicleChangeHistory
        fields = ('create_timestamp', 'create_user', 'validation_status')


class VehicleListSerializer(
    ModelSerializer, EnumSupportSerializerMixin
):
    organization = SerializerMethodField()
    validation_status = EnumField(VehicleDefinitionStatuses, read_only=True)
    credit_value = SerializerMethodField()
    credit_class = SerializerMethodField()
    model_year = SerializerMethodField()
    vehicle_zev_type = SerializerMethodField()
    sales_issued = SerializerMethodField()

    def get_organization(self, obj):
        organization = Organization.objects.get(id=obj.organization_id)
        name = organization.name
        short_name = organization.short_name
        return {'name': name, 'short_name': short_name}

    def get_credit_value(self, instance):
        return instance.get_credit_value()

    def get_credit_class(self, instance):
        return instance.get_credit_class()

    def get_model_year(self, obj):
        model_year = ModelYear.objects.get(id=obj.model_year_id)
        return model_year.name

    def get_vehicle_zev_type(self, obj):
        zev_type = ZevType.objects.filter(id=obj.vehicle_zev_type_id).first()
        return zev_type.vehicle_zev_code
    
    def get_sales_issued(self, instance):
        return RecordOfSale.objects.filter(
            vehicle_id=instance.id,
            submission__validation_status="VALIDATED"  # Validated actually means issued
        ).count()

    class Meta:
        model = Vehicle
        fields = ('id', 'organization',  'validation_status',
                  'credit_value', 'credit_class',
                  'model_year', 'model_name', 'make',
                  'range', 'vehicle_zev_type', 'is_active',
                  'sales_issued'
                  )


class VehicleSerializer(
    ModelSerializer, EnumSupportSerializerMixin
):
    actions = SerializerMethodField()
    attachments = SerializerMethodField()
    credit_class = SerializerMethodField()
    credit_value = SerializerMethodField()
    history = VehicleHistorySerializer(read_only=True, many=True)
    model_year = ModelYearSerializer()
    validation_status = EnumField(VehicleDefinitionStatuses, read_only=True)
    vehicle_class_code = VehicleClassSerializer()
    vehicle_zev_type = VehicleZevTypeSerializer()
    update_user = SerializerMethodField()
    organization = OrganizationSerializer()
    vehicle_comment = SerializerMethodField()
    create_user = SerializerMethodField()

    def get_actions(self, instance):
        request = self.context.get('request')
        gov = request.user.is_government

        actions = []

        if (gov and instance.validation_status is
                VehicleDefinitionStatuses.SUBMITTED):
            actions.append('VALIDATED')
            actions.append('REJECTED')

        if (not gov and instance.validation_status in [
            VehicleDefinitionStatuses.DRAFT, VehicleDefinitionStatuses.NEW
        ]):
            actions.append('SUBMITTED')

        return actions

    def get_attachments(self, instance):
        attachments = VehicleAttachment.objects.filter(
            vehicle_id=instance.id,
            is_removed=False)

        serializer = VehicleAttachmentSerializer(attachments, many=True)

        return serializer.data

    def get_credit_class(self, instance):
        return instance.get_credit_class()

    def get_credit_value(self, instance):
        return instance.get_credit_value()

    def get_create_user(self, obj):
        user_profile = UserProfile.objects.filter(username=obj.create_user)

        if user_profile.exists():
            serializer = MemberSerializer(user_profile.first(), read_only=True)
            return serializer.data

        return obj.create_user
    
    def get_update_user(self, obj):
        user_profile = UserProfile.objects.filter(username=obj.update_user)

        if user_profile.exists():
            serializer = MemberSerializer(user_profile.first(), read_only=True)
            return serializer.data

        return obj.update_user

    def get_vehicle_comment(self, obj):
        vehicle_comment = VehicleComment.objects.filter(
            vehicle=obj
        ).order_by('-create_timestamp')

        if vehicle_comment.exists():
            serializer = VehicleCommentSerializer(
                vehicle_comment.first(), read_only=True
            )
            return serializer.data

        return None

    class Meta:
        model = Vehicle
        fields = (
            'id', 'actions', 'history', 'make', 'model_name', 'model_year',
            'range', 'validation_status', 'vehicle_class_code', 'weight_kg',
            'vehicle_zev_type', 'credit_class', 'credit_value',
            'vehicle_comment', 'attachments', 'update_user', 'create_user',
            'update_timestamp', 'organization', 'has_passed_us_06_test', 'is_active'
        )
        read_only_fields = ('validation_status',)


class VehicleSaveSerializer(
    ModelSerializer, EnumSupportSerializerMixin
):
    model_year = SlugRelatedField(
        slug_field='name',
        queryset=ModelYear.objects.all()
    )
    vehicle_attachments = VehicleAttachmentSerializer(
        allow_null=True,
        many=True,
        required=False
    )
    vehicle_class_code = SlugRelatedField(
        slug_field='vehicle_class_code',
        queryset=VehicleClass.objects.all()
    )
    vehicle_zev_type = SlugRelatedField(
        slug_field='vehicle_zev_code',
        queryset=ZevType.objects.all()
    )
    validation_status = EnumField(
        VehicleDefinitionStatuses,
        required=False
    )
    vehicle_comment = VehicleCommentSerializer(
        allow_null=True,
        required=False
    )

    def create(self, validated_data):
        request = self.context.get('request')
        organization = request.user.organization
        make = validated_data.pop('make')
        make = " ".join(make.upper().split())
        validated_data.pop('vehicle_comment', None)

        vehicle = Vehicle.objects.create(
            make=make,
            organization_id=organization.id,
            **validated_data
        )

        return vehicle

    def update(self, instance, validated_data):
        status = validated_data.get('validation_status')
        request = self.context.get('request')
        attachments = validated_data.pop('vehicle_attachments', [])
        files_to_be_removed = request.data.get('delete_files', [])
        vehicle_comment = validated_data.pop('vehicle_comment', None)

        if vehicle_comment:
            VehicleComment.objects.create(
                create_user=request.user.username,
                vehicle=instance,
                comment=vehicle_comment.get('comment')
            )

        for attachment in attachments:
            VehicleAttachment.objects.create(
                create_user=request.user.username,
                vehicle=instance,
                **attachment
            )

        for file_id in files_to_be_removed:
            attachment = VehicleAttachment.objects.filter(
                id=file_id,
                vehicle=instance
            ).first()

            if attachment:
                minio_remove_object(attachment.minio_object_name)

                attachment.is_removed = True
                attachment.update_user = request.user.username
                attachment.save()

        for data in validated_data:
            setattr(instance, data, validated_data[data])

            if data == 'make':
                make = validated_data[data]
                make = " ".join(make.upper().split())

                setattr(instance, data, make)

        instance.update_user = request.user.username
        instance.save()

        if status:
            notifications_zev_model(instance, status)

        return instance

    class Meta:
        model = Vehicle
        fields = (
            'id', 'make', 'model_name', 'model_year', 'range', 'weight_kg',
            'validation_status', 'vehicle_zev_type', 'vehicle_class_code',
            'create_user', 'update_user', 'vehicle_attachments',
            'vehicle_comment', 'has_passed_us_06_test',
        )
        read_only_fields = ('validation_status', 'id',)


class VehicleMinSerializer(
    ModelSerializer, EnumSupportSerializerMixin
):
    credit_class = SerializerMethodField()
    credit_value = SerializerMethodField()

    model_year = SlugRelatedField(
        slug_field='name',
        queryset=ModelYear.objects.all()
    )
    vehicle_class_code = SlugRelatedField(
        slug_field='vehicle_class_code',
        queryset=VehicleClass.objects.all()
    )
    vehicle_zev_type = SlugRelatedField(
        slug_field='vehicle_zev_code',
        queryset=ZevType.objects.all()
    )

    def get_credit_class(self, instance):
        request = self.context.get('request')
        if instance.validation_status == \
                VehicleDefinitionStatuses.VALIDATED or \
                (request and request.user and request.user.is_government):
            return instance.get_credit_class()

        return None

    def get_credit_value(self, instance):
        request = self.context.get('request')

        if instance.validation_status == \
                VehicleDefinitionStatuses.VALIDATED or \
                (request and request.user and request.user.is_government):
            return instance.get_credit_value()

        return None

    class Meta:
        model = Vehicle
        fields = (
            'id', 'make', 'model_name', 'model_year',
            'range', 'vehicle_class_code',
            'vehicle_zev_type', 'weight_kg',
            'credit_class', 'credit_value',
        )

class VehicleSalesSerializer(
    ModelSerializer
):
    pending_sales = SerializerMethodField()
    sales_issued = SerializerMethodField()
    zev_class = SerializerMethodField()
    credit_value = SerializerMethodField()

    model_year = SlugRelatedField(
        slug_field='name',
        queryset=ModelYear.objects.all()
    )
    vehicle_class_code = SlugRelatedField(
        slug_field='vehicle_class_code',
        queryset=VehicleClass.objects.all()
    )
    vehicle_zev_type = SlugRelatedField(
        slug_field='vehicle_zev_code',
        queryset=ZevType.objects.all()
    )

    def get_zev_class(self, instance):
        return instance.get_credit_class()

    def get_credit_value(self, instance):
        return instance.get_credit_value()

    def get_pending_sales(self, instance):
        return SalesSubmissionContent.objects.filter(
            xls_make__iexact=instance.make,
            xls_model__iexact=instance.model_name,
            xls_model_year=str(instance.model_year.name) + '.0',
            submission__validation_status__in=[
                "SUBMITTED", "RECOMMEND_APPROVAL", "RECOMMEND_REJECTION", "CHECKED",
            ]
        ).count()

    def get_sales_issued(self, instance):
        return RecordOfSale.objects.filter(
            vehicle_id=instance.id,
            submission__validation_status="VALIDATED"  # Validated actually means issued
        ).count()

    class Meta:
        model = Vehicle
        fields = (
            'id', 'make', 'model_name', 'model_year',
            'range', 'vehicle_class_code',
            'vehicle_zev_type', 'zev_class', 'credit_value',
            'pending_sales', 'sales_issued',
        )
