"""test vehicle, organization, user data

Revision ID: 36600dac742e
Revises: a9f0bc6dbe92
Create Date: 2020-01-06 21:12:46.630255-08:00

"""
import os
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '36600dac742e'
down_revision = 'a9f0bc6dbe92'
branch_labels = None
depends_on = None


def upgrade():
    is_test = os.getenv('LOAD_TEST_FIXTURES', 'False') == 'True'

    if not is_test:
        return

    print('loading test data')

    op.execute("insert into organizations (name) values ('Test Vehicle Supplier 1')")
    op.execute("insert into organizations (name) values ('Test Vehicle Supplier 2')")
    op.execute("insert into organizations (name) values ('Test Vehicle Supplier 3')")

    op.execute("insert into users (username, organization_id) values ('test_vs_1', (select id from organizations where name like 'Test Vehicle Supplier 1'))")
    op.execute("insert into users (username, organization_id) values ('test_vs_2', (select id from organizations where name like 'Test Vehicle Supplier 2'))")

    op.execute("insert into vehicles (organization_id, type, make, model, trim, range, credits) values ((select id from organizations where name like 'Test Vehicle Supplier 1'), 'BZEV', 'Optimus Prime', 'Model A', 'XL', 150, 100.2)")
    op.execute("insert into vehicles (organization_id, type, make, model, trim, range, credits) values ((select id from organizations where name like 'Test Vehicle Supplier 1'), 'BZEV', 'Optimus Prime', 'Model A', 'XLS', 250, 300.5)")
    op.execute("insert into vehicles (organization_id, type, make, model, trim, range, credits) values ((select id from organizations where name like 'Test Vehicle Supplier 1'), 'HEV', 'Optimus Prime', 'Model T', 'Import', 500, 700.5)")

def downgrade():
    pass
