/*
 * Presentational component
 */
import React from 'react';
import PropTypes from 'prop-types';

import ReactTable from '../../app/components/ReactTable';
import history from '../../app/History';

const UsersTable = (props) => {
  const columns = [{
    accessor: 'displayName',
    className: 'text-left',
    Header: 'Name',
  }, {
    accessor: (item) => (item.roles.map((role) => role.description).join(', ')),
    id: 'roles',
    className: 'text-left',
    Header: 'Roles',
  }, {
    accessor: (item) => (item.isActive ? 'Active' : 'Inactive'),
    className: 'text-center',
    Header: 'Status',
    id: 'status',
  }];

  const { items } = props;

  return (
    <ReactTable
      columns={columns}
      data={items}
      defaultSorted={[{
        id: 'displayName',
      }]}
      getTrProps={(state, row) => {
        if (row && row.original) {
          return {
            onClick: () => {
              const { id } = row.original;
              history.push(`/users/${id}/edit`);
            },
            className: 'clickable',
          };
        }

        return {};
      }}
    />
  );
};

UsersTable.defaultProps = {
};

UsersTable.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape()).isRequired,
};

export default UsersTable;
