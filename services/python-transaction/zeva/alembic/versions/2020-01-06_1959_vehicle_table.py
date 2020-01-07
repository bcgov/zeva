"""vehicle, user, organization tables

Revision ID: a9f0bc6dbe92
Revises: d7f8be4ac865
Create Date: 2020-01-06 19:59:19.228098-08:00

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import Column, func, DateTime, BigInteger, Numeric, Integer, String, \
    CheckConstraint, ForeignKey

# revision identifiers, used by Alembic.
revision = 'a9f0bc6dbe92'
down_revision = 'd7f8be4ac865'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'organizations',
        Column('id', BigInteger, primary_key=True, comment='unique identifier'),
        Column('name', String(200),  CheckConstraint('length(name)>3'), nullable=False, unique=True,
               comment='The organization\'s legal name'),
        Column('created', DateTime, nullable=False, server_default=func.now()),
        Column('updated', DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
    )

    op.create_table(
        'vehicles',
        Column('id', BigInteger, primary_key=True, comment='unique identifier'),
        Column('organization_id', BigInteger, ForeignKey('organizations.id'), nullable=False),
        Column('type', String(100), nullable=False),
        Column('make', String(100), nullable=False),
        Column('model', String(100), nullable=False),
        Column('trim', String(100), nullable=False),
        Column('range', Integer, CheckConstraint('range>0'), nullable=False),
        Column('credits', Numeric(10, 2), CheckConstraint('credits>0'), nullable=False),

        Column('created', DateTime, nullable=False, server_default=func.now()),
        Column('updated', DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
    )

    op.create_table(
        'users',
        Column('username', String, primary_key=True, unique=True, nullable=False),
        Column('organization_id', BigInteger, ForeignKey('organizations.id'), nullable=False),
        Column('created', DateTime, nullable=False, server_default=func.now()),
        Column('updated', DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
    )


def downgrade():
    op.drop_table('users')
    op.drop_table('vehicles')
    op.drop_table('organizations')

