/*
 * Presentational component
 */
import PropTypes from 'prop-types';
import React from 'react';
import ReactTable from 'react-table';

import history from '../../app/History';

const VehicleListTable = (props) => {
  const columns = [{
    accessor: (row) => (row.make ? row.make.name : ''),
    Header: 'Make',
    id: 'make',
  }, {
    accessor: (row) => (row.model ? row.model.name : ''),
    Header: 'Model',
    id: 'model',
  }, {
    accessor: (row) => (row.modelYear ? row.modelYear.name : ''),
    Header: 'Model Year',
    id: 'col-my',
  }, {
    accessor: (row) => (row.fuelType ? row.fuelType.description : ''),
    Header: 'Fuel Type',
    id: 'type',
  }, {
    accessor: 'range',
    Header: 'Range (km)',
    id: 'ranger',
  }, {
    accessor: (v) => ((v.creditValue && v.creditValue.a) ? v.creditValue.a : ''),
    Header: 'Class A Credits',
    id: 'col-class-a',
  }, {
    accessor: (v) => ((v.creditValue && v.creditValue.b) ? v.creditValue.b : ''),
    Header: 'Class B Credits',
    id: 'col-class-b',
  }, {
    accessor: (v) => v.state,
    Header: 'State',
    id: 'col-validated',
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
      getTrProps={(state, row) => {
        if (row && row.original) {
          return {
            onClick: () => {
              const { id } = row.original;

              history.push(`/vehicles/${id}`);
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

VehicleListTable.defaultProps = {};

VehicleListTable.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
  })).isRequired,
};

export default VehicleListTable;
