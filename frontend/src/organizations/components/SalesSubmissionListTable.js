/*
 * Presentational component
 */
import PropTypes from 'prop-types';
import React from 'react';
import ReactTable from 'react-table';

import history from '../../app/History';
import ROUTES_SALES from '../../app/routes/Sales';
import CustomPropTypes from '../../app/utilities/props';
import formatStatus from '../../app/utilities/formatStatus';

const SalesSubmissionListTable = (props) => {
  const columns = [{
    Header: 'Submission ID',
    accessor: 'submissionId',
  }, {
    Header: 'Date',
    accessor: 'submissionDate',
    className: 'text-center',
  }, {
    Header: 'Last Transaction User',
    accessor: (item) => (item.updateUser ? `${item.updateUser.displayName}` : ''),
    id: 'user',
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
    Header: 'Total Sales',
    accessor: 'totals.vins',
    className: 'text-right',
  }, {
    accessor: (item) => {
      const { validationStatus } = item;

      return formatStatus(validationStatus);
    },
    className: 'text-center text-capitalize',
    Header: 'Status',
    id: 'status',
  }];

  const filterMethod = (filter, row) => {
    const id = filter.pivotId || filter.id;
    return row[id] !== undefined ? String(row[id])
      .toLowerCase()
      .includes(filter.value.toLowerCase()) : true;
  };

  const filterable = true;

  const { items, user } = props;

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
      getTrProps={(state, row) => {
        if (row && row.original) {
          return {
            onClick: () => {
              const { id } = row.original;

              history.push(ROUTES_SALES.APPROVAL.replace(/:id/g, id));
            },
            className: 'clickable',
          };
        }

        return {};
      }}
      filterable={filterable}
      pageSizeOptions={[items.length, 5, 10, 15, 20, 25, 50, 100]}
    />
  );
};

SalesSubmissionListTable.defaultProps = {};

SalesSubmissionListTable.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default SalesSubmissionListTable;
