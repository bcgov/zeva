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
    className: 'text-right',
    Header: 'Total Credits',
    accessor: (item) => (item.total === 0 ? '-' : _.round(item.total, 2).toFixed(2)),
    id: 'total',
    width: 150,
  }, {
    accessor: 'sales',
    className: 'text-right',
    Header: 'Sales',
    id: 'sales',
    width: 100,
  }, {
    accessor: 'vehicle.modelYear',
    className: 'text-center',
    Header: 'Model Year',
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
    className: 'text-right',
    Header: 'Credit Entitlement',
    accessor: (item) => (item.credits === 0 ? '-' : _.round(item.credits, 2).toFixed(2)),
    id: 'credits',
    width: 150,
  }, {
    accessor: 'vehicle.vehicleZevType',
    className: 'text-center',
    Header: 'ZEV Type',
    width: 150,
  }, {
    accessor: 'vehicle.range',
    className: 'text-right',
    Header: 'Range (km)',
    width: 150,
  }];

  const data = [];
  const totals = {
    a: 0,
    b: 0,
    sales: 0,
  };

  items.forEach((item) => {
    const id = `${item.xlsModelYear}-${item.xlsMake}-${item.xlsModel}`;
    const found = data.findIndex((obj) => (obj.id === id));
    const addSale = 1;
    let creditValue = 0;
    let invalidModel = false;

    if (item.vehicle) {
      ({ creditValue } = item.vehicle);
      if (!creditValue || Number.isNaN(creditValue)) {
        creditValue = 0;
      }

      // if (['CHECKED', 'RECOMMEND_APPROVAL', 'RECOMMEND_REJECTION', 'VALIDATED'].indexOf(validationStatus) < 0) {
      //   addSale = 1;
      // } else if (item.recordOfSale) {
      //   addSale = 1;
      // }

      if (addSale > 0) {
        if (item.vehicle.creditClass === 'A') {
          totals.a += creditValue;
        } else if (item.vehicle.creditClass === 'B') {
          totals.b += creditValue;
        }
      }
    }
    // else if (['CHECKED', 'RECOMMEND_APPROVAL', 'RECOMMEND_REJECTION', 'VALIDATED'].indexOf(validationStatus) < 0) {
    //   addSale = 1;
    // }

    let warnings = 0;
    // does this row have any warnings?
    // if so, mark this as CONTAINS WARNINGS (vs how many warnings does this row have)
    if (item.warnings && item.warnings.length > 0 && !item.recordOfSale) {
      warnings = 1;

      if (item.warnings.includes('INVALID_MODEL')) {
        invalidModel = true;
      }
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
        invalidModel,
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

    totals.sales += addSale;
  });

  return (
    <>

      <div className="table">
        <ReactTable
          columns={columns}
          data={data}
          defaultSorted={[{
            id: 'make',
          }]}
          getTrProps={(state, row) => {
            if (row && row.original && row.original.invalidModel) {
              return {
                className: 'background-danger',
              };
            }

            return {};
          }}
          key="table"
        />

      </div>
    </>
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
