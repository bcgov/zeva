/*
 * Presentational component
 */
import PropTypes from 'prop-types';
import React from 'react';

import ReactTable from '../../app/components/ReactTable';
import formatNumeric from '../../app/utilities/formatNumeric';
import history from '../../app/History';
import ROUTES_CREDITS from '../../app/routes/Credits';
import CustomPropTypes from '../../app/utilities/props';
import formatStatus from '../../app/utilities/formatStatus';

const SubmissionListTable = (props) => {
  const {
    items, filtered, setFiltered, user,
  } = props;

  const columns = [{
    accessor: 'id',
    className: 'text-right',
    Header: 'ID',
    maxWidth: 100,
  }, {
    accessor: 'submissionDate',
    className: 'text-center',
    Header: 'Date',
  }, {
    accessor: 'updateUser.displayName',
    className: 'text-left',
    Header: 'Last User',
    id: 'updateUser',
  }, {
    accessor: (item) => (item.organization ? item.organization.name : ''),
    className: 'text-left',
    Header: 'Supplier',
    id: 'supplier',
    show: user.isGovernment,
  }, {
    accessor: 'totals.vins',
    className: 'text-right',
    Header: 'Total Sales',
    maxWidth: 150,
  }, {
    accessor: (item) => (item.totalWarnings > 0 ? item.totalWarnings : '-'),
    className: 'text-right',
    Header: 'Warnings',
    id: 'warnings',
    maxWidth: 150,
  }, {
    accessor: (item) => (formatNumeric(item.totalACredits)),
    className: 'text-right',
    Header: 'A-Credits',
    id: 'credits-a',
    maxWidth: 150,
  }, {
    accessor: (item) => (formatNumeric(item.totalBCredits)),
    className: 'text-right',
    Header: 'B-Credits',
    id: 'credits-b',
    maxWidth: 150,
  }, {
    accessor: (item) => {
      const { validationStatus } = item;
      const status = formatStatus(validationStatus);

      if (status === 'checked') {
        return 'submitted';
      }

      if (status === 'validated') {
        return 'issued';
      }

      return status;
    },
    className: 'text-center text-capitalize',
    Header: 'Status',
    id: 'status',
    maxWidth: 200,
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
  user: CustomPropTypes.user.isRequired,
};

export default SubmissionListTable;
