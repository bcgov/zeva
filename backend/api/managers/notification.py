from django.db import models


class NoticationManager(models.Manager):
    def get_by_natural_key(self, code):
        return self.get(code=code)
