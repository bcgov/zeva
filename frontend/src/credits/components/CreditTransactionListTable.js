/*
 * Presentational component
 */
import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import moment from 'moment-timezone';

import ReactTable from '../../app/components/ReactTable';

const CreditTransactionListTable = (props) => {
  const { items, user } = props;
  const translateTransactionType = (type) => {
    switch (type.toLowerCase()) {
      case 'validation':
        return 'Credit Application';
      default:
        return type;
    }
  };

  const columns = [{
    Header: '',
    headerClassName: 'header-group',
    columns: [{
      accessor: 'id',
      className: 'text-center',
      Header: 'ID',
      id: 'id',
      maxWidth: 150,
      show: false,
    }],
  }, {
    Header: '',
    headerClassName: 'header-group date',
    columns: [{
      accessor: (item) => (moment(item.transactionTimestamp).format('YYYY-MM-DD')),
      className: 'text-center date',
      Header: 'Date',
      headerClassName: 'date',
      id: 'date',
      maxWidth: 200,
    }],
  }, {
    Header: '',
    headerClassName: 'header-group transaction',
    columns: [{
      accessor: (item) => translateTransactionType(item.transactionType.transactionType),
      className: 'text-left transaction',
      Header: 'Transaction',
      headerClassName: 'text-left transaction',
      id: 'transaction',
    }],
  }, {
    Header: 'Credits',
    headerClassName: 'header-group credits-left',
    columns: [{
      accessor: (item) => {
        if (item.creditClass.creditClass === 'A') {
          if (item.debitFrom) {
            if (item.debitFrom.id === user.organization.id) return (item.totalValue * -1);
          }
          return item.totalValue;
        }
        return '-';
      },
      className: 'text-right credits-left',
      Header: 'A',
      Cell: (item) => (
        <span className={item.value < 0 ? 'text-danger' : ''}>{item.value}</span>
      ),
      headerClassName: 'credits-left',
      id: 'credit-class-a',
      maxWidth: 175,
    }, {
      accessor: (item) => (item.creditClass.creditClass === 'B' ? item.totalValue : '-'),
      className: 'text-right',
      Cell: (item) => (
        <span className={item.value < 0 ? 'text-danger' : ''}>{item.value}</span>
      ),
      Header: 'B',
      id: 'credit-class-b',
      maxWidth: 175,
    }],
  }, {
    Header: 'Balance',
    headerClassName: 'header-group balance-left',
    columns: [{
      accessor: (item) => (_.round(item.displayTotalA, 2).toFixed(2)),
      className: 'text-right balance-left',
      Cell: (item) => (
        <span className={item.value < 0 ? 'text-danger' : ''}>{item.value}</span>
      ),
      Header: 'A',
      headerClassName: 'balance-left',
      id: 'credit-balance-a',
      maxWidth: 175,
    }, {
      accessor: (item) => (_.round(item.displayTotalB, 2).toFixed(2)),
      className: 'text-right',
      Cell: (item) => (
        <span className={item.value < 0 ? 'text-danger' : ''}>{item.value}</span>
      ),
      Header: 'B',
      id: 'credit-balance-b',
      maxWidth: 175,
    }],
  }];

  return (
    <ReactTable
      className="credit-transaction-list-table"
      columns={columns}
      data={items}
      defaultSorted={[{
        id: 'id',
        desc: true,
      }]}
      filterable={false}
    />
  );
};

CreditTransactionListTable.defaultProps = {};

CreditTransactionListTable.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  user: PropTypes.shape({}).isRequired,
};

export default CreditTransactionListTable;
