/*
 * Presentational component
 */
import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';

import ReactTable from '../../app/components/ReactTable';
import CustomPropTypes from '../../app/utilities/props';

const ModelListTable = (props) => {
  const { submission, user } = props;

  const columns = [{
    accessor: 'sales',
    className: 'text-right',
    Header: 'Sales Submitted',
    id: 'sales',
    width: 150,
  }, {
    accessor: (item) => {
      if (!submission.eligible) {
        return '-';
      }

      const eligibleSales = submission.eligible.find(
        (eligible) => (eligible.vehicleId === item.vehicle.id),
      );

      if (!eligibleSales) {
        return '-';
      }

      return eligibleSales.vinCount;
    },
    className: 'text-right',
    Header: 'Eligible Sales',
    id: 'eligible-sales',
    show: (user.isGovernment || submission.validationStatus === 'VALIDATED'),
    width: 150,
  }, {
    accessor: (item) => {
      const { vehicle } = item;

      if (!submission.eligible) {
        return '-';
      }

      const eligibleSales = submission.eligible.find(
        (eligible) => (eligible.vehicleId === vehicle.id),
      );

      if (!eligibleSales) {
        return '-';
      }

      if (vehicle && vehicle.creditValue && vehicle.creditValue !== 0) {
        return (eligibleSales.vinCount * _.round(vehicle.creditValue, 2)).toFixed(2);
      }

      return '-';
    },
    className: 'text-right',
    Header: 'Eligible ZEV Credits',
    id: 'eligible-zev-credits',
    show: (user.isGovernment || submission.validationStatus === 'VALIDATED'),
    width: 200,
  }, {
    accessor: (item) => (`${item.xlsModelYear} ${item.xlsMake} ${item.xlsModel}`),
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
      data={submission.content}
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

ModelListTable.defaultProps = {};

ModelListTable.propTypes = {
  submission: PropTypes.shape({
    content: PropTypes.arrayOf(PropTypes.shape()),
    eligible: PropTypes.arrayOf(PropTypes.shape()),
    validationStatus: PropTypes.string,
  }).isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default ModelListTable;
