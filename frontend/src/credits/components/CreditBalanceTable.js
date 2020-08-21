/*
 * Presentational component
 */
import PropTypes from 'prop-types';
import React from 'react';
import ReactTable from 'react-table';

const CreditBalancesTable = (props) => {
  const columns = [{
    accessor: 'modelYear.name',
    className: 'text-left',
    Header: 'Model Year',
    id: 'model-year',
  }, {
    accessor: 'weightClass.weightClassCode',
    className: 'text-left',
    Header: 'Vehicle Class',
    id: 'vehicle-class',
  }, {
    accessor: 'creditClass.creditClass',
    className: 'text-center',
    Header: 'ZEV Class',
    id: 'zev-class',
  }, {
    accessor: 'creditValue',
    className: 'text-right',
    Header: 'Total',
    id: 'total',
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
        id: 'model-year',
        desc: true,
      }, {
        id: 'zev-class',
      }]}
      filterable={filterable}
      pageSizeOptions={[items.length, 5, 10, 15, 20, 25, 50, 100]}
      showPagination={false}
    />
  );
};

CreditBalancesTable.defaultProps = {};

CreditBalancesTable.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default CreditBalancesTable;
