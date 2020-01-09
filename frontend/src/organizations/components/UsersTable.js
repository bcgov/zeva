/*
 * Presentational component
 */
import React from 'react';
import PropTypes from 'prop-types';

import ReactTable from 'react-table';


const UsersTable = (props) => {
  const columns = [{
    accessor: 'displayName',
    className: 'col-name',
    Header: 'Name',
  }, {
    accessor: 'roles',
    className: 'col-roles',
    Header: 'Roles',
  }, {
    accessor: (item) => (item.isActive ? 'Active' : 'Inactive'),
    className: 'col-status',
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
