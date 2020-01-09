class DBComments(object):
    """Mixin to support database metadata."""

    # Subclasses should override if needed.
    db_table_comment = None

    @classmethod
    def db_table_name(cls):
        """database table name"""
        return cls._meta.db_table

    @classmethod
    def db_table_comment_or_name(cls):
        """database table comment (default to name if unset)"""
        return cls.db_table_comment or cls.__name__

    @classmethod
    def db_column_comments(cls):
        """database table column comments, including supplemental overrides"""
        column_comments = {}

        for field in cls._meta.fields:
            if hasattr(field, 'db_comment'):
                column_comments[field.column] = field.db_comment

        # breadth-first traversal up the class tree looking for supplemental comments
        inspection_list = [cls]
        visited = []

        while inspection_list:
            current = inspection_list.pop()

            if current in visited:
                # Don't look in the same place twice
                continue

            visited.append(current)

            if issubclass(current, DBComments):
                if hasattr(current, 'db_column_supplemental_comments'):
                    for column, comment in current.db_column_supplemental_comments.items():
                        column_comments[column] = comment

            inspection_list = inspection_list + list(current.__bases__)

        return column_comments
