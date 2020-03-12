/*
 * Presentational component
 */
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import ReactTable from 'react-table';
import _ from 'lodash';

const uniqueKeys = (vals) => {
  return Object.keys(_.countBy(vals)).join(', ');
};

const SalesDetailsTable = (props) => {

  const [expanded, setExpanded] = useState(props.items.map((item, index) => ({
    index: true,
  })));

  const columns = [
    {
      // Build our expander column
      id: 'expander', // Make sure it has an ID,
      isExpanded: true,
    },
    {
      accessor: 'vinValidationStatus',
      className: 'text-center',
      Header: 'VIN Status',
      width: 300,
    },
    {
      accessor: 'vehicle.modelName',
      Header: 'Model',
      id: 'model',
    },
    {
      accessor: 'vehicle.modelYear',
      className: 'text-center',
      Header: 'MY',
      aggregate: uniqueKeys,
      width: 120,
    }, {
      accessor: 'vehicle.make',
      Header: 'Make',
      id: 'make',
      aggregate: uniqueKeys,
      width: 200,

    }, {
      accessor: 'vehicle.range',
      className: 'text-right',
      Header: 'R. (km)',
      aggregate: (vals) => _.round(_.mean(vals), 0),
      Aggregated: (row) => (
        <span>
        {row.value} mean
      </span>
      ),
      width: 150,
    }, {
      accessor: 'vehicle.vehicleClassCode',
      className: 'text-center',
      Header: 'Class',
      aggregate: uniqueKeys,
      width: 120,
    },
    {
      accessor: 'vin',
      className: 'text-center',
      Header: 'VIN',
      aggregate: () => (null),
      width: 400,
    },

    {
      accessor: 'vehicle.vehicleFuelType',
      className: 'text-center',
      Header: 'Fuel Type',
      aggregate: uniqueKeys,
      width: 150,
    }, {
      className: 'text-right',
      Header: 'Credits',
      accessor: 'credits',
      aggregate: (vals) => _.round(_.sum(vals), 2),
      Aggregated: (row) => (
        <span>
        {row.value} total
      </span>
      ),
      width: 150,
    }, {
      accessor: () => 1,
      className: 'text-right',
      Header: 'Sales',
      id: 'sales',
      width: 100,
      aggregate: (vals, x) => (
        _.reduce(vals, (r, n) => {
          return r + n;
        }, 0)
      )
      ,
      filterable: false,
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
      defaultPageSize={items.length}
      defaultSorted={[{
        id: 'make',
      }]}
      expanded={expanded}
      onExpandedChange={setExpanded}
      pivotBy={['vinValidationStatus', 'model', 'modelYear']}
      filterable={filterable}
      pageSizeOptions={[items.length, 5, 10, 15, 20, 25, 50, 100]}
    />
  );
};

SalesDetailsTable.defaultProps = {};

SalesDetailsTable.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default SalesDetailsTable;
