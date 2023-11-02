def update_comment_text(comment, comment_text):
    comment.comment = comment_text
    comment.save(update_fields=["comment", "update_timestamp"])
    return comment
