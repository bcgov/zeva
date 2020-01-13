from django.db import models

from api.managers.uniquely_named import UniquelyNamedManager


class Named(models.Model):
    name = models.CharField(blank=False,
                            null=False,
                            max_length=250)

    class Meta:
        abstract = True


class UniquelyNamed(models.Model):
    name = models.CharField(blank=False,
                            unique=True,
                            null=False,
                            max_length=250)

    objects = UniquelyNamedManager()

    class Meta:
        abstract = True
