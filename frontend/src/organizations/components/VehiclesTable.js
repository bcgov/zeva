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
    accessor: (row) => (row.make ? row.make.name : ''),
    Header: 'Make',
    id: 'make',
  }, {
    accessor: (row) => (row.model ? row.model.name : ''),
    Header: 'Model',
    id: 'model',
  }, {
    accessor: (row) => (row.trim ? row.trim.name : ''),
    Header: 'Trim',
    id: 'trim',
  }, {
    accessor: (row) => (row.modelYear ? row.modelYear.name : ''),
    Header: 'Model Year',
    id: 'col-my',
  }, {
    accessor: (row) => (row.type ? row.type.name : ''),
    Header: 'Type',
    id: 'type',
  }, {
    accessor: 'range',
    Header: 'Range (km)',
    id: 'ranger',
  }, {
    accessor: (row) => ((row.creditValue && row.creditValue.a) ? row.creditValue.a : ''),
    Header: 'Class A Credits',
    id: 'col-class-a',
  }, {
    accessor: (row) => ((row.creditValue && row.creditValue.b) ? row.creditValue.b : ''),
    Header: 'Class B Credits',
    id: 'col-class-b',
  }, {
    accessor: 'validated',
    Cell: (row) => (
      <input type="checkbox" checked={row.original.validated} readOnly />
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
