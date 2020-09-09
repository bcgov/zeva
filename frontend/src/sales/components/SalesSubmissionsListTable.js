/*
 * Presentational component
 */
import PropTypes from 'prop-types';
import React from 'react';

import ReactTable from '../../app/components/ReactTable';
import history from '../../app/History';
import ROUTES_SALES from '../../app/routes/Sales';
import formatStatus from '../../app/utilities/formatStatus';

const SalesSubmissionListTable = (props) => {
  const { items, filtered, setFiltered } = props;
  const columns = [{
    accessor: 'id',
    Header: 'Submission ID',
  }, {
    accessor: 'submissionDate',
    className: 'text-center',
    Header: 'Date',
  }, {
    accessor: (item) => (item.updateUser ? `${item.updateUser.displayName}` : ''),
    Header: 'Last Transaction User',
    id: 'user',
  }, {
    accessor: 'totals.vins',
    className: 'text-right',
    Header: 'Sales Total',
  }, {
    accessor: (item) => (item.validationStatus === 'VALIDATED' ? item.errors : '-'),
    className: 'text-right',
    Header: 'Errors',
    id: 'errors',
  }, {
    accessor: 'totalACredits',
    className: 'text-right',
    Header: 'A-Credits',
    id: 'credits-a',
  }, {
    accessor: 'totalBCredits',
    className: 'text-right',
    Header: 'B-Credits',
    id: 'credits-b',
  }, {
    accessor: (item) => {
      const { validationStatus } = item;
      const status = formatStatus(validationStatus);
      if (status === 'validated') {
        return 'issued';
      }
      if (status === 'recommend rejection' || status === 'recommend approval') {
        return 'submitted';
      }
      return status;
    },
    className: 'text-center text-capitalize',
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
    Header: 'Status',
    id: 'status',
  }];

  return (
    <ReactTable
      columns={columns}
      data={items}
      defaultSorted={[{
        id: 'submissionDate',
      }]}
      filtered={filtered}
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
      setFiltered={setFiltered}
    />
  );
};

SalesSubmissionListTable.defaultProps = {
  filtered: undefined,
  setFiltered: undefined,
};

SalesSubmissionListTable.propTypes = {
  filtered: PropTypes.arrayOf(PropTypes.shape({})),
  items: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  setFiltered: PropTypes.func,
};

export default SalesSubmissionListTable;
