/*
 * Presentational component
 */
import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import moment from 'moment-timezone';

import ReactTable from '../../app/components/ReactTable';
import formatNumeric from '../../app/utilities/formatNumeric';
import history from '../../app/History';
import ROUTES_CREDIT_REQUESTS from '../../app/routes/CreditRequests';
import ROUTES_CREDIT_TRANSFERS from '../../app/routes/CreditTransfers';
import ROUTES_CREDITS from '../../app/routes/Credits';

const CreditTransactionListTable = (props) => {
  const { items } = props;
  const translateTransactionType = (item) => {
    if (!item.transactionType) {
      return false;
    }

    const { transactionType } = item.transactionType;
    const { name } = item.modelYear;

    switch (transactionType.toLowerCase()) {
      case 'validation':
        return 'Credit Application';
      case 'reduction':
        if (item.transactionType.transactionType === 'Reduction' && !item.foreignKey) {
          return 'Administrative Credit Reduction';
        }

        return `${name} Model Year Report Credit Reduction`;
      default:
        return transactionType;
    }
  };

  const abbreviateTransactionType = (item) => {
    if (!item.transactionType) {
      return false;
    }

    const { transactionType } = item.transactionType;

    switch (transactionType.toLowerCase()) {
      case 'validation':
        return 'CA';
      case 'credit transfer':
        return 'CT';
      case 'reduction':
        return 'CR';
      default:
        return transactionType;
    }
  };

  let totalA = 0;
  let totalB = 0;

  const transactions = [];

  items.sort((a, b) => {
    if (a.transactionTimestamp < b.transactionTimestamp) {
      return -1;
    }

    if (a.transactionTimestamp > b.transactionTimestamp) {
      return 1;
    }

    return 0;
  });

  items.forEach((item) => {
    if (item.creditClass.creditClass === 'A') {
      totalA += parseFloat(item.totalValue);
    }

    if (item.creditClass.creditClass === 'B') {
      totalB += parseFloat(item.totalValue);
    }

    const found = transactions.findIndex(
      (transaction) => (transaction.foreignKey === item.foreignKey
        && transaction.transactionType
        && item.transactionType
        && transaction.transactionType.transactionType === item.transactionType.transactionType),
    );

    if (found >= 0) {
      transactions[found] = {
        ...transactions[found],
        creditsA: (item.creditClass.creditClass === 'A' ? item.totalValue : transactions[found].creditsA),
        creditsB: (item.creditClass.creditClass === 'B' ? item.totalValue : transactions[found].creditsB),
        displayTotalA: totalA,
        displayTotalB: totalB,
      };
    } else {
      transactions.push({
        creditsA: (item.creditClass.creditClass === 'A' ? item.totalValue : 0),
        creditsB: (item.creditClass.creditClass === 'B' ? item.totalValue : 0),
        displayTotalA: totalA,
        displayTotalB: totalB,
        foreignKey: item.foreignKey,
        transactionTimestamp: item.transactionTimestamp,
        modelYear: item.modelYear,
        transactionType: item.transactionType,
      });
    }
  });

  const columns = [{
    Header: '',
    headerClassName: 'header-group',
    columns: [{
      accessor: (item) => {
        if (item.transactionType.transactionType === 'Reduction' && !item.foreignKey) {
          return 'AR';
        }

        return `${abbreviateTransactionType(item)}-${item.foreignKey}`;
      },
      className: 'text-center',
      Header: 'Transaction ID',
      id: 'id',
      maxWidth: 150,
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
      accessor: (item) => translateTransactionType(item),
      className: 'text-left transaction',
      Header: 'Transaction',
      headerClassName: 'text-left transaction',
      id: 'transaction',
    }],
  }, {
    Header: 'Credits',
    headerClassName: 'header-group credits-left',
    columns: [{
      accessor: (item) => (item.creditsA ? formatNumeric(item.creditsA, 2) : '-'),
      className: 'text-right credits-left',
      Header: 'A',
      Cell: (item) => (
        <span className={item.value < 0 ? 'text-danger' : ''}>{item.value}</span>
      ),
      headerClassName: 'credits-left',
      id: 'credit-class-a',
      maxWidth: 175,
    }, {
      accessor: (item) => (item.creditsB ? formatNumeric(item.creditsB, 2) : '-'),
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
      accessor: (item) => (item.displayTotalA ? _.round(item.displayTotalA, 2).toFixed(2) : '-'),
      className: 'text-right balance-left',
      Cell: (item) => (
        <span className={item.value < 0 ? 'text-danger' : ''}>{item.value}</span>
      ),
      Header: 'A',
      headerClassName: 'balance-left',
      id: 'credit-balance-a',
      maxWidth: 175,
    }, {
      accessor: (item) => (item.displayTotalB ? _.round(item.displayTotalB, 2).toFixed(2) : '-'),
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
      data={transactions}
      defaultSorted={[{
        id: 'date',
        desc: true,
      }]}
      filterable={false}
      getTrProps={(state, row) => {
        if (row && row.original) {
          return {
            onClick: () => {
              if (!row.original.transactionType) {
                return false;
              }

              const item = row.original;

              const { transactionType } = item.transactionType;
              switch (transactionType.toLowerCase()) {
                case 'credit transfer':
                  history.push(
                    ROUTES_CREDIT_TRANSFERS.DETAILS.replace(/:id/g, item.foreignKey),
                    { href: ROUTES_CREDITS.LIST },
                  );
                  break;
                case 'validation':
                  history.push(
                    ROUTES_CREDIT_REQUESTS.DETAILS.replace(/:id/g, item.foreignKey),
                    { href: ROUTES_CREDITS.LIST },
                  );
                  break;
                default:
              }

              return false;
            },
            className: 'clickable',
          };
        }

        return {};
      }}
    />
  );
};

CreditTransactionListTable.defaultProps = {};

CreditTransactionListTable.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default CreditTransactionListTable;
