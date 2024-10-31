from api.models.credit_agreement_comment import CreditAgreementComment
from api.mixins.user_mixin import UserSerializerMixin

class CreditAgreementCommentSerializer(UserSerializerMixin):
    """
    Serializer for credit agreement comments
    """
    
    class Meta:
        model = CreditAgreementComment
        fields = (
            'id', 'comment', 'create_timestamp', 'update_timestamp', 'create_user', 'to_director'
        )
        read_only_fields = (
            'id',
        )
