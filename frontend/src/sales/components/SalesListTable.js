/*
 * Presentational component
 */
import PropTypes from 'prop-types';
import React from 'react';
import ReactTable from 'react-table';

import history from '../../app/History';

const SalesListTable = (props) => {
  const columns = [
    {
      Header: 'VIN',
      accessor: 'vin',
    },
    {
      Header: 'VIN Status',
      accessor: 'vinValidationStatus',
    },
    {
      Header: 'Make',
      accessor: 'vehicle.make',
    },
    {
      Header: 'Model',
      accessor: 'vehicle.modelName',
    },
    {
      Header: 'Sale Date',
      accessor: 'saleDate',
    },
    {
      Header: 'Range',
      accessor: 'vehicle.range',
    },
    {
      Header: 'Class Code',
      accessor: 'vehicle.vehicleClassCode',
    },
    {
      Header: 'Fuel Type',
      accessor: 'vehicle.vehicleFuelType',
    },
    {
      Header: 'Range',
      accessor: 'vehicle.range',
    },
  ];

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
        id: 'submissionDate',
      }]}
      filterable={filterable}
      pageSizeOptions={[5, 10, 15, 20, 25, 50, 100]}
    />
  );
};

SalesListTable.defaultProps = {};

SalesListTable.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default SalesListTable;
