import moment from 'moment-timezone';
import PropTypes from 'prop-types';
import React from 'react';
import ReactTable from 'react-table';

const SalesSubmissionContentTable = (props) => {
  const cols = [{
    accessor: 'xlsMake',
    Header: 'Make',
  }, {
    accessor: (row) => {
      const { xlsModelYear } = row;

      if (Number.isNaN(xlsModelYear)) {
        return '';
      }

      return Math.trunc(row.xlsModelYear);
    },
    className: 'text-center',
    Header: 'Model Year',
    id: 'model-year',
  }, {
    accessor: 'xlsModel',
    Header: 'Model',
  }, {
    accessor: 'xlsVin',
    Header: 'VIN',
  }, {
    accessor: (row) => (moment(row.salesDate).format('YYYY-MM-DD') !== 'Invalid date' ? moment(row.salesDate).format('YYYY-MM-DD') : row.salesDate),
    className: 'text-center',
    Header: 'Sale Date',
    id: 'salesDate',
  }, {
    accessor: 'vehicle.vehicleZevType',
    className: 'text-center',
    Header: 'Type',
  }, {
    accessor: 'vehicle.range',
    className: 'text-right',
    Header: 'Range (km)',
  }, {
    accessor: 'vehicle.creditClass',
    className: 'text-center',
    Header: 'Credit Class',
  }, {
    accessor: 'vehicle.creditValue',
    className: 'text-right',
    Header: 'Credits',
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

SalesSubmissionContentTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default SalesSubmissionContentTable;
