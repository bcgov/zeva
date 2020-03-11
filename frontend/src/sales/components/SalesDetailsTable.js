/*
 * Presentational component
 */
import PropTypes from 'prop-types';
import React from 'react';
import ReactTable from 'react-table';

const SalesDetailsTable = (props) => {
  const columns = [{
    accessor: 'modelYear',
    className: 'text-center',
    Header: 'MY',
    width: 80,
  }, {
    accessor: 'make',
    Header: 'Make',
    id: 'make',
    width: 100,
  }, {
    accessor: 'modelName',
    Header: 'Model',
  }, {
    accessor: 'zevType',
    className: 'text-center',
    Header: 'Zev Type',
    width: 100,
  }, {
    accessor: 'range',
    className: 'text-right',
    Header: 'R. (km)',
    width: 100,
  }, {
    accessor: 'zevType',
    className: 'text-center',
    Header: 'Type',
    width: 100,
  }, {
    accessor: 'class',
    className: 'text-center',
    Header: 'Class',
    width: 100,
  }, {
    accessor: 'credits',
    className: 'text-right',
    Header: 'Credits',
    width: 125,
  }, {
    accessor: 'sales',
    className: 'text-right',
    Header: 'Sales',
    width: 100,
  }, {
    accessor: 'submissionDate',
    className: 'text-center',
    Header: 'Sub. Date',
    width: 150,
  }, {
    accessor: 'total',
    className: 'text-right',
    Header: 'Total',
    width: 125,
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
      defaultPageSize={items.length}
      defaultSorted={[{
        id: 'make',
      }]}
      filterable={filterable}
      pageSizeOptions={[items.length, 5, 10, 15, 20, 25, 50, 100]}
    />
  );
};

SalesDetailsTable.defaultProps = {};

SalesDetailsTable.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
  })).isRequired,
};

export default SalesDetailsTable;
