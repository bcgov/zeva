/*
 * Presentational component
 */
import ReactTable from 'react-table';
import React from 'react';
import PropTypes from 'prop-types';
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

  const filterMethod = (filter, row) => {
    const id = filter.pivotId || filter.id;
    return row[id] !== undefined ? String(row[id])
      .toLowerCase()
      .includes(filter.value.toLowerCase()) : true;
  };

  const filterable = true;

  const { items } = props;

  return (
    <ReactTable
      className="searchable"
      columns={columns}
      data={items}
      defaultFilterMethod={filterMethod}
      defaultPageSize={10}
      defaultSorted={[{
        id: 'displayName',
      }]}
      filterable={filterable}
      getTrProps={(state, row) => {
        if (row && row.original) {
          return {
            onClick: () => {
              const { id } = row.original;
              history.push(`/users/${id}`);
            },
            className: 'clickable',
          };
        }

        return {};
      }}
      pageSizeOptions={[5, 10, 15, 20, 25, 50, 100]}
    />
  );
};

UsersTable.defaultProps = {
};

UsersTable.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape()).isRequired,
};

export default UsersTable;
