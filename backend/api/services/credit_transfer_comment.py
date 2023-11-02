from api.models.credit_transfer_comment import CreditTransferComment


def get_comment(comment_id):
    return CreditTransferComment.objects.filter(id=comment_id).first()


def delete_comment(comment_id):
    CreditTransferComment.objects.filter(id=comment_id).delete()
