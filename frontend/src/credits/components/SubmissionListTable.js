/*
 * Presentational component
 */
import PropTypes from 'prop-types';
import React from 'react';

import ReactTable from '../../app/components/ReactTable';
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
      const status = formatStatus(validationStatus);

      if (status === 'validated') {
        return 'issued';
      }

      return status;
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

  const { items, filtered, setFiltered } = props;

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

              history.push(ROUTES_CREDITS.CREDIT_REQUEST_DETAILS.replace(/:id/g, id));
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

SubmissionListTable.defaultProps = {};

SubmissionListTable.propTypes = {
  filtered: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  setFiltered: PropTypes.func.isRequired,
};

export default SubmissionListTable;
