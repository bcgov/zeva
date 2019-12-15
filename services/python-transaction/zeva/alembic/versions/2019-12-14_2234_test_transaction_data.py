"""test_transaction_data

Revision ID: d7f8be4ac865
Revises: df6d9e741373
Create Date: 2019-12-14 22:34:11.893553-08:00

"""
import os

from alembic import op, context
import sqlalchemy as sa

revision = 'd7f8be4ac865'
down_revision = 'df6d9e741373'
branch_labels = None
depends_on = None


def upgrade():
    is_test = os.getenv('LOAD_TEST_FIXTURES', 'False') == 'True'

    if not is_test:
        return

    print('loading test data')

    op.execute("insert into transactions (type, credits, transaction_amount) values ('BOUGHT', 100, 100)")
    op.execute("insert into transactions (type, credits, transaction_amount) values ('SOLD', 200, 200)")
    op.execute("insert into transactions (type, credits, transaction_amount) values ('BOUGHT', 200, 300)")


def downgrade():
    pass
