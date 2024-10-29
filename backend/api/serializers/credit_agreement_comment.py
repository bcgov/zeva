from rest_framework.serializers import ModelSerializer, \
    SerializerMethodField
from api.models.credit_agreement_comment import CreditAgreementComment
from ..mixins.user_mixin import UserMixin

class CreditAgreementCommentSerializer(ModelSerializer, UserMixin):
    """
    Serializer for credit agreement comments
    """
    create_user = SerializerMethodField()
    
    class Meta:
        model = CreditAgreementComment
        fields = (
            'id', 'comment', 'create_timestamp', 'update_timestamp', 'create_user', 'to_director'
        )
        read_only_fields = (
            'id',
        )
