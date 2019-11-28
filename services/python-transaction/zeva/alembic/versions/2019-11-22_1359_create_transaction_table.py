"""create transaction table

Revision ID: df6d9e741373
Revises: beadb98386c8
Create Date: 2019-11-22 13:59:49.678612-08:00

"""
from alembic import op
import sqlalchemy as sa
import enum

# revision identifiers, used by Alembic.
from sqlalchemy import Column, BIGINT, TIMESTAMP, INTEGER, func, DateTime, BigInteger, Integer, Enum

revision = 'df6d9e741373'
down_revision = 'beadb98386c8'
branch_labels = None
depends_on = None


def upgrade():

    class V1TransactionTypes(enum.Enum):
        VALIDATION = 0
        REDUCTION = 1
        SOLD = 2
        BOUGHT = 3

    op.create_table(
        'transactions',
        Column('id', BigInteger, primary_key=True, comment='unique identifier'),
        Column('type', Enum(V1TransactionTypes), nullable=False, default=V1TransactionTypes.BOUGHT),
        Column('credits', Integer, nullable=False, default=0),
        Column('transaction_amount', BigInteger, nullable=False, default=0),
        Column('created', DateTime, nullable=False, server_default=func.now()),
        Column('updated', DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
    )


def downgrade():
    op.drop_table('transactions')
    sa.Enum(name='v1transactiontypes').drop(op.get_bind(), checkfirst=False)
