import PropTypes from 'prop-types';
import React from 'react';
import ReactTable from 'react-table';

const VINTable = (props) => {
  const cols = [{
    Header: 'Make',
    accessor: 'vehicle.make',
  }, {
    Header: 'Model Year',
    id: 'modelYear',
    accessor: 'vehicle.modelYear',
  }, {
    Header: 'Model',
    accessor: 'vehicle.modelName',
  }, {
    Header: 'VIN',
    accessor: 'vin',
  }, {
    Header: 'Sale Date',
    id: 'saleDate',
    accessor: 'saleDate',
  }, {
    Header: 'Type',
    accessor: 'vehicle.vehicleZevType',
  }, {
    Header: 'Range (km)',
    accessor: 'vehicle.range',
  }, {
    Header: 'Credit Class',
    accessor: 'class',
  }, {
    Header: 'Credits',
    accessor: 'credits',
  }];
  const filterMethod = (filter, row) => {
    const id = filter.pivotId || filter.id;
    return row[id] !== undefined ? String(row[id])
      .toLowerCase()
      .includes(filter.value.toLowerCase()) : true;
  };

  const { data } = props;


  return (
    <ReactTable
      columns={cols}
      data={data}
      className="searchable"
      defaultFilterMethod={filterMethod}
      defaultPageSize={10}
      defaultSorted={[{
        id: 'VIN',
      }]}
      filterable
      pageSizeOptions={[5, 10, 15, 20, 25, 50, 100]}
    />
  );
};

VINTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default VINTable;
