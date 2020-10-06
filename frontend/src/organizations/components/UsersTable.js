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

  const { filtered, items, setFiltered } = props;

  return (
    <ReactTable
      columns={columns}
      data={items}
      defaultSorted={[{
        id: 'displayName',
      }]}
      filtered={filtered}
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
      setFiltered={setFiltered}
    />
  );
};

UsersTable.defaultProps = {
};

UsersTable.propTypes = {
  filtered: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  items: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  setFiltered: PropTypes.func.isRequired,
};

export default UsersTable;
