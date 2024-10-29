import inspect
import logging
import pkgutil
import sys

from collections import namedtuple
from django.apps import AppConfig
from django.db.models.signals import post_migrate

from db_comments.db_actions import create_db_comments, \
    create_db_comments_from_models

logger = logging.getLogger('zeva.apps')


class ApiConfig(AppConfig):
    name = 'api'

    def ready(self):
        """
        Django callback when application is loaded
        """

        # register our interest in the post_migrate signal
        post_migrate.connect(post_migration_callback, sender=self)
        sys.modules['api.models.account_balance'] = None


def post_migration_callback(sender, **kwargs):
    """
    Post-migration hook. Use this to populate database comments
    """

    # Dynamic comments from models
    create_db_comments_from_models(get_all_model_classes())

    # Static comments for Django-specific tables
    create_db_comments(
        table_name='django_admin_log',
        table_comment='Log of administrative activities',
        column_comments={
            'id': 'Primary key',
            'object_repr': 'Representation of accessed object'
        }
    )

    create_db_comments(
        table_name='auth_group',
        table_comment='Django Authentication groups'
                      '(used by admin application)',
        column_comments={
            'id': 'Primary key'
        }
    )

    create_db_comments(
        table_name='auth_group_permissions',
        table_comment='Django Authentication groups to permissions mapping'
                      '(used by admin application)'
    )

    create_db_comments(
        table_name='auth_permission',
        table_comment='Django Authentication permissions '
                      '(used by admin application)'
    )

    create_db_comments(
        table_name='django_migrations',
        table_comment='Used to track Django database migration state',
        column_comments={
            'name': 'The filename containing the related migration',
            'applied': 'Flag. True if this migration was applied successfully'
        }
    )


def get_all_model_classes():
    """
    Get all the model classes in api.models. Easier than maintaining a list.
    """

    # Has to be a local import. Must be loaded late.
    import api.models

    models_path = api.models.__path__
    classes = set()

    ModuleInfo = namedtuple('ModuleInfo', ['module_finder', 'name', 'ispkg'])

    for (module_finder, name, ispkg) in pkgutil.walk_packages(
            models_path,
            prefix='api.models.'
    ):

        sub_module = ModuleInfo(module_finder, name, ispkg)

        if sub_module.name in sys.modules:
            # we're already loaded (probably as a dependency of another)
            mod = sys.modules[sub_module.name]
        else:
            # load the module
            spec = sub_module.module_finder.find_spec(sub_module.name, models_path)
            mod = spec.loader.load_module(spec.name)

        for name, obj in inspect.getmembers(mod):
            if inspect.getmodule(obj) is not None and \
                    inspect.getmodule(obj).__name__.startswith('api.models'):
                # Assume anything with a 'Meta' attribute is a model
                if inspect.isclass(obj) and hasattr(obj, 'Meta'):
                    classes.add(obj)

    return classes
