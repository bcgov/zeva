/*
 * Presentational component
 */
import PropTypes from 'prop-types';
import React from 'react';

import CustomPropTypes from '../../app/utilities/props';
import ReactTable from '../../app/components/ReactTable';
import formatNumeric from '../../app/utilities/formatNumeric';
import formatStatus from '../../app/utilities/formatStatus';
import history from '../../app/History';
import ROUTES_CREDIT_REQUESTS from '../../app/routes/CreditRequests';

const CreditRequestListTable = (props) => {
  const {
    items, filtered, setFiltered, user,
  } = props;

  const columns = [{
    accessor: 'id',
    className: 'text-right',
    Header: 'ID',
    maxWidth: 75,
  }, {
    accessor: 'submissionHistory',
    className: 'text-center',
    Header: 'Date',
  }, {
    accessor: (item) => (item.organization ? item.organization.name : ''),
    className: 'text-left',
    Header: 'Supplier',
    id: 'supplier',
    show: user.isGovernment,
  }, {
    accessor: (item) => {
      if (['DRAFT', 'SUBMITTED'].indexOf(item.validationStatus) >= 0) {
        const totals = item.totals.vins + item.unselected;
        return (totals > 0 ? totals : '-');
      }

      return (item.totals.vins > 0 ? item.totals.vins : '-');
    },
    className: 'text-right',
    Header: 'Total Sales',
    maxWidth: 150,
    id: 'total-sales',
  }, {
    accessor: (item) => (item.totalWarnings > 0 ? item.totalWarnings : '-'),
    className: 'text-right',
    Header: 'Not Eligible for Credits',
    id: 'warnings',
    maxWidth: 250,
  }, {
    accessor: (item) => (item.totalCredits && item.totalCredits.a > 0 ? formatNumeric(item.totalCredits.a) : '-'),
    className: 'text-right',
    Header: 'A-Credits',
    id: 'credits-a',
    maxWidth: 150,
  }, {
    accessor: (item) => (item.totalCredits && item.totalCredits.b > 0 ? formatNumeric(item.totalCredits.b) : '-'),
    className: 'text-right',
    Header: 'B-Credits',
    id: 'credits-b',
    maxWidth: 150,
  }, {
    accessor: (item) => {
      const { validationStatus } = item;
      const status = formatStatus(validationStatus);

      if (status === 'checked') {
        return 'validated';
      }

      if (status === 'validated') {
        return 'issued';
      }

      if (status === 'recommend approval') {
        return 'recommend issuance';
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
    maxWidth: 250,
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

              history.push(ROUTES_CREDIT_REQUESTS.DETAILS.replace(/:id/g, id), filtered);
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

CreditRequestListTable.defaultProps = {
  filtered: undefined,
  setFiltered: undefined,
};

CreditRequestListTable.propTypes = {
  filtered: PropTypes.arrayOf(PropTypes.shape()),
  items: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  setFiltered: PropTypes.func,
  user: CustomPropTypes.user.isRequired,
};

export default CreditRequestListTable;
