import logging

from django.contrib.postgres.fields import JSONField
from django.db.models import CharField, Field, EmailField, ForeignKey, \
    DateField, UUIDField, BooleanField, IntegerField, BigIntegerField, \
    AutoField, DecimalField, BinaryField, TextField, DateTimeField


class PatchedField(Field):
    """
    A modified version of django base Field class that knows about database
    comments
    """

    _db_comment = None

    def __init__(self, *args, **kwargs):
        """Strip the db_comment kwarg (if any) and delegate to super"""

        self._db_comment = None

        if 'db_comment' in kwargs:
            self._db_comment = kwargs['db_comment']
            del kwargs['db_comment']

        super().__init__(*args, **kwargs)

    @property
    def db_comment(self):
        """Detect if we're a foreign key, and if so, provide additional detail.
         Otherwise just return the comment"""

        if isinstance(self, ForeignKey):
            # This has to be done after all models are loaded (which is why
            # it's not done in the constructor)
            try:
                remote_class = self.related_model
                remote_table = self.related_model.db_table_name() \
                    if hasattr(self.related_model, 'db_table_name') else None

                if self._db_comment is not None:
                    return 'Reference to primary key (id) of table {},' \
                           ' with additional comment: {}'.format(
                                remote_table,
                                self._db_comment
                            )

                return 'Reference to primary key (id) of table {}'.format(
                    remote_table
                )
            except:
                # something somewhere up the chain is catching exceptions
                # and silently failing
                logging.error(
                    'caught an exception while attaching comments to a '
                    'foreign key. Proceeding with comment set to None'
                )
                return None

        return self._db_comment


def patch_fields():
    """Insinuate PatchedField into class hierarchy"""

    # Insert PatchedField in the hierarchy between Field and its immediate
    # subclasses at runtime

    to_patch = [
        CharField,
        EmailField,
        DateField,
        DateTimeField,
        UUIDField,
        BooleanField,
        IntegerField,
        BigIntegerField,
        DecimalField,
        AutoField,
        JSONField,
        ForeignKey,
        BinaryField,
        TextField
    ]

    for cls in to_patch:
        # breadth-first search up the class tree looking for Field as a base
        # class

        inspection_list = [cls]
        visited = []

        while inspection_list:
            current = inspection_list.pop()

            if current is PatchedField:
                # We've already patched this
                break

            if current in visited:
                # Don't look in the same place twice
                continue

            visited.append(current)

            if Field in current.__bases__:
                # replace Field in tuple of class bases with PatchedField
                current.__bases__ = tuple([
                    PatchedField if base is Field else base
                    for base in current.__bases__
                ])
                break

            inspection_list = inspection_list + list(current.__bases__)
