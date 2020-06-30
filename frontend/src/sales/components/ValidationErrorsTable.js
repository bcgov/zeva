import PropTypes from 'prop-types';
import React from 'react';
import ReactTable from 'react-table';

const ValidationErrorsTable = (props) => {
  const cols = [
    {
      Header: 'Row Number',
      id: 'row',
      accessor: (item) => (item.row ? item.row : 'N/A'),
    },
    {
      Header: 'Message',
      accessor: 'message',
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
