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
    if (['RECOMMEND_APPROVAL', 'VALIDATED'].indexOf(validationStatus >= 0)) {
      return true;
    }

    return validatedOnly;
  };

  const columns = [{
    accessor: 'warnings',
    className: 'text-right',
    filterable: false,
    Header: 'Warnings',
    id: 'warnings',
    show: showWarnings(),
    width: 100,
  }, {
    accessor: 'sales',
    className: 'text-right',
    filterable: false,
    Header: 'Sales',
    id: 'sales',
    width: 100,
  }, {
    accessor: 'vehicle.modelYear',
    className: 'text-center',
    Header: 'MY',
    width: 120,
  }, {
    accessor: 'vehicle.make',
    Header: 'Make',
    id: 'make',
    width: 200,
  }, {
    accessor: 'vehicle.modelName',
    Header: 'Model',
    id: 'model',
  }, {
    accessor: 'vehicle.vehicleZevType',
    className: 'text-center',
    Header: 'ZEV Type',
    width: 150,
  }, {
    accessor: 'vehicle.range',
    className: 'text-right',
    Header: 'R. (km)',
    width: 150,
  }, {
    accessor: (item) => {
      const { vehicle } = item;

      if (vehicle) {
        return vehicle.creditClass;
      }

      return '';
    },
    className: 'text-center',
    Header: 'Class',
    id: 'credit-class',
    width: 120,
  }, {
    className: 'text-right',
    Header: 'Credits',
    accessor: (item) => (item.credits === 0 ? '-' : _.round(item.credits, 2).toFixed(2)),
    id: 'credits',
    width: 150,
  }, {
    className: 'text-right',
    Header: 'Total',
    accessor: (item) => (item.total === 0 ? '-' : _.round(item.total, 2).toFixed(2)),
    id: 'total',
    width: 150,
  }];

  const data = [];
  const totals = {
    a: 0,
    b: 0,
  };

  items.forEach((item) => {
    const id = `${item.xlsModelYear}-${item.xlsMake}-${item.xlsModel}`;
    const found = data.findIndex((obj) => (obj.id === id));
    let addSale = 0;
    let { creditValue } = item.vehicle;

    if (!creditValue || Number.isNaN(creditValue)) {
      creditValue = 0;
    }

    if (['CHECKED', 'RECOMMEND_APPROVAL', 'RECOMMEND_REJECTION', 'VALIDATED'].indexOf(validationStatus) < 0) {
      addSale = 1;
    } else if (item.recordOfSale) {
      addSale = 1;
    }

    if (addSale > 0) {
      if (item.vehicle.creditClass === 'A') {
        totals.a += creditValue;
      } else if (item.vehicle.creditClass === 'B') {
        totals.b += creditValue;
      }
    }

    let warnings = 0;

    // does this row have any warnings?
    // if so, mark this as CONTAINS WARNINGS (vs how many warnings does this row have)
    if (item.warnings && item.warnings.length > 0) {
      warnings = 1;
    }

    if (found >= 0) {
      data[found] = {
        ...data[found],
        sales: data[found].sales + addSale,
        total: data[found].total + (creditValue * addSale),
        warnings: data[found].warnings + warnings,
      };
    } else {
      data.push({
        id,
        credits: creditValue,
        sales: addSale,
        total: (creditValue * addSale),
        vehicle: {
          creditClass: (item.vehicle && item.vehicle.id) ? item.vehicle.creditClass : '-',
          modelYear: Math.trunc(item.xlsModelYear),
          make: item.xlsMake,
          modelName: item.xlsModel,
          range: (item.vehicle && item.vehicle.id) ? item.vehicle.range : '-',
          vehicleZevType: (item.vehicle && item.vehicle.id) ? item.vehicle.vehicleZevType : '-',
        },
        warnings,
      });
    }
  });

  return ([
    <ReactTable
      columns={columns}
      data={data}
      defaultSorted={[{
        id: 'make',
      }]}
      key="table"
    />,
    <div className="totals" key="totals">
      <table>
        <tbody className="font-weight-bold">
          <tr className="total-grey">
            <td className="text-center">Total A Credits</td>
            <td className="text-right">{_.round(totals.a, 2).toFixed(2)}</td>
          </tr>
          <tr>
            <td className="text-center">Total B Credits</td>
            <td className="text-right">{_.round(totals.b, 2).toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>,
  ]);
};

ModelListTable.defaultProps = {
  validatedOnly: false,
};

ModelListTable.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  validatedOnly: PropTypes.bool,
};

export default ModelListTable;
