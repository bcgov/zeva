from django.db import models

from api.managers.uniquely_named import UniquelyNamedManager


class Named(models.Model):
    name = models.CharField(
        blank=False,
        db_column="description",
        db_comment="Displayed name for the lookup value",
        max_length=250,
        null=False
    )

    class Meta:
        abstract = True


class UniquelyNamed(models.Model):
    name = models.CharField(
        blank=False,
        db_column="description",
        db_comment="Displayed name for the lookup value. "
                   "Contains unique values.",
        unique=True,
        null=False,
        max_length=250
    )

    objects = UniquelyNamedManager()

    class Meta:
        abstract = True
