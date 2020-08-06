/*
 * Presentational component
 */
import PropTypes from 'prop-types';
import React from 'react';
import ReactTable from 'react-table';

import history from '../../app/History';
import ROUTES_CREDITS from '../../app/routes/Credits';
import formatStatus from '../../app/utilities/formatStatus';

const SubmissionListTable = (props) => {
  const columns = [{
    accessor: 'submissionDate',
    className: 'text-left',
    Header: 'Date',
  }, {
    accessor: (item) => (item.organization ? item.organization.name : ''),
    className: 'text-left',
    Header: 'Supplier',
    id: 'supplier',
  }, {
    accessor: 'totals.vins',
    className: 'text-right',
    Header: 'Total Sales',
  }, {
    accessor: (item) => {
      const { validationStatus } = item;

      return formatStatus(validationStatus);
    },
    className: 'text-center text-capitalize',
    Header: 'Status',
    id: 'status',
  }, {
    accessor: () => '',
    className: 'text-left',
    Header: 'Next to Act',
    id: 'next-to-act',
  }, {
    accessor: () => '0',
    className: 'text-right',
    Header: 'Warnings',
    id: 'warnings',
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
      defaultPageSize={items.length || 5}
      defaultSorted={[{
        id: 'submissionDate',
      }]}
      getTrProps={(state, row) => {
        if (row && row.original) {
          return {
            onClick: () => {
              const { id } = row.original;

              history.push(ROUTES_CREDITS.CREDIT_REQUEST_DETAILS.replace(/:id/g, id));
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

SubmissionListTable.defaultProps = {};

SubmissionListTable.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default SubmissionListTable;
