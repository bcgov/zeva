/*
 * Presentational component
 */
import PropTypes from 'prop-types';
import React from 'react';
import ReactTable from 'react-table';

const RoleListTable = (props) => {
  const { roles } = props;

  const columns = [{
    accessor: 'name',
    Header: 'Role',
  }, {
    accessor: 'description',
    Header: 'Description',
  }];

  const filterMethod = (filter, row) => {
    const id = filter.pivotId || filter.id;
    return row[id] !== undefined ? String(row[id])
      .toLowerCase()
      .includes(filter.value.toLowerCase()) : true;
  };
  const filterable = true;

  return (
    <ReactTable
      className="searchable"
      columns={columns}
      data={roles}
      defaultFilterMethod={filterMethod}
      defaultPageSize={10}
      defaultSorted={[{
        id: 'name',
      }]}
      filterable={filterable}
      pageSizeOptions={[5, 10, 15, 20, 25, 50, 100]}
    />
  );
};

RoleListTable.defaultProps = {};

RoleListTable.propTypes = {
  roles: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
  })).isRequired,
};

export default RoleListTable;
