from rest_framework.serializers import ModelSerializer, \
    SerializerMethodField
from api.models.credit_agreement_comment import CreditAgreementComment
from ..mixins.user_mixin import get_user_data

class CreditAgreementCommentSerializer(ModelSerializer,):
    """
    Serializer for credit agreement comments
    """
    create_user = SerializerMethodField()

    def get_create_user(self, obj):
        return get_user_data(obj, 'create_user', self.context.get('request'))
    
    class Meta:
        model = CreditAgreementComment
        fields = (
            'id', 'comment', 'create_timestamp', 'update_timestamp', 'create_user', 'to_director'
        )
        read_only_fields = (
            'id',
        )
