/*
 * Presentational component
 */
import PropTypes from 'prop-types';
import React from 'react';

import history from '../../app/History';
import ReactTable from '../../app/components/ReactTable';
import formatStatus from '../../app/utilities/formatStatus';
import ROUTES_VEHICLES from '../../app/routes/Vehicles';

const VehicleListTable = (props) => {
  const {
    items, user, filtered, setFiltered, showSupplier,
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
    accessor: (row) => {
      if (row.organization) {
        return row.organization.shortName || row.organization.name;
      }

      return '';
    },
    Header: 'Supplier',
    id: 'col-supplier',
    show: showSupplier,
    width: 200,
  }, {
    accessor: (row) => (formatStatus(row.validationStatus)),
    className: 'text-center text-capitalize',
    Header: 'Status',
    id: 'col-status',
    width: 175,
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
    Header: 'Body Type',
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
    Header: 'ZEV Type',
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
    Header: 'Zev Class',
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
    Header: 'Credit Entitlement',
    id: 'col-credit',
    width: 125,
  }];

  return (
    <ReactTable
      columns={columns}
      filtered={filtered}
      data={items}
      defaultSorted={[{
        id: user.isGovernment ? 'col-supplier' : 'make',
      }]}
      getTrProps={(state, row) => {
        if (row && row.original && user) {
          return {
            onClick: () => {
              const { id, validationStatus } = row.original;

              if (['CHANGES_REQUESTED', 'DRAFT'].indexOf(validationStatus) >= 0 && !user.isGovernment) {
                history.push(ROUTES_VEHICLES.EDIT.replace(/:id/g, id), filtered);
              } else {
                history.push(ROUTES_VEHICLES.DETAILS.replace(/:id/g, id), filtered);
              }
            },
            className: 'clickable',
          };
        }

        return {};
      }}
      setFiltered={setFiltered}
    />
  );
};

VehicleListTable.defaultProps = {
  filtered: undefined,
  setFiltered: undefined,
  showSupplier: false,
};

VehicleListTable.propTypes = {
  filtered: PropTypes.arrayOf(PropTypes.object),
  setFiltered: PropTypes.func,
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
  })).isRequired,
  showSupplier: PropTypes.bool,
  user: PropTypes.shape({
    isGovernment: PropTypes.bool,
  }).isRequired,
};

export default VehicleListTable;
