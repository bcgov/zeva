/*
 * Presentational component
 */
import PropTypes from 'prop-types';
import React from 'react';
import ReactTable from 'react-table';

import history from '../../app/History';
import ROUTES_SALES from '../../app/routes/Sales';
import formatStatus from '../../app/utilities/formatStatus';

const SalesSubmissionListTable = (props) => {
  const { items, filtered, setFiltered } = props;
  const columns = [{
    Header: 'Submission ID',
    accessor: 'id',
  }, {
    Header: 'Date',
    accessor: 'submissionDate',
    className: 'text-center',
  }, {
    Header: 'Last Transaction User',
    accessor: (item) => (item.updateUser ? `${item.updateUser.displayName}` : ''),
    id: 'user',
  }, {
    Header: 'Sales Total',
    accessor: 'totals.vins',
    className: 'text-right',
  }, {
    Header: 'Errors',
    accessor: '-',
    className: 'text-right',
  }, {
    Header: 'A-Credits',
    accessor: 'totalACredits',
    className: 'text-right',
    id: 'credits-a',
  }, {
    Header: 'B-Credits',
    accessor: 'totalBCredits',
    className: 'text-right',
    id: 'credits-b',
  }, {
    accessor: (item) => {
      const { validationStatus } = item;
      const status = formatStatus(validationStatus);
      if (status === 'validated') {
        return 'issued';
      }
      return status;
    },
    className: 'text-center text-capitalize',
    Header: 'Status',
    id: 'status',
    filterMethod: (filter, row) => {
      const filterValues = filter.value.split(',');
      let returnValue = false;
      filterValues.forEach((filterValue) => {
        const value = filterValue.toLowerCase().trim();
        if (value !== '' && !returnValue) {
          returnValue = row[filter.id].toLowerCase().includes(value);
        }
      });
      return returnValue;
    },
  }];

  const filterMethod = (filter, row) => {
    const id = filter.pivotId || filter.id;
    return row[id] !== undefined ? String(row[id])
      .toLowerCase()
      .includes(filter.value.toLowerCase()) : true;
  };

  return (
    <ReactTable
      className="searchable"
      columns={columns}
      data={items}
      defaultFilterMethod={filterMethod}
      defaultPageSize={items.length}
      defaultSorted={[{
        id: 'submissionDate',
      }]}
      filterable
      filtered={filtered}
      onFilteredChange={(input) => {
        setFiltered(input);
      }}
      getTrProps={(state, row) => {
        if (row && row.original) {
          return {
            onClick: () => {
              const { id } = row.original;
              history.push(ROUTES_SALES.DETAILS.replace(/:id/g, id));
            },
            className: 'clickable',
          };
        }

        return {};
      }}
      pageSizeOptions={[items.length, 5, 10, 15, 20, 25, 50, 100]}
    />
  );
};

SalesSubmissionListTable.defaultProps = {};

SalesSubmissionListTable.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  setFiltered: PropTypes.func.isRequired,
  filtered: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default SalesSubmissionListTable;
