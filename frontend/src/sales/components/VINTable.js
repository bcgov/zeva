import PropTypes from 'prop-types';
import React from 'react';
import ReactTable from 'react-table';

const VINTable = (props) => {
  const cols = [
    {
      Header: 'make',
      accessor: 'make',
    },
    {
      Header: 'Model Year',
      id: 'modelYear',
      accessor: 'model_year',
    },
    {
      Header: 'Model',
      accessor: 'model',
    },
    {
      Header: 'VIN',
      accessor: 'vin',
    },
    {
      Header: 'Sale Date',
      id: 'saleDate',
      accessor: 'sale_date',
    },
    {
      Header: 'Type',
      accessor: 'type',
    },
    {
      Header: 'Range (km)',
      accessor: 'range',
    },
    {
      Header: 'Credit Class',
      accessor: 'class',
    },
    {
      Header: 'Credits',
      accessor: 'credits',
    },

  ];
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
