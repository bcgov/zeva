/*
 * Presentational component
 */
import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';

import ReactTable from '../../app/components/ReactTable';

const ModelListTable = (props) => {
  const { items, validatedOnly, validationStatus } = props;

  const showWarnings = () => {
    if (['RECOMMEND_APPROVAL', 'VALIDATED'].indexOf(validationStatus) >= 0) {
      return true;
    }

    return validatedOnly;
  };

  const columns = [{
    accessor: 'warnings',
    className: 'text-right',
    Header: 'Warnings',
    id: 'warnings',
    show: showWarnings(),
    width: 100,
  }, {
    accessor: (item) => {
      const { vehicle } = item;

      if (vehicle && vehicle.creditValue && vehicle.creditValue !== 0) {
        return _.round(item.sales * vehicle.creditValue, 2).toFixed(2);
      }

      return '-';
    },
    className: 'text-right',
    Header: 'Total Credits',
    id: 'total',
    width: 150,
  }, {
    accessor: 'sales',
    className: 'text-right',
    Header: 'Sales',
    id: 'sales',
    width: 100,
  }, {
    accessor: 'xlsModelYear',
    className: 'text-center',
    Header: 'Model Year',
    width: 120,
  }, {
    accessor: 'xlsMake',
    Header: 'Make',
    id: 'make',
    width: 200,
  }, {
    accessor: 'xlsModel',
    Header: 'Model',
    id: 'model',
  }, {
    accessor: (item) => {
      const { vehicle } = item;

      if (vehicle) {
        return vehicle.creditClass;
      }

      return '';
    },
    className: 'text-center',
    Header: 'ZEV Class',
    id: 'credit-class',
    width: 120,
  }, {
    accessor: (item) => {
      const { vehicle } = item;

      if (vehicle && vehicle.creditValue && vehicle.creditValue !== 0) {
        return _.round(vehicle.creditValue, 2).toFixed(2);
      }

      return '-';
    },
    className: 'text-right',
    Header: 'Credit Entitlement',
    id: 'credits',
    width: 150,
  }, {
    accessor: 'vehicle.vehicleZevType.vehicleZevCode',
    className: 'text-center',
    Header: 'ZEV Type',
    width: 150,
  }, {
    accessor: 'vehicle.range',
    className: 'text-right',
    Header: 'Range (km)',
    width: 150,
  }];

  return (
    <ReactTable
      columns={columns}
      data={items}
      defaultSorted={[{
        id: 'make',
      }]}
      getTrProps={(state, row) => {
        if (row && row.original && (!row.original.vehicle || !row.original.vehicle.id || row.original.modelName === '')) {
          return {
            className: 'background-danger',
          };
        }

        return {};
      }}
      key="table"
    />
  );
};

ModelListTable.defaultProps = {
  validatedOnly: false,
};

ModelListTable.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  validatedOnly: PropTypes.bool,
  validationStatus: PropTypes.string.isRequired,
};

export default ModelListTable;
