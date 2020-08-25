/*
 * Presentational component
 */
import PropTypes from 'prop-types';
import React from 'react';

import history from '../../app/History';
import ReactTable from '../../app/components/ReactTable';
import formatStatus from '../../app/utilities/formatStatus';

const VehicleListTable = (props) => {
  const {
    items, user, filtered, setFiltered,
  } = props;

  const toComma = (value) => {
    let newValue = value;
    if (typeof newValue === 'number') {
      newValue = newValue.toString();
    }
    newValue = newValue.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    return newValue;
  };
  const columns = [{
    accessor: (row) => (row.organization ? row.organization.name : ''),
    className: 'text-center',
    Header: 'Supplier',
    id: 'col-supplier',
    show: user && user.isGovernment,
    width: 200,
  }, {
    accessor: (row) => (row.make ? row.make : ''),
    Header: 'Make',
    id: 'make',
    width: 150,
  }, {
    accessor: (row) => (row.modelName ? row.modelName : ''),
    Header: 'Model',
    id: 'model',
  }, {
    accessor: (row) => (row.modelYear ? row.modelYear.name : ''),
    className: 'text-center',
    Header: 'Model Year',
    id: 'col-my',
    width: 125,
  }, {
    accessor: (row) => (row.vehicleClassCode ? row.vehicleClassCode.description : ''),
    className: 'text-center',
    Header: 'Body',
    id: 'col-class-desc',
    width: 125,
  }, {
    accessor: (row) => (parseInt(row.weightKg, 10)),
    Cell: (row) => (toComma(row.row['col-weight'])),
    className: 'text-center',
    Header: 'GVWR (kg)',
    id: 'col-weight',
    width: 125,
  }, {
    accessor: 'range',
    Cell: (row) => (toComma(row.row.range)),
    className: 'text-right',
    Header: 'Range (km)',
    id: 'range',
    width: 125,
  }, {
    accessor: (row) => (row.vehicleZevType.vehicleZevCode),
    className: 'text-center',
    Header: 'Type',
    id: 'zev-type',
    width: 100,
  }, {
    accessor: (row) => {
      if ((row.vehicleZevType.vehicleZevCode === 'BEV' && row.range < 80.47)
          || row.range < 16) {
        return 'C';
      }

      if (row.vehicleZevType.vehicleZevCode === 'BEV') {
        return 'A';
      }

      return 'B';
    },
    className: 'text-center',
    Header: 'Class',
    id: 'col-class',
    width: 125,
  }, {
    accessor: (row) => {
      if ((row.vehicleZevType.vehicleZevCode === 'BEV' && row.range < 80.47)
          || row.range < 16) {
        return 0;
      }

      let variable = 0.3;

      if (row.vehicleZevType.vehicleZevCode === 'BEV') {
        variable = 0.5;
      }

      if (['EREV', 'PHEV'].indexOf(row.vehicleZevType.vehicleZevCode) >= 0) {
        variable += 0.2;
      }

      let credit = ((row.range * 0.006214) + variable).toFixed(2);

      if (credit > 4) {
        credit = 4;
      }

      return credit;
    },
    className: 'text-right',
    Header: 'Credit',
    id: 'col-credit',
    width: 125,
  }, {
    accessor: (row) => (formatStatus(row.validationStatus)),
    className: 'text-center text-capitalize',
    Header: 'Status',
    id: 'col-status',
    width: 175,
  }];

  return (
    <ReactTable
      columns={columns}
      filtered={filtered}
      data={items}
      defaultSorted={[{
        id: 'make',
      }]}
      getTrProps={(state, row) => {
        if (row && row.original && user) {
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
      onFilteredChange={(input) => {
        setFiltered(input);
      }}
      setFiltered={setFiltered}
    />
  );
};

VehicleListTable.defaultProps = {
};

VehicleListTable.propTypes = {
  filtered: PropTypes.arrayOf(PropTypes.object).isRequired,
  setFiltered: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
  })).isRequired,
  user: PropTypes.shape({
    isGovernment: PropTypes.bool,
  }).isRequired,
};

export default VehicleListTable;
