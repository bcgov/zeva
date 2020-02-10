/*
 * Presentational component
 */
import PropTypes from 'prop-types';
import React from 'react';
import ReactTable from 'react-table';

const RoleListTable = (props) => {
  const { roles, title } = props;

  const permissionTableColumns = [
    {
      accessor: 'name',
      Header: 'Permission',
    }, {
      accessor: 'description',
      Header: 'Authority',
    },
  ];

  return (
    <div className="panel">
      <h2>{title}</h2>
      <ReactTable
        columns={permissionTableColumns}
        data={roles}
        defaultSorted={[{
          id: 'name',
        }]}
        showPagination={false}
        pageSize={roles.length}
      />
    </div>
  );
};

RoleListTable.defaultProps = {};

RoleListTable.propTypes = {
  roles: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
  })).isRequired,
  title: PropTypes.string.isRequired,
};

export default RoleListTable;
