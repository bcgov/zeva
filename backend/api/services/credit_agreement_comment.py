from api.models.credit_agreement_comment import CreditAgreementComment


def get_comment(comment_id):
    return CreditAgreementComment.objects.filter(id=comment_id).first()


def delete_comment(comment_id):
    CreditAgreementComment.objects.filter(id=comment_id).delete()
