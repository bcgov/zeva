from django.db import models


class FixtureMigration(models.Model):
    fixture_filename = models.CharField(
        max_length=255,
        db_comment="File that has been loaded into the database."
                   "This will contain the folder as well to keep track "
                   "where the fixture came from."
                   "e.g. operational/0000_add_government_organization.py"
    )
    applied = models.DateTimeField(
        auto_now=True,
        db_comment="When the fixture was applied."
    )

    class Meta:
        db_table = "fixture_migrations"

    db_table_comment = "Contains the list of fixtures that have been " \
                       "applied to the system."
