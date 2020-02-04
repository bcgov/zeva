/*
 * Presentational component
 */
import PropTypes from 'prop-types';
import React from 'react';
import ReactTable from 'react-table';

import history from '../../app/History';

const VehicleListTable = (props) => {
  const { items, user, handleCheckboxClick } = props;
  const columns = [{
    accessor: (row) => (row.make ? row.make.name : ''),
    Header: 'Make',
    id: 'make',
  }, {
    accessor: 'modelName',
    Header: 'Model',
    id: 'model',
  }, {
    accessor: (row) => (row.modelYear ? row.modelYear.name : ''),
    Header: 'Model Year',
    id: 'col-my',
  }, {
    accessor: (row) => (row.vehicleFuelType ? row.vehicleFuelType.description : ''),
    Header: 'Fuel Type',
    id: 'type',
  }, {
    accessor: 'range',
    Header: 'Range (km)',
    id: 'ranger',
  }, {
    accessor: (row) => {
      let variable = 0.3;

      if (row.vehicleFuelType.vehicleFuelCode === 'B') {
        variable = 0.5;
      }

      let credit = ((row.range * 0.006214) + variable).toFixed(2);

      if (credit > 4) {
        credit = 4;
      }

      return credit;
    },
    Header: 'Credit',
    id: 'col-credit',
  }, {
    accessor: (row) => (row.vehicleFuelType.vehicleFuelCode === 'B' ? 'A' : 'B'),
    Header: 'Class',
    id: 'col-class',
  }, {
    accessor: 'validationStatus',
    Header: 'Status',
    id: 'col-status',
  }, {
    accessor: (row) => (row.state === 'VALIDATED' ? <input type="checkbox" defaultChecked disabled /> : <input type="checkbox" value={row.id} onChange={(event) => { handleCheckboxClick(event); }} />),
    className: 'text-center',
    Header: 'Validate',
    id: 'col-validated',
    show: user.isGovernment,
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
      data={items}
      defaultFilterMethod={filterMethod}
      defaultPageSize={10}
      defaultSorted={[{
        id: 'make',
      }]}
      filterable={filterable}
      getTrProps={(state, row) => {
        if (row && row.original && !user.isGovernment) {
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
  handleCheckboxClick: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
  })).isRequired,
  user: PropTypes.shape({
    isGovernment: PropTypes.bool,
  }).isRequired,
};

export default VehicleListTable;
