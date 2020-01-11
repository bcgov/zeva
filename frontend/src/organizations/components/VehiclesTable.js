/*
 * Presentational component
 */
import React from 'react';
import PropTypes from 'prop-types';

import ReactTable from 'react-table';

const VehiclesTable = (props) => {
  const FilterCheckbox = ({ filter, onChange }) => (
    <select
      onChange={(event) => onChange(event.target.value)}
      value={filter ? filter.value : ''}
    >
      <option value="">Show All</option>
      <option value="true">Validated</option>
      <option value="false">Not Validated</option>
    </select>
  );

  FilterCheckbox.defaultProps = {
    filter: {},
  };

  FilterCheckbox.propTypes = {
    filter: PropTypes.shape({
      value: PropTypes.string,
    }),
    onChange: PropTypes.func.isRequired,
  };

  const columns = [{
    accessor: 'make',
    className: 'text-left',
    Header: 'Make',
  }, {
    accessor: 'model',
    className: 'text-left',
    Header: 'Model',
  }, {
    accessor: 'type',
    className: 'text-center',
    Header: 'Type',
  }, {
    accessor: 'trim',
    className: 'text-center',
    Header: 'Trim',
  }, {
    accessor: 'range',
    className: 'text-right',
    Header: 'Range (km)',
  }, {
    accessor: 'credit',
    className: 'text-right',
    Header: 'Credit',
  }, {
    accessor: 'class',
    className: 'text-center',
    Header: 'Class',
  }, {
    accessor: 'state',
    className: 'text-center',
    Header: 'State',
  }, {
    accessor: 'validate',
    Cell: (row) => (
      <input type="checkbox" checked={row.original.validate} readOnly />
    ),
    className: 'text-center',
    Filter: FilterCheckbox,
    Header: 'Validate',
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
        id: 'make',
      }]}
      filterable={filterable}
      pageSizeOptions={[5, 10, 15, 20, 25, 50, 100]}
    />
  );
};

VehiclesTable.defaultProps = {
};

VehiclesTable.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape()).isRequired,
};

export default VehiclesTable;
