from django.db import models


class DisplayOrder(models.Model):
    display_order = models.IntegerField(
        db_comment="Sort order of the items."
    )

    class Meta:
        abstract = True
