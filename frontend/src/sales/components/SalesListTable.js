/*
 * Presentational component
 */
import PropTypes from 'prop-types';
import React from 'react';
import ReactTable from 'react-table';

import history from '../../app/History';

const SalesListTable = (props) => {
  const columns = [{
    accessor: 'submissionDate',
    className: 'text-center',
    Header: 'Submission Date',
  }, {
    accessor: 'totalSales',
    className: 'text-right',
    Header: 'Total Sales',
  }, {
    accessor: (row) => (row.credits.a),
    className: 'text-right',
    Header: 'A-Credits',
    id: 'credits-a',
  }, {
    accessor: (row) => (row.credits.b),
    className: 'text-right',
    Header: 'B-Credits',
    id: 'credits-b',
  }, {
    accessor: 'status',
    className: 'text-center',
    Header: 'Status',
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
      defaultPageSize={10}
      defaultSorted={[{
        id: 'submissionDate',
      }]}
      filterable={filterable}
      getTrProps={(state, row) => {
        if (row && row.original) {
          return {
            onClick: () => {
              const { id } = row.original;
              history.push(`/sales/${id}`);
            },
            className: 'clickable',
          };
        }

        return {};
      }}
      pageSizeOptions={[5, 10, 15, 20, 25, 50, 100]}
    />
  );
};

SalesListTable.defaultProps = {};

SalesListTable.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
  })).isRequired,
};

export default SalesListTable;
