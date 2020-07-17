/*
 * Presentational component
 */
import PropTypes from 'prop-types';
import React from 'react';
import ReactTable from 'react-table';
import _ from 'lodash';

import getCreditClass from '../../app/utilities/getCreditClass';

const ModelListTable = (props) => {
  const { items, validatedOnly } = props;

  const columns = [{
    accessor: () => '0',
    className: 'text-right',
    filterable: false,
    Header: 'Warnings',
    id: 'warnings',
    show: validatedOnly,
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

      return getCreditClass(vehicle);
    },
    className: 'text-center',
    Header: 'Class',
    id: 'credit-class',
    width: 120,
  }, {
    className: 'text-right',
    Header: 'Credits',
    accessor: (item) => (_.round(item.credits, 2).toFixed(2)),
    id: 'credits',
    width: 150,
  }, {
    className: 'text-right',
    Header: 'Total',
    accessor: (item) => (_.round(item.total, 2).toFixed(2)),
    id: 'total',
    width: 150,
  }];

  const filterMethod = (filter, row) => {
    const id = filter.pivotId || filter.id;
    return row[id] !== undefined ? String(row[id])
      .toLowerCase()
      .includes(filter.value.toLowerCase()) : true;
  };

  const data = [];
  const totals = {
    a: 0,
    b: 0,
  };

  items.forEach((item) => {
    const found = data.findIndex((obj) => (obj.vehicle.id === item.vehicle.id));
    let addSale = 0;

    if (!validatedOnly || item.validationStatus === 'VALIDATED') {
      addSale = 1;

      if (getCreditClass(item.vehicle) === 'A') {
        totals.a += item.credits;
      } else if (getCreditClass(item.vehicle) === 'B') {
        totals.b += item.credits;
      }
    }

    if (found >= 0) {
      data[found] = {
        ...data[found],
        sales: data[found].sales + addSale,
        total: data[found].total + (item.credits * addSale),
      };
    } else {
      data.push({
        credits: item.credits,
        sales: addSale,
        total: (item.credits * addSale),
        vehicle: item.vehicle,
      });
    }
  });

  return ([
    <ReactTable
      className="searchable"
      columns={columns}
      data={data}
      defaultFilterMethod={filterMethod}
      defaultPageSize={data.length}
      defaultSorted={[{
        id: 'make',
      }]}
      filterable
      key="table"
      pageSizeOptions={[items.length, 5, 10, 15, 20, 25, 50, 100]}
    />,
    <div className="totals" key="totals">
      <table>
        <tbody>
          <tr>
            <td className="text-center">Total A</td>
            <td className="text-right">{_.round(totals.a, 2).toFixed(2)}</td>
          </tr>
          <tr>
            <td className="text-center">Total B</td>
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
  submission: PropTypes.shape({
    id: PropTypes.number,
  }).isRequired,
  validatedOnly: PropTypes.bool,
};

export default ModelListTable;
