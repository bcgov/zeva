import PropTypes from 'prop-types';
import React from 'react';
import ReactTable from 'react-table';

const ValidationErrorsTable = (props) => {
  const cols = [{
    accessor: (item) => (item.row ? item.row : 'N/A'),
    Header: 'Row Number',
    id: 'row',
  }, {
    accessor: 'rowContents.modelYear',
    Header: 'MY',
  }, {
    accessor: 'rowContents.make',
    Header: 'Make',
  }, {
    accessor: 'rowContents.modelName',
    Header: 'Model',
  }, {
    accessor: 'rowContents.saleDate',
    Header: 'Retail Sale',
  }, {
    accessor: 'rowContents.vin',
    Header: 'VIN',
  }, {
    accessor: (item) => {
      const errorCodes = [];
      const { message } = item;

      if (message.indexOf('has previously been recorded') >= 0) {
        errorCodes.push('11');
      }

      if (message.indexOf('more recent than') >= 0) {
        errorCodes.push('22');
      }

      if (message.indexOf('doesn\'t match an approved') >= 0) {
        errorCodes.push('33');
      }

      return errorCodes.join(', ');
    },
    Header: 'Error',
    id: 'error',
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
        id: 'row',
      }]}
      filterable
      pageSizeOptions={[5, 10, 15, 20, 25, 50, 100]}
    />
  );
};

ValidationErrorsTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default ValidationErrorsTable;
