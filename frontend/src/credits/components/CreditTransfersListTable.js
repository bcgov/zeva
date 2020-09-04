/*
 * Presentational component
 */
import moment from 'moment-timezone';
import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';

import CustomPropTypes from '../../app/utilities/props';
import ReactTable from '../../app/components/ReactTable';

const CreditTransfersListTable = (props) => {
  const { user } = props;
  let { items } = props;

  items = items.map((item) => {
    let totalCreditsA = 0;
    let totalCreditsB = 0;
    let totalTransferValue = 0;

    item.creditTransactions.forEach((transaction) => {
      if (transaction.creditClass.creditClass === 'A') {
        totalCreditsA += transaction.numberOfCredits;
      }

      if (transaction.creditClass.creditClass === 'B') {
        totalCreditsB += transaction.numberOfCredits;
      }

      totalTransferValue += parseFloat(transaction.totalValue);
    });

    return {
      ...item,
      totalCreditsA,
      totalCreditsB,
      totalTransferValue,
    };
  });

  const columns = [{
    accessor: 'id',
    className: 'text-right',
    Header: 'ID',
    id: 'id',
    maxWidth: 100,
  }, {
    accessor: (row) => (moment(row.createTimestamp).format('YYYY-MM-DD')),
    className: 'text-center',
    Header: 'Date',
    id: 'date',
    maxWidth: 150,
  }, {
    accessor: 'updateUser.displayName',
    className: 'text-left',
    Header: 'Last User',
    id: 'updateUser',
    maxWidth: 200,
  }, {
    accessor: (row) => (row.creditTo.id !== user.organization.id
      ? row.creditTo.name
      : row.debitFrom.name
    ),
    className: 'text-left',
    Header: 'Transfer Partner',
    id: 'partner',
  }, {
    accessor: (row) => (row.totalCreditsA > 0 ? row.totalCreditsA : '-'),
    className: 'text-right',
    Header: 'A-Credits',
    id: 'credits-a',
    maxWidth: 150,
  }, {
    accessor: (row) => (row.totalCreditsB > 0 ? row.totalCreditsB : '-'),
    className: 'text-right',
    Header: 'B-Credits',
    id: 'credits-b',
    maxWidth: 150,
  }, {
    accessor: (row) => `$ ${(_.round(row.totalTransferValue, 0).toFixed(0))}`,
    className: 'text-right',
    Header: 'Transfer Value',
    id: 'transfer-value',
    maxWidth: 150,
  }, {
    accessor: 'status',
    className: 'text-left',
    Header: 'Status',
    id: 'status',
    maxWidth: 200,
  }];

  return (
    <ReactTable
      columns={columns}
      data={items}
      defaultSorted={[{
        id: 'id',
        desc: true,
      }]}
    />
  );
};

CreditTransfersListTable.defaultProps = {};

CreditTransfersListTable.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    creditTransactions: PropTypes.arrayOf(PropTypes.shape()),
  })).isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default CreditTransfersListTable;
